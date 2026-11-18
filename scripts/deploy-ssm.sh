#!/usr/bin/env bash
set -euo pipefail

environment="${1:?Usage: deploy-ssm.sh <test|production> <ecr-image-uri> }"
image_uri="${2:?Usage: deploy-ssm.sh <test|production> <ecr-image-uri> }"

case "$environment" in
  test|production) ;;
  *) echo "Environment must be test or production." >&2; exit 2 ;;
esac

instance_id="$(aws ec2 describe-instances \
  --filters \
    "Name=tag:Project,Values=melodex" \
    "Name=tag:Environment,Values=${environment}" \
    "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].InstanceId | [0]' \
  --output text)"

if [[ -z "$instance_id" || "$instance_id" == "None" ]]; then
  echo "No running Melodex ${environment} EC2 instance was found." >&2
  exit 1
fi

parameters="commands=[\"sudo /usr/local/bin/melodex-deploy '${image_uri}'\"]"
command_id="$(aws ssm send-command \
  --instance-ids "$instance_id" \
  --document-name AWS-RunShellScript \
  --comment "Deploy Melodex ${environment} ${image_uri##*:}" \
  --parameters "$parameters" \
  --query 'Command.CommandId' \
  --output text)"

for attempt in $(seq 1 60); do
  status="$(aws ssm get-command-invocation \
    --command-id "$command_id" \
    --instance-id "$instance_id" \
    --query 'Status' \
    --output text 2>/dev/null || true)"

  case "$status" in
    Success) echo "${environment} deployment and health check succeeded."; exit 0 ;;
    Failed|TimedOut|Cancelled|Cancelling)
      aws ssm get-command-invocation --command-id "$command_id" --instance-id "$instance_id" \
        --query '{Status:Status,Details:StatusDetails}' --output table >&2 || true
      exit 1
      ;;
  esac
  sleep 5
done

echo "Timed out waiting for the ${environment} deployment." >&2
exit 1
