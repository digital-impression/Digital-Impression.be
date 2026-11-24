/* Digital Impression: de laptop in Webdesign toont hoe een bezoeker een aanvraag doet.
   Per site: even scrollen, klikken op de knop, een aanvraagvenster verschijnt vóór de site,
   de gegevens worden snel ingevuld en verstuurd. Op de gsm komt meteen de melding binnen. Daarna de volgende site. */
(() => {
  const deck = document.querySelector('.dv[data-demo]') || document.querySelector('#deck');
  if (!deck) return;
  const scr = deck.querySelector('.dv__scr');
  if (!scr) return;
  const note = deck.querySelector('.phn');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setOn = (k) => deck.querySelectorAll('[data-k]').forEach((el) => el.classList.toggle('is-on', +el.dataset.k === k));

  /* coördinaten in pixels van de originele pagina, 1280 breed */
  const SITES = [
    { key: 'credo', img: 'img/scroll/credo.webp', url: 'credorehabandperformance.com/rehab', H: 6742, scroll: 5842, cta: [933, 6342, 218, 49],
      title: 'Afspraak aanvragen', fields: [['Naam', 'Lotte Janssens'], ['Telefoon', '0478 12 34 56'], ['Waarvoor?', 'Knieblessure na het lopen']], go: 'Verstuur aanvraag',
      ok: ['Aanvraag verstuurd', 'We bellen je zo snel mogelijk terug.'], note: ['Nieuwe aanvraag', 'Credo · knieblessure, Lotte J.'] },
    { key: 'carwash', img: 'img/scroll/carwash.webp', url: 'carwashvdb.be', H: 8000, scroll: 7076, cta: [172, 7636, 207, 52],
      title: 'Offerte aanvragen', fields: [['Naam', 'Tom De Smet'], ['Wagen', 'BMW X3'], ['Wat mogen we doen?', 'Keramische coating']], go: 'Offerte aanvragen',
      ok: ['Aanvraag verstuurd', 'Je krijgt snel een prijs van ons.'], note: ['Nieuwe offerteaanvraag', 'Carwash VDB · coating, BMW X3'] },
    { key: 'fadim', img: 'img/scroll/fadim.webp', url: 'fadimofficial.be', H: 9400, scroll: 260, cta: [111, 710, 174, 50],
      title: 'Fadim boeken', fields: [['Naam', 'Els Van Damme'], ['Feest', 'Trouwfeest op 20 juni'], ['Gasten', 'Ongeveer 120']], go: 'Verstuur aanvraag',
      ok: ['Aanvraag verstuurd', 'Fadim laat snel iets weten.'], note: ['Nieuwe boekingsaanvraag', 'Fadim · trouwfeest 20 juni'] },
  ];

  /* ---------- opbouw ---------- */
  const lv = document.createElement('div'); lv.className = 'lv lv--lap'; lv.setAttribute('aria-hidden', 'true');
  lv.innerHTML = '<span class="lv__bar"><i></i><i></i><i></i><span class="lv__url"></span></span><span class="lv__vp"></span>';
  scr.appendChild(lv);
  const vp = lv.querySelector('.lv__vp'), url = lv.querySelector('.lv__url');
  const pages = SITES.map((s) => { const im = document.createElement('img'); im.className = 'lv__pg'; im.src = s.img; im.alt = ''; im.decoding = 'async'; vp.appendChild(im); return im; });
  vp.insertAdjacentHTML('beforeend', '<span class="md"><span class="md__box"><span class="md__form"><b class="md__h"></b><span class="md__fs"></span><span class="md__go"></span></span><span class="md__ok"><i class="md__chk"><svg viewBox="0 0 24 24"><path d="M5 12.6l4.4 4.4L19 7.4"/></svg></i><b></b><span></span></span></span></span><svg class="lv__cur" viewBox="0 0 12 17"><path d="M0,0 L0,14 L3.6,10.6 L6.2,16.2 L8.5,15.2 L6,9.8 L10.6,9.8 Z"/></svg>');
  const md = vp.querySelector('.md'), fs = md.querySelector('.md__fs'), go = md.querySelector('.md__go'), cur = vp.querySelector('.lv__cur');

  /* ---------- hulp ---------- */
  let seen = false;
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => { seen = e.isIntersecting; }), { threshold: 0.3 }).observe(deck);
  else seen = true;
  const ready = () => seen && !document.hidden && deck.dataset.run !== '0';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  /* als de laptop opnieuw binnenkomt, begint het verhaal weer netjes bij Credo */
  const leadEl = document.querySelector('.card--lead');
  const startK = () => { const n = leadEl ? +leadEl.dataset.site : 0; return n >= 0 && n < SITES.length ? n : 0; };
  /* zolang de laptop niet speelt (nog niet in beeld of nog onderweg), toont hij dezelfde site als het scherm in de ontzorgsectie en begint hij daar ook mee */
  let idleK = -1;
  const idle = () => { const n = startK(); if (n === idleK) return; idleK = n;
    pages.forEach((p, i) => { p.classList.remove('is-in', 'is-leave'); p.classList.toggle('is-on', i === n); });
    pages.forEach((p, i) => scrollTo(i, 0, 0)); lv.dataset.site = SITES[n].key; url.textContent = SITES[n].url; setOn(n); };
  let reset = false;
  const gate = async () => { while (!ready()) { reset = true; idle(); await sleep(200); } if (reset) { reset = false; throw new Error('reset'); } };
  const wait = async (ms) => { const end = performance.now() + ms; while (performance.now() < end) { await gate(); await sleep(Math.min(90, end - performance.now())); } };
  const vpH = () => { const r = vp.getBoundingClientRect(); return r.width ? (r.height / r.width) * 1280 : 740; };
  const pos = (x, y, top) => [(x / 1280) * 100, ((y - top) / vpH()) * 100];
  const move = async (x, y, ms) => { cur.style.transitionDuration = ms + 'ms'; cur.style.left = x + '%'; cur.style.top = y + '%'; await wait(ms + 40); };
  const press = async (x, y) => {
    cur.classList.add('is-press'); await wait(120); cur.classList.remove('is-press');
    const r = document.createElement('i'); r.className = 'bk__rip'; r.style.left = x + '%'; r.style.top = y + '%'; vp.appendChild(r); setTimeout(() => r.remove(), 800);
    await wait(160);
  };
  const center = (el) => { const v = vp.getBoundingClientRect(), r = el.getBoundingClientRect(); return [((r.left + r.width * 0.3 - v.left) / v.width) * 100, ((r.top + r.height * 0.62 - v.top) / v.height) * 100]; };
  /* sjieke wissel: de nieuwe site veegt er schuin over, met een lichtstreep op de rand */
  const swap = (list, k, vpEl) => {
    const cur = list.find((e) => e.classList.contains('is-on')), nxt = list[k];
    if (cur === nxt) return;
    nxt.classList.remove('is-leave'); nxt.classList.add('w0', 'is-in'); void nxt.offsetWidth; nxt.classList.remove('w0');
    if (cur) { cur.classList.add('is-leave'); }
    let sw = vpEl.querySelector('.lv__sweep'); if (!sw) { sw = document.createElement('i'); sw.className = 'lv__sweep'; vpEl.appendChild(sw); }
    sw.classList.remove('is-go'); void sw.offsetWidth; sw.classList.add('is-go');
    setTimeout(() => { list.forEach((e) => { if (e !== nxt) e.classList.remove('is-on', 'is-leave'); }); nxt.classList.add('is-on'); nxt.classList.remove('is-in'); }, 1250);
  };
  const show = (k) => { if (!pages.some((p) => p.classList.contains('is-on'))) pages[k].classList.add('is-on'); else swap(pages, k, vp); lv.dataset.site = SITES[k].key; url.textContent = SITES[k].url; setOn(k); };
  const scrollTo = (k, y, ms) => { const pg = pages[k]; pg.style.transitionDuration = ms + 'ms'; pg.style.transform = `translateY(${(-y / SITES[k].H) * 100}%)`; };

  if (reduce) { show(0); return; }

  let k = 0, fresh = true;
  const run = async () => {
    for (;;) {
      const s = SITES[k];
      /* klaarzetten */
      md.classList.remove('is-on', 'is-done'); lv.querySelectorAll('.lv__ring').forEach((e) => e.remove());
      if (note) note.classList.remove('is-on');
      cur.classList.remove('is-on'); scrollTo(k, 0, 0); show(k);
      md.querySelector('.md__h').textContent = s.title;
      fs.innerHTML = s.fields.map((f) => `<span class="md__f"><small>${f[0]}</small><span class="md__in"><span class="md__v"></span></span></span>`).join('');
      go.textContent = s.go;
      md.querySelector('.md__ok b').textContent = s.ok[0]; md.querySelector('.md__ok span').textContent = s.ok[1];
      cur.style.transitionDuration = '0ms'; cur.style.left = '64%'; cur.style.top = '72%';
      /* na de overgang begint hij meteen, daarna laat hij elke site even staan */
      await wait(fresh ? 150 : 1250); fresh = false;
      /* één seconde scrollen */
      cur.classList.add('is-on');
      scrollTo(k, s.scroll, 1000); await wait(1100);
      /* naar de knop */
      const [cx, cy] = pos(s.cta[0], s.cta[1], s.scroll);
      await move(cx, cy, 650);
      const ring = document.createElement('i'); ring.className = 'lv__ring';
      const [rx, ry] = pos(s.cta[0] - s.cta[2] / 2, s.cta[1] - s.cta[3] / 2, s.scroll);
      ring.style.left = rx + '%'; ring.style.top = ry + '%'; ring.style.width = (s.cta[2] / 1280) * 100 + '%'; ring.style.height = (s.cta[3] / vpH()) * 100 + '%';
      vp.appendChild(ring); requestAnimationFrame(() => ring.classList.add('is-on'));
      await press(cx, cy);
      /* het aanvraagvenster komt vóór de site */
      md.classList.add('is-on'); await wait(420);
      /* snel invullen */
      for (const f of fs.querySelectorAll('.md__f')) {
        const [x, y] = center(f.querySelector('.md__in'));
        await move(x, y, 300); await press(x, y);
        f.classList.add('is-act');
        const v = f.querySelector('.md__v'), txt = s.fields[[...fs.children].indexOf(f)][1];
        for (let i = 1; i <= txt.length; i++) { v.textContent = txt.slice(0, i); await wait(28); }
        f.classList.remove('is-act');
      }
      const [gx, gy] = center(go);
      await move(gx + 6, gy, 380); go.classList.add('is-sel'); await press(gx + 6, gy);
      md.classList.add('is-done');
      await wait(450);
      if (note) { note.querySelector('.phn__t').textContent = s.note[0]; note.querySelector('.phn__s').textContent = s.note[1]; note.classList.add('is-on'); }
      await move(70, 86, 800); cur.classList.remove('is-on');
      await wait(2300);
      go.classList.remove('is-sel');
      k = (k + 1) % SITES.length;
    }
  };
  const loop = async () => {
    for (;;) {
      try { await run(); } catch (e) {
        k = startK(); idleK = -1; fresh = true; md.classList.remove('is-on', 'is-done'); lv.querySelectorAll('.lv__ring').forEach((x) => x.remove());
        if (note) note.classList.remove('is-on'); cur.classList.remove('is-on');
        pages.forEach((p, i) => { p.classList.remove('is-in', 'is-leave'); p.classList.toggle('is-on', i === k); }); scrollTo(k, 0, 0); show(k);
      }
    }
  };
  loop();
})();
