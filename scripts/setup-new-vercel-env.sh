#!/usr/bin/env bash
# One-time: populate the NEW Vercel project's Production env vars from local .env,
# then redeploy. Run from the project root in Git Bash:
#
#     bash scripts/setup-new-vercel-env.sh
#
# Why this is needed: the new project (yogesh-cbc3/yogi-tours-and-travels) had
# every env var created with an EMPTY value, so the app 500s (blank DATABASE_URL).
#
# Requires: vercel CLI logged in (or export VERCEL_TOKEN=...), repo linked to the
# new project (vercel link --project yogi-tours-and-travels --scope yogesh-cbc3).
set -euo pipefail
cd "$(dirname "$0")/.."

TOKEN_ARG=()
[ -f .vercel-token ] && TOKEN_ARG=(--token "$(cat .vercel-token)")

# name -> where the value comes from. "@ENV" means read KEY from local .env.
declare -A VALUES=(
  [NODE_ENV]="production"
  [SITE_URL]="https://www.yogitourstravels.com"
  [DATABASE_URL]="@ENV"
  [SESSION_SECRET]="@ENV"
  [ENCRYPTION_KEY]="@ENV"
  [ADMIN_USERNAME]="@ENV"
  [ADMIN_PASSWORD]="@ENV"
  [BUSINESS_PHONE]="@ENV"
  [BUSINESS_WHATSAPP]="@ENV"
  [BUSINESS_EMAIL]="@ENV"
)

for KEY in "${!VALUES[@]}"; do
  RAW="${VALUES[$KEY]}"
  if [ "$RAW" = "@ENV" ]; then
    VAL="$(grep -E "^${KEY}=" .env | head -1 | cut -d= -f2- | tr -d '\r' || true)"
  else
    VAL="$RAW"
  fi
  if [ -z "${VAL:-}" ]; then
    echo "!! $KEY has no value in .env — skipping"
    continue
  fi
  printf '%s' "$VAL" | vercel env add "$KEY" production --force --yes "${TOKEN_ARG[@]}" >/dev/null
  echo "ok  $KEY  (${#VAL} chars)"
done

echo
echo "Env vars set. Redeploying production..."
vercel deploy --prod --yes "${TOKEN_ARG[@]}"
