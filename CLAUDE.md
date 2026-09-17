# psyneupre

Site vitrine de Céline Liurno, psychologue & sexologue à Plainevaux (Neupré, Liège).

## Stack
Statique pur : un `index.html`, un `styles.css`. Aucun build, aucun framework, aucun
runtime. `seo/` est un outillage Python autonome (pytrends), sans lien avec le site servi.

**Deux fronts, un seul public :**

| Front | Hôte | Rôle |
|---|---|---|
| **Cloudflare Pages** | `www.psyneupre.be` | 🌍 **prod publique**, la seule indexée |
| node2 nginx:alpine :8145 | `psyneupre.jgsquare.io` | 🔒 aperçu tailnet-only |

## Commandes
    python3 -m http.server 8000     # aperçu local
    ./pages-build.sh                # produit dist/ (ce que Pages publiera)
    ship psyneupre                  # déploie l'aperçu node2 (mode A · docker-context)
    ship psyneupre --checks-only    # sondes via l'edge, zéro deploy

Prod publique = `git push origin main` → Cloudflare Pages build auto.

## Ce qu'il faut savoir avant de coder
- 🔴 **Pas de build.** `Dockerfile` COPIE les fichiers tels quels dans nginx ; `pages-build.sh`
  est une **copie allowlist**, pas un bundler. Introduire un vrai build oblige à reprendre
  les deux. Tout nouveau fichier à publier doit être ajouté **aux deux** listes, sinon il
  existe sur un front et pas sur l'autre.
- 🔴 `pages-build.sh` existe parce que Pages publie **tout** son dossier de sortie. Le
  pointer sur la racine du dépôt exposerait `CLAUDE.md` (notes infra node2/ship), `seo/`
  et `nginx.conf` sur le domaine public.
- 🔴 Les en-têtes de sécurité sont déclarés **deux fois** : `nginx.conf` (node2) et
  `_headers` (Pages). Il n'y a pas de nginx sur Pages — modifier l'un sans l'autre crée
  un écart silencieux entre l'aperçu et la prod.
- 🔴 `absolute_redirect off` dans `nginx.conf` : sans lui, nginx émet des redirections
  `http://psyneupre.jgsquare.io:8145/…` (port interne, HTTP) derrière Caddy → page morte.
- 🔴 Le JSON-LD `MedicalBusiness` de `index.html` porte l'adresse, le téléphone et le mail
  **réels**. Ce sont des données métier : ne jamais les inventer ni les « corriger ».
- 🔴 `canonical`, `og:url`, `sitemap.xml` et `robots.txt` pointent tous **`https://www.psyneupre.be`**
  (avec `www`). `_redirects` 301 l'apex vers `www`. Changer d'avis sur le `www` oblige à
  reprendre ces cinq endroits **ensemble**, sinon Google voit du contenu dupliqué.
- 🟡 Le corps de texte (section « Mon approche », descriptions des 3 services) est
  **masqué** via `.is-hidden` (`display:none`), pas supprimé — choix design du 2026-09-17.
  Google ignore largement le contenu masqué : le site n'a donc quasi pas de texte
  indexable, et son SEO repose sur le JSON-LD + Google Business Profile. Retirer la
  classe suffit à tout rétablir.
- 🟡 GitHub Pages est **désactivé** depuis 2026-08-24 — à ne pas confondre avec
  Cloudflare Pages, qui est le front public depuis 2026-09-17.
