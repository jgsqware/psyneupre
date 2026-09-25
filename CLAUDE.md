# psyneupre

Site vitrine de Céline Liurno, psychologue & sexologue à Plainevaux (Neupré, Liège).

## Stack
Statique pur : `index.html`, `styles.css`, `script.js`, `favicon.svg`, `og-image.png`.
Aucun build, aucun framework, aucun bundler. Seule exception au « tout statique » :
`functions/api/contact.js`, une Cloudflare Pages Function (formulaire → Resend), qui
n'existe donc que sur le front public. `seo/` est un outillage Python autonome
(pytrends), sans lien avec le site servi.

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
  existe sur un front et pas sur l'autre. Les deux listes ne sont pas identiques :
  `_headers`/`_redirects` sont Pages-only, `functions/` n'est dans aucune des deux (Pages
  découvre les Functions à la racine du dépôt, pas dans `dist/`).
- 🔴 **Le formulaire ne marche que sur Pages.** `script.js` POST `/api/contact`, servi par
  `functions/api/contact.js` (Resend). node2 n'a pas de runtime Functions : nginx répond
  405 sur ce POST et le formulaire affiche son message d'échec. C'est attendu — l'aperçu
  node2 ne teste que le rendu. La prod exige trois variables dans Pages → Settings →
  Environment variables : `RESEND_API_KEY` (secret), `CONTACT_TO`, `CONTACT_FROM`
  (domaine vérifié chez Resend). Sans elles, l'envoi renvoie 502.
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
- 🟢 Le site porte le contenu complet fourni par la cliente (2026-09-23) : présentation,
  parcours, consultations, thèmes, informations/tarif (30 min · 40 €), FAQ, contact.
  Texte repris tel quel (coquilles corrigées) — ne pas le réécrire sans son accord.
  Le `.hero-tagline` est visible depuis le passage au design v3 (2026-09-25).
- 🟢 **La source de vérité du design est le projet claude.ai/design**
  `68f133e0-a3c0-4b0e-8c81-1415d8fb6277` (dossier `repo/`), pas ce dépôt. Une retouche
  visuelle se fait là-bas puis se réimporte via DesignSync (`/design-login` d'abord).
- 🟡 `og-image.png` n'est pas modifiable à la main : il est rendu à partir de
  `OG Image.dc.html` du projet design (1200×630, Chromium headless, polices Google
  embarquées en data-URI). DesignSync tronque les binaires à 256 Kio, donc on le
  **regénère** au lieu de le télécharger.
- 🟡 GitHub Pages est **désactivé** depuis 2026-08-24 — à ne pas confondre avec
  Cloudflare Pages, qui est le front public depuis 2026-09-17.
