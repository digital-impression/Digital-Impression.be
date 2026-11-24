/* Digital Impression: dynamiek op de subpagina's.
   Titels die woord per woord opkomen, bezoekers die klikken, een zoekopdracht die zich typt,
   licht dat de muis volgt, zacht kantelende beelden en een tijdlijn die meegroeit met het scrollen. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const root = document.documentElement;

  /* ---------- titel woord per woord ---------- */
  $$('.split').forEach((h) => {
    const words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach((w, i) => {
      const m = document.createElement('span'); m.className = 'sw';
      const t = document.createElement('span'); t.className = 'sw__i'; t.textContent = w; t.style.transitionDelay = (0.12 + i * 0.07) + 's';
      m.appendChild(t); h.appendChild(m); if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
    requestAnimationFrame(() => requestAnimationFrame(() => h.classList.add('is-in')));
  });

  /* ---------- licht dat de muis volgt ---------- */
  if (fine) $$('.spot').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- zacht kantelen ---------- */
  if (fine && !reduce) $$('[data-tilt]').forEach((el) => {
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const loop = () => { cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08; el.style.transform = `perspective(1200px) rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`; raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.01 ? requestAnimationFrame(loop) : 0; };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5) * 6; ty = -((e.clientY - r.top) / r.height - 0.5) * 5; kick(); });
    el.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  });

  /* ---------- zoekopdracht typt zich, advertentie wisselt ---------- */
  const CASES = [
    { q: 'kinesist diepenbeek', f: 'C', u: 'credorehabandperformance.com', t: 'Credo Rehab & Performance | Kom sterker terug', d: 'Revalidatie en personal training in Diepenbeek. Boek online je afspraak.' },
    { q: 'carwash sint-niklaas', f: 'C', u: 'carwashvdb.be', t: 'Carwash VDB | Wasstraat en detailing in Sint-Niklaas', d: 'Snel door de wasstraat of een volledige detailing. Bekijk de abonnementen.' },
    { q: 'zanger voor feest', f: 'F', u: 'fadimofficial.be', t: 'Fadim | Schlager en levenslied voor uw feest', d: 'Boek Fadim voor elk feest. Bekijk de agenda en vraag uw datum aan.' },
  ];
  $$('[data-serp]').forEach((g) => {
    if (reduce) return;
    let k = 0, typing = 0;
    const show = () => {
      k = (k + 1) % CASES.length; const c = CASES[k];
      g.classList.add('is-out'); clearInterval(typing);
      setTimeout(() => {
        $('.gs__f', g).textContent = c.f; $('.gs__u', g).textContent = c.u; $('.gs__t', g).textContent = c.t; $('.gs__d', g).textContent = c.d; $('.gs__q', g).textContent = '';
        let n = 0;
        typing = setInterval(() => { n++; $('.gs__q', g).textContent = c.q.slice(0, n); if (n >= c.q.length) { clearInterval(typing); setTimeout(() => g.classList.remove('is-out'), 220); } }, 55);
      }, 520);
    };
    setInterval(() => { if (!document.hidden) show(); }, 4800);
  });

  /* ---------- tijdlijn groeit mee ---------- */
  $$('[data-steps]').forEach((box) => {
    const fill = $('.steps__fill', box), steps = $$('.step', box);
    const upd = () => {
      const r = box.getBoundingClientRect(), mid = innerHeight * 0.6;
      const p = clamp((mid - r.top) / r.height);
      fill.style.transform = `scaleY(${p.toFixed(4)})`;
      steps.forEach((s) => { const n = $('.step__n', s).getBoundingClientRect(); s.classList.toggle('is-on', n.top + n.height / 2 < mid); });
    };
    upd(); addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd);
  });

  /* ---------- bezoekers die op de site klikken ---------- */
  const hosts = $$('[data-traffic]');
  if (hosts.length && !reduce && fine) {
    const cv = document.createElement('canvas'); cv.className = 'traffic'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    const cx = cv.getContext('2d');
    const CUR = new Path2D('M0,0 L0,14 L3.6,10.6 L6.2,16.2 L8.5,15.2 L6,9.8 L10.6,9.8 Z');
    const col = (getComputedStyle(root).getPropertyValue('--gold') || '#A0C9FD').trim().replace('#', '');
    const n = parseInt(col, 16), rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    const rgba = (a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`;
    let dpr = 1, W = 0, H = 0, parts = [], last = 0;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; };
    size(); addEventListener('resize', size);
    const rnd = (a, b) => a + Math.random() * (b - a);
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const spawn = (el) => parts.push({ el, th: Math.random() * 6.283, r: rnd(0.35, 0.7), bend: rnd(-0.4, 0.4), u: rnd(0.15, 0.85), v: rnd(0.2, 0.8), t: 0, d: rnd(3.2, 4.6), s: rnd(1.05, 1.3), c: -1, kind: Math.random() < 0.7 ? 'cur' : 'tap' });
    const draw = (time) => {
      requestAnimationFrame(draw);
      const dt = Math.min(0.05, last ? (time - last) / 1000 : 0.016); last = time;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      if (document.hidden) return;
      hosts.forEach((h) => {
        const r = h.getBoundingClientRect(); const vis = r.bottom > 0 && r.top < H;
        if (vis && parts.filter((p) => p.el === h).length < 2 && Math.random() < dt * 0.9) spawn(h);
      });
      parts = parts.filter((p) => {
        const r = p.el.getBoundingClientRect();
        const ex = r.left + r.width * p.u, ey = r.top + r.height * p.v, R = Math.max(r.width, 220) * p.r;
        const sx = ex + Math.cos(p.th) * R, sy = ey + Math.sin(p.th) * R * 0.7;
        const mx = (sx + ex) / 2 - (ey - sy) * p.bend, my = (sy + ey) / 2 + (ex - sx) * p.bend;
        let x, y, a, press = 1;
        if (p.c < 0) {
          p.t += dt / p.d; const t = Math.min(1, p.t), e = ease(t), q = 1 - e;
          x = q * q * sx + 2 * q * e * mx + e * e * ex; y = q * q * sy + 2 * q * e * my + e * e * ey;
          a = Math.min(1, t * 2.2) * (0.6 + 0.3 * e); if (t >= 1) p.c = 0;
        } else {
          p.c += dt / 1.7; if (p.c >= 1) return false; const c = p.c; x = ex; y = ey;
          a = 0.9 * (c < 0.65 ? 1 : 1 - (c - 0.65) / 0.35);
          if (c > 0.12 && c < 0.32) press = 1 - 0.22 * Math.sin(((c - 0.12) / 0.2) * Math.PI);
          if (c > 0.2) { const k = clamp((c - 0.2) / 0.6); cx.strokeStyle = rgba(0.6 * (1 - k)); cx.lineWidth = 1.3; cx.beginPath(); cx.arc(x, y, 4 + k * 13, 0, 7); cx.stroke(); }
        }
        if (p.kind === 'cur') {
          cx.save(); cx.translate(x, y); cx.scale(p.s * press, p.s * press);
          cx.fillStyle = `rgba(0,0,0,${(a * 0.35).toFixed(3)})`; cx.translate(1, 1.5); cx.fill(CUR); cx.translate(-1, -1.5);
          cx.fillStyle = rgba(a); cx.fill(CUR); cx.lineWidth = 1; cx.strokeStyle = `rgba(20,10,16,${(a * 0.55).toFixed(3)})`; cx.stroke(CUR); cx.restore();
        } else {
          cx.fillStyle = rgba(a * 0.2); cx.beginPath(); cx.arc(x, y, 9 * p.s, 0, 7); cx.fill();
          cx.fillStyle = rgba(a * 0.9); cx.beginPath(); cx.arc(x, y, 3.2 * p.s * press, 0, 7); cx.fill();
        }
        return true;
      });
    };
    requestAnimationFrame(draw);
  }
})();
