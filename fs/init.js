// Load Mongoose OS API
load('api_config.js');
load('api_timer.js');
load('api_dht.js');
load('api_aws.js');
load('api_mqtt.js');

let pin = 13;
let dht = DHT.create(pin, DHT.DHT11);

let deviceId = Cfg.get('device.id');
let isConnected = false;
let isMQTTConnected = false;

// Topics
let metaTopic = 'devices/' + deviceId + '/data';

// Temp and Humidity
let getSensorData = function() {
  
  let t = dht.getTemp();
  let h = dht.getHumidity();
  
  if (isNaN(h) || isNaN(t)) {
    print('Failed to read data from sensor');
  }
  
  return JSON.stringify({
    device: deviceId,
    temp: t,
    humidity: h
  });
};

// Every 5 minutes
Timer.set(1000 * 30, Timer.REPEAT, function() {

  let message = getSensorData();
  
  let ok = MQTT.pub(metaTopic, message, 1, false);
  print('Published:', ok ? 'yes' : 'no', 'topic:', metaTopic, 'message:', message);

}, null);