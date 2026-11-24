(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const hasG = !!(G && ST);
  if (hasG) G.registerPlugin(ST);
  const MOTION = '(prefers-reduced-motion: no-preference)';
  const LIVE_Q = '(min-width: 901px) and (min-height: 560px) and ' + MOTION;
  const liveNow = () => window.matchMedia(LIVE_Q).matches;

  /* ---------- koppen: woorden in een masker (schuiven omhoog uit een clip) ---------- */
  const maskSplit = (el) => {
    let i = 0;
    const wrap = (node) => { const m = document.createElement('span'); m.className = 'wm'; const w = document.createElement('span'); w.className = 'wi'; w.style.setProperty('--i', i++); m.appendChild(w); w.appendChild(node); return m; };
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/([ \t\n\r]+)/).forEach((p) => {
            if (!p) return;
            if (/^[ \t\n\r]+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            frag.appendChild(wrap(document.createTextNode(p)));
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.classList.contains('hpill')) {
          const ph = document.createComment('');
          n.replaceWith(ph); ph.replaceWith(wrap(n));
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  };
  $$('[data-mask]').forEach(maskSplit);

  /* koppen die oplichten tijdens het scrollen */
  $$('[data-light]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, k) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; el.appendChild(s); if (k < words.length - 1) el.appendChild(document.createTextNode(' ')); });
  });

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const onNav = () => nav.classList.toggle('is-s', window.scrollY > 16);
  window.addEventListener('scroll', onNav, { passive: true });
  onNav();

  /* ---------- de beeldpil in de hero-kop ---------- */
  const pillImgs = $$('.hpill img');
  if (pillImgs.length > 1 && !reduce) {
    let pi = 0;
    setInterval(() => { pillImgs[pi].classList.remove('is-on'); pi = (pi + 1) % pillImgs.length; pillImgs[pi].classList.add('is-on'); }, 2200);
  }

  /* ---------- de waaier in de hero ---------- */
  const fan = $('#fan');
  const cards = $$('.card', fan);
  const lead = $('.card--lead', fan);
  const isSmall = () => window.innerWidth <= 760;
  const A = (c) => {
    const cw = c.offsetWidth || 260, sm = isSmall(), k = +c.dataset.pos;
    if (k === 0) return { x: 0, y: 0, rotation: 0, scale: 1.06 };
    return { x: k * cw * (sm ? 0.42 : 0.62), y: k * k * (sm ? 6 : 12), rotation: k * 6, scale: 1 };
  };
  const order = (c) => Math.abs(+c.dataset.pos);

  let introDone = Promise.resolve();
  const scanLead = () => { lead.classList.remove('is-scan'); void lead.offsetWidth; lead.classList.add('is-scan'); };
  const startIntro = () => {
    if (!hasG || reduce || window.scrollY > 40) { root.classList.add('ready'); return; }
    introDone = new Promise((res) => {
      const rest = cards.filter((c) => c !== lead);
      root.classList.add('ready');
      /* buiten desktop eindigt de intro exact op de stand uit de CSS, zodat er na afloop niets verspringt */
      const css = liveNow() ? null : new Map(cards.map((c) => {
        const m = /matrix\(([^)]+)\)/.exec(getComputedStyle(c).transform || '');
        if (!m) return [c, { x: 0, y: 0, rotation: 0, scale: 1 }];
        const [a, b, , , e, f] = m[1].split(',').map(Number);
        return [c, { x: e, y: f, rotation: Math.atan2(b, a) * 180 / Math.PI, scale: Math.hypot(a, b) }];
      }));
      const T = (c) => (css ? css.get(c) : A(c));
      G.set(cards, { x: 0, y: 18, rotation: 0, scale: 0.96 });
      G.set(rest, { opacity: 0 });
      root.classList.add('ready');
      const tl = G.timeline({ delay: 0.75, onComplete: () => { G.set(cards, { clearProps: liveNow() ? 'opacity' : 'transform,translate,rotate,opacity' }); res(); } });
      { const t = T(lead); tl.to(lead, { x: t.x, y: t.y, rotation: t.rotation, scale: css ? t.scale : 1.06, duration: 0.9, ease: 'power3.out' }, 0); }
      rest.sort((a, b) => order(a) - order(b)).forEach((c, i) => {
        const t = T(c);
        tl.to(c, { opacity: 1, duration: 0.3, ease: 'none' }, 0.95 + i * 0.07);
        tl.to(c, { x: t.x, y: t.y, rotation: t.rotation, scale: t.scale, duration: 1.4, ease: 'expo.out' }, 0.95 + i * 0.07);
      });
    });
  };
  if (!hasG) root.classList.add('no-g');

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (hasG && !reduce && window.Lenis && window.matchMedia('(pointer: fine)').matches) {
    lenis = new window.Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const goTo = (target) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -78, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      goTo(id === '#aanvraag' ? $('#formcard') : t);
      history.replaceState(null, '', id);
    });
  });

  /* ---------- 01 tot 03: één doorlopend object ---------- */
  const journey = $('#journey'), stage = $('#stage'), feel = $('#gevoel'), space = $('#feelSpace');
  const wA = $$('.feel__h--a .w', feel), wB = $$('.feel__h--b .w', feel);
  const hA = $('.feel__h--a', feel), hR = $('.feel__r', feel), svc = $('.svc2', feel);
  const deck = $('#deck'), deckIn = $('.dv__scr', deck), lapF = $('.dv__lap', deck), devBase = $('.dv__base', deck), devCap = $('.dv__cap', deck), phn = $('.dv__ph', deck), phones = [phn];
  const buzz = $('#buzz'), bz = buzz ? $$('.bz', buzz) : [];
  const card = (n) => cards.find((c) => ($('img', c).getAttribute('src') || '').includes(n));
  const cCredo = card('credo'), cCar = card('carwash'), cFadim = card('fadim');
  const lit = (c) => $('.card__lit', c);
  const inner = (c) => $('.card__in', c);
  const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
  const centerOf = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + window.scrollY + r.height / 2, w: r.width, h: r.height }; };

  const buildLive = () => {
    const hero = $('#hero');
    const typo = $('#webdesign');
    root.classList.add('is-live');
    let tl = null;
    let trafficAt = () => 0, soloFrom = 0;

    /* ---------- verkeer: bezoekers (muis en vinger) die rustig naar de site bewegen en klikken ---------- */
    const cv = document.createElement('canvas'); cv.className = 'traffic'; cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
    const cx2 = cv.getContext('2d');
    const CUR = new Path2D('M0,0 L0,14 L3.6,10.6 L6.2,16.2 L8.5,15.2 L6,9.8 L10.6,9.8 Z');
    let dpr = 1, VW = 0, VH = 0, parts = [], acc = 0, last = 0, idle = true;
    const col = (getComputedStyle(root).getPropertyValue('--gold') || '#A0C9FD').trim();
    const rgb = (() => { const h = col.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; })();
    const rgba = (a) => 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a.toFixed(3) + ')';
    const size = () => { dpr = Math.min(2, window.devicePixelRatio || 1); VW = innerWidth; VH = innerHeight; cv.width = VW * dpr; cv.height = VH * dpr; };
    size(); window.addEventListener('resize', size);
    const rnd = (a, b) => a + Math.random() * (b - a);
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const spawn = () => {
      const span = Math.max(lead.getBoundingClientRect().width, 200);
      const th = Math.random() * Math.PI * 2, r0 = span * rnd(0.55, 1.05);
      const kind = Math.random() < 0.65 ? 'cur' : 'tap';
      /* elke bezoeker kiest een site; zodra de waaier dicht is, gaat iedereen naar Credo */
      /* Credo boekt zelf (js/demo.js); de bezoekers gaan naar de andere twee sites */
      const pool = window.scrollY > soloFrom ? [] : cards.filter((c) => c !== lead);
      if (!pool.length) return;
      /* verdeel het bezoek: de site met de minste bezoekers krijgt de volgende */
      const load = (c) => parts.filter((q) => q.el === c).length;
      const min = Math.min(...pool.map(load)), free = pool.filter((c) => load(c) === min);
      const el = free[Math.floor(Math.random() * free.length)];
      parts.push({ kind, el, th, r0, bend: rnd(-0.45, 0.45), u: rnd(0.22, 0.78), v: rnd(0.25, 0.75), t: 0, d: rnd(3.4, 5), s: rnd(1.05, 1.3), c: -1 });
    };
    const draw = (time) => {
      const dt = Math.min(0.05, last ? time - last : 0.016); last = time;
      const I = reduce ? 0 : trafficAt(window.scrollY);
      if (I <= 0 && !parts.length) { if (!idle) { cx2.clearRect(0, 0, cv.width, cv.height); idle = true; } return; }
      idle = false;
      const r = lead.getBoundingClientRect(), rects = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
      cx2.setTransform(dpr, 0, 0, dpr, 0, 0); cx2.clearRect(0, 0, VW, VH);
      acc += dt * 0.45 * I; while (acc >= 1) { spawn(); acc -= 1; }
      /* elke site heeft altijd minstens één bezoeker */
      if (I > 0.2) { const pool = window.scrollY > soloFrom ? [] : cards.filter((c) => c !== lead); pool.forEach((c) => { if (!parts.some((q) => q.el === c)) spawn(); }); }
      parts = parts.filter((pt) => {
        /* doel: een eigen plek op de site, die meebeweegt met de kaart */
        const rr = rects.get(pt.el) || r;
        const ex = rr.left + rr.width * pt.u, ey = rr.top + rr.height * pt.v;
        const sx = ex + Math.cos(pt.th) * pt.r0, sy = ey + Math.sin(pt.th) * pt.r0 * 0.75;
        const mx = (sx + ex) / 2 - (ey - sy) * pt.bend, my = (sy + ey) / 2 + (ex - sx) * pt.bend;
        let x, y, a, press = 1;
        if (pt.c < 0) {
          pt.t += dt / pt.d;
          const t = Math.min(1, pt.t), e = ease(t), q = 1 - e;
          x = q * q * sx + 2 * q * e * mx + e * e * ex; y = q * q * sy + 2 * q * e * my + e * e * ey;
          a = Math.min(1, t * 2.2) * (0.6 + 0.3 * e);
          if (t >= 1) pt.c = 0;
        } else {
          /* even stil, klikken, en dan weg */
          pt.c += dt / 1.7; if (pt.c >= 1) return false;
          x = ex; y = ey; const c = pt.c;
          a = 0.9 * (c < 0.65 ? 1 : 1 - (c - 0.65) / 0.35);
          if (c > 0.12 && c < 0.32) press = 1 - 0.22 * Math.sin(((c - 0.12) / 0.2) * Math.PI);
          if (c > 0.16 && !pt.hit) {
            pt.hit = true;
            /* de site reageert op de klik: een heel kleine indruk */
            const inn = pt.el && pt.el.querySelector('.card__in');
            if (inn && inn.animate) inn.animate([{ scale: '1', translate: '0 0' }, { scale: '0.982', translate: '0 1.5px' }, { scale: '1.004', translate: '0 0' }, { scale: '1', translate: '0 0' }], { duration: 520, easing: 'cubic-bezier(.3,.7,.3,1)' });
          }
          if (c > 0.2) {
            const k = clamp((c - 0.2) / 0.6);
            const hl = cx2.createRadialGradient(x, y, 0, x, y, 26);
            hl.addColorStop(0, 'rgba(255,255,255,' + (0.18 * (1 - k)).toFixed(3) + ')'); hl.addColorStop(1, 'rgba(255,255,255,0)');
            cx2.fillStyle = hl; cx2.beginPath(); cx2.arc(x, y, 26, 0, 7); cx2.fill();
            cx2.strokeStyle = rgba(0.6 * (1 - k)); cx2.lineWidth = 1.3;
            cx2.beginPath(); cx2.arc(x, y, 4 + k * 13, 0, 7); cx2.stroke();
          }
        }
        a *= (r.left + r.width / 2 > VW * 0.55 ? clamp((x - VW * 0.3) / (VW * 0.16), 0.15, 1) : 1);
        if (pt.kind === 'cur') {
          cx2.save(); cx2.translate(x, y); cx2.scale(pt.s * press, pt.s * press);
          cx2.fillStyle = 'rgba(0,0,0,' + (a * 0.35).toFixed(3) + ')'; cx2.translate(1, 1.5); cx2.fill(CUR); cx2.translate(-1, -1.5);
          cx2.fillStyle = rgba(a); cx2.fill(CUR);
          cx2.lineWidth = 1; cx2.strokeStyle = 'rgba(20,10,16,' + (a * 0.55).toFixed(3) + ')'; cx2.stroke(CUR);
          cx2.restore();
        } else {
          cx2.fillStyle = rgba(a * 0.2); cx2.beginPath(); cx2.arc(x, y, 9 * pt.s, 0, 7); cx2.fill();
          cx2.fillStyle = rgba(a * 0.9); cx2.beginPath(); cx2.arc(x, y, 3.2 * pt.s * press, 0, 7); cx2.fill();
        }
        return true;
      });
    };
    G.ticker.add(draw);

    const make = () => {
      const vh = window.innerHeight;
      typo.style.paddingBottom = '';
      /* oorsprong van de waaier (documentcoördinaten op het moment dat het podium loskomt) */
      const J0 = docTop(journey), E = J0 + journey.offsetHeight - vh;
      const sr = stage.getBoundingClientRect(), fr = fan.getBoundingClientRect(), spr = space.getBoundingClientRect();
      const fanX = fr.left, fanY = E + (fr.top - sr.top);
      const cw = lead.offsetWidth || 260, ch = lead.offsetHeight || cw * 0.625;
      const M = { dx: spr.left + spr.width / 2 - fr.left, dy: spr.top + spr.height / 2 - fr.top };
      /* in sectie 1 wordt de waaier één scherm: Credo groeit, de andere twee schuiven erachter weg */
      const sS = Math.min((spr.height - 6) / ch, (stage.offsetWidth * 0.4) / cw);
      const B = (c) => { const k = +c.dataset.pos; return k === 0 ? { x: M.dx, y: M.dy, rotation: 0, scale: sS, opacity: 1 } : { x: M.dx + k * cw * 0.16, y: M.dy + 10, rotation: k * 3, scale: sS * 0.86, opacity: 0 }; };

      /* de plek in Webdesign: rechts, verticaal in het midden van de sectie */
      const slot = centerOf(deckIn), colW = deck.getBoundingClientRect().width;
      const sF = deckIn.getBoundingClientRect().width / cw, cwF = sF * cw;
      const TX = slot.x - fanX - M.dx, TY = slot.y - fanY - M.dy;
      /* dichte stapel en open waaier, ten opzichte van het midden van de stapel */
      const closed = (c) => { const k = +c.dataset.pos; return { x: M.dx + k * 4, y: M.dy + Math.abs(k) * 3, rotation: k * 1.5 }; };
      /* open waaier in Webdesign: diagonaal, zodat hij ook in de hoogte vult */
      const open = (c) => { const k = +c.dataset.pos; return { x: M.dx + k * 0.4 * cwF, y: M.dy + k * 0.42 * cwF * 0.625, rotation: k * 3.5, scale: sF * (k ? 1 : 1.06) }; };

      /* meldingen en advertentie rond de waaier in sectie 1 (podiumcoördinaten) */
      const cx = spr.left - sr.left + spr.width / 2, cy = spr.top - sr.top + spr.height / 2;
      const hw = cw * 1.1 * 0.62 + cw * 0.53, sw = stage.offsetWidth;
      const place = (el, side, dy) => {
        const w = el.offsetWidth || 250, h = el.offsetHeight || 64;
        let x = side < 0 ? cx - hw - 26 - w : cx + hw + 26;
        x = Math.max(18, Math.min(sw - w - 18, x));
        G.set(el, { left: x, top: cy + dy * ch - h / 2 });
      };
      if (bz.length >= 2) {
        /* de meldingen liggen half over de buitenste kaarten, zoals op een vergrendelscherm */
        const pl = (el, side, dy) => { const w = el.offsetWidth || 330, h = el.offsetHeight || 80; let x = side < 0 ? cx - hw - 34 - w : cx + hw + 34; x = Math.max(18, Math.min(sw - w - 18, x)); G.set(el, { left: x, top: cy + dy * ch - h / 2 }); };
        pl(bz[0], -1, 0.42); pl(bz[1], 1, -0.42);
        /* lichtlijnen: van de sites naar de meldingen. De site brengt de oproep en de boeking binnen. */
        const ns = 'http://www.w3.org/2000/svg';
        let svgL = $('.bz__lines', buzz);
        if (!svgL) { svgL = document.createElementNS(ns, 'svg'); svgL.setAttribute('class', 'bz__lines'); buzz.prepend(svgL); }
        svgL.setAttribute('viewBox', '0 0 ' + sw + ' ' + stage.offsetHeight); svgL.innerHTML = '';
        const rectOf = (el) => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top), w: el.offsetWidth, h: el.offsetHeight });
        const t0 = rectOf(bz[0]), t1 = rectOf(bz[1]);
        const lines = [
          { a: [cx - cw * 0.35, cy + ch * 0.05], b: [t0.x + t0.w * 0.62, t0.y] },
          { a: [cx + cw * 0.35, cy - ch * 0.05], b: [t1.x + t1.w * 0.38, t1.y + t1.h] },
        ];
        lines.forEach((l, k) => {
          const [ax, ay] = l.a, [bx, by] = l.b, mx = (ax + bx) / 2;
          const d = 'M' + ax + ',' + ay + ' C' + mx + ',' + ay + ' ' + mx + ',' + by + ' ' + bx + ',' + by;
          svgL.insertAdjacentHTML('beforeend', '<g class="bz__lg" data-k="' + k + '"><path class="bz__ln" d="' + d + '"/><path class="bz__lf" d="' + d + '"/><circle class="bz__ld" r="3.2"><animateMotion dur="2.2s" repeatCount="indefinite" path="' + d + '"/></circle></g>');
        });
      }

      /* scrollposities */
      const LJ = E - J0, Tj = 6.2, jt = (t) => (t / Tj) * LJ, p = (y) => y - J0;
      /* alles staat op zijn plek op het moment dat het midden van Webdesign in het midden van het scherm komt */
      const secMid = docTop(typo) + typo.offsetHeight / 2;
      const S4 = Math.max(secMid - 0.5 * vh + 0.1 * vh, E + 0.5 * vh);
      const S3 = S4 - 0.08 * vh, S2 = S3 - 0.12 * vh;
      /* het scherm landt op de laptop wanneer die net onder het midden van het scherm staat */
      const YL = Math.max(E + 0.5 * vh, slot.y - 0.55 * vh), SE = Math.max(S4, YL + 0.3 * vh);
      tl = G.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          start: J0, end: SE + 0.02 * vh, scrub: 1.1,
          onUpdate: (self) => {
            const y = self.scroll();
            hero.style.pointerEvents = y > J0 + 0.04 * LJ ? 'none' : '';
            root.classList.toggle('is-flow', y > E - 4);
            deck.dataset.run = y > YL + 0.09 * vh ? '1' : '0';
            /* het scherm speelt zodra het uit de waaier gegroeid is, tot het op de laptop landt */
            lead.dataset.live = y > J0 + jt(1.6) && y < YL + 0.18 * vh ? '1' : '0';
            root.classList.toggle('is-s1', y > J0 + jt(1.2));
          },
        },
      });
      tl.set(cCredo, { zIndex: 20 }, 0).set(cCar, { zIndex: 18 }, 0).set(cFadim, { zIndex: 17 }, 0);

      /* 1. hero naar sectie 1 */
      const fades = $$('.hero__fade', hero), h1 = $('.h1', hero);
      tl.fromTo(fades, { y: 0, opacity: 1 }, { y: -14, opacity: 0, duration: jt(1.1), ease: 'sine.inOut' }, jt(0));
      tl.fromTo(h1, { y: 0, opacity: 1 }, { y: -24, opacity: 0, duration: jt(1.5), ease: 'sine.inOut' }, jt(0.1));
      tl.fromTo('#fxA', { opacity: 1 }, { opacity: 0.45, duration: jt(3) }, jt(0.3));
      tl.fromTo('#fxB', { opacity: 0 }, { opacity: 0.3, duration: jt(3) }, jt(1.4));
      /* in sectie 1 zakt het licht rond de waaier naar een zachte gloed */
      tl.fromTo('.fan__aura', { opacity: 1 }, { opacity: 0.38, duration: jt(2), ease: 'sine.inOut' }, jt(0.4));
      cards.forEach((c) => tl.fromTo(c,
        { x: A(c).x, y: A(c).y, rotation: A(c).rotation, scale: A(c).scale, opacity: 1 },
        { x: B(c).x, y: B(c).y, rotation: B(c).rotation, scale: B(c).scale, opacity: B(c).opacity, duration: jt(2.2), ease: 'power2.inOut' }, jt(0.3 + order(c) * 0.06)));
      tl.fromTo(hA, { opacity: 0, y: 18, x: 0 }, { opacity: 1, y: 0, duration: jt(1.2), ease: 'sine.out' }, jt(1.5));
      tl.fromTo(hR, { opacity: 0, y: 18, x: 0 }, { opacity: 1, y: 0, duration: jt(1.2), ease: 'sine.out' }, jt(1.8));
      tl.fromTo(wA, { opacity: 0.18 }, { opacity: 1, duration: jt(0.45), stagger: jt(0.3) }, jt(2.3));
      tl.fromTo(svc, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: jt(0.6), ease: 'sine.out' }, jt(2.3));
      /* meldingen komen binnen terwijl de tweede zin oplicht */
      bz.forEach((el, k) => {
        const from = k ? 22 : -22;
        tl.fromTo(el, { opacity: 0, x: from, y: 8, scale: 0.96 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: jt(0.7), ease: 'power2.out' }, jt(3.3 + k * 0.6));
        const lg = $('.bz__lg[data-k="' + k + '"]', buzz);
        if (lg) { tl.fromTo(lg, { opacity: 0 }, { opacity: 1, duration: jt(0.5) }, jt(3.0 + k * 0.6)); tl.to(lg, { opacity: 0, duration: 0.12 * vh }, p(E) - 0.06 * vh); }
      });
      /* en gaan weer weg voor de waaier dichtklapt: alleen de waaier reist mee */
      bz.forEach((el, k) => tl.to(el, { opacity: 0, y: -10, duration: 0.16 * vh, ease: 'sine.inOut' }, p(E) - 0.04 * vh + k * 0.02 * vh));

      /* 2a. toeklappen: na de pin vouwt de waaier dicht terwijl de pagina doorscrolt */
      cards.forEach((c) => tl.to(c, { ...closed(c), duration: 0.3 * vh, ease: 'power2.inOut' }, p(E) - 0.02 * vh));
      /* 2b. reizen: het scherm gaat naar de plek van de laptop, klapt onderweg dicht als een deksel
         en klapt daar weer open. Daarna neemt de echte laptop het over. */
      const Ta = p(E) + 0.02 * vh, Tb = p(YL), Lt = Tb - p(E);
      tl.fromTo(fan, { x: 0 }, { x: TX, duration: Tb - Ta, ease: 'power1.inOut' }, Ta);
      tl.fromTo(fan, { y: 0 }, { y: TY, duration: Lt, ease: 'none' }, p(E));
      cards.forEach((c) => tl.to(c, { scale: sF, duration: Tb - Ta - 0.06 * vh, ease: 'power1.inOut' }, Ta + 0.06 * vh));
      /* deksel dicht: kantelt naar achter rond de onderrand */
      /* in de witruimte draait het scherm meteen om, toont even Digital Impression en draait dan terug naar de site */
      tl.set(lead, { transformPerspective: 1400 }, p(E));
      tl.fromTo(lead, { rotationY: 0 }, { rotationY: 180, duration: 0.2 * Lt, ease: 'power2.inOut' }, p(E) + 0.02 * Lt);
      tl.to(lead, { rotationY: 360, duration: 0.2 * Lt, ease: 'power2.inOut' }, p(E) + 0.62 * Lt);
      tl.set(lead, { rotationY: 0, transformPerspective: 0 }, p(E) + 0.84 * Lt);
      /* terwijl Digital Impression in beeld staat, glijdt er een glans over */
      const shine = lead.querySelector('.card__shine');
      if (shine) tl.fromTo(shine, { xPercent: -160 }, { xPercent: 160, duration: 0.36 * Lt, ease: 'sine.inOut' }, p(E) + 0.24 * Lt);
      /* verkeer: van zodra de waaier dichtklapt tot hij landt, stroomt er bezoek naar de site */
      trafficAt = (y) => 0.75 * clamp((S2 - y) / (0.14 * vh)); soloFrom = J0 + jt(1.2);
      /* de tekst blijft staan; alleen wat onder de stapel door zou schuiven, vervaagt zacht */
      tl.to([hR], { opacity: 0, y: -8, duration: 0.12 * vh, ease: "sine.inOut" }, p(E) - 0.1 * vh);
      /* 2d. de echte laptop neemt over; de gsm schuift ervoor */
      /* het scherm ligt exact op het laptopscherm; daarna bouwt de laptop zich eromheen */
      tl.fromTo(lapF, { opacity: 0 }, { opacity: 1, duration: 0.06 * vh, ease: 'sine.inOut' }, Tb);
      tl.fromTo(devBase, { opacity: 0, scaleX: 0.6 }, { opacity: 1, scaleX: 1, duration: 0.12 * vh, ease: 'power2.out' }, Tb + 0.03 * vh);
      tl.to(cards, { opacity: 0, duration: 0.03 * vh, ease: 'none' }, Tb + 0.06 * vh);
      tl.to('.fan__aura', { opacity: 0, duration: 0.1 * vh }, Tb - 0.1 * vh);
      tl.fromTo(phn, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.2 * vh, ease: 'power3.out' }, Tb + 0.08 * vh);
      tl.fromTo(devCap, { opacity: 0 }, { opacity: 1, duration: 0.1 * vh }, Tb + 0.15 * vh);
      tl.to({}, { duration: 0 }, p(SE + 0.02 * vh));
    };

    const kill = () => {
      if (!tl) return;
      tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); tl = null;
      typo.style.paddingBottom = '';
      deck.dataset.run = '1';
      lead.dataset.live = '0';
      G.set(['.fan__aura', ...cards, ...cards.map(lit), ...cards.map(inner), fan, hA, hR, svc, lapF, devBase, devCap, phn, ...bz, '.hero__fade', '#hero .h1', '#fxA', '#fxB'], { clearProps: 'all' });
    };
    make();
    let rt = 0;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { kill(); make(); ST.refresh(); }, 260); };
    window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (tl) { kill(); make(); ST.refresh(); } });

    return () => {
      window.removeEventListener('resize', onResize);
      kill();
      root.classList.remove('is-live', 'is-flow');
      trafficAt = () => 0; G.ticker.remove(draw); cv.remove(); window.removeEventListener('resize', size);
      hero.style.pointerEvents = '';
    };
  };

  /* gsm, tablet en lage schermen: geen reis. De copy licht op, het zoekscherm bouwt zich op en Credo klimt naar boven. */
  const buildSolo = () => {
    const light = (words, trig) => G.fromTo(words, { opacity: 0.18 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: trig, start: 'top 86%', end: 'bottom 52%', scrub: 0.6 } });
    light(wA, hA);
    [svc].forEach((el) => G.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, ease: 'sine.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
    /* het scherm in de ontzorgsectie komt binnen met Digital Impression op de achterkant en draait dan om naar de sites */
    root.classList.add('is-solo');
    const ms = $('.mscr'), shine = ms && $('.card__shine', ms);
    let st = null;
    if (ms) {
      ms.dataset.front = '0';
      const t2 = G.timeline({ scrollTrigger: { trigger: ms, start: 'top 96%', end: 'center 56%', scrub: 0.8,
        onUpdate: (self) => { ms.dataset.front = self.progress > 0.92 ? '1' : '0'; } } });
      t2.fromTo(ms, { rotationY: 180, scale: 0.86, y: 40, transformPerspective: 1100 }, { rotationY: 180, scale: 0.94, y: 16, duration: 0.42, ease: 'none' }, 0)
        .fromTo(shine, { xPercent: -160 }, { xPercent: 160, duration: 0.42, ease: 'sine.inOut' }, 0)
        .to(ms, { rotationY: 360, scale: 1, y: 0, duration: 0.58, ease: 'power2.inOut' }, 0.42);
      st = t2;
    }
    return () => { root.classList.remove('is-solo'); if (st) { st.scrollTrigger && st.scrollTrigger.kill(); st.kill(); G.set(ms, { clearProps: 'all' }); ms.dataset.front = '0'; } G.set([svc, ...wA, ...wB], { clearProps: 'all' }); };
  };


  /* de waaier kantelt zacht mee met de muis (alleen desktop, niet bij minder beweging) */
  if (hasG && !reduce && window.matchMedia('(hover: hover) and (min-width: 901px)').matches) {
    const rx = G.quickTo(fan, 'rotationX', { duration: 1.2, ease: 'power3.out' }), ry = G.quickTo(fan, 'rotationY', { duration: 1.2, ease: 'power3.out' });
    G.set(fan, { transformPerspective: 1400 });
    window.addEventListener('pointermove', (e) => {
      if (root.classList.contains('is-flow') || root.classList.contains('is-s1')) { rx(0); ry(0); return; }
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      rx(-ny * 7); ry(nx * 9);
    }, { passive: true });
  }

  /* Laptop en gsm wisselen om de beurt van case (Webdesign) en van advertentie (Google Ads) */
  const CASES = [
    { q: 'kinesist diepenbeek', f: 'C', u: 'credorehabandperformance.com', t: 'Credo Rehab & Performance | Kom sterker terug', d: 'Revalidatie en personal training in Diepenbeek. Boek online je afspraak.' },
    { q: 'carwash sint-niklaas', f: 'C', u: 'carwashvdb.be', t: 'Carwash VDB | Wasstraat en detailing in Sint-Niklaas', d: 'Snel door de wasstraat of een volledige detailing. Bekijk de abonnementen.' },
    { q: 'zanger voor feest', f: 'F', u: 'fadimofficial.be', t: 'Fadim | Schlager en levenslied voor uw feest', d: 'Boek Fadim voor elk feest. Bekijk de agenda en vraag uw datum aan.' },
  ];
  const cycle = (fig, every, onStep) => {
    if (!fig) return;
    let k = 0, t = 0, seen = false;
    const tick = () => { if (!seen || fig.dataset.run === '0' || document.hidden) return; k = (k + 1) % 3; onStep(k); };
    const start = () => { if (!t) t = setInterval(tick, every); };
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => { seen = e.isIntersecting; if (seen) start(); }), { threshold: 0.35 }).observe(fig);
    else { seen = true; start(); }
  };
  const setOn = (fig, k) => $$('[data-k]', fig).forEach((el) => el.classList.toggle('is-on', +el.dataset.k === k));
  /* de laptop in Webdesign speelt de boekingsdemo (js/demo.js) */
  const srch = $('figure.srch');
  if (srch) {
    const serps = $$('.gs, .gs-box', srch);
    let typing = 0;
    const show = (k) => {
      const c = CASES[k];
      serps.forEach((g) => g.classList.add('is-out'));
      clearInterval(typing);
      setTimeout(() => {
        serps.forEach((g) => { $('.gs__f', g).textContent = c.f; $('.gs__u', g).textContent = c.u; $('.gs__t', g).textContent = c.t; $('.gs__d', g).textContent = c.d; $('.gs__q', g).textContent = ''; });
        let n = 0;
        typing = setInterval(() => {
          n++; serps.forEach((g) => { $('.gs__q', g).textContent = c.q.slice(0, n); });
          if (n >= c.q.length) { clearInterval(typing); setTimeout(() => serps.forEach((g) => g.classList.remove('is-out')), 220); }
        }, reduce ? 0 : 55);
      }, 520);
    };
    cycle(srch, 4600, show);
  }

  /* ---------- reveals ---------- */
  const heads = $$('[data-mask]:not([data-mask="load"])');
  $$('.pts li, .open__cta, .open .lead, .wprice, .uspq, .plan, .aft, .ads2, .price__end, .q, .faq__alt, .ask__p, .ask__alt, .formcard').forEach((el) => el.classList.add('mrv'));
  const rv = $$('.mrv');
  if ('IntersectionObserver' in window && !reduce && hasG) {
    const ioH = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); ioH.unobserve(e.target); } }), { threshold: 0.3 });
    heads.forEach((h) => ioH.observe(h));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    rv.forEach((el) => io.observe(el));
  } else { heads.forEach((h) => h.classList.add('is-in')); rv.forEach((el) => el.classList.add('is-in')); root.classList.add('ready'); }

  if (hasG && !reduce) {
    /* zet de definitieve desktop-opbouw meteen klaar, zodat er na de intro niets meer verspringt */
    if (liveNow()) root.classList.add('is-live');
    startIntro();
    const mm = G.matchMedia();
    const later = (fn) => (ctx) => { let undo = null, alive = true; introDone.then(() => { if (!alive) return; ctx.add(() => { undo = fn(); }); ST.refresh(); }); return () => { alive = false; if (typeof undo === 'function') undo(); }; };
    mm.add(LIVE_Q, later(buildLive));
    mm.add('(max-width: 900px) and ' + MOTION + ', (max-height: 559px) and ' + MOTION, later(buildSolo));
  } else root.classList.add('ready');

  /* ---------- prijzen: tellen op bij het eerste zicht ---------- */
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const countUp = (el) => {
    const to = +el.dataset.n, t0 = performance.now(), dur = 1100;
    const step = (t) => { const k = clamp((t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(to * e)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && !reduce) {
    const ioN = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { countUp(e.target); ioN.unobserve(e.target); } }), { threshold: 0.6 });
    $$('.num').forEach((n) => ioN.observe(n));
  }

  /* ---------- prijzen: Webdesign / Google Ads ---------- */
  const seg = $('.seg'), segB = $$('.seg__b'), cta = $('#priceCta');
  const show = (i, focus) => {
    const cur = $('.pp__p.is-on');
    const next = $('#' + segB[i].getAttribute('aria-controls'));
    if (cur === next) return;
    seg.dataset.on = i;
    const sec = $('#prijzen'); if (sec) sec.dataset.tab = i;
    segB.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
    if (focus) segB[i].focus();
    if (cta) cta.dataset.want = i ? 'Voorbeeldcampagne' : 'Voorbeeldwebsite';
    const swap = () => {
      cur.classList.remove('is-on', 'is-leave', 'is-enter');
      next.classList.add('is-on', 'is-enter');
      $$('.num', next).forEach((n) => { if (!reduce) countUp(n); });
      setTimeout(() => next.classList.remove('is-enter'), 1300);
      if (hasG) ST.refresh();
    };
    if (reduce) swap(); else { cur.classList.add('is-leave'); setTimeout(swap, 260); }
  };
  $$('[data-tab]').forEach((a) => a.addEventListener('click', () => show(+a.dataset.tab)));
  segB.forEach((b, i) => {
    b.addEventListener('click', () => show(i));
    b.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { show(i ? 0 : 1, true); e.preventDefault(); } });
  });


  /* ---------- vragen: zacht open en dicht ---------- */
  $$('.q').forEach((d) => {
    const sum = $('summary', d), body = $('p', d);
    sum.addEventListener('click', (e) => {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (d.open) {
        const h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = () => { d.open = false; };
        d.classList.remove('is-open');
      } else {
        d.open = true; d.classList.add('is-open');
        const h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0, transform: 'translateY(-6px)' }, { height: h + 'px', opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.22,.8,.24,1)' });
      }
    });
  });

  /* ---------- keuze in het formulier ---------- */
  const form = $('#form'), pick = $('.pick', form);
  const syncPick = () => { const i = $$('input[name="wat"]', form).findIndex((r) => r.checked); pick.dataset.i = Math.max(0, i); };
  $$('input[name="wat"]', form).forEach((r) => r.addEventListener('change', syncPick));
  syncPick();
  $$('[data-want]').forEach((a) => a.addEventListener('click', () => {
    const r = form.querySelector('input[name="wat"][value="' + a.dataset.want + '"]');
    if (r) { r.checked = true; syncPick(); }
  }));

  /* ---------- aanvraag ---------- */
  const err = $('.form__err', form);
  const btn = $('button[type="submit"]', form);
  const thanks = $('.thanks');
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  $$('input', form).forEach((i) => i.addEventListener('input', () => i.closest('.fld') && i.closest('.fld').classList.remove('is-bad')));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true;
    const d = Object.fromEntries(new FormData(form).entries());
    const bad = [];
    if (!d.naam || !d.naam.trim()) bad.push('f-naam');
    if (!emailOk((d.email || '').trim())) bad.push('f-email');
    if (!d.website || !d.website.trim()) bad.push('f-web');
    if (bad.length) {
      bad.forEach((id) => $('#' + id).closest('.fld').classList.add('is-bad'));
      err.textContent = bad.includes('f-email') && bad.length === 1 ? 'Kijkt u uw e-mailadres nog even na?' : 'Vult u de gemarkeerde velden nog even in?';
      err.hidden = false;
      $('#' + bad[0]).focus();
      return;
    }
    btn.classList.add('is-busy');
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) });
      if (!res.ok) throw new Error('fout');
      $('.thanks__n', thanks).textContent = d.naam.trim() ? ', ' + d.naam.trim().split(' ')[0] : '';
      form.hidden = true;
      thanks.hidden = false;
      thanks.focus({ preventScroll: true });
      if (hasG) ST.refresh();
    } catch (x) {
      err.textContent = 'Er ging iets mis bij het versturen. Probeer het opnieuw of bel ons op 0496 25 14 45.';
      err.hidden = false;
    } finally {
      btn.classList.remove('is-busy');
    }
  });
})();
