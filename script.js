// Navigation mobile, barre d'action mobile, thèmes repliables, formulaire de contact.
(() => {
    const body = document.body;
    const nav = document.getElementById('nav');
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    const sticky = document.querySelector('.sticky-cta');
    const contact = document.getElementById('contact');
    let scrollPos = 0;

    // Menu mobile
    const openMenu = () => {
        scrollPos = window.scrollY;
        body.style.top = `-${scrollPos}px`;
        body.classList.add('menu-open');
        menu.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Fermer le menu');
    };
    const closeMenu = () => {
        body.classList.remove('menu-open');
        body.style.top = '';
        window.scrollTo(0, scrollPos);
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Ouvrir le menu');
    };
    toggle.addEventListener('click', () => (toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu()));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', e => {
        if (!menu.classList.contains('active')) return;
        e.preventDefault();
        closeMenu();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) setTimeout(() => window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' }), 50);
    }));

    // Fond de nav + barre d'action mobile (après le hero, masquée près de Contact)
    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
        const pastHero = window.scrollY > window.innerHeight * 0.8;
        const atContact = contact.getBoundingClientRect().top < window.innerHeight * 0.6;
        const show = pastHero && !atContact && !body.classList.contains('menu-open');
        sticky.classList.toggle('visible', show);
        sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    // Thèmes : 3 mots visibles, bouton « Voir les N autres »
    const SHOWN = 3;
    document.querySelectorAll('.theme-card').forEach(card => {
        const more = card.querySelectorAll('.cloud li').length - SHOWN;
        if (more <= 0) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-more';
        btn.setAttribute('aria-expanded', 'false');
        const label = () => {
            const open = card.classList.contains('open');
            btn.innerHTML = `${open ? 'Réduire' : `Voir les ${more} autres`}<span aria-hidden="true">↓</span>`;
            btn.setAttribute('aria-expanded', String(open));
        };
        btn.addEventListener('click', () => { card.classList.toggle('open'); label(); });
        label();
        card.appendChild(btn);
    });

    // Formulaire → POST /api/contact (Cloudflare Pages Function, Resend)
    const form = document.querySelector('.contact-form');
    const success = document.querySelector('.form-success');
    const failure = form.querySelector('.form-error');
    const submit = form.querySelector('button[type="submit"]');
    const rules = {
        nom: v => v.trim() ? '' : 'Indiquez votre nom.',
        prenom: v => v.trim() ? '' : 'Indiquez votre prénom.',
        email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Adresse email invalide.',
        tel: v => v.replace(/\D/g, '').length >= 9 ? '' : 'Numéro de téléphone invalide.',
        message: v => v.trim().length >= 5 ? '' : 'Écrivez votre message.',
    };
    const setError = (field, msg) => {
        field.classList.toggle('invalid', !!msg);
        field.setAttribute('aria-invalid', msg ? 'true' : 'false');
        field.parentElement.querySelector('.field-error').textContent = msg;
    };
    Object.keys(rules).forEach(name => {
        const field = form.elements[name];
        field.addEventListener('input', () => { if (field.classList.contains('invalid')) setError(field, rules[name](field.value)); });
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        failure.hidden = true;
        let firstInvalid = null;
        Object.entries(rules).forEach(([name, rule]) => {
            const field = form.elements[name];
            const msg = rule(field.value);
            setError(field, msg);
            if (msg && !firstInvalid) firstInvalid = field;
        });
        if (firstInvalid) { firstInvalid.focus(); return; }

        const data = Object.fromEntries(new FormData(form));
        submit.disabled = true;
        submit.textContent = 'Envoi…';
        try {
            const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!r.ok) throw new Error(r.status);
            success.querySelector('[data-sent-email]').textContent = data.email.trim();
            form.hidden = true;
            success.hidden = false;
        } catch {
            failure.hidden = false;
        } finally {
            submit.disabled = false;
            submit.textContent = 'Envoyer le message';
        }
    });

    success.querySelector('[data-reset]').addEventListener('click', () => {
        form.reset();
        form.hidden = false;
        success.hidden = true;
    });
})();
