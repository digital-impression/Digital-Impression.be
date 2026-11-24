/* Digital Impression: in "Wij ontzorgen u volledig." wordt de waaier één scherm
   dat rustig wisselt tussen de hero's van Credo, Carwash VDB en Fadim.
   Op desktop gebeurt dat in de voorste kaart van de waaier, op de gsm in een eigen scherm in de sectie. */
(() => {
  const root = document.documentElement;
  const lead = document.querySelector('.card--lead');
  const SITES = [
    ['img/scroll/credo.webp', 'credorehabandperformance.com/rehab'],
    ['img/scroll/carwash.webp', 'carwashvdb.be'],
    ['img/scroll/fadim.webp', 'fadimofficial.be'],
  ];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* bouwt een browserschermpje met de drie hero's in host */
  const fader = (host) => {
    const lv = document.createElement('span'); lv.className = 'lv lv--hero'; lv.setAttribute('aria-hidden', 'true');
    lv.innerHTML = '<span class="lv__bar"><i></i><i></i><i></i><span class="lv__url"></span></span><span class="lv__vp">' +
      SITES.map((s, i) => `<img class="lv__hero${i ? '' : ' is-on'}" src="${s[0]}" alt="" decoding="async">`).join('') + '</span>';
    host.appendChild(lv);
    const imgs = [...lv.querySelectorAll('.lv__hero')], url = lv.querySelector('.lv__url'), vpEl = lv.querySelector('.lv__vp');
    url.textContent = SITES[0][1];
    const f = { k: 0 };
    f.go = (n) => { if (n === f.k) return; f.k = n; if (lead) lead.dataset.site = n; swap(imgs, n, vpEl); url.textContent = SITES[n][1]; };
    return f;
  };
  /* om de drie seconden de volgende site, zolang ok() klopt */
  const loop = (f, ok, frozen) => {
    if (reduce) return;
    let t = 0;
    setInterval(() => {
      if (document.hidden || !ok()) { t = 0; return; }
      if (frozen && frozen()) { t = 0; return; }
      if ((t += 300) >= 3000) { t = 0; f.go((f.k + 1) % SITES.length); }
    }, 300);
  };

  if (lead) lead.dataset.site = 0;

  /* desktop: in de voorste kaart van de waaier */
  const host = lead && lead.querySelector('.card__in');
  if (host) {
    const f = fader(host);
    /* zodra we naar Webdesign scrollen, blijft de huidige site staan: de laptop begint met dezelfde */
    loop(f, () => lead.dataset.live === '1' && root.classList.contains('is-live'), () => root.classList.contains('is-flow'));
  }

  /* gsm en tablet: een eigen scherm in de ontzorgsectie, met Digital Impression op de achterkant */
  const space = document.getElementById('feelSpace');
  if (space) {
    space.innerHTML = '<span class="mscr"><span class="mscr__in"></span><span class="card__back"><span class="card__mark">Digital Impression</span><span class="card__tag">Webdesign · Google Ads</span><span class="card__shine"></span></span></span>';
    const scr = space.querySelector('.mscr');
    const f = fader(space.querySelector('.mscr__in'));
    let seen = false;
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => { seen = e.isIntersecting; }), { threshold: 0.6 }).observe(scr);
    loop(f, () => seen && !root.classList.contains('is-live') && scr.dataset.front === '1');
  }
})();
