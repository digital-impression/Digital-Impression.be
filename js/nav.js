/* Digital Impression: menu op gsm, navigatiebalk bij scrollen en zachte reveals op de subpagina's */
(() => {
  const root = document.documentElement;
  const nav = document.getElementById('nav');
  if (!nav) return;
  const btn = nav.querySelector('.nav__menu');
  const links = document.getElementById('navLinks');

  const close = () => { nav.classList.remove('is-open'); if (btn) btn.setAttribute('aria-expanded', 'false'); };
  if (btn && links) {
    btn.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) close(); });
  }

  /* alleen op de subpagina's: main.js doet dit al op de homepage */
  if (!document.body.classList.contains('sub')) return;
  root.classList.add('ready');
  const onNav = () => nav.classList.toggle('is-s', window.scrollY > 16);
  onNav(); window.addEventListener('scroll', onNav, { passive: true });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || reduce) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));

  /* laptop op de webdesignpagina: wisselt rustig van site */
  document.querySelectorAll('[data-cycle]').forEach((fig) => {
    const imgs = fig.querySelectorAll('[data-k]'); if (imgs.length < 2 || reduce) return;
    let k = 0;
    setInterval(() => { if (document.hidden) return; k = (k + 1) % 3; imgs.forEach((im) => im.classList.toggle('is-on', +im.dataset.k === k)); }, 3600);
  });
})();
