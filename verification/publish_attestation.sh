#!/usr/bin/env bash
# Publish attestation.json to the public site repos so it's live same-origin at
# https://fieldfluxbiosystems.com/attestation.json and
# https://membrane-health.com/attestation.json  — each site then renders its own
# copy (no cross-origin fetch, no CORS).
#
# No-ops gracefully if PAGES_DEPLOY_TOKEN isn't configured, so the workflow still
# builds + attests + uploads the artifact before the secret is set up.
#
# PAGES_DEPLOY_TOKEN: a token with `contents:write` on BOTH
#   zedjames/fieldfluxbiosystems  and  zedjames/membrane-health-site.
set -euo pipefail

if [ -z "${PAGES_DEPLOY_TOKEN:-}" ]; then
  echo "PAGES_DEPLOY_TOKEN not set — skipping publish (artifact + provenance still produced)."
  exit 0
fi
if [ ! -f attestation.json ]; then
  echo "attestation.json missing — nothing to publish." >&2
  exit 1
fi

STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
for REPO in zedjames/fieldfluxbiosystems zedjames/membrane-health-site; do
  tmp="$(mktemp -d)"
  git clone --depth 1 "https://x-access-token:${PAGES_DEPLOY_TOKEN}@github.com/${REPO}.git" "$tmp"
  cp attestation.json "$tmp/attestation.json"
  (
    cd "$tmp"
    git config user.name  "fieldflux-attestation"
    git config user.email "contact@fieldfluxbiosystems.com"
    git add attestation.json
    if git diff --cached --quiet; then
      echo "${REPO}: attestation unchanged — nothing to publish."
    else
      git commit -m "attestation: ${GITHUB_SHA:-manual} @ ${STAMP}"
      git push
      echo "${REPO}: published attestation.json"
    fi
  )
  rm -rf "$tmp"
done
