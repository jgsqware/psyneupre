# syntax=docker/dockerfile:1.7
# psyneupre — vitrine statique (Céline Liurno, psychologue & sexologue à Plainevaux/Neupré).
# Aucun build : index.html + styles.css sont servis tels quels par nginx:alpine non-root.

FROM nginx:1.27-alpine

# Notre config (écoute :8145, chemins temp sous /tmp pour tourner non-root).
COPY nginx.conf /etc/nginx/nginx.conf

# Le site statique. robots.txt/sitemap.xml sont copiés pour garder node2 iso au
# public (Cloudflare Pages) : node2 reste tailnet-only, c'est l'aperçu avant prod.
# Miroir de l'allowlist de build.sh, moins _headers/_redirects (Workers only)
# et moins functions/ : les Pages Functions n'ont pas d'équivalent sous nginx,
# donc POST /api/contact échoue sur l'aperçu — le formulaire ne s'y teste pas.
COPY index.html styles.css script.js favicon.svg og-image.png robots.txt sitemap.xml /usr/share/nginx/html/
COPY fonts/ /usr/share/nginx/html/fonts/

# nginx:alpine embarque l'utilisateur non privilégié `nginx` (UID 101). On rend
# les chemins runtime accessibles en écriture puis on lâche root.
RUN mkdir -p /tmp/nginx-client && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /tmp && \
    chmod -R g+w /var/cache/nginx

USER nginx
EXPOSE 8145

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8145/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
