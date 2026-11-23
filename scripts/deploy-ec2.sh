#!/usr/bin/env bash
set -euo pipefail

image_uri="${1:?Usage: melodex-deploy <ecr-image-uri>}"
set -a
source /etc/melodex/deploy.env
set +a

runtime_dir=/run/melodex
install -d -m 0700 "$runtime_dir"
db_secret_file="$runtime_dir/database-secret.json"
rapidapi_secret_file="$runtime_dir/rapidapi-secret.json"
admin_secret_file="$runtime_dir/admin-secret.json"
private_config="$runtime_dir/application-private.properties"
compose_env="$runtime_dir/deploy.env"

aws secretsmanager get-secret-value \
  --region "$AWS_REGION" \
  --secret-id "$DB_SECRET_ARN" \
  --query SecretString \
  --output text > "$db_secret_file"
aws secretsmanager get-secret-value \
  --region "$AWS_REGION" \
  --secret-id "$RAPIDAPI_SECRET_ARN" \
  --query SecretString \
  --output text > "$rapidapi_secret_file"
aws secretsmanager get-secret-value \
  --region "$AWS_REGION" \
  --secret-id "$ADMIN_SECRET_ARN" \
  --query SecretString \
  --output text > "$admin_secret_file"
chmod 0600 "$db_secret_file" "$rapidapi_secret_file" "$admin_secret_file"

python3 - "$image_uri" <<'PY'
import json
import os
import pathlib
import sys

runtime = pathlib.Path('/run/melodex')
db = json.loads((runtime / 'database-secret.json').read_text())
rapidapi = json.loads((runtime / 'rapidapi-secret.json').read_text())
admin = json.loads((runtime / 'admin-secret.json').read_text())
key = rapidapi['rapidapi_key']
host = os.environ.get('SHAZAM_RAPIDAPI_HOST', 'shazam.p.rapidapi.com')
environment = os.environ['DEPLOY_ENVIRONMENT']
image = sys.argv[1]

pooled_url = db.get(f'{environment}_pooled_url') or db.get('pooled_url')
if not pooled_url:
    raise SystemExit(f'Missing {environment}_pooled_url in the Neon secret.')
from urllib.parse import parse_qsl, unquote, urlparse
parsed = urlparse(pooled_url)
if parsed.scheme not in ('postgres', 'postgresql') or not parsed.hostname or not parsed.path:
    raise SystemExit('The configured Neon pooled URL is not a PostgreSQL connection URL.')
query = dict(parse_qsl(parsed.query, keep_blank_values=True))
query.setdefault('sslmode', 'require')
if 'channel_binding' in query:
    query['channelBinding'] = query.pop('channel_binding')
jdbc_url = f"jdbc:postgresql://{parsed.hostname}:{parsed.port or 5432}{parsed.path}"
if query:
    from urllib.parse import urlencode
    jdbc_url += '?' + urlencode(query)

private_config = runtime / 'application-private.properties'
private_config.write_text(
    'music.recognition.rapidapi-key=' + key + '\n'
    'music.recognition.rapidapi-host=' + host + '\n',
    encoding='utf-8',
)
os.chown(private_config, 0, 10001)
private_config.chmod(0o440)

values = {
    'APP_IMAGE': image,
    'DATABASE_URL': jdbc_url,
    'DATABASE_USERNAME': unquote(parsed.username or ''),
    'DATABASE_PASSWORD': unquote(parsed.password or ''),
    'SHAZAM_RAPIDAPI_HOST': host,
    'ADMIN_USERNAME': admin.get('username', ''),
    'ADMIN_PASSWORD': admin.get('password', ''),
    'AWS_REGION': os.environ['AWS_REGION'],
    'MELODEX_PRIVATE_CONFIG_FILE': str(private_config),
}
with (runtime / 'deploy.env').open('w', encoding='utf-8') as env_file:
    def dotenv_quote(value):
        return "'" + str(value).replace('\\', '\\\\').replace("'", "\\'") + "'"
    for name, value in values.items():
        env_file.write(f'{name}={dotenv_quote(value)}\n')
(runtime / 'deploy.env').chmod(0o600)
PY
rm -f "$db_secret_file" "$rapidapi_secret_file" "$admin_secret_file"

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$ECR_REGISTRY"
docker compose --project-name melodex \
  --env-file "$compose_env" \
  --file /opt/melodex/compose.aws.yaml pull
docker compose --project-name melodex \
  --env-file "$compose_env" \
  --file /opt/melodex/compose.aws.yaml up -d --remove-orphans

for attempt in $(seq 1 30); do
  if curl --fail --silent http://127.0.0.1/api/health >/dev/null; then
    exit 0
  fi
  sleep 5
done

docker compose --project-name melodex --env-file "$compose_env" \
  --file /opt/melodex/compose.aws.yaml logs --tail=80 web nginx >&2 || true
exit 1
