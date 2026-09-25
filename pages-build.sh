#!/bin/sh
# Build Cloudflare Pages — ce n'est PAS un bundler : une copie allowlist.
#
# Pages publie tout le contenu du dossier de sortie. Pointer Pages sur la racine
# du dépôt exposerait CLAUDE.md (notes infra node2/ship), seo/ et nginx.conf sur
# www.psyneupre.be. On énumère donc explicitement ce qui part en public.
#
# functions/ n'est PAS copié : Pages découvre les Functions à la racine du
# projet, pas dans le dossier de sortie.
set -eu

rm -rf dist
mkdir -p dist
cp index.html styles.css script.js robots.txt _headers _redirects favicon.svg og-image.png dist/

# sitemap : lastmod = date de publication
sed "s|<lastmod>[^<]*</lastmod>|<lastmod>$(date -u +%Y-%m-%d)</lastmod>|" sitemap.xml > dist/sitemap.xml

echo "dist/ :"
ls -1 dist
