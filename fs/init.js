// Load Mongoose OS API
load('api_dht.js');
load('api_config.js');
load('api_timer.js');
load('api_aws.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_gpio.js');

let dhtPin = 13;
let ledPin = 2;

let dht = DHT.create(dhtPin, DHT.DHT11);
GPIO.set_mode(ledPin, GPIO.MODE_OUTPUT);

let deviceId = Cfg.get('device.id');

// Timer delays
let msToSendSensorData = 1000 * 30;

// Topics
let sensorTopic = 'devices/' + deviceId + '/data';
let settingsUpdateTopic  = 'devices/' + deviceId + '/settings';

//Device state by default led on and sending data
let state = {
  sendData: true,
  ledOn: true
};

// Temp and Humidity
function getSensorData() {
  let t = dht.getTemp();
  let h = dht.getHumidity();

  if (isNaN(h) || isNaN(t)) {
    print('Failed to read data from sensor!');
  }

  return JSON.stringify({
    device: deviceId,
    temp: t,
    humidity: h
  });
};

function applyLed() {
  GPIO.write(ledPin, state.ledOn || 0);
}

// To update the state changes
function updateState(newSt) {
  if (newSt.sendData !== undefined && newSt.ledOn !== null) {
    state.sendData = newSt.sendData;
    state.ledOn = newSt.ledOn;
  }
};

// Timer for sending message to AWS with sensor data (outgoing)
Timer.set(msToSendSensorData, Timer.REPEAT, function() {
  let message = getSensorData();
  if(state.sendData === true){
    let ok = MQTT.pub(sensorTopic, message, 1, false);
    print('Published:', ok ? 'yes' : 'no', 'topic:', sensorTopic, 'message:', message);
  } else {
    print('Publishing disabled, please enable sendData flag in shadow');
  }
}, null);


Timer.set(1000 /* 1 sec */ , true /* repeat */ , function() {
  if(state.ledOn === true){
    GPIO.toggle(ledPin);
  }
}, null);


// Subscribe to the settingsUpdateTopic (incoming)
MQTT.sub(settingsUpdateTopic, function(conn, settingsUpdateTopic, msg) {
  print('Topic: ', settingsUpdateTopic, 'message:', msg);
  let obj = JSON.parse(msg);

  if(obj.sendData === false){
    print('Disabling Sensor data upload');
    state.sendData = obj.sendData;
    state.ledOn = obj.ledOn;
  } else {
    print('Enabling Sensor data upload');
    state.sendData = obj.sendData;
    state.ledOn = obj.ledOn;
  }
  AWS.Shadow.update(0, state);
}, null);

// Shadow updates
AWS.Shadow.setStateHandler(function(ud, ev, reported, desired) {
  print('Event:', ev, '('+AWS.Shadow.eventName(ev)+')');

  if (ev === AWS.Shadow.CONNECTED) {
    AWS.Shadow.update(0, state);
    return;
  }

  print('Reported state:', JSON.stringify(reported));
  print('Desired state:', JSON.stringify(desired));

  // mOS will request state on reconnect and deltas will arrive on changes.
  if (ev !== AWS.Shadow.GET_ACCEPTED && ev !== AWS.Shadow.UPDATE_DELTA) {
    return;
  }

  // Here we extract values from previosuly reported state (if any)
  // and then override it with desired state (if present).
  updateState(reported);
  updateState(desired);

  print('New state:', JSON.stringify(state));
  applyLed();

  if (ev === AWS.Shadow.UPDATE_DELTA) {
    AWS.Shadow.update(0, state);
  }
}, null);
