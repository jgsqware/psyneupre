#!/bin/sh
# Build complet du Worker. UNE seule commande, pour que Workers Builds et le
# poste local produisent exactement la même chose — la commande du dashboard
# se résume à `./build.sh`.
#
# Deux sorties, volontairement séparées :
#   dist/         assets statiques publiés tels quels (assets.directory)
#   worker-build/ script serveur compilé depuis functions/ (main)
#
# worker-build/ doit rester HORS de dist/ : tout dist/ est publié en accès
# public, le code serveur y serait téléchargeable.
#
# dist/ est une copie allowlist, pas un bundle. Pointer assets.directory sur la
# racine du dépôt exposerait CLAUDE.md (notes infra node2/ship), seo/ et
# nginx.conf sur le domaine public. On énumère donc ce qui part en public.
set -eu

rm -rf dist worker-build
mkdir -p dist
cp index.html styles.css script.js robots.txt _headers _redirects favicon.svg og-image.png dist/
cp -r fonts dist/

# sitemap : lastmod = date de publication
sed "s|<lastmod>[^<]*</lastmod>|<lastmod>$(date -u +%Y-%m-%d)</lastmod>|" sitemap.xml > dist/sitemap.xml

echo "dist/ :"
ls -1 dist

# functions/ -> un script unique. Le --outdir n'est pas optionnel : sans lui
# wrangler écrit ailleurs et `wrangler deploy` ne trouve pas son point d'entrée
# (c'est exactement ce qui a fait échouer le premier build).
npx --yes wrangler pages functions build --outdir=./worker-build/

echo "worker-build/ :"
ls -1 worker-build
