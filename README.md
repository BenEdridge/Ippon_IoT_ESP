# Mongoose OS demo for AWS IoT

![ESP8266 IoT Device](https://raw.githubusercontent.com/BenEdridge/Ippon_IoT_ESP/master/aws_iot_esp_device.jpeg)

## Prerequisites:
1. MongooseOS CLI and IDE `mos`
    - https://mongoose-os.com/software.html
    - https://mongoose-os.com/docs/quickstart/setup.html
2. AWS CLI `aws`
    - https://aws.amazon.com/cli/
3.  Terraform for building the AWS stack `terraform`
    - https://www.terraform.io/downloads.html
4. Android Studio for the [Android application](https://github.com/BenEdridge/Ippon_IoT_Android)
    - https://developer.android.com/studio/
5. Download the Greengrass software for EC2 x86_64 packages: https://docs.aws.amazon.com/greengrass/latest/developerguide/gg-config.html


## Setup:
### Warning the below setup is not for production usage!
**If you wish to use MongooseOS UI you can run `mos ui` within the project directory.**

1. Set up terraform for AWS: `terraform init`
2. Set up stack using terraform: `terraform apply`
3. Configure the `mos.yml` with the output of relevant `terraform apply` and your wifi setup. You will also need to 
change the thing to the name outputted by terraform: `["aws.thing_name", "IOT_DEVICE_1"]`
4. Build the firmware according to your device: `mos build --arch esp8266` or `mos build --arch esp32`
5. Flash device: `mos flash`
6. Setting up AWS config for device: `mos aws-iot-setup --aws-region <Region> --aws-iot-policy mos-default` 
7. Check device logs to see AWS updates: `mos console` you should get logging similar to below.
8. Setup the optional [Android management application](https://github.com/BenEdridge/Ippon_IoT_Android) with the `terraform` output


### Log outputs:
`[Jul 23 15:40:34.451] Published: yes topic: devices/esp8266_7A0349/data message: {"humidity":"80","temp":"20","device":"esp8266_7A0349"}`

**You can also edit the mos.yml file to configure device setup**

##### For extra libraries check out: https://github.com/mongoose-os-libs

## Limitations and Issues:
- AWS still has limited Cloudformation APIs for IoT and Greengrass
- Terraform has even less support
- Make sure `mos` is updated run: `mos update latest`



