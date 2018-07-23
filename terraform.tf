provider "aws" {
  region = "ap-southeast-2"
}

variable thing_name {
  default = "esp8266_7A0349"
}

variable "greengrass_keypair" {
}

data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-trusty-14.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}

# Allows us to get the endpoint for IoT
data "aws_iot_endpoint" "iot_endpoint" {}

##########################
# Android Authentication
##########################
resource "aws_cognito_identity_pool" "cognito_pool" {
  identity_pool_name = "identity pool"
  allow_unauthenticated_identities = true
}

##########################
# IoT
##########################

resource "aws_iot_thing" "thing1" {
  name = "${var.thing_name}"
}

##########################
# TOPICS and Rules
##########################
resource "aws_iot_topic_rule" "topic_rule_write_to_s3" {
  name = "rule_write_to_s3"
  enabled = true
  sql = "SELECT * FROM 'devices/${aws_iot_thing.thing1.name}/data'"
  sql_version = "2016-03-23"
  s3 {
    bucket_name = "${aws_s3_bucket.s3_bucket.bucket}"
    key = "$${topic()}/data_$${timestamp()}.json"
    role_arn = "${aws_iam_role.role_iot.arn}"
  }
}

##########################
# S3 for sensor data
##########################
resource "aws_s3_bucket" "s3_bucket" {
  bucket_prefix = "iot-data-"
  force_destroy = true
}

##########################
# Greengrass setup
##########################

//resource "aws_security_group" "greengrass_mqtt_allow" {
//  name        = "greengrass_mqtt_allow"
//  description = "Allows all MQTT traffic"
//  vpc_id      = "${var.vpc}"
//  ingress {
//    from_port   = 8883
//    to_port     = 8883
//    protocol    = "tcp"
//    cidr_blocks = ["0.0.0.0/0"]
//  }
//  egress {
//    from_port       = 8883
//    to_port         = 8883
//    protocol        = "tcp"
//    cidr_blocks     = ["0.0.0.0/0"]
//  }
//}

//resource "aws_instance" "greengrass" {
//  instance_type = "t2.micro"
//  ami = "${data.aws_ami.ubuntu.id}"
//  key_name = "${var.greengrass_keypair}"
//  user_data = "${file("gg_user_data.sh")}"
//}

##########################
# Outputs
##########################
output "cognito_endpoint" {
  value = "${aws_cognito_identity_pool.cognito_pool.id}"
}

output "iot_endpoint" {
  value = "${data.aws_iot_endpoint.iot_endpoint.endpoint_address}"
}

output "s3_private_bucket_output" {
  value = "${aws_s3_bucket.s3_bucket.bucket}"
}

output "thing_name" {
  value = "${aws_iot_thing.thing1.name}"
}
