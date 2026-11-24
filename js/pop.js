/* Digital Impression: klikt iemand op een site in de animatie, dan opent die site groot in een venster.
   Daarin kan de bezoeker door de hele pagina scrollen, of doorklikken naar de echte site. */
(() => {
  const SITES = {
    credo: { img: 'img/scroll/credo.webp', url: 'credorehabandperformance.com', href: 'https://credorehabandperformance.com', name: 'Credo Rehab & Performance' },
    carwash: { img: 'img/scroll/carwash.webp', url: 'carwashvdb.be', href: 'https://carwashvdb.be', name: 'Carwash VDB' },
    fadim: { img: 'img/scroll/fadim.webp', url: 'fadimofficial.be', href: 'https://fadimofficial.be', name: 'Fadim' },
  };
  const ORDER = ['credo', 'carwash', 'fadim'];
  const root = document.documentElement;
  const lead = document.querySelector('.card--lead');
  const leadKey = () => ORDER[lead ? +lead.dataset.site || 0 : 0] || 'credo';

  /* welke site toont het element waarop geklikt werd? */
  const keyFor = (el) => {
    const card = el.closest('.card');
    if (card) {
      const k = +card.dataset.pos;
      if (k === -1) return 'carwash';
      if (k === 1) return 'fadim';
      return lead && lead.dataset.live === '1' ? leadKey() : 'credo';
    }
    if (el.closest('.mscr')) return leadKey();
    const dv = el.closest('.dv');
    if (dv) { const lv = dv.querySelector('.lv--lap'); return (lv && SITES[lv.dataset.site]) ? lv.dataset.site : 'credo'; }
    return null;
  };

  /* het venster */
  const pop = document.createElement('div');
  pop.className = 'pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true'); pop.setAttribute('aria-label', 'Voorbeeld van de website'); pop.hidden = true;
  pop.innerHTML = '<div class="pop__bg" data-close></div>' +
    '<div class="pop__win">' +
      '<div class="pop__bar"><i></i><i></i><i></i><span class="pop__url"></span><button class="pop__x" type="button" aria-label="Sluiten" data-close><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="pop__vp" data-lenis-prevent><img class="pop__img" alt=""></div>' +
      '<div class="pop__foot"><span class="pop__name"></span><a class="pop__go" target="_blank" rel="noopener">Bekijk de echte site<svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></a></div>' +
    '</div>';
  document.body.appendChild(pop);
  const img = pop.querySelector('.pop__img'), url = pop.querySelector('.pop__url'), name = pop.querySelector('.pop__name'), go = pop.querySelector('.pop__go'), vp = pop.querySelector('.pop__vp'), win = pop.querySelector('.pop__win');
  let last = null;

  const open = (key, from) => {
    const s = SITES[key]; if (!s) return;
    last = from || null;
    img.src = s.img; img.alt = 'De website van ' + s.name;
    url.textContent = s.url; name.textContent = s.name; go.href = s.href;
    vp.scrollTop = 0;
    pop.hidden = false; root.classList.add('is-pop');
    if (window.__lenis && window.__lenis.stop) window.__lenis.stop();
    requestAnimationFrame(() => requestAnimationFrame(() => pop.classList.add('is-open')));
    setTimeout(() => pop.querySelector('.pop__x').focus({ preventScroll: true }), 60);
  };
  const close = () => {
    if (pop.hidden) return;
    pop.classList.remove('is-open'); root.classList.remove('is-pop');
    if (window.__lenis && window.__lenis.start) window.__lenis.start();
    setTimeout(() => { pop.hidden = true; img.removeAttribute('src'); }, 380);
    if (last && last.focus) last.focus({ preventScroll: true });
  };
  pop.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  win.addEventListener('click', (e) => e.stopPropagation());
  pop.querySelector('.pop__x').addEventListener('click', close);

  /* klikbare schermen: de waaier, het scherm in de ontzorgsectie en de laptop */
  const targets = '.card, .mscr, .dv__lap, .dv__ph';
  document.querySelectorAll(targets).forEach((el) => {
    el.classList.add('is-pop-t');
    if (!el.closest('[aria-hidden="true"]')) { el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.setAttribute('aria-label', 'Bekijk deze website groot'); }
  });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.is-pop-t'); if (!t || pop.contains(t)) return;
    const k = keyFor(t); if (!k) return;
    e.preventDefault(); open(k, t);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = document.activeElement && document.activeElement.closest && document.activeElement.closest('.is-pop-t');
    if (!t) return; e.preventDefault(); const k = keyFor(t); if (k) open(k, t);
  });
})();
