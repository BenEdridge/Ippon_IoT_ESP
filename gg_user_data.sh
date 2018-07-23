#!/bin/sh -v
# https://docs.aws.amazon.com/greengrass/latest/developerguide/module1.html

adduser --system ggc_user
groupadd --system ggc_group

echo "fs.protected_hardlinks = 1" >> /etc/sysctl.d/00-defaults.conf
echo "fs.protected_symlinks = 1" >> /etc/sysctl.d/00-defaults.conf

curl https://raw.githubusercontent.com/tianon/cgroupfs-mount/951c38ee8d802330454bdede20d85ec1c0f8d312/cgroupfs-mount > cgroupfs-mount.sh
chmod +x cgroupfs-mount.sh 
bash ./cgroupfs-mount.sh

yum install git
git clone https://github.com/aws-samples/aws-greengrass-samples.git
aws-greengrass-samples/greengrass-dependency-checker-GGCv1.5.0/check_ggc_dependencies

# Check CloudWatch for logs is it successful?

# transfer greengrass setup
# trasnfer certs

tar -xzvf greengrass-OS-architecture-1.5.0.tar.gz -C /
tar -xzvf GUID-setup.tar.gz -C /greengrass

# Install Symantec
cd /greengrass/certs/
wget -O root.ca.pem http://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem

# Running Greengrass daemon
/greengrass/ggc/core/greengrassd start