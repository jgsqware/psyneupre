# psyneupre

Site vitrine de Céline Liurno, psychologue & sexologue à Plainevaux (Neupré, Liège).

Statique pur — `index.html`, `styles.css`, `script.js`, aucun bundler. Prod publique sur
un Cloudflare Worker à assets statiques (`www.psyneupre.be`), où `functions/api/contact.js`
sert le formulaire de contact. Aperçu tailnet-only servi par nginx sur node2, derrière
l'edge Caddy (`psyneupre.jgsquare.io`) — le formulaire n'y fonctionne pas, faute de runtime
Workers.

Voir `CLAUDE.md` pour ce qu'il faut savoir avant de toucher au code, et le `Shipfile`
pour le déploiement (`ship psyneupre`).
