#!/usr/bin/env bash
# dist/ altına Chrome (.zip) ve Firefox (.xpi) paketlerini üretir.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist
for target in chrome firefox; do
  tmp="$(mktemp -d)"
  cp src/* "$tmp"/
  cp "manifests/manifest.$target.json" "$tmp/manifest.json"
  ext=zip; [ "$target" = firefox ] && ext=xpi
  (cd "$tmp" && zip -qr -X "$OLDPWD/dist/dp-x-source-label-$target.$ext" .)
  rm -rf "$tmp"
  echo "dist/dp-x-source-label-$target.$ext"
done
