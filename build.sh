#!/bin/sh
# Produit dist/, le dossier d'assets statiques du Worker — ce n'est PAS un
# bundler : une copie allowlist.
#
# Tout ce qui est dans dist/ est publié tel quel sur www.psyneupre.be. Pointer
# assets.directory sur la racine du dépôt exposerait CLAUDE.md (notes infra
# node2/ship), seo/ et nginx.conf. On énumère donc ce qui part en public.
#
# functions/ n'est PAS copié ici : il est compilé séparément vers worker-build/
# par `wrangler pages functions build`, hors de dist/ — dans dist/ le code
# serveur serait publié comme asset public.
set -eu

rm -rf dist
mkdir -p dist
cp index.html styles.css script.js robots.txt _headers _redirects favicon.svg og-image.png dist/

# sitemap : lastmod = date de publication
sed "s|<lastmod>[^<]*</lastmod>|<lastmod>$(date -u +%Y-%m-%d)</lastmod>|" sitemap.xml > dist/sitemap.xml

echo "dist/ :"
ls -1 dist
