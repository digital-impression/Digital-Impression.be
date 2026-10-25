/* Digital Impression v3 · immersive (upgrade 10/2026) */
(function () {
  "use strict";
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var DESK = function () { return window.matchMedia("(min-width: 900px)").matches; };
  var FORM_ENDPOINT = "https://formspree.io/f/xlgqkgbd";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lang = "nl", lenis = null;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- smooth scroll ---------------- */
  function initLenis() {
    if (REDUCED || typeof Lenis === "undefined") return;
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length < 2) return;
        var el = $(id); if (!el) return;
        e.preventDefault(); closeMenu();
        lenis.scrollTo(el, { offset: 0, duration: 1.4 });
      });
    });
  }

  /* ---------------- preloader ---------------- */
  function initPre() {
    var pre = $("#pre"), num = $("#preNum"), bar = $("#preBar");
    if (!pre) { heroIn(); return; }
    if (REDUCED) { pre.remove(); heroIn(); return; }
    document.documentElement.classList.add("lenis-stopped");
    var o = { v: 0 };
    gsap.timeline({ onComplete: function () { pre.remove(); document.documentElement.classList.remove("lenis-stopped"); heroIn(); ScrollTrigger.refresh(); } })
      .to(o, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: function () { num.textContent = Math.round(o.v); } })
      .to(bar, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0)
      .to(pre, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "+=0.15");
  }
  var heroPlayed = false;
  function heroIn() {
    var hero = $("#hero");
    splitLetters($("#brandName"));
    var letters = $$("#brandName .bl");
    var tl = gsap.timeline();
    tl.fromTo(letters,
      { x: function () { return gsap.utils.random(-260, 260); }, y: function () { return gsap.utils.random(-180, 180); }, scale: function () { return gsap.utils.random(1.6, 3); }, rotation: function () { return gsap.utils.random(-35, 35); }, opacity: 0, filter: "blur(10px)" },
      { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, filter: "blur(0px)", duration: 1.7, stagger: { each: 0.045, from: "center" }, ease: "expo.out", clearProps: "filter" }, 0.1)
      .fromTo("#brandTag .bw", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.09, ease: "expo.out" }, 1.25)
      .fromTo("#brandTag", { "--ul": 0 }, { "--ul": 1, duration: 0.9, ease: "power3.inOut" }, 2.1)
      .add(function () { hero.classList.add("is-loaded-ui"); heroPlayed = true; }, 1.4)
      .fromTo(".brand__sub, .brand__cta, .brand__facts", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "expo.out" }, 1.55);
    if (REDUCED) { tl.progress(1); hero.classList.add("is-loaded-ui"); gsap.set("#brandTag .bw, .brand__sub, .brand__cta, .brand__facts", { opacity: 1, y: 0 }); }
    if (window.__glEnter) window.__glEnter();
  }

  /* ---------------- WebGL hero: floating site cards ---------------- */
  function initGL() {
    var canvas = $("#gl"); if (!canvas || typeof THREE === "undefined") return;
    var hero = $("#hero");
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0E1C3A, 6, 19);
    var cam = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    cam.position.set(0, 0, 6);
    var loader = new THREE.TextureLoader();
    var SITES = [
      { src: "site-salon", name: "Studio Elin", kind: { nl: "Schoonheidssalon · ontwerp", en: "Beauty salon · design", fr: "Institut de beauté · design" }, panel: 2 },
      { src: "site-fitness", name: "Studio Kern", kind: { nl: "Fitnessstudio · ontwerp", en: "Fitness studio · design", fr: "Salle de fitness · design" }, panel: 3 },
      { src: "site-credo", name: "Credo Rehab & Performance", kind: { nl: "Kinesitherapie · live", en: "Physio · live", fr: "Kiné · en ligne" }, panel: 1, live: "https://www.credorehabandperformance.com" },
      { src: "site-bnb", name: "Hoeve Kersengaard", kind: { nl: "B&B · ontwerp", en: "B&B · design", fr: "Chambres d'hôtes · design" }, panel: 4 },
      { src: "site-boekhouder", name: "Accountancy Verhaeghe", kind: { nl: "Boekhouder · ontwerp", en: "Accountant · design", fr: "Comptable · design" }, panel: 5 }
    ];
    var cards = [], group = new THREE.Group(); scene.add(group);
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    // a quiet corridor: cards alternate left/right, evenly spaced in depth, each turned towards the centre
    // a silhouette of sites around the centre: ten cards on an ellipse, each at its own depth
    // one card per site: five on the ellipse, starting at the top, each at its own depth
    var ZS = [0.9, 0, 1.7, 0.4, 1.3], seeded = [];
    for (var si = 0; si < 5; si++) seeded.push([Math.PI / 2 + Math.PI / 5 + si * Math.PI * 2 / 5, -1.8 - ZS[si]]);
    var frameGeo = new THREE.PlaneGeometry(2.3, 1.475, 1, 1);
    seeded.forEach(function (p, i) {
      var site = SITES[i % SITES.length];
      var tex = loader.load("assets/img/" + site.src + ".jpg");
      tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex.center.set(0.5, 0.5);
      var geo = new THREE.PlaneGeometry(2.2, 1.375, 1, 1);
      var mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
      var m = new THREE.Mesh(geo, mat);
      m.position.set(0, 0, p[1]);
      // gold frame behind the card, shown on hover / focus
      var frame = new THREE.Mesh(frameGeo, new THREE.MeshBasicMaterial({ color: 0xC9A24A, transparent: true, opacity: 0, side: THREE.DoubleSide }));
      frame.position.z = -0.01; m.add(frame);
      m.userData = { site: site, ang0: p[0], z0: p[1], base: [0, 0, p[1]], rx: 0, ry: 0, rz: 0, ph: rnd(0, Math.PI * 2), sp: rnd(0.3, 0.55), frame: frame, tex: tex, hover: 0, enter: 1, lock: 0 };
      group.add(m); cards.push(m);
    });
    var N = 320, pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) { pos[i * 3] = rnd(-7, 7); pos[i * 3 + 1] = rnd(-4, 4); pos[i * 3 + 2] = rnd(-30, 4); }
    var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xC9A24A, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(dust);
    var ring = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.23, 96), new THREE.MeshBasicMaterial({ color: 0xC9A24A, transparent: true, opacity: 0.25, side: THREE.DoubleSide }));
    ring.position.set(0.4, 0.2, -12); scene.add(ring);

    var mx = 0, my = 0, tx = 0, ty = 0, prog = 0, w = 0, h = 0, small = false, short = false;
    var ray = new THREE.Raycaster(), pointer = new THREE.Vector2(-9, -9), hovered = null, focused = null, focusProg = 0, pdown = null;
    var focusEl = $("#glFocus"), kindEl = $("#glKind"), nameEl = $("#glName"), goBtn = $("#glGo"), liveA = $("#glLive"), closeBtn = $("#glClose"), tip = $("#heroTip");
    function resize() {
      var r = hero.getBoundingClientRect(); w = r.width; h = r.height;
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      small = w < 700; short = !small && h < 800;
    }
    resize(); window.addEventListener("resize", resize);
    function setPointer(e) { var r = canvas.getBoundingClientRect(); pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1; pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1; }
    if (FINE) window.addEventListener("mousemove", function (e) { tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; setPointer(e); }, { passive: true });
    hero.addEventListener("pointerdown", function (e) { if (e.target.closest("a, button, .gl-focus")) return; pdown = [e.clientX, e.clientY]; setPointer(e); });
    hero.addEventListener("pointerup", function (e) {
      if (!pdown || e.target.closest("a, button, .gl-focus")) return;
      var moved = Math.hypot(e.clientX - pdown[0], e.clientY - pdown[1]); pdown = null; if (moved > 8) return;
      setPointer(e); pick();
      if (hovered && hovered !== focused) focus(hovered); else if (focused) unfocus();
    });
    function pick() {
      ray.setFromCamera(pointer, cam);
      var hits = ray.intersectObjects(cards, false).filter(function (hh) { return hh.object.position.z < cam.position.z - 0.5 && (hh.object.material.opacity > 0.3); });
      var obj = hits.length ? hits[0].object : null;
      if (obj !== hovered) {
        hovered = obj;
        canvas.style.cursor = obj ? "pointer" : "";
        if (obj) canvas.setAttribute("data-cursor", lang === "en" ? "View" : lang === "fr" ? "Voir" : "Bekijk"); else canvas.removeAttribute("data-cursor");
        document.dispatchEvent(new CustomEvent("di:cursorcheck"));
      }
    }
    var entered = false;
    // burst: every card starts in the centre and shoots out to its place on the ring
    window.__glEnter = function () { cards.forEach(function (c, i) { gsap.to(c.userData, { enter: 0, duration: 1.6, delay: 0.05 + i * 0.045, ease: "expo.out", onComplete: function () { if (i === cards.length - 1) entered = true; } }); }); };
    var worldDir = new THREE.Vector3();
    function focus(card) {
      focused = card; focusProg = prog;
      var u = card.userData, site = u.site;
      cam.getWorldDirection(worldDir);
      var target = cam.position.clone().add(worldDir.multiplyScalar(3.1));
      target.x += w > 980 ? 0.55 : 0; target.y += w > 980 ? 0.15 : 0.35;
      var local = group.worldToLocal(target.clone());
      gsap.to(card.position, { x: local.x, y: local.y, z: local.z, duration: 1.1, ease: "power4.inOut" });
      gsap.to(card.rotation, { x: -my * 0.05, y: mx * 0.08, z: 0, duration: 1.1, ease: "power4.inOut" });
      gsap.to(card.material, { opacity: 1, duration: 0.6 });
      gsap.to(u.frame.material, { opacity: 0.9, duration: 0.8, delay: 0.3 });
      gsap.killTweensOf(u.tex.repeat); u.tex.repeat.set(1, 1); u.tex.offset.set(0, 0);
      gsap.to(u.tex.repeat, { x: 0.9, y: 0.9, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1, onUpdate: function () { u.tex.offset.set((1 - u.tex.repeat.x) / 2, (1 - u.tex.repeat.y) / 2); } });
      cards.forEach(function (c) { if (c !== card) gsap.to(c.material, { opacity: 0.18, duration: 0.8 }); });
      gsap.to(dust.material, { opacity: 0.2, duration: 0.8 });
      if (focusEl) {
        kindEl.textContent = site.kind[lang] || site.kind.nl; nameEl.textContent = site.name;
        if (site.live) { liveA.href = site.live; liveA.hidden = false; } else liveA.hidden = true;
        focusEl.hidden = false; gsap.fromTo(focusEl, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.35 });
        goBtn.onclick = function () { unfocus(); setTimeout(function () { if (window.__gotoWork) window.__gotoWork(site.panel); }, 250); };
      }
      if (tip) gsap.to(tip, { opacity: 0, duration: 0.4 });
      gsap.to("#brandName, #brandTag", { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" });
      hero.classList.add("is-focus");
    }
    function unfocus() {
      if (!focused) return;
      var card = focused, u = card.userData; focused = null;
      gsap.killTweensOf(u.tex.repeat);
      gsap.to(u.tex.repeat, { x: 1, y: 1, duration: 0.8, onUpdate: function () { u.tex.offset.set((1 - u.tex.repeat.x) / 2, (1 - u.tex.repeat.y) / 2); } });
      gsap.to(card.position, { x: u.base[0], y: u.base[1], z: u.base[2], duration: 1.1, ease: "power4.inOut" });
      u.lock = performance.now() + 1150;
      gsap.to(card.rotation, { x: u.rx, y: u.ry, z: u.rz, duration: 1.1, ease: "power4.inOut" });
      gsap.to(u.frame.material, { opacity: 0, duration: 0.4 });
      cards.forEach(function (c) { gsap.to(c.material, { opacity: 0.92, duration: 0.8 }); });
      gsap.to(dust.material, { opacity: 0.55, duration: 0.8 });
      if (focusEl) gsap.to(focusEl, { opacity: 0, y: 12, duration: 0.4, onComplete: function () { focusEl.hidden = true; } });
      if (tip) gsap.to(tip, { opacity: 1, duration: 0.6, delay: 0.4 });
      gsap.to("#brandName, #brandTag", { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" });
      hero.classList.remove("is-focus");
    }
    if (closeBtn) closeBtn.addEventListener("click", unfocus);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") unfocus(); });
    ScrollTrigger.create({ trigger: "#hero", start: "top top", end: "bottom top", scrub: true, onUpdate: function (st) { prog = st.progress; if (focused && Math.abs(prog - focusProg) > 0.02) unfocus(); } });
    var sp = 0;
    function kf(pts, x) { if (x <= pts[0][0]) return pts[0][1]; for (var i = 1; i < pts.length; i++) { if (x <= pts[i][0]) { var a = pts[i - 1], b = pts[i], k = (x - a[0]) / (b[0] - a[0]); k = k * k * (3 - 2 * k); return a[1] + (b[1] - a[1]) * k; } } return pts[pts.length - 1][1]; }
    var bell = function (x, c, wdt) { var q = (x - c) / wdt; return Math.exp(-q * q); };
    // ring radius, card scale, alpha and depth offset along the scroll: breathe → explode outwards → re-form around the brand → gather and vanish
    var KR = [[0, 0.80], [0.12, 0.86], [0.55, 2.1], [0.85, 2.6]];
    var KS = [[0, 1], [0.2, 1.08], [0.55, 1.45], [0.85, 1.6]];
    var KA = [[0, 1], [0.25, 1], [0.6, 0.55], [0.85, 0]];
    var KZ = [[0, 0], [0.2, 0.4], [0.55, 3.8], [0.85, 6]];
    var clock = new THREE.Clock(), visible = true, stageEl = $("#hero");
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(stageEl || hero);
    function tick() {
      requestAnimationFrame(tick);
      if (!visible) return;
      var dt = Math.min(clock.getDelta(), 0.05), t = clock.getElapsedTime(), now = performance.now();
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      sp += (prog - sp) * 0.12;
      if (FINE && sp < 0.3) { hero.style.setProperty("--px", (mx * -10) + "px"); hero.style.setProperty("--py", (my * -8) + "px"); }
      var Rr = kf(KR, sp), Ss = kf(KS, sp), Aa = kf(KA, sp), Zo = kf(KZ, sp), burst = bell(sp, 0.45, 0.14);
      if (Aa <= 0.001 && !focused) { renderer.render(scene, cam); return; }
      cam.position.z = 6 - sp * 1.6;
      cam.position.x = mx * 0.5 + Math.sin(t * 0.2) * 0.18; cam.position.y = -my * 0.35 + Math.cos(t * 0.16) * 0.1;
      cam.lookAt(mx * 0.25, -my * 0.18, cam.position.z - 6);
      cam.rotateZ(mx * 0.03 + burst * 0.06);
      dust.material.size = 0.035 + burst * 0.12; dust.material.opacity = focused ? 0.2 : 0.55 + burst * 0.35;
      var fovT = Math.tan(cam.fov * Math.PI / 360), RX = small ? 1.02 : 1.06, RY = small ? 0.98 : (short ? 0.96 : 0.88);
      if (FINE && !focused) pick();
      cards.forEach(function (c) {
        var u = c.userData;
        if (c === focused || u.lock > now) return;
        var ang = u.ang0 + t * 0.04 + sp * 1.1 + burst * 0.9;
        var z = u.z0 + Math.sin(t * 0.3 + u.ph) * 0.35 + Zo;
        var d = Math.max(2.4, cam.position.z - z), hh = fovT * d, hw = hh * cam.aspect;
        var R = Rr * (1 - u.enter);
        var px = Math.cos(ang) * RX * R * hw + Math.cos(t * u.sp + u.ph) * 0.08;
        var py = Math.sin(ang) * RY * R * hh + Math.sin(t * u.sp * 0.8 + u.ph) * 0.1;
        var rx = py * 0.045 - my * 0.05, ry = -px * 0.06 + mx * 0.1, rz = Math.sin(t * 0.2 + u.ph) * 0.02;
        c.position.set(px, py, z); c.rotation.set(rx, ry, rz);
        u.base[0] = px; u.base[1] = py; u.base[2] = z; u.rx = rx; u.ry = ry; u.rz = rz;
        var want = (c === hovered && !focused) ? 1 : 0;
        u.hover += (want - u.hover) * 0.12;
        var sc = (small ? 0.62 : (short ? 0.96 : 1.12)) * Ss * (0.12 + 0.88 * (1 - u.enter)) * (1 + u.hover * 0.07); c.scale.set(sc, sc, 1);
        u.frame.material.opacity = u.hover * 0.7;
        c.material.opacity = Math.min(1, 0.94 * Aa + u.hover * 0.06) * (1 - u.enter * 0.9);
      });
      dust.rotation.y = t * 0.02; ring.rotation.z = t * 0.05;
      renderer.render(scene, cam);
    }
    tick();
  }

  /* ---------------- scroll story: brand → tagline → new backdrop → hook ---------------- */
  var storyKill = null;
  function splitLetters(el) {
    if (!el || $(".bl", el)) return;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split("").forEach(function (ch) { if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; } var s = document.createElement("span"); s.className = "bl"; s.textContent = ch; frag.appendChild(s); });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  }
  function splitWords(el) {
    if (!el || $(".iw", el)) return;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w)); else { var s = document.createElement("span"); s.className = "iw"; s.textContent = w; frag.appendChild(s); } });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  }
  function initStory() {
    var hero = $("#hero"), brand = $("#brand"); if (!hero || !brand) return;
    if (storyKill) { storyKill(); storyKill = null; }
    var tag = $("#brandTag"), tagWords = $$(".bw", tag);
    if (REDUCED) { gsap.set(tagWords, { opacity: 1 }); return; }
    if (!heroPlayed) gsap.set(tagWords, { opacity: 0, y: 30 });
    // the brand recedes as the hero scrolls away
    var out = gsap.to(brand, { scale: 0.9, y: -60, opacity: 0, filter: "blur(10px)", transformOrigin: "50% 50%", ease: "power1.in", scrollTrigger: { trigger: hero, start: "top top", end: "70% top", scrub: 0.5 } });
    var outC = gsap.to(".hero__corner", { opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "30% top", scrub: true } });
    storyKill = function () { out.scrollTrigger && out.scrollTrigger.kill(); out.kill(); outC.scrollTrigger && outC.scrollTrigger.kill(); outC.kill(); gsap.set([brand, tag].concat(tagWords), { clearProps: "all" }); if (tag) tag.style.removeProperty("--ul"); };
  }

  /* ---------------- cursor + magnets ---------------- */
  function initCursor() {
    var dot = $("#cur"), ring = $("#curRing"), label = $("#curLabel"), ink = $("#ink");
    if (!FINE || REDUCED || !dot) return;
    document.documentElement.classList.add("has-cur");
    var x = -100, y = -100, rx = -100, ry = -100, pts = [], ctx = null, iw = 0, ih = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), visible = false;
    if (ink) {
      ctx = ink.getContext("2d");
      var size = function () { iw = window.innerWidth; ih = window.innerHeight; ink.width = iw * dpr; ink.height = ih * dpr; ink.style.width = iw + "px"; ink.style.height = ih + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
      size(); window.addEventListener("resize", size);
    }
    window.addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; visible = true; pts.push({ x: x, y: y, t: performance.now() }); if (pts.length > 48) pts.shift(); }, { passive: true });
    window.addEventListener("mouseout", function (e) { if (!e.relatedTarget) visible = false; });
    gsap.ticker.add(function () {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      dot.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)";
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      if (!ctx) return;
      ctx.clearRect(0, 0, iw, ih);
      var now = performance.now(), life = 700;
      pts = pts.filter(function (p) { return now - p.t < life; });
      if (pts.length > 1) {
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        for (var i = 1; i < pts.length; i++) {
          var p0 = pts[i - 1], p1 = pts[i], al = Math.max(0, 1 - (now - p1.t) / life);
          ctx.strokeStyle = "rgba(201,162,74," + (al * 0.85).toFixed(3) + ")"; ctx.lineWidth = 0.8 + al * 1.8;
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
        }
      }
    });
    function check(t) {
      var lab = t && t.closest && t.closest("[data-cursor]");
      var inter = t && t.closest && t.closest("a, button, .faq__q, [role='slider']");
      if (lab) { label.textContent = lab.getAttribute("data-cursor"); ring.classList.add("is-label"); ring.classList.remove("is-hover"); }
      else { ring.classList.remove("is-label"); ring.classList.toggle("is-hover", !!inter); }
    }
    document.addEventListener("mouseover", function (e) { check(e.target); });
    document.addEventListener("di:cursorcheck", function () { check(document.elementFromPoint(x, y)); });
    $$("[data-magnet]").forEach(function (b) {
      var sx = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3" }), sy = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3" });
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); sx((e.clientX - (r.left + r.width / 2)) * 0.28); sy((e.clientY - (r.top + r.height / 2)) * 0.28); });
      b.addEventListener("mouseleave", function () { sx(0); sy(0); });
    });
  }

  /* ---------------- theme switch (navy -> cream -> navy) ---------------- */
  function initTheme() {
    var secs = $$("[data-theme]"), html = document.documentElement;
    if (!secs.length) return;
    var top = $("#top"), lastY = window.scrollY, band = $(".band");
    function themeAt(y) { var cur = secs[0]; secs.forEach(function (s) { if (s.offsetTop <= y) cur = s; }); return cur; }
    function update() {
      var sy = window.scrollY, cur = themeAt(sy + window.innerHeight * 0.5);
      html.classList.toggle("is-light", cur.getAttribute("data-theme") === "light");
      if (!top) return;
      var under = themeAt(sy + 40), light = under.getAttribute("data-theme") === "light";
      if (band && band.offsetTop <= sy + 40 && band.offsetTop + band.offsetHeight > sy + 40) light = "gold";
      top.classList.toggle("top--light", light === true); top.classList.toggle("top--gold", light === "gold");
      top.classList.toggle("is-scrolled", sy > 40);
      var d = sy - lastY;
      if (sy < 160 || d < -6 || $("#menu").classList.contains("is-open")) top.classList.remove("is-hidden");
      else if (d > 6) top.classList.add("is-hidden");
      lastY = sy;
    }
    window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update); update();
    if (lenis) lenis.on("scroll", update);
  }

  /* ---------------- menu ---------------- */
  var menuLast = null;
  function closeMenu() {
    var m = $("#menu"); if (!m || !m.classList.contains("is-open")) return;
    m.classList.remove("is-open"); m.setAttribute("aria-hidden", "true");
    var b = $("#menuBtn"); b.setAttribute("aria-expanded", "false"); b.classList.remove("is-x");
    document.documentElement.classList.remove("menu-open");
    if (lenis) lenis.start();
    if (menuLast && menuLast.focus) menuLast.focus({ preventScroll: true });
  }
  function initMenu() {
    var m = $("#menu"), b = $("#menuBtn"), c = $("#menuClose");
    function open() {
      menuLast = document.activeElement;
      m.classList.add("is-open"); m.setAttribute("aria-hidden", "false"); b.setAttribute("aria-expanded", "true"); b.classList.add("is-x");
      document.documentElement.classList.add("menu-open");
      if (lenis) lenis.stop();
      if (!REDUCED) {
        gsap.fromTo($$(".menu__nav a", m), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: "expo.out", delay: 0.15 });
        gsap.fromTo($$(".menu__foot > *", m), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: "expo.out", delay: 0.4 });
      }
      // huidige sectie markeren
      var y = window.scrollY + window.innerHeight * 0.4;
      $$(".menu__nav a", m).forEach(function (a) { var t = $(a.getAttribute("href")); var on = t && t.offsetTop <= y && t.offsetTop + t.offsetHeight > y; a.classList.toggle("is-here", !!on); });
      setTimeout(function () { c.focus({ preventScroll: true }); }, 60);
    }
    b.addEventListener("click", function () { if (m.classList.contains("is-open")) closeMenu(); else open(); });
    c.addEventListener("click", closeMenu);
    $$("a", m).forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) {
      if (!m.classList.contains("is-open")) return;
      if (e.key === "Escape") closeMenu();
      if (e.key === "Tab") { var f = $$("a, button", m).filter(function (x) { return x.offsetParent; }); var a0 = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a0) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a0.focus(); } }
    });
  }

  /* ---------------- intro: two lines + three USPs, pinned ---------------- */
  function wrapIntroWords(el) {
    $$(".line-mask > span", el).forEach(function (span) {
      if ($(".iw", span)) return;
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w)); else { var s = document.createElement("span"); s.className = "iw"; s.textContent = w; frag.appendChild(s); } });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(span);
    });
  }
  function wrapWords(el) {}
  var introKill = null;
  function initIntro() {
    var sec = $(".intro"); if (!sec || !$("#il1")) return;
    if (introKill) { introKill(); introKill = null; }
    var lines = [$("#il1"), $("#il2")];
    if (REDUCED) { gsap.set(lines, { clearProps: "all" }); return; }
    lines.forEach(wrapIntroWords);
    var w1 = $$(".iw", lines[0]), w2 = $$(".iw", lines[1]);
    gsap.set(w1.concat(w2), { opacity: 0.1 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.8 } });
    // sentence one is written over the first half of the scroll, sentence two over the next third, then it holds
    tl.fromTo(lines[0], { y: 40 }, { y: 0, duration: 10, ease: "power2.out" }, 0);
    tl.to(w1, { opacity: 1, duration: 8, stagger: { each: 38 / w1.length, ease: "none" }, ease: "power2.out" }, 4);
    tl.fromTo(lines[1], { y: 30 }, { y: 0, duration: 10, ease: "power2.out" }, 44);
    tl.to(w2, { opacity: 1, duration: 8, stagger: { each: 26 / w2.length, ease: "none" }, ease: "power2.out" }, 48);
    tl.fromTo(lines[1], { "--ul": 0 }, { "--ul": 1, duration: 8, ease: "power2.inOut" }, 80);
    tl.to({}, { duration: 12 }, 88);
    introKill = function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set(lines.concat(w1, w2), { clearProps: "all" }); };
  }

  /* ---------------- work: horizontal pin ---------------- */
  function initWork() {
    var pin = $("#workPin"), track = $("#workTrack"), count = $("#workCount"), bar = $("#workBar");
    if (!pin || !track) return;
    var panels = $$(".story", track), n = panels.length;
    window.__gotoWork = function (i) {
      var st = ScrollTrigger.getById("workST");
      var y = st ? st.start + (st.end - st.start) * ((i - 1) / Math.max(1, n - 1)) : (panels[i - 1].getBoundingClientRect().top + window.scrollY - 80);
      if (lenis) lenis.scrollTo(y, { duration: 1.6 }); else window.scrollTo({ top: y, behavior: "smooth" });
    };
    var pad = function (i) { return (i < 10 ? "0" : "") + i; };
    ScrollTrigger.matchMedia({
      "(min-width: 900px)": function () {
        var dist = function () { return track.scrollWidth - document.documentElement.clientWidth; };
        var tween = gsap.to(track, { x: function () { return -dist(); }, ease: "none",
          scrollTrigger: { id: "workST", trigger: pin, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.35, invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: function (st) { var i = Math.min(n, Math.floor(st.progress * n) + 1); count.textContent = pad(i) + " / " + pad(n); if (bar) bar.style.transform = "scaleX(" + st.progress + ")"; } } });
        panels.forEach(function (p) {
          var img = $("img", p);
          gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: p, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        });
      },
      "(max-width: 899px)": function () {
        panels.forEach(function (p, i) {
          ScrollTrigger.create({ trigger: p, start: "top 60%", onEnter: function () { count.textContent = pad(i + 1) + " / " + pad(n); }, onEnterBack: function () { count.textContent = pad(i + 1) + " / " + pad(n); } });
          gsap.fromTo($("img", p), { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true } });
        });
      }
    });
  }

  /* ---------------- FAQ accordion ---------------- */
  function initFAQ() {
    var list = $("#faqList"); if (!list) return;
    $$(".faq__item", list).forEach(function (it) {
      var q = $(".faq__q", it);
      q.addEventListener("click", function () {
        var open = it.classList.toggle("is-open"); q.setAttribute("aria-expanded", open ? "true" : "false");
        $$(".faq__item", list).forEach(function (o) { if (o !== it) { o.classList.remove("is-open"); $(".faq__q", o).setAttribute("aria-expanded", "false"); } });
        setTimeout(function () { ScrollTrigger.refresh(); }, 600);
      });
    });
  }

  /* ---------------- process: sticky number ---------------- */
  function initProcess() {
    var big = $("#procBig"), steps = $$(".pstep"), list = $("#procSteps"); if (!big || !list) return;
    var roll = $(".proc__roll", big), cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      if (roll) gsap.to(roll, { yPercent: -100 * i / steps.length, duration: 0.9, ease: "expo.out" }); else big.textContent = "0" + (i + 1);
      steps.forEach(function (o, k) { o.classList.toggle("is-on", k === i); o.classList.toggle("is-past", k < i); });
      $$("#procStage .pmock").forEach(function (o, k) { o.classList.toggle("is-on", k === i); o.classList.toggle("is-past", k < i); });
    }
    setStep(0);
    ScrollTrigger.create({ trigger: list, start: "top 62%", end: "bottom 45%", onUpdate: function (st) { setStep(Math.min(steps.length - 1, Math.floor(st.progress * steps.length))); }, onLeave: function () { setStep(steps.length - 1); }, onLeaveBack: function () { setStep(0); } });
    var fill = $("#procFill");
    if (fill && list) gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 55%", end: "bottom 55%", scrub: 0.4 } });
  }

  /* ---------------- pricing tilt ---------------- */
  function initTilt() {
    if (!FINE || REDUCED) return;
    $$("[data-tilt]").forEach(function (c) {
      var rx = gsap.quickTo(c, "rotationX", { duration: 0.6, ease: "power3" }), ry = gsap.quickTo(c, "rotationY", { duration: 0.6, ease: "power3" });
      gsap.set(c, { transformPerspective: 1000 });
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", (px * 100) + "%"); c.style.setProperty("--my", (py * 100) + "%"); ry((px - 0.5) * 8); rx((0.5 - py) * 8); });
      c.addEventListener("mouseleave", function () { rx(0); ry(0); });
    });
  }

  /* ---------------- section reveals ---------------- */
  function initReveals() {
    if (REDUCED) return;
    $$(".h-xl, .h-l, .band__t, .case__t").forEach(function (el) {
      if (el.closest(".hero") || el.closest(".story")) return;
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; } var m = document.createElement("span"); m.className = "wm"; var i = document.createElement("span"); i.className = "wi"; i.textContent = w; m.appendChild(i); frag.appendChild(m); });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && !n.classList.contains("vh")) walk(n);
        });
      };
      walk(el);
      gsap.from($$(".wi", el), { yPercent: 110, rotate: 3, duration: 1.15, stagger: 0.045, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    $$(".case__voor, .case__na, .story__vis, .portret__arch").forEach(function (el) {
      gsap.fromTo(el, { clipPath: "inset(18% 6% 18% 6% round 18px)", opacity: 0 }, { clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1, duration: 1.4, ease: "expo.out", clearProps: "clipPath", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    $$(".eyebrow, .h-m, .lead, .sig, .letter, .contact__copy > p, .contact__person, .checks, .form, .proc__steps, .faq__list").forEach(function (el) {
      if (el.closest(".hero")) return;
      gsap.from(el, { opacity: 0, y: 24, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    $$(".case__txt, .band__acts").forEach(function (el) { gsap.from(el, { opacity: 0, y: 34, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }); });
    $$(".quote, .scard").forEach(function (el, i) { gsap.from(el, { opacity: 0, y: 30, duration: 0.9, delay: (i % 4) * 0.08, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } }); });
    gsap.from(".footer__big", { yPercent: 40, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".footer", start: "top 90%", once: true } });
  }

  /* ---------------- diepte: zwevende objecten ---------------- */
  function initDepth() {
    if (REDUCED) return;
    $$("[data-depth]").forEach(function (el) {
      var d = parseFloat(el.getAttribute("data-depth")) || 0.2, sec = el.closest("section") || el.parentNode;
      gsap.fromTo(el, { y: d * 160 }, { y: -d * 160, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
    if (FINE) {
      $$(".case__vis, .portret, .band__in").forEach(function (box) {
        var items = $$("[data-depth]", box);
        box.addEventListener("mousemove", function (e) {
          var r = box.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
          items.forEach(function (it) { var d = parseFloat(it.getAttribute("data-depth")) || 0.2; gsap.to($(".fl__bob", it) || it, { x: -px * d * 60, rotateY: px * d * 14, rotateX: -py * d * 10, duration: 1, ease: "power3.out" }); });
        });
        box.addEventListener("mouseleave", function () { items.forEach(function (it) { gsap.to($(".fl__bob", it) || it, { x: 0, rotateY: 0, rotateX: 0, duration: 1.2, ease: "power3.out" }); }); });
      });
    }
  }

  function initDock() {
    var dock = $("#dock"), bar = $("#topProgress"), hero = $("#hero"), contact = $("#contact"), foot = $(".footer");
    function tick() {
      var sy = window.scrollY, vh = window.innerHeight, max = document.documentElement.scrollHeight - vh;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, sy / max) : 0) + ")";
      if (!dock) return;
      var past = hero ? sy > hero.offsetHeight * 0.6 : sy > 400;
      var near = contact && contact.getBoundingClientRect().top < vh * 0.85;
      var busy = document.documentElement.classList.contains("menu-open") || document.documentElement.classList.contains("viewer-open");
      var on = past && !near && !busy; dock.classList.toggle("is-on", on); document.documentElement.classList.toggle("dock-on", on);
    }
    window.addEventListener("scroll", tick, { passive: true }); window.addEventListener("resize", tick); if (lenis) lenis.on("scroll", tick); tick();
    var mo = new MutationObserver(tick); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------------- ontwerp-venster ---------------- */
  function initViewer() {
    var v = $("#viewer"); if (!v) return;
    var img = $("#viewerImg"), title = $("#viewerTitle"), scroller = $(".viewer__scroll", v), frame = $(".viewer__frame", v), inner = $(".viewer__in", v);
    var btns = $$(".story__open"), list = btns.map(function (b) { return { key: b.getAttribute("data-design"), title: b.getAttribute("data-title") }; });
    var cur = 0, mode = "d", last = null;
    function show(i, dir) {
      cur = (i + list.length) % list.length;
      var d = list[cur];
      title.textContent = d.title;
      var src = "assets/img/full/" + d.key + "-" + mode + ".jpg";
      if (!REDUCED && dir) gsap.fromTo(frame, { x: dir * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "expo.out" });
      img.src = src; img.alt = d.title; scroller.scrollTop = 0;
    }
    function setMode(m) {
      mode = m; v.classList.toggle("is-mobile", m === "m");
      $$(".viewer__mode button", v).forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-mode") === m); b.setAttribute("aria-pressed", b.getAttribute("data-mode") === m); });
      show(cur);
    }
    function open(i) {
      last = document.activeElement;
      setMode(window.innerWidth < 760 ? "m" : "d"); show(i);
      v.hidden = false; document.documentElement.classList.add("viewer-open"); if (lenis) lenis.stop();
      if (!REDUCED) { gsap.fromTo($(".viewer__bg", v), { opacity: 0 }, { opacity: 1, duration: 0.5 }); gsap.fromTo(inner, { y: 60, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "expo.out" }); }
      setTimeout(function () { scroller.focus({ preventScroll: true }); }, 50);
    }
    function close() {
      var done = function () { v.hidden = true; document.documentElement.classList.remove("viewer-open"); if (lenis) lenis.start(); if (last) last.focus({ preventScroll: true }); };
      if (REDUCED) return done();
      gsap.to(inner, { y: 40, opacity: 0, duration: 0.4, ease: "power2.in" }); gsap.to($(".viewer__bg", v), { opacity: 0, duration: 0.45, onComplete: done });
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { open(i); });
      var shot = b.closest(".story") && $(".story__shot", b.closest(".story"));
      if (shot) { shot.style.cursor = "zoom-in"; shot.setAttribute("data-cursor", lang === "en" ? "View" : lang === "fr" ? "Voir" : "Bekijk"); shot.addEventListener("click", function () { open(i); }); }
    });
    $$("[data-close]", v).forEach(function (b) { b.addEventListener("click", close); });
    $("#viewerPrev").addEventListener("click", function () { show(cur - 1, -1); });
    $("#viewerNext").addEventListener("click", function () { show(cur + 1, 1); });
    $$(".viewer__mode button", v).forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
    document.addEventListener("keydown", function (e) {
      if (v.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(cur + 1, 1);
      if (e.key === "ArrowLeft") show(cur - 1, -1);
      if (e.key === "Tab") { var f = $$("button, [tabindex='0']", v).filter(function (x) { return x.offsetParent; }); var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
  }

  /* ---------------- form ---------------- */
  function initForm() {
    var btn = $("#submitBtn"), fields = $("#formFields"), ok = $("#formSuccess"), err = $("#formError"), reset = $("#resetBtn");
    if (!btn) return;
    var ids = ["naam", "email", "website", "bericht"];
    var msg = function (nl, en, fr) { return lang === "en" ? en : lang === "fr" ? fr : nl; };
    var showErr = function (m) { err.textContent = m; err.hidden = false; };
    btn.addEventListener("click", function () {
      var v = {}; ids.forEach(function (id) { v[id] = ($("#" + id).value || "").trim(); });
      if (!v.naam || !v.email || !v.bericht) { showErr(msg("Vul a.u.b. uw naam, e-mailadres en bericht in.", "Please fill in your name, email and message.", "Veuillez indiquer votre nom, votre e-mail et votre message.")); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) { showErr(msg("Vul a.u.b. een geldig e-mailadres in.", "Please enter a valid email address.", "Veuillez saisir une adresse e-mail valide.")); return; }
      err.hidden = true; v._subject = "Nieuwe aanvraag via digital-impression.be van " + v.naam;
      var original = btn.innerHTML; btn.disabled = true; btn.textContent = msg("Verzenden…", "Sending…", "Envoi…");
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify(v) })
        .then(function (r) { if (!r.ok) throw new Error("bad"); fields.hidden = true; ok.hidden = false; ScrollTrigger.refresh(); })
        .catch(function () { showErr(msg("Er ging iets mis. Probeer opnieuw of mail ons rechtstreeks.", "Something went wrong. Please try again or email us directly.", "Une erreur s'est produite. Réessayez ou écrivez-nous directement.")); })
        .finally(function () { btn.disabled = false; btn.innerHTML = original; });
    });
    if (reset) reset.addEventListener("click", function () { ids.forEach(function (id) { $("#" + id).value = ""; }); ok.hidden = true; fields.hidden = false; ScrollTrigger.refresh(); });
  }

  /* ---------------- i18n ---------------- */
  var I18N = {
    en: {
      meta_title: "Digital Impression | Websites that make an impression", menu: "Menu", close: "Close",
      nav_work: "Work", nav_services: "Services", nav_process: "Process", nav_pricing: "Free design", nav_contact: "Contact",
      hero_eyebrow: "Web design studio · Belgium & the Netherlands", h1_a: "<span class=\"hw\">Your</span> <span class=\"hw\">website</span> <span class=\"hw\">is</span> <span class=\"hw\">the</span> <span class=\"hw\">first</span> <span class=\"hw\">encounter</span> <span class=\"hw\">with</span> <span class=\"hw\">your</span> <span class=\"hw\">customer.</span>", h1_b: "<span class=\"hw\">Make</span> <span class=\"hw\">sure</span> <span class=\"hw\"><em class=\"it kw\">it sticks.</em></span>",
      hero_lead: "Designed and built to measure. You see your homepage within five working days, free, and pay no deposit.",
      cta_design: "Request your free homepage design", cta_work: "See our work", scroll: "Scroll", show_open: "View in the gallery", hk1: "Your website is your first encounter with the customer.", hk2: "Make sure it <em class=\"it kw\">sticks.</em>", brand_tag: "<span class=\"bw\">Websites</span> <span class=\"bw\">that</span> <span class=\"bw\">make</span> <span class=\"bw\">an</span> <span class=\"bw it\">impression.</span>", hero_tip: "Click a website to see it up close", hero_tr: "Bespoke websites · since 2024", gl_go: "Show in the gallery", gl_live: "View live", gl_close: "Close",
      mq1: "Business websites", mq2: "Webshops", mq3: "Redesigns", mq4: "Landing pages",
      statement: "Your website is the first handshake with a new customer. We make sure it is a firm one: <em class=\"it\">fast, beautiful and built to win enquiries.</em> You see your design before you decide, and you pay only when you are happy.",
      cta_how: "How we work", st_note: "No deposit · live in 2 weeks · one point of contact",
      work_eyebrow: "Selected work", work_title: "Our work", w_live: "View live", w_design: "View the design",
      w1_s: "Physio & performance · live", w1_m: "From Wix template to a bespoke site: black and white, direct, three languages and online booking.",
      w2_s: "B2B wholesale · redesign", w2_m: "Wholesaler of fresh carrots from Haspengouw. Proposal for a new homepage: product first, own fields and family in view, a quote within five working days.",
      w3_s: "Tourism & culture · redesign", w3_m: "Guided tours through centuries-old marl caves. Proposal for a new homepage: dark and amber, Google score up front, booking in one click.",
      w4_s: "Software · concept", w4_m: "Fleet management platform. Concept: a clear SaaS hero with the dashboard itself as proof, numbers that build trust at a glance.",
      w5_s: "Architecture · concept", w5_m: "Architecture practice. Concept: editorial layout, large type, light and silence as the subject, photos that let the space speak.",
      ba_eyebrow: "Before and after", ba_title: "From this. <em class=\"it\">To this.</em>", ba_body: "Credo Rehab & Performance, Diepenbeek. Left, the Wix template that was there; right, the website we built. Same practice, same people. Different impression.", ba_hint: "Drag the handle", ba_before: "Before", ba_after: "After",
      svc_eyebrow: "What we build", svc_title: "Services",
      s1_t: "Business websites", s1_p: "A website that builds trust and wins enquiries. Designed to measure, fast, and perfect on every screen.", s1_1: "Bespoke", s1_2: "Lead forms", s1_3: "Fast and secure",
      s2_t: "Webshops", s2_p: "Sell online with a shop that works: beautiful product pages, secure payments and a checkout without friction.", s2_1: "Product pages", s2_2: "Payment integration", s2_3: "Manage it yourself",
      s3_t: "Redesigns", s3_p: "Your existing website, redesigned. Same content, completely new impression. See the Credo example above.", s3_1: "Keep your content", s3_2: "Faster and mobile", s3_3: "New look",
      s4_t: "Landing pages", s4_p: "One page, one goal. For campaigns, launches and promotions that need to convert.", s4_1: "One clear goal", s4_2: "Built to convert", s4_3: "Online fast",
      n1_u: "hours", n1_l: "until you see your homepage. Free, and you decide afterwards.", n2_u: "days", n2_l: "from first conversation to live website, for most projects.", n3_u: "deposit", n3_l: "You pay once the website is finished and you are happy with it.",
      proc_eyebrow: "Process", proc_title: "From conversation to live, <em class=\"it\">in four steps.</em>",
      proc_title: "From free design to live, <em class=\"it\">in five steps.</em>",
      p1_k: "Step 01", p1_t: "Free homepage design", p1_p: "Tell us in one sentence what your business does. Within five working days you see a first design of your homepage. Free, no obligation.",
      p2_k: "Step 02", p2_t: "Conversation and quote", p2_p: "Convinced by the design? Then we talk for half an hour about your customers and what the website must do. You get a fixed price, no deposit.",
      p3_k: "Step 03", p3_t: "Bespoke design", p3_p: "We work the homepage into a full design for every page, on phone and on laptop. You watch along and steer.",
      p4_k: "Step 04", p4_t: "Build", p4_p: "Ten to fourteen days, with you at the table at every step. Copy, imagery and tech under one roof.",
      pr_eyebrow: "Pricing", pr_title: "What it costs. <em class=\"it\">No small print.</em>", pr_lead: "Fixed starting prices, no small print. Every package starts with a free homepage design.", pr_from: "from", pr_cta: "Request your free design",
      t1_s: "Website Basic", t1_n: "Starter", t1_f: "Freelancers, local businesses and starters who need a professional website.", t1_1: "Bespoke website, up to 3 pages", t1_2: "Perfect on phone, tablet and laptop", t1_3: "Contact form and social media", t1_4: "Live in 10 to 14 days",
      t2_s: "Website Premium", t2_n: "Growth", t2_f: "Businesses that want to convince visitors and win customers.", t2_1: "Everything in Starter", t2_2: "Up to 5 pages, blog or news", t2_3: "Booking or quote system", t2_4: "Newsletter integration",
      t3_s: "Webshop", t3_n: "Sales", t3_f: "Anyone selling online: fashion, food, beauty and anything that fits in a box.", t3_1: "Everything in Growth", t3_2: "Shop setup, up to 50 products", t3_3: "Payments, cart and checkout", t3_4: "Guidance so you manage it yourself",
      pr_note: "Hosting, domain name and copywriting are not part of the package price; we arrange them on request via the quote. No deposit: you pay once the website is finished and you are happy.",
      ab_eyebrow: "About us", ab_title: "People buy <em class=\"it\">from people.</em>",
      sig1: "No deposit.", sig2: "No templates.", sig3: "No promises about Google.", sig4: "One point of contact.", ab_role: "Founder · design and build",
      c_eyebrow: "Start your project", c_title: "Let's build something <em class=\"it\">that makes an impression.</em>", c_lead: "Tell us briefly about your business. Within five working days you receive a tailored quote plus a free design of your homepage.", region: "Belgium & the Netherlands",
      f_naam: "Name", f_naam_ph: "Your name", f_email: "Email", f_email_ph: "you@company.com", f_site: "Current website (optional)", f_site_ph: "www.yourcompany.com", f_msg: "Your project", f_msg_ph: "How can we help? Tell us briefly about your business.",
      f_fine: "By sending you agree to a no-obligation contact. No deposit, no commitment.", f_ok_t: "Thank you. We get to work.", f_ok_p: "You will hear from us soon. Within five working days you receive a first design of your homepage, without obligation.", f_again: "Send another request",
      nav_faq: "FAQ",
      rv_eyebrow: "Clients", rv_title: "Good work, <em class=\"it\">and the client uses it every day.</em>",
      rv1_q: "From a Wix template to a bespoke website: black and white, direct, in three languages and with online booking. Since launch, the first encounter for every new patient.", rv1_m: "Physiotherapy · Diepenbeek",
      rv2_q: "Your business here? Every project starts with a free homepage design. Only when it convinces you do we build on.", rv2_n: "Your company", rv2_m: "Next client · Limburg or beyond", rv2_l: "Start for free",
      sv_eyebrow: "Services", sv_title: "What we <em class=\"it\">build for you.</em>", sv_lead: "Fixed starting prices, no deposit. Click through for what exactly is included.",
      sv1_t: "Web design", sv1_p: "Bespoke websites that build trust and win enquiries. On every screen, no template.", sv_more: "More about web design",
      sv2_t: "Development", sv2_p: "Webshops and custom work: online booking, payments, connecting what you already use.", sv_more2: "More about development",
      sv3_t: "SEO", sv3_p: "The technical basis so Google finds you: fast, well structured, locally visible. No empty promises.", sv3_m: "Basics included", sv_more3: "More about SEO",
      sv4_t: "Maintenance & hosting", sv4_p: "Hosting, domain, updates and small changes. Taken care of, so you never have to think about it.", sv4_m: "Via the quote", sv_more4: "More about maintenance",
      p1_b: "Free · within 5 working days", p5_k: "Step 05", p5_t: "Live and aftercare", p5_p: "Your website goes online, with guidance and support. Afterwards you stay with the same person.",
      ab_p1: "Digital Impression is the web design studio of Stijn Vranken, in Belgian Limburg. From the first conversation to launch you talk to the person who designs and builds your website.",
      fq_eyebrow: "Frequently asked questions", fq_title: "What you are <em class=\"it\">probably wondering.</em>",
      fq1_q: "What does a website cost?", fq1_a: "A bespoke website starts at €999 (Starter, up to 3 pages). Growth starts at €1,249, a webshop at €1,899. You always get a fixed price up front, with no surprises.",
      fq2_q: "How long does it take?", fq2_a: "You see the free homepage design within five working days. After your go-ahead most websites are online in ten to fourteen days.",
      fq3_q: "Can I make changes myself?", fq3_a: "Yes. You get guidance so you manage texts, photos and products yourself. Rather not? Then we do it, on request.",
      fq4_q: "What about hosting and the domain name?", fq4_a: "Hosting and domain name are not part of the package price. We arrange them on request via the quote, so you never have to think about them.",
      fq5_q: "What if I don't like the design?", fq5_a: "Then it stops there, at no cost. The first design is free and you pay no deposit. You decide only after you have seen it.",
      fq6_q: "Do I have to pay a deposit?", fq6_a: "No. You pay once the website is finished and you are happy with it.",
      c_b1: "Free and without obligation", c_b2: "In your inbox within 5 working days", c_b3: "No deposit, you decide afterwards",
      foot_tag: "Web design studio in Limburg. Bespoke websites for SMEs in Belgium and the Netherlands.", foot_cta: "Request your free homepage design", foot_contact: "Contact", foot_addr: "Limburg, Belgium", foot_company: "Company", foot_kbo: "Company number on request", foot_follow: "Follow us",
      foot_rights: "© 2026 Digital Impression. All rights reserved.", foot_privacy: "Privacy policy", foot_terms: "Terms & conditions",
      in1a: "Your website is the first encounter",
      in1b: "with a new customer.",
      in2a: "Make sure it",
      in2b: "<em class=\"it\">sticks.</em>",
      usp1: "No deposit",
      usp2: "Live in 2 weeks",
      usp3: "One point of contact",
      w1_tag: "Live",
      w2_tag: "Redesign",
      w3_tag: "Redesign",
      w4_tag: "Concept",
      w5_tag: "Concept",
      w1_who: "Physios in Diepenbeek who bring athletes back to their level, and beyond.",
      w1_what: "From Wix template to a bespoke site: black and white, direct, three languages and online booking.",
      w2_who: "Wholesaler of fresh carrots from Haspengouw, on the road to all of Europe every day.",
      w2_what: "Proposal for a new homepage: the field in an arch, the product up front, numbers that build trust.",
      w3_who: "Guided tours through centuries-old marl caves under the village of Zichen.",
      w3_what: "Proposal for a new homepage: dark and amber, a centred poster, Google score and booking in one click.",
      w4_who: "Concept for a platform that tracks vehicle fleets: fuel, maintenance, damage and leasing.",
      w4_what: "Dark command centre: live map with routes, vehicle cards, numbers and chart on the side.",
      w5_who: "Concept for an architecture practice in Hasselt and Antwerp.",
      w5_what: "Editorial: three photos at different heights, the word NOOR as a watermark, light and silence as the subject.",
      ct_eyebrow: "Free homepage design", ct_title: "Curious what your homepage <em class=\"it\">could look like?</em>",
      ct_lead: "Tell us briefly about your business. Within five working days you receive a first design of your homepage. Free, no deposit, no obligation.", ct_link: "See services and pricing",
      of_eyebrow: "Services &amp; pricing", of_title: "What we build, <em class=\"it\">and what it costs.</em>",
      of_lead: "Fixed starting prices, no small print. Pick a service and the details appear next to it. Every project starts with a free homepage design.",
      o1_t: "Business website", o1_s: "Build trust and win enquiries.", o2_t: "Webshop", o2_s: "Sell while you sleep, without checkout hassle.", o3_t: "Redesign", o3_s: "Same content, completely new impression. See Credo.", o4_t: "Landing page", o4_s: "One page, one goal, for campaigns and promotions.", o4_p: "tailored"
    },
    fr: {
      meta_title: "Digital Impression | Des sites web qui font impression", menu: "Menu", close: "Fermer",
      nav_work: "Réalisations", nav_services: "Services", nav_process: "Méthode", nav_pricing: "Design gratuit", nav_contact: "Contact",
      hero_eyebrow: "Studio de webdesign · Belgique & Pays-Bas", h1_a: "<span class=\"hw\">Votre</span> <span class=\"hw\">site</span> <span class=\"hw\">web</span> <span class=\"hw\">est</span> <span class=\"hw\">la</span> <span class=\"hw\">première</span> <span class=\"hw\">rencontre</span> <span class=\"hw\">avec</span> <span class=\"hw\">votre</span> <span class=\"hw\">client.</span>", h1_b: "<span class=\"hw\">Faites</span> <span class=\"hw\">en</span> <span class=\"hw\">sorte</span> <span class=\"hw\"><em class=\"it kw\">qu'elle marque.</em></span>",
      hero_lead: "Conçus et construits sur mesure. Vous voyez votre page d'accueil sous cinq jours ouvrables, gratuitement, sans acompte.",
      cta_design: "Demandez votre design de page d'accueil gratuit", cta_work: "Voir nos réalisations", scroll: "Défiler", show_open: "Voir dans la galerie", hk1: "Votre site web est votre première rencontre avec le client.", hk2: "Faites en sorte qu'elle <em class=\"it kw\">marque.</em>", brand_tag: "<span class=\"bw\">Des</span> <span class=\"bw\">sites</span> <span class=\"bw\">web</span> <span class=\"bw\">qui</span> <span class=\"bw\">font</span> <span class=\"bw it\">impression.</span>", hero_tip: "Cliquez sur un site pour le voir de près", hero_tr: "Sites sur mesure · depuis 2024", gl_go: "Voir dans la galerie", gl_live: "Voir en ligne", gl_close: "Fermer",
      mq1: "Sites d'entreprise", mq2: "Boutiques en ligne", mq3: "Refontes", mq4: "Landing pages",
      statement: "Votre site web est la première poignée de main avec un nouveau client. Nous veillons à ce qu'elle soit ferme : <em class=\"it\">rapide, élégante et conçue pour générer des demandes.</em> Vous voyez votre design avant de décider, et vous ne payez que lorsque vous êtes satisfait.",
      cta_how: "Notre méthode", st_note: "Sans acompte · en ligne en 2 semaines · un seul interlocuteur",
      work_eyebrow: "Réalisations choisies", work_title: "Nos réalisations", w_live: "Voir en ligne", w_design: "Voir le design",
      w1_s: "Kiné & performance · en ligne", w1_m: "D'un modèle Wix à un site sur mesure : noir et blanc, direct, trois langues et réservation en ligne.",
      w2_s: "Commerce de gros B2B · refonte", w2_m: "Grossiste en carottes fraîches de Hesbaye. Proposition de nouvelle page d'accueil : le produit d'abord, les champs et la famille en image, un devis sous cinq jours ouvrables.",
      w3_s: "Tourisme & culture · refonte", w3_m: "Visites guidées dans des galeries de marne centenaires. Proposition de nouvelle page d'accueil : sombre et ambre, la note Google en avant, réservation en un clic.",
      w4_s: "Logiciel · concept", w4_m: "Plateforme de gestion de flotte. Concept : un hero SaaS clair avec le tableau de bord comme preuve, des chiffres qui inspirent confiance d'un coup d'œil.",
      w5_s: "Architecture · concept", w5_m: "Bureau d'architectes. Concept : mise en page éditoriale, grands caractères, la lumière et le silence comme sujet, des photos qui laissent parler l'espace.",
      ba_eyebrow: "Avant et après", ba_title: "De ceci. <em class=\"it\">À cela.</em>", ba_body: "Credo Rehab & Performance, Diepenbeek. À gauche, le modèle Wix en place ; à droite, le site que nous avons créé. Même cabinet, mêmes personnes. Autre impression.", ba_hint: "Glissez le curseur", ba_before: "Avant", ba_after: "Après",
      svc_eyebrow: "Ce que nous créons", svc_title: "Services",
      s1_t: "Sites d'entreprise", s1_p: "Un site qui inspire confiance et génère des demandes. Conçu sur mesure, rapide et parfait sur chaque écran.", s1_1: "Sur mesure", s1_2: "Formulaires de contact", s1_3: "Rapide et sécurisé",
      s2_t: "Boutiques en ligne", s2_p: "Vendez en ligne avec une boutique qui fonctionne : belles pages produits, paiement sécurisé et commande sans friction.", s2_1: "Pages produits", s2_2: "Paiement intégré", s2_3: "Gérable par vous",
      s3_t: "Refontes", s3_p: "Votre site existant, repensé. Même contenu, impression entièrement nouvelle. Voyez l'exemple Credo ci-dessus.", s3_1: "Gardez votre contenu", s3_2: "Plus rapide et mobile", s3_3: "Nouveau look",
      s4_t: "Landing pages", s4_p: "Une page, un objectif. Pour les campagnes, lancements et actions qui doivent convertir.", s4_1: "Un objectif clair", s4_2: "Conçu pour convertir", s4_3: "En ligne rapidement",
      n1_u: "heures", n1_l: "avant de voir votre page d'accueil. Gratuit, et vous décidez ensuite.", n2_u: "jours", n2_l: "du premier échange au site en ligne, pour la plupart des projets.", n3_u: "d'acompte", n3_l: "Vous payez quand le site est terminé et que vous êtes satisfait.",
      proc_eyebrow: "Méthode", proc_title: "De l'échange à la mise en ligne, <em class=\"it\">en quatre étapes.</em>",
      proc_title: "Du design gratuit à la mise en ligne, <em class=\"it\">en cinq étapes.</em>",
      p1_k: "Étape 01", p1_t: "Design de page d'accueil gratuit", p1_p: "Dites en une phrase ce que fait votre entreprise. Sous cinq jours ouvrables, vous voyez un premier design de votre page d'accueil. Gratuit, sans engagement.",
      p2_k: "Étape 02", p2_t: "Échange et devis", p2_p: "Le design vous convainc ? Alors nous parlons une demi-heure de vos clients et de ce que le site doit faire. Vous recevez un prix fixe, sans acompte.",
      p3_k: "Étape 03", p3_t: "Design sur mesure", p3_p: "Nous développons la page d'accueil en un design complet pour chaque page, sur mobile et sur ordinateur. Vous suivez et ajustez.",
      p4_k: "Étape 04", p4_t: "Construction", p4_p: "Dix à quatorze jours, avec vous à chaque étape. Textes, images et technique sous un même toit.",
      pr_eyebrow: "Tarifs", pr_title: "Ce que ça coûte. <em class=\"it\">Sans petits caractères.</em>", pr_lead: "Des prix de départ fixes, pas de petits caractères. Chaque formule commence par un design de page d'accueil gratuit.", pr_from: "à partir de", pr_cta: "Demandez votre design gratuit",
      t1_s: "Website Basic", t1_n: "Starter", t1_f: "Indépendants, commerces locaux et starters qui ont besoin d'un site professionnel.", t1_1: "Site sur mesure, jusqu'à 3 pages", t1_2: "Parfait sur mobile, tablette et ordinateur", t1_3: "Formulaire de contact et réseaux sociaux", t1_4: "En ligne en 10 à 14 jours",
      t2_s: "Website Premium", t2_n: "Croissance", t2_f: "Entreprises qui veulent convaincre les visiteurs et gagner des clients.", t2_1: "Tout de Starter", t2_2: "Jusqu'à 5 pages, blog ou actualités", t2_3: "Système de réservation ou de devis", t2_4: "Intégration newsletter",
      t3_s: "Boutique en ligne", t3_n: "Vente", t3_f: "Qui vend en ligne : mode, alimentation, beauté et tout ce qui tient dans une boîte.", t3_1: "Tout de Croissance", t3_2: "Boutique, jusqu'à 50 produits", t3_3: "Paiement, panier et commande", t3_4: "Explications pour gérer vous-même",
      pr_note: "L'hébergement, le nom de domaine et la rédaction ne font pas partie du prix du forfait ; nous les organisons sur demande via le devis. Pas d'acompte : vous payez quand le site est terminé et que vous êtes satisfait.",
      ab_eyebrow: "À propos", ab_title: "On achète <em class=\"it\">à des personnes.</em>",
      sig1: "Pas d'acompte.", sig2: "Pas de modèles.", sig3: "Pas de promesses sur Google.", sig4: "Un seul interlocuteur.", ab_role: "Fondateur · design et construction",
      c_eyebrow: "Démarrez votre projet", c_title: "Construisons quelque chose <em class=\"it\">qui fait impression.</em>", c_lead: "Parlez-nous brièvement de votre entreprise. Sous cinq jours ouvrables, vous recevez un devis sur mesure et un design gratuit de votre page d'accueil.", region: "Belgique & Pays-Bas",
      f_naam: "Nom", f_naam_ph: "Votre nom", f_email: "E-mail", f_email_ph: "vous@entreprise.be", f_site: "Site web actuel (facultatif)", f_site_ph: "www.votreentreprise.be", f_msg: "Votre projet", f_msg_ph: "Comment pouvons-nous vous aider ? Parlez-nous brièvement de votre entreprise.",
      f_fine: "En envoyant, vous acceptez une prise de contact sans engagement. Pas d'acompte, pas d'obligation.", f_ok_t: "Merci. Nous nous mettons au travail.", f_ok_p: "Vous aurez bientôt de nos nouvelles. Sous cinq jours ouvrables, vous recevez un premier design de votre page d'accueil, sans engagement.", f_again: "Envoyer une autre demande",
      nav_faq: "FAQ",
      rv_eyebrow: "Clients", rv_title: "Du beau travail, <em class=\"it\">et le client s'en sert chaque jour.</em>",
      rv1_q: "D'un modèle Wix à un site sur mesure : noir et blanc, direct, en trois langues et avec réservation en ligne. Depuis la mise en ligne, la première rencontre de chaque nouveau patient.", rv1_m: "Kinésithérapie · Diepenbeek",
      rv2_q: "Votre entreprise ici ? Chaque projet commence par un design de page d'accueil gratuit. Nous ne construisons la suite que s'il vous convainc.", rv2_n: "Votre entreprise", rv2_m: "Prochain client · Limbourg ou ailleurs", rv2_l: "Commencer gratuitement",
      sv_eyebrow: "Services", sv_title: "Ce que nous <em class=\"it\">créons pour vous.</em>", sv_lead: "Prix de départ fixes, pas d'acompte. Cliquez pour voir ce qui est compris exactement.",
      sv1_t: "Webdesign", sv1_p: "Des sites sur mesure qui inspirent confiance et génèrent des demandes. Sur chaque écran, sans modèle.", sv_more: "En savoir plus sur le webdesign",
      sv2_t: "Développement", sv2_p: "Boutiques en ligne et sur mesure : réservation, paiement, connexion avec vos outils actuels.", sv_more2: "En savoir plus sur le développement",
      sv3_t: "SEO", sv3_p: "La base technique pour que Google vous trouve : rapide, bien structuré, visible localement. Sans promesses creuses.", sv3_m: "Base comprise", sv_more3: "En savoir plus sur le SEO",
      sv4_t: "Maintenance & hébergement", sv4_p: "Hébergement, nom de domaine, mises à jour et petites modifications. Pris en charge, pour ne plus y penser.", sv4_m: "Via le devis", sv_more4: "En savoir plus sur la maintenance",
      p1_b: "Gratuit · sous 5 jours ouvrables", p5_k: "Étape 05", p5_t: "En ligne et suivi", p5_p: "Votre site est mis en ligne, avec explications et support. Ensuite, vous restez avec la même personne.",
      ab_p1: "Digital Impression est le studio de webdesign de Stijn Vranken, dans le Limbourg belge. Du premier échange à la mise en ligne, vous parlez à la personne qui conçoit et construit votre site.",
      fq_eyebrow: "Questions fréquentes", fq_title: "Ce que vous vous demandez <em class=\"it\">probablement.</em>",
      fq1_q: "Combien coûte un site web ?", fq1_a: "Un site sur mesure commence à 999 € (Starter, jusqu'à 3 pages). Croissance démarre à 1 249 €, une boutique en ligne à 1 899 €. Vous recevez toujours un prix fixe à l'avance, sans surprise.",
      fq2_q: "Combien de temps cela prend-il ?", fq2_a: "Vous voyez le design gratuit de votre page d'accueil sous cinq jours ouvrables. Après votre accord, la plupart des sites sont en ligne en dix à quatorze jours.",
      fq3_q: "Puis-je faire des modifications moi-même ?", fq3_a: "Oui. Vous recevez des explications pour gérer vous-même textes, photos et produits. Vous préférez ne pas le faire ? Nous nous en chargeons, sur demande.",
      fq4_q: "Et l'hébergement et le nom de domaine ?", fq4_a: "L'hébergement et le nom de domaine ne font pas partie du prix du forfait. Nous les organisons sur demande via le devis, pour que vous n'ayez pas à y penser.",
      fq5_q: "Et si le design ne me plaît pas ?", fq5_a: "Alors cela s'arrête là, sans frais. Le premier design est gratuit et vous ne payez aucun acompte. Vous décidez seulement après l'avoir vu.",
      fq6_q: "Dois-je payer un acompte ?", fq6_a: "Non. Vous payez quand le site est terminé et que vous êtes satisfait.",
      c_b1: "Gratuit et sans engagement", c_b2: "Dans votre boîte mail sous 5 jours ouvrables", c_b3: "Pas d'acompte, vous décidez ensuite",
      foot_tag: "Studio de webdesign dans le Limbourg. Des sites sur mesure pour les PME en Belgique et aux Pays-Bas.", foot_cta: "Demandez votre design de page d'accueil gratuit", foot_contact: "Contact", foot_addr: "Limbourg, Belgique", foot_company: "Entreprise", foot_kbo: "Numéro d'entreprise sur demande", foot_follow: "Suivez-nous",
      foot_rights: "© 2026 Digital Impression. Tous droits réservés.", foot_privacy: "Politique de confidentialité", foot_terms: "Conditions générales",
      in1a: "Votre site web est la première rencontre",
      in1b: "avec un nouveau client.",
      in2a: "Faites en sorte qu'elle",
      in2b: "<em class=\"it\">marque.</em>",
      usp1: "Pas d'acompte",
      usp2: "En ligne en 2 semaines",
      usp3: "Un seul interlocuteur",
      w1_tag: "En ligne",
      w2_tag: "Refonte",
      w3_tag: "Refonte",
      w4_tag: "Concept",
      w5_tag: "Concept",
      w1_who: "Des kinés à Diepenbeek qui ramènent les sportifs à leur niveau, et au-delà.",
      w1_what: "D'un modèle Wix à un site sur mesure : noir et blanc, direct, trois langues et réservation en ligne.",
      w2_who: "Grossiste en carottes fraîches de Hesbaye, chaque jour en route vers toute l'Europe.",
      w2_what: "Proposition de nouvelle page d'accueil : le champ dans une arche, le produit en avant, des chiffres qui rassurent.",
      w3_who: "Visites guidées dans des galeries de marne centenaires sous le village de Zichen.",
      w3_what: "Proposition de nouvelle page d'accueil : sombre et ambre, affiche centrée, note Google et réservation en un clic.",
      w4_who: "Concept pour une plateforme de suivi de flotte : carburant, entretien, sinistres et leasing.",
      w4_what: "Centre de commande sombre : carte en direct avec itinéraires, fiches véhicules, chiffres et graphique sur le côté.",
      w5_who: "Concept pour un bureau d'architectes à Hasselt et Anvers.",
      w5_what: "Éditorial : trois photos à des hauteurs différentes, le mot NOOR en filigrane, la lumière et le silence comme sujet.",
      ct_eyebrow: "Design de page d'accueil gratuit", ct_title: "Curieux de voir à quoi votre page d'accueil <em class=\"it\">pourrait ressembler ?</em>",
      ct_lead: "Parlez-nous brièvement de votre entreprise. Sous cinq jours ouvrables, vous recevez un premier design de votre page d'accueil. Gratuit, sans acompte, sans engagement.", ct_link: "Voir services et tarifs",
      of_eyebrow: "Services &amp; tarifs", of_title: "Ce que nous créons, <em class=\"it\">et ce que ça coûte.</em>",
      of_lead: "Des prix de départ fixes, sans petits caractères. Choisissez un service, les détails apparaissent à côté. Chaque projet commence par un design de page d'accueil gratuit.",
      o1_t: "Site d'entreprise", o1_s: "Inspirer confiance et générer des demandes.", o2_t: "Boutique en ligne", o2_s: "Vendre pendant que vous dormez, sans tracas à la caisse.", o3_t: "Refonte", o3_s: "Même contenu, impression entièrement nouvelle. Voyez Credo.", o4_t: "Landing page", o4_s: "Une page, un objectif, pour campagnes et actions.", o4_p: "sur mesure"
    }
  };
  var I18N_UP = {
    en: {
      nav_services: "Pricing", nav_pricing: "Free example",
      hero_sub: "Bespoke for freelancers and small businesses in Belgium and the Netherlands. First you see a free example with your own photos.",
      cta_free: "Request your free example", cta_work: "See our work", hf1: "€499, all included", hf2: "No deposit", hf3: "Online within two weeks",
      w1_before: "Before · Wix template",
      w2_tag: "Design · salon", w2_who: "Beauty salon with three specialists: facials, nails, lashes and brows.", w2_what: "Treatments with price and duration. Clients put together their own appointment and pick a time.",
      w3_tag: "Design · fitness", w3_who: "Fitness studio with personal training and small groups of up to eight.", w3_what: "Coaches with a face, a class schedule with open spots and a free trial class in three taps.",
      w4_tag: "Design · B&B", w4_who: "B&B with four rooms in an old square farmstead among the orchards of Haspengouw.", w4_what: "Availability per night and direct booking, without a booking platform's commission.",
      w5_tag: "Design · accountant", w5_who: "Family accounting firm for freelancers, companies and private clients.", w5_what: "Calm and reliable: services per type of client, familiar faces and booking an introduction right away.",
      w6_tag: "Redesign", w6_who: "Wholesaler of fresh carrots from Haspengouw, on the road to all of Europe every day.", w6_what: "Proposal for a new homepage: the field in an arch, the product up front, numbers that build trust.",
      cs_before: "Before · Wix template", cs_after: "Now · bespoke",
      cs_t: "From a template like all the others to a site that sounds like their practice.",
      cs_1: "languages: Dutch, English and French", cs_2: "patients book an appointment online themselves", cs_3: "templates: black and white and direct, like the practice itself", cs_next: "Your business next? Start for free",
      sv_eyebrow: "Services &amp; pricing", sv_title: "One price, <em class=\"it\">everything included.</em>",
      sv_lead: "Already received an example site from us? This is the same offer. No deposit: you pay once the site is finished.",
      sv1_k: "01 · Web design", sv1_h: "Your website", sv1_once: "one-off, all included",
      sv1_l1: "Designed for your business, with your own photos and texts", sv1_l2: "Perfect on phone, tablet and laptop", sv1_l3: "Enquiries land straight in your inbox", sv1_l4: "Findable on Google with your name and town",
      sv4_t: "Maintenance &amp; hosting", sv4_p: "Manage it yourself for €0, or carefree: hosting, domain and small changes taken care of.", sv4_k: "per month",
      sv2_t: "Webshop &amp; custom work", sv2_p: "Sell online, take payments or connect with what you already use. Fixed price up front.", sv_more2: "More about webshops",
      sv3_p: "The technical basis so Google finds you: fast, well structured, locally visible.",
      proc_title: "From free example to online, <em class=\"it\">in five steps.</em>",
      p1_t: "Free example", p1_p: "We make an example of your new homepage with the photos, texts and reviews of your business. You don't need to fill in or explain anything.",
      p2_t: "You look and decide", p2_p: "Convinced? Then we continue. Not for you? Then it stops there, at no cost and with no obligation.",
      p3_t: "Finishing it together", p3_p: "You tell us what should change: photos, texts, colours, price list. We adjust until it is right, on phone and laptop.",
      p4_t: "Online", p4_p: "Within ten to fourteen days your site is live on your own domain. You pay only once it is finished and you are happy.",
      p5_t: "Aftercare", p5_p: "Manage it yourself, or carefree for €19.99 a month. You stay with the same person.",
      band_t: "Curious what <em>your</em> website could look like?", band_wa: "or send a WhatsApp", ab_call: "Call Stijn: +32 496 25 14 45",
      fq1_a: "Your website costs €499, one-off and all included. Afterwards you choose: manage it yourself for €0, or carefree for €19.99 a month. A webshop or custom work starts at €1,899, with a fixed price up front.",
      fq2_a: "You see the free example within five working days. After your go-ahead your site is usually online within ten to fourteen days.",
      fq4_a: "With carefree (€19.99 a month) hosting and domain are included and we put new photos, prices or opening hours online for you. If you manage it yourself, hosting and domain are in your name.",
      fq5_q: "What if I don't like the example?", fq5_a: "Then it stops there, at no cost. The example is free and you pay no deposit. You decide only after you have seen it.",
      c_eyebrow: "Free example", c_title: "See your new website <em class=\"it\">before you decide.</em>",
      c_lead: "Tell us briefly about your business, or just share your website or Instagram. Within five working days you receive an example with your own photos. No obligation, no deposit.",
      f_site: "Current website or Instagram (optional)", f_site_ph: "www.yourcompany.com or @yourbusiness", cta_design: "Request your free example",
      f_ok_p: "You will hear from us soon. Within five working days you receive an example of your new website, without obligation.",
      foot_tag: "Web design from Limburg. Bespoke websites for freelancers and small businesses in Belgium and the Netherlands.", foot_cta: "Request your free example"
    },
    fr: {
      nav_services: "Tarifs", nav_pricing: "Exemple gratuit",
      hero_sub: "Sur mesure pour les indépendants et les PME en Belgique et aux Pays-Bas. Vous voyez d'abord un exemple gratuit avec vos propres photos.",
      cta_free: "Demandez votre exemple gratuit", cta_work: "Voir nos réalisations", hf1: "499 €, tout compris", hf2: "Sans acompte", hf3: "En ligne en deux semaines",
      w1_before: "Avant · modèle Wix",
      w2_tag: "Design · institut", w2_who: "Institut de beauté avec trois spécialistes : soins du visage, ongles, cils et sourcils.", w2_what: "Soins avec prix et durée. Les clients composent eux-mêmes leur rendez-vous et choisissent un moment.",
      w3_tag: "Design · fitness", w3_who: "Salle de fitness avec coaching personnel et petits groupes de huit maximum.", w3_what: "Des coachs avec un visage, un planning avec les places libres et une séance d'essai gratuite en trois clics.",
      w4_tag: "Design · chambres d'hôtes", w4_who: "Quatre chambres d'hôtes dans une ferme carrée entourée de vergers en Hesbaye.", w4_what: "Disponibilité par nuit et réservation directe, sans commission d'une plateforme de réservation.",
      w5_tag: "Design · comptable", w5_who: "Cabinet comptable familial pour indépendants, sociétés et particuliers.", w5_what: "Calme et fiable : services par type de client, des visages connus et un premier rendez-vous en un clic.",
      w6_tag: "Refonte", w6_who: "Grossiste en carottes fraîches de Hesbaye, chaque jour en route vers toute l'Europe.", w6_what: "Proposition de nouvelle page d'accueil : le champ dans une arche, le produit en avant, des chiffres qui rassurent.",
      cs_before: "Avant · modèle Wix", cs_after: "Maintenant · sur mesure",
      cs_t: "D'un modèle comme tous les autres à un site qui ressemble à leur cabinet.",
      cs_1: "langues : néerlandais, anglais et français", cs_2: "les patients réservent eux-mêmes en ligne", cs_3: "modèle : noir et blanc et direct, comme le cabinet lui-même", cs_next: "Votre entreprise ensuite ? Commencez gratuitement",
      sv_eyebrow: "Services &amp; tarifs", sv_title: "Un prix, <em class=\"it\">tout compris.</em>",
      sv_lead: "Vous avez déjà reçu un site d'exemple de notre part ? C'est la même offre. Sans acompte : vous payez quand le site est terminé.",
      sv1_k: "01 · Webdesign", sv1_h: "Votre site web", sv1_once: "en une fois, tout compris",
      sv1_l1: "Conçu pour votre entreprise, avec vos propres photos et textes", sv1_l2: "Parfait sur mobile, tablette et ordinateur", sv1_l3: "Les demandes arrivent directement dans votre boîte mail", sv1_l4: "Trouvable sur Google avec votre nom et votre commune",
      sv4_t: "Maintenance &amp; hébergement", sv4_p: "Gérez vous-même pour 0 €, ou sans souci : hébergement, domaine et petites modifications pris en charge.", sv4_k: "par mois",
      sv2_t: "Boutique en ligne &amp; sur mesure", sv2_p: "Vendre en ligne, encaisser ou connecter vos outils actuels. Prix fixe à l'avance.", sv_more2: "En savoir plus sur les boutiques",
      sv3_p: "La base technique pour que Google vous trouve : rapide, bien structuré, visible localement.",
      proc_title: "De l'exemple gratuit à la mise en ligne, <em class=\"it\">en cinq étapes.</em>",
      p1_t: "Exemple gratuit", p1_p: "Nous créons un exemple de votre nouvelle page d'accueil avec les photos, textes et avis de votre entreprise. Vous n'avez rien à remplir ni à expliquer.",
      p2_t: "Vous regardez et décidez", p2_p: "Convaincu ? Alors nous continuons. Pas pour vous ? Cela s'arrête là, sans frais ni engagement.",
      p3_t: "Finaliser ensemble", p3_p: "Vous dites ce qui doit changer : photos, textes, couleurs, tarifs. Nous ajustons jusqu'à ce que ce soit juste, sur mobile et sur ordinateur.",
      p4_t: "En ligne", p4_p: "En dix à quatorze jours, votre site est en ligne sur votre propre domaine. Vous payez seulement quand il est terminé et que vous êtes satisfait.",
      p5_t: "Suivi", p5_p: "Gérez vous-même, ou sans souci pour 19,99 € par mois. Vous restez avec la même personne.",
      band_t: "Curieux de voir à quoi <em>votre</em> site pourrait ressembler ?", band_wa: "ou envoyez un WhatsApp", ab_call: "Appelez Stijn : +32 496 25 14 45",
      fq1_a: "Votre site coûte 499 €, en une fois et tout compris. Ensuite vous choisissez : gérer vous-même pour 0 €, ou sans souci pour 19,99 € par mois. Une boutique en ligne ou du sur-mesure commence à 1 899 €, avec un prix fixe à l'avance.",
      fq2_a: "Vous voyez l'exemple gratuit sous cinq jours ouvrables. Après votre accord, votre site est généralement en ligne en dix à quatorze jours.",
      fq4_a: "Avec la formule sans souci (19,99 € par mois), l'hébergement et le domaine sont compris et nous mettons en ligne vos nouvelles photos, prix ou horaires. Si vous gérez vous-même, hébergement et domaine sont à votre nom.",
      fq5_q: "Et si l'exemple ne me plaît pas ?", fq5_a: "Alors cela s'arrête là, sans frais. L'exemple est gratuit et vous ne payez aucun acompte. Vous décidez seulement après l'avoir vu.",
      c_eyebrow: "Exemple gratuit", c_title: "Voyez votre nouveau site <em class=\"it\">avant de décider.</em>",
      c_lead: "Parlez-nous brièvement de votre entreprise, ou indiquez simplement votre site ou votre Instagram. Sous cinq jours ouvrables, vous recevez un exemple avec vos propres photos. Sans engagement, sans acompte.",
      f_site: "Site actuel ou Instagram (facultatif)", f_site_ph: "www.votreentreprise.be ou @votreentreprise", cta_design: "Demandez votre exemple gratuit",
      f_ok_p: "Vous aurez bientôt de nos nouvelles. Sous cinq jours ouvrables, vous recevez un exemple de votre nouveau site, sans engagement.",
      foot_tag: "Webdesign depuis le Limbourg. Des sites sur mesure pour les indépendants et les PME en Belgique et aux Pays-Bas.", foot_cta: "Demandez votre exemple gratuit"
    }
  };
  I18N_UP.en.nav_about = "About"; I18N_UP.fr.nav_about = "À propos";
  I18N_UP.en.w_open = "View the design"; I18N_UP.fr.w_open = "Voir le design";
  I18N_UP.en.sv1_foot = "No deposit. You pay once the site is finished and you are happy."; I18N_UP.fr.sv1_foot = "Sans acompte. Vous payez quand le site est terminé et que vous êtes satisfait.";
  I18N_UP.en.ab_letter = "I design and build every website myself. So you don't talk to a salesperson or a project manager, but to the person working on your site, from the first example until after launch.";
  I18N_UP.fr.ab_letter = "Je conçois et construis chaque site moi-même. Vous ne parlez donc pas à un commercial ou à un chef de projet, mais à la personne qui travaille sur votre site, du premier exemple jusqu'après la mise en ligne.";
  I18N_UP.en.ab_place = "Limburg · Belgium"; I18N_UP.fr.ab_place = "Limbourg · Belgique";
  I18N_UP.en.c_person = "Your request goes straight to Stijn. You get a personal reply, not an automatic email."; I18N_UP.fr.c_person = "Votre demande arrive directement chez Stijn. Vous recevez une réponse personnelle, pas un e-mail automatique.";
  I18N_UP.en.v_kind = "Design"; I18N_UP.fr.v_kind = "Design"; I18N_UP.en.v_desk = "Laptop"; I18N_UP.fr.v_desk = "Ordinateur"; I18N_UP.en.v_mob = "Phone"; I18N_UP.fr.v_mob = "Mobile";
  I18N_UP.en.v_hint = "Scroll through the full homepage."; I18N_UP.fr.v_hint = "Faites défiler toute la page d'accueil.";
  (function () {
    var T = {
      m_call: ["Call", "Appeler"], mk_book: ["Book an appointment", "Prendre rendez-vous"], mk_booked: ["Confirmed · Tue 4 at 10:30", "Confirmé · mar 4 à 10h30"],
      mk_bill: ["Your invoice", "Votre facture"], mk_dep: ["Deposit", "Acompte"], mk_on: ["On delivery", "À la livraison"], mk_tot: ["Total", "Total"], mk_stamp: ["Only when you are happy", "Seulement si vous êtes satisfait"],
      mk_m_sub: ["Your example site is ready", "Votre site d'exemple est prêt"], mk_m_p: ["As promised: your new homepage, with your own photos.", "Comme promis : votre nouvelle page d'accueil, avec vos propres photos."], mk_new: ["New", "Nouveau"],
      mk_r1: ["Could you use this photo of our studio?", "Vous pouvez mettre cette photo de notre studio ?"], mk_r2: ["Sure, it will be there tomorrow.", "Bien sûr, elle sera en ligne demain."],
      mk_l_h: ["Changes", "Modifications"], mk_l1: ["Top photo replaced", "Photo principale remplacée"], mk_l2: ["Price list added", "Tarifs ajoutés"], mk_l3: ["Opening hours corrected", "Horaires corrigés"],
      mk_g_t: ["Your Business · Town", "Votre entreprise · Commune"], mk_g_p: ["Opening hours, prices and booking right away. See our work and get in touch.", "Horaires, prix et prise de rendez-vous immédiate. Découvrez notre travail et contactez-nous."], mk_gsm: ["Phone", "Mobile"],
      mk_c1: ["Can you add the holiday opening hours?", "Vous pouvez ajouter les horaires des fêtes ?"], mk_c2: ["Done. Have a look.", "C'est fait. Jetez un œil."], mk_c3: ["Carefree · €19.99 a month", "Sans souci · 19,99 € par mois"],
      ch_design: ["Design", "Design"], ch_build: ["Build", "Développement"], ch_care: ["Aftercare", "Suivi"]
    };
    Object.keys(T).forEach(function (k) { I18N_UP.en[k] = T[k][0]; I18N_UP.fr[k] = T[k][1]; });
  })();
  Object.keys(I18N_UP).forEach(function (l) { Object.keys(I18N_UP[l]).forEach(function (k) { I18N[l][k] = I18N_UP[l][k]; }); });
  var NL = {};
  function initI18n() {
    $$("[data-i18n]").forEach(function (el) { var k = el.getAttribute("data-i18n"); if (!(k in NL)) NL[k] = el.innerHTML; });
    $$("[data-i18n-ph]").forEach(function (el) { var k = el.getAttribute("data-i18n-ph"); if (!(k in NL)) NL[k] = el.getAttribute("placeholder"); });
    NL.meta_title = document.title;
    $$(".lang").forEach(function (g) { g.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) applyLang(b.getAttribute("data-lang")); }); });
    var saved = null; try { saved = localStorage.getItem("di_lang"); } catch (e) {}
    if (saved && saved !== "nl" && I18N[saved]) applyLang(saved, true);
  }
  function applyLang(l, silent) {
    lang = l; var d = I18N[l];
    $$("[data-i18n]").forEach(function (el) { var k = el.getAttribute("data-i18n"); var v = d ? d[k] : NL[k]; if (v != null) el.innerHTML = v; });
    $$("[data-i18n-ph]").forEach(function (el) { var k = el.getAttribute("data-i18n-ph"); var v = d ? d[k] : NL[k]; if (v != null) el.setAttribute("placeholder", v); });
    document.title = (d && d.meta_title) || NL.meta_title; document.documentElement.lang = l;
    $$(".lang button").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-lang") === l); });
    // statement words were wrapped: rewrap
    initIntro(); initStory();
    try { localStorage.setItem("di_lang", l); } catch (e) {}
    ScrollTrigger.refresh();
  }

  /* ---------------- init ---------------- */
  function initVW() {
    var set = function () { document.documentElement.style.setProperty("--vw", document.documentElement.clientWidth + "px"); };
    set(); window.addEventListener("resize", set);
  }
  function init() {
    initVW();
    initI18n(); initLenis(); initMenu(); initCursor(); initTheme(); initGL(); initStory(); initIntro(); initWork(); initFAQ(); initTilt(); initProcess(); initReveals(); initForm(); initViewer(); initDepth(); initDock(); initPre();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
