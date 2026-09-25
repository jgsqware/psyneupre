// Cloudflare Pages Function — POST /api/contact
// Envoie le message du formulaire à contact@psyneupre.be via l'API Resend.
// Variables à définir dans Pages → Settings → Environment variables :
//   RESEND_API_KEY   (secret)
//   CONTACT_TO       contact@psyneupre.be
//   CONTACT_FROM     "Site psyneupre <formulaire@psyneupre.be>"  (domaine vérifié chez Resend)

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json({ ok: false, error: 'bad_request' }, 400); }
  const f = {
    nom: (d.nom || '').trim(), prenom: (d.prenom || '').trim(),
    email: (d.email || '').trim(), tel: (d.tel || '').trim(), message: (d.message || '').trim(),
  };
  if (d.website) return json({ ok: true }); // honeypot anti-spam
  if (!f.nom || !f.prenom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) || f.tel.replace(/\D/g, '').length < 9 || f.message.length < 5 || f.message.length > 5000) {
    return json({ ok: false, error: 'invalid' }, 422);
  }
  const html = `<p><strong>${esc(f.prenom)} ${esc(f.nom)}</strong><br>${esc(f.email)} · ${esc(f.tel)}</p><p>${esc(f.message).replace(/\n/g, '<br>')}</p>`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM, to: [env.CONTACT_TO], reply_to: f.email,
      subject: `Demande de contact — ${f.prenom} ${f.nom}`,
      html, text: `${f.prenom} ${f.nom}\n${f.email} · ${f.tel}\n\n${f.message}`,
    }),
  });
  return r.ok ? json({ ok: true }) : json({ ok: false, error: 'send_failed' }, 502);
}

const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
