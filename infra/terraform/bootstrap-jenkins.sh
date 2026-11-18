#!/usr/bin/env bash
set -euxo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y fontconfig openjdk-21-jdk docker.io awscli curl git jq snapd unzip
systemctl enable --now docker
snap install amazon-ssm-agent --classic || true
systemctl enable --now snap.amazon-ssm-agent.amazon-ssm-agent.service || true

install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key \
  -o /etc/apt/keyrings/jenkins-keyring.asc
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
  > /etc/apt/sources.list.d/jenkins.list
apt-get update
apt-get install -y jenkins

sdk_root=/opt/android-sdk
sdk_archive=/tmp/android-commandlinetools.zip
install -d -m 0755 "$sdk_root/cmdline-tools/latest"
curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-15859902_latest.zip \
  -o "$sdk_archive"
echo '4e4c464f145a7512b57d088ac6c278c03c9eea610886b35a5e0804e74eedf583  /tmp/android-commandlinetools.zip' \
  | sha256sum --check --status
unzip -q "$sdk_archive" -d /tmp/android-commandlinetools
cp -a /tmp/android-commandlinetools/cmdline-tools/. "$sdk_root/cmdline-tools/latest/"
chown -R jenkins:jenkins "$sdk_root"

usermod -aG docker jenkins
install -d -m 0755 /etc/systemd/system/jenkins.service.d
cat > /etc/systemd/system/jenkins.service.d/android-sdk.conf <<'EOF'
[Service]
Environment="ANDROID_HOME=/opt/android-sdk"
Environment="ANDROID_SDK_ROOT=/opt/android-sdk"
EOF
systemctl daemon-reload
systemctl enable jenkins
systemctl restart jenkins

cloudwatch_deb=/tmp/amazon-cloudwatch-agent.deb
curl -fsSL https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb \
  -o "$cloudwatch_deb"
dpkg -i "$cloudwatch_deb"
install -d -m 0755 /opt/aws/amazon-cloudwatch-agent/etc
cat > /opt/aws/amazon-cloudwatch-agent/etc/melodex.json <<'EOF'
{
  "agent": { "metrics_collection_interval": 60, "run_as_user": "root" },
  "metrics": {
    "namespace": "Melodex/EC2",
    "append_dimensions": { "InstanceId": "${aws:InstanceId}" },
    "metrics_collected": {
      "mem": { "measurement": ["mem_used_percent"], "metrics_collection_interval": 60 },
      "disk": { "measurement": ["used_percent"], "resources": ["/"], "metrics_collection_interval": 60 }
    }
  }
}
EOF
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/melodex.json -s
