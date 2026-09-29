// Cloudflare Pages Function — POST /api/e
// Mesure d'audience maison : un événement anonyme par action (appel, mail, formulaire…),
// écrit dans Workers Analytics Engine (dataset `site_events`, binding EVENTS).
// Ni IP, ni user-agent, ni cookie, ni identifiant : seulement l'action, l'endroit de la
// page, le site d'origine, le pays (déduit par Cloudflare) et mobile/ordinateur.
// Lu par le dashboard stats (API SQL d'Analytics Engine).

const EVENTS = new Set([
  'tel', 'tel_urgence', 'mail', 'maps', 'cta_contact',
  'form_sent', 'form_error', 'form_invalid', 'scroll_50', 'scroll_90',
]);
const clip = (s, n) => String(s ?? '').slice(0, n);

export async function onRequestPost({ request, env }) {
  if (!env.EVENTS) return new Response(null, { status: 204 });
  const raw = await request.text();
  if (raw.length > 1024) return new Response(null, { status: 413 });
  let d;
  try { d = JSON.parse(raw); } catch { return new Response(null, { status: 400 }); }
  if (!d || !EVENTS.has(d.e)) return new Response(null, { status: 400 });

  env.EVENTS.writeDataPoint({
    indexes: [new URL(request.url).hostname],
    blobs: [
      d.e,                                    // blob1 : action
      clip(d.l, 64),                          // blob2 : endroit (nav, hero, contact, sticky…)
      clip(d.p, 128),                         // blob3 : chemin
      clip(d.r, 64),                          // blob4 : site d'origine (referrer, hôte seul)
      clip(request.cf?.country, 2),           // blob5 : pays
      d.m === 'mobile' ? 'mobile' : 'desktop', // blob6 : appareil
    ],
    doubles: [1],
  });
  return new Response(null, { status: 204 });
}
