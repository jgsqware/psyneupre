#!/bin/sh
# Build Cloudflare Pages — ce n'est PAS un bundler : une copie allowlist.
#
# Pages publie tout le contenu du dossier de sortie. Pointer Pages sur la racine
# du dépôt exposerait CLAUDE.md (notes infra node2/ship), seo/ et nginx.conf sur
# www.psyneupre.be. On énumère donc explicitement ce qui part en public.
set -eu

rm -rf dist
mkdir -p dist
cp index.html styles.css robots.txt sitemap.xml _headers _redirects dist/

echo "dist/ :"
ls -1 dist
