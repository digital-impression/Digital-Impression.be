/* Digital Impression v3 · immersive */
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
    if (!pre) return;
    if (REDUCED) { pre.remove(); heroIn(); return; }
    document.documentElement.classList.add("lenis-stopped");
    var o = { v: 0 };
    gsap.timeline({ onComplete: function () { pre.remove(); document.documentElement.classList.remove("lenis-stopped"); heroIn(); ScrollTrigger.refresh(); } })
      .to(o, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: function () { num.textContent = Math.round(o.v); } })
      .to(bar, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0)
      .to(pre, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "+=0.15");
  }
  function heroIn() {
    var hero = $("#hero");
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(".hero .line-mask > span", { y: 0, duration: 1.3, stagger: 0.14 }, 0)
      .add(function () { hero.classList.add("is-drawn"); }, 0.9)
      .add(function () { hero.classList.add("is-loaded-ui"); }, 1.2);
    if (REDUCED) { tl.progress(1); hero.classList.add("is-drawn", "is-loaded-ui"); }
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
    scene.fog = new THREE.Fog(0x0E1C3A, 5, 18);
    var cam = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    cam.position.set(0, 0, 6);
    var loader = new THREE.TextureLoader();
    var SITES = [
      { src: "site-fleetreview", name: "Fleetreview", kind: { nl: "Software · concept", en: "Software · concept", fr: "Logiciel · concept" }, panel: 4 },
      { src: "site-noor", name: "NOOR architecten", kind: { nl: "Architectuur · concept", en: "Architecture · concept", fr: "Architecture · concept" }, panel: 5 },
      { src: "site-credo", name: "Credo Rehab & Performance", kind: { nl: "Kinesitherapie · live", en: "Physio · live", fr: "Kiné · en ligne" }, panel: 1, live: "https://www.credorehabandperformance.com" },
      { src: "site-simonta", name: "Simonta", kind: { nl: "B2B groothandel · herontwerp", en: "B2B wholesale · redesign", fr: "Commerce de gros · refonte" }, panel: 2 },
      { src: "site-mergel", name: "Mergelgrotten Zichen", kind: { nl: "Toerisme · herontwerp", en: "Tourism · redesign", fr: "Tourisme · refonte" }, panel: 3 }
    ];
    var cards = [], group = new THREE.Group(); scene.add(group);
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var seeded = [
      [-2.6, 0.9, -1], [2.4, -0.7, -2.5], [-1.4, -1.4, -4], [2.9, 1.3, -5.5], [-3.1, 0.2, -7], [0.9, 1.6, -8.5],
      [-0.6, -1.3, -10], [2.6, 0.5, -11.5], [-2.4, 1.1, -13], [1.4, -1.0, -14.5]
    ];
    var frameGeo = new THREE.PlaneGeometry(2.3, 1.475, 1, 1);
    seeded.forEach(function (p, i) {
      var site = SITES[i % SITES.length];
      var tex = loader.load("assets/img/gl-" + site.src.replace("site-", "") + ".jpg");
      tex.minFilter = THREE.LinearFilter; tex.center.set(0.5, 0.5);
      var geo = new THREE.PlaneGeometry(2.2, 1.375, 1, 1);
      var mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
      var m = new THREE.Mesh(geo, mat);
      var band = 1.7 + Math.max(0, -p[2]) * 0.09;
      if (Math.abs(p[0]) < band) p[0] = (p[0] < 0 ? -1 : 1) * (band + rnd(0, 0.7));
      m.position.set(p[0], p[1], p[2]);
      m.rotation.set(rnd(-0.12, 0.12), rnd(-0.35, 0.35), rnd(-0.06, 0.06));
      m.scale.setScalar(0.001);
      // gold frame behind the card, shown on hover / focus
      var frame = new THREE.Mesh(frameGeo, new THREE.MeshBasicMaterial({ color: 0xC9A24A, transparent: true, opacity: 0, side: THREE.DoubleSide }));
      frame.position.z = -0.01; m.add(frame);
      var ci = cards.length, leapAt = [0.055, 0.16, 0.29][[1, 4, 7].indexOf(ci)];
      m.userData = { site: site, base: p.slice(), ph: rnd(0, Math.PI * 2), sp: rnd(0.4, 0.8), rx: m.rotation.x, ry: m.rotation.y, rz: m.rotation.z, frame: frame, tex: tex, hover: 0, s: 1,
        mode: ci % 3, leap: leapAt != null ? { at: leapAt, len: 0.13, side: (ci % 2 ? 1 : -1) } : null, e: 0 };
      group.add(m); cards.push(m);
    });
    var N = 160, pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) { pos[i * 3] = rnd(-6, 6); pos[i * 3 + 1] = rnd(-3.5, 3.5); pos[i * 3 + 2] = rnd(-18, 2); }
    var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xC9A24A, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(dust);
    var ring = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.23, 96), new THREE.MeshBasicMaterial({ color: 0xC9A24A, transparent: true, opacity: 0.25, side: THREE.DoubleSide }));
    ring.position.set(0.4, 0.2, -12); scene.add(ring);

    var mx = 0, my = 0, tx = 0, ty = 0, prog = 0, w = 0, h = 0;
    var ray = new THREE.Raycaster(), pointer = new THREE.Vector2(-9, -9), hovered = null, focused = null, focusProg = 0, pdown = null;
    var focusEl = $("#glFocus"), kindEl = $("#glKind"), nameEl = $("#glName"), goBtn = $("#glGo"), liveA = $("#glLive"), closeBtn = $("#glClose"), tip = $("#heroTip");
    function resize() {
      var r = hero.getBoundingClientRect(); w = r.width; h = r.height;
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      group.scale.setScalar(w < 700 ? 0.72 : 1);
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
    window.__glEnter = function () { cards.forEach(function (c, i) { gsap.to(c.scale, { x: 1, y: 1, z: 1, duration: 1.6, delay: 0.15 + i * 0.07, ease: "power3.out", onComplete: function () { if (i === cards.length - 1) entered = true; } }); }); };
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
      hero.classList.add("is-focus");
    }
    function unfocus() {
      if (!focused) return;
      var card = focused, u = card.userData; focused = null;
      gsap.killTweensOf(u.tex.repeat);
      gsap.to(u.tex.repeat, { x: 1, y: 1, duration: 0.8, onUpdate: function () { u.tex.offset.set((1 - u.tex.repeat.x) / 2, (1 - u.tex.repeat.y) / 2); } });
      gsap.to(card.position, { x: u.base[0], y: u.base[1], z: u.base[2], duration: 1.1, ease: "power4.inOut" });
      gsap.to(card.rotation, { x: u.rx, y: u.ry, z: u.rz, duration: 1.1, ease: "power4.inOut" });
      gsap.to(u.frame.material, { opacity: 0, duration: 0.4 });
      cards.forEach(function (c) { gsap.to(c.material, { opacity: 0.92, duration: 0.8 }); });
      gsap.to(dust.material, { opacity: 0.55, duration: 0.8 });
      if (focusEl) gsap.to(focusEl, { opacity: 0, y: 12, duration: 0.4, onComplete: function () { focusEl.hidden = true; } });
      if (tip) gsap.to(tip, { opacity: 1, duration: 0.6, delay: 0.4 });
      hero.classList.remove("is-focus");
    }
    if (closeBtn) closeBtn.addEventListener("click", unfocus);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") unfocus(); });
    ScrollTrigger.create({ trigger: "#stage", start: "top top", end: "bottom bottom", scrub: true, onUpdate: function (st) { prog = st.progress; if (focused && Math.abs(prog - focusProg) > 0.02) unfocus(); } });
    gsap.to(".hero__in", { opacity: 0, y: -30, ease: "none", scrollTrigger: { trigger: "#stage", start: "top top", end: "+=45%", scrub: true } });
    gsap.to(".hero__veil", { opacity: 0.3, ease: "none", scrollTrigger: { trigger: "#stage", start: "top top", end: "+=90%", scrub: true } });
    var rnd0 = function (ph) { return Math.sin(ph) * 0.35; };
    var clock = new THREE.Clock(), visible = true, stageEl = $("#stage");
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(stageEl || hero);
    function tick() {
      requestAnimationFrame(tick);
      if (!visible && prog >= 1) return;
      var dt = Math.min(clock.getDelta(), 0.05), t = clock.getElapsedTime();
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      cam.position.z = 6 - prog * 12;
      var fg = Math.min(1, Math.max(0, (prog - 0.08) / 0.45)); // 0 in the hero → 1 once the intro copy runs
      cam.position.x = mx * 0.6; cam.position.y = -my * 0.4 - prog * 1.3;
      cam.lookAt(mx * 0.3, -my * 0.2, cam.position.z - 6);
      if (FINE && !focused) pick();
      cards.forEach(function (c) {
        var u = c.userData;
        if (c === focused) { return; }
        // slow conveyor towards the viewer, wrapping to the back
        u.base[2] += dt * 0.55;
        if (u.base[2] > cam.position.z - 2.2) { u.base[2] -= 19; u.base[0] = (Math.random() < 0.5 ? -1 : 1) * rnd(3.0, 4.2); u.base[1] = rnd(-1.5, 1.6); }
        // three movement characters so the field never reads as one loop
        var bob = u.mode === 1 ? 0.34 : 0.22, swayY = u.mode === 2 ? 0.2 : 0.12, spin = u.mode === 1 ? Math.sin(t * 0.09 + u.ph) * 0.08 : 0;
        var px = u.base[0] * (1 - fg * 0.26) + Math.cos(t * u.sp * 0.7 + u.ph) * 0.14, py = u.base[1] + Math.sin(t * u.sp + u.ph) * bob, pz = u.base[2];
        var ry = u.ry + Math.sin(t * 0.3 + u.ph) * swayY + mx * 0.12, rx = Math.sin(t * 0.25 + u.ph) * 0.07 - my * 0.07, rz = u.rz + Math.sin(t * 0.2 + u.ph) * 0.03 + spin;
        // leapers: scroll-driven jump to right in front of the viewer, then back into the stream
        var e = 0;
        if (u.leap) { var k = (prog - u.leap.at) / u.leap.len; if (k > 0 && k < 1) e = Math.sin(k * Math.PI); e = Math.pow(e, 0.8); }
        u.e += (e - u.e) * 0.2; e = u.e;
        if (e > 0.001) {
          var lz = cam.position.z - 4.6, lx = cam.position.x + u.leap.side * 3.0, ly = cam.position.y + rnd0(u.ph);
          px = px * (1 - e) + lx * e; py = py * (1 - e) + ly * e; pz = pz * (1 - e) + lz * e;
          ry = ry * (1 - e) + (-u.leap.side * 0.22) * e; rx *= (1 - e); rz *= (1 - e);
        }
        c.position.set(px, py, pz); c.rotation.set(rx, ry, rz);
        var want = (c === hovered && !focused) ? 1 : 0;
        u.hover += (want - u.hover) * 0.12;
        var breathe = u.mode === 2 ? 1 + Math.sin(t * 0.6 + u.ph) * 0.035 : 1;
        if (entered) { var sc = (1 + fg * 0.34 + u.hover * 0.08) * breathe * (1 + e * 0.22); c.scale.set(sc, sc, 1); }
        u.frame.material.opacity = u.hover * 0.7;
        if (!focused) c.material.opacity = Math.min(1, 0.92 + fg * 0.08 + u.hover * 0.08 + e * 0.5);
      });
      dust.rotation.y = t * 0.02; ring.rotation.z = t * 0.05;
      renderer.render(scene, cam);
    }
    tick();
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
      var inter = t && t.closest && t.closest("a, button, .orow__btn, [role='slider']");
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
    function update() {
      var y = window.scrollY + window.innerHeight * 0.5, cur = secs[0];
      secs.forEach(function (s) { if (s.offsetTop <= y) cur = s; });
      html.classList.toggle("is-light", cur.getAttribute("data-theme") === "light");
    }
    window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update); update();
    if (lenis) lenis.on("scroll", update);
  }

  /* ---------------- menu ---------------- */
  function closeMenu() { var m = $("#menu"); if (m && m.classList.contains("is-open")) { m.classList.remove("is-open"); m.setAttribute("aria-hidden", "true"); $("#menuBtn").setAttribute("aria-expanded", "false"); if (lenis) lenis.start(); } }
  function initMenu() {
    var m = $("#menu"), b = $("#menuBtn"), c = $("#menuClose");
    b.addEventListener("click", function () { m.classList.add("is-open"); m.setAttribute("aria-hidden", "false"); b.setAttribute("aria-expanded", "true"); if (lenis) lenis.stop(); });
    c.addEventListener("click", closeMenu);
    $$("a", m).forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* ---------------- marquee (velocity reactive) ---------------- */
  function initMarquee() {
    var track = $("#mqTrack"); if (!track) return;
    var x = 0, base = REDUCED ? 0 : 0.6, vel = 0;
    if (lenis) lenis.on("scroll", function (e) { vel = e.velocity || 0; });
    gsap.ticker.add(function (t, dt) {
      var half = track.scrollWidth / 2; if (!half) return;
      x -= (base + Math.min(Math.abs(vel) * 0.08, 6)) * (dt / 16.7);
      if (x <= -half) x += half;
      track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
    });
  }

  /* ---------------- statement word reveal ---------------- */
  function wrapWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes), out = "";
    nodes.forEach(function (n) {
      if (n.nodeType === 3) { out += n.textContent.split(/(\s+)/).map(function (w) { return /^\s+$/.test(w) || !w ? w : '<span class="w">' + w + "</span>"; }).join(""); }
      else if (n.nodeType === 1) { out += '<span class="w it">' + n.innerHTML + "</span>"; }
    });
    el.innerHTML = out;
  }
  function initStatement() {
    var el = $("#statement"); if (!el) return;
    wrapWords(el);
    var words = $$(".w", el);
    if (REDUCED) { words.forEach(function (w) { w.classList.add("on"); }); return; }
    ScrollTrigger.create({ trigger: el, start: "top 78%", end: "bottom 45%", scrub: true,
      onUpdate: function (st) { var n = Math.floor(st.progress * words.length); words.forEach(function (w, i) { w.classList.toggle("on", i <= n); }); } });
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
  var introKill = null;
  function initIntro() {
    var sec = $(".intro"); if (!sec) return;
    if (introKill) { introKill(); introKill = null; }
    var items = [$("#il1"), $("#il2"), $("#usp1"), $("#usp2"), $("#usp3")];
    var fill = $("#introFill"), step = $("#introStep"), ticks = $("#introTicks");
    if (REDUCED) { gsap.set(items, { clearProps: "all" }); return; }
    var mob = window.matchMedia("(max-width: 899px)").matches, travel = mob ? 42 : 50;
    gsap.set(items, { autoAlpha: 0 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.55,
      onUpdate: function (st) { var p = st.progress; if (fill) fill.style.transform = "scaleY(" + p + ")"; if (step) step.textContent = "0" + Math.min(5, Math.floor(p * 5.1) + 1); } } });
    var L = 20;
    items.forEach(function (el, i) {
      var s = i * L, last = i === items.length - 1, isLine = i < 2;
      if (isLine) {
        // the sentence sits still; every word is written by the scroll itself
        wrapIntroWords(el);
        var words = $$(".iw", el);
        tl.fromTo(el, { y: travel * 0.5 + "vh" }, { y: 0, duration: L * 0.2, ease: "power2.out" }, s);
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: L * 0.12, ease: "power2.out" }, s);
        var w0 = s + L * 0.1, w1 = s + L * 0.74, each = L * 0.1, gap = words.length > 1 ? (w1 - w0 - each) / (words.length - 1) : 0;
        words.forEach(function (w, k) { tl.fromTo(w, { opacity: 0.1, yPercent: 55 }, { opacity: 1, yPercent: 0, duration: each, ease: "power2.out" }, w0 + gap * k); });
        tl.to(el, { y: (-travel) + "vh", duration: L * 0.22, ease: "power2.in" }, s + L * 0.78);
        tl.to(el, { autoAlpha: 0, duration: L * 0.16, ease: "power2.in" }, s + L * 0.84);
      } else {
        // USP beats: solid stage, long vertical travel, blur + scale in and out, gold rule drawn while it holds
        var t2 = travel * 1.4, title = $(".usp__t", el);
        tl.fromTo(el, { y: t2 + "vh" }, { y: 0, duration: L * 0.44, ease: "power3.out" }, s);
        tl.fromTo(el, { autoAlpha: 0, scale: 0.78, filter: "blur(14px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: L * 0.34, ease: "power2.out" }, s + L * 0.04);
        tl.fromTo(title, { letterSpacing: "0.06em" }, { letterSpacing: "-0.03em", duration: L * 0.4, ease: "power2.out" }, s);
        tl.fromTo(title, { "--ul": 0 }, { "--ul": 1, duration: L * 0.3, ease: "power2.inOut" }, s + L * 0.3);
        if (!last) {
          tl.to(el, { y: (-t2) + "vh", duration: L * 0.44, ease: "power3.in" }, s + L * 0.56);
          tl.to(el, { autoAlpha: 0, scale: 1.18, filter: "blur(12px)", duration: L * 0.3, ease: "power2.in" }, s + L * 0.68);
        }
      }
    });
    var cover = $("#introCover");
    if (cover) tl.fromTo(cover, { autoAlpha: 0 }, { autoAlpha: 1, duration: 5.5, ease: "power2.inOut" }, 36);
    tl.to({}, { duration: 8 }, 100);
    var tk = ticks ? gsap.fromTo(ticks, { yPercent: 0 }, { yPercent: -30, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true } }) : null;
    introKill = function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); if (tk) { tk.scrollTrigger && tk.scrollTrigger.kill(); tk.kill(); } gsap.set(items, { clearProps: "all" }); };
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

  /* ---------------- before / after ---------------- */
  function initBA() {
    var root = $("#ba"), before = $("#baBefore"), handle = $("#baHandle"); if (!root) return;
    var dragging = false;
    function syncW() { before.firstElementChild.style.setProperty("--w", root.getBoundingClientRect().width + "px"); }
    syncW(); window.addEventListener("resize", syncW);
    function setPos(x) { var r = root.getBoundingClientRect(), pct = Math.max(3, Math.min(97, ((x - r.left) / r.width) * 100)); before.style.width = pct + "%"; handle.style.left = pct + "%"; handle.setAttribute("aria-valuenow", Math.round(pct)); }
    var start = function (e) { dragging = true; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    var move = function (e) { if (!dragging) return; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    var end = function () { dragging = false; };
    root.addEventListener("mousedown", start); root.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("mousemove", move); window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("mouseup", end); window.addEventListener("touchend", end);
    handle.addEventListener("keydown", function (e) { var v = parseFloat(handle.getAttribute("aria-valuenow")) || 50, r = root.getBoundingClientRect(); if (e.key === "ArrowLeft") { setPos(r.left + r.width * (v - 5) / 100); e.preventDefault(); } if (e.key === "ArrowRight") { setPos(r.left + r.width * (v + 5) / 100); e.preventDefault(); } });
  }


  /* ---------------- live CTA: type a sentence, see your homepage ---------------- */
  var DEMO = {
    nl: {
      studio:   { kick: "Uw sector · uw regio", h: "Uw zaak, in één zin.", p: "Een eerste indruk die klopt, geschreven en ontworpen rond uw zaak.", btn: "Maak een afspraak", links: ["Aanbod", "Over ons", "Contact"], strip: ["Op maat", "Snel", "Eén aanspreekpunt"], cta: "Contact" },
      kinesist: { kick: "Kinesitherapie & performance", p: "Van blessure naar beter dan voorheen. Persoonlijke begeleiding, meetbare vooruitgang.", btn: "Boek een sessie", links: ["Behandelingen", "Team", "Tarieven"], strip: ["Sportrevalidatie", "Manuele therapie", "Online boeken"], cta: "Boek nu" },
      bakker:   { kick: "Ambachtelijke bakkerij", p: "Elke ochtend vers uit de oven. Brood met tijd, taarten met liefde.", btn: "Bekijk het assortiment", links: ["Brood", "Patisserie", "Bestellen"], strip: ["Dagvers", "Eigen zuurdesem", "Op bestelling"], cta: "Bestel" },
      advocaat: { kick: "Advocatenkantoor", p: "Heldere raad en vastberaden verdediging, in taal die u begrijpt.", btn: "Plan een eerste gesprek", links: ["Expertise", "Kantoor", "Contact"], strip: ["Ondernemingsrecht", "Familierecht", "Vastgoed"], cta: "Afspraak" },
      tuinman:  { kick: "Tuinaanleg & onderhoud", p: "Ontwerp, aanleg en onderhoud door mensen die weten wat er in uw grond groeit.", btn: "Vraag een tuinplan", links: ["Tuinen", "Projecten", "Contact"], strip: ["Ontwerp", "Aanleg", "Onderhoud"], cta: "Offerte" },
      zanger:   { kick: "Live muziek voor uw event", p: "Van intieme ceremonie tot volle dansvloer. Eén stem, de juiste sfeer.", btn: "Check beschikbaarheid", links: ["Repertoire", "Agenda", "Boeken"], strip: ["Bruiloften", "Bedrijfsfeesten", "Festivals"], cta: "Boek" },
      webshop:  { kick: "Nieuwe collectie", p: "Zorgvuldig gemaakt, eerlijk geprijsd, morgen bij u thuis.", btn: "Shop de collectie", links: ["Shop", "Over", "Verzending"], strip: ["Gratis verzending", "Retour binnen 30 dagen", "Veilig betalen"], cta: "Winkelwagen" }
    },
    en: {
      studio:   { kick: "Your sector · your region", h: "Your business, in one sentence.", p: "A first impression that fits, written and designed around your business.", btn: "Book an appointment", links: ["Services", "About", "Contact"], strip: ["Bespoke", "Fast", "One contact"], cta: "Contact" },
      kinesist: { kick: "Physiotherapy & performance", p: "From injury to better than before. Personal guidance, measurable progress.", btn: "Book a session", links: ["Treatments", "Team", "Rates"], strip: ["Sports rehab", "Manual therapy", "Online booking"], cta: "Book now" },
      bakker:   { kick: "Artisan bakery", p: "Fresh from the oven every morning. Bread with time, cakes with love.", btn: "See the range", links: ["Bread", "Pastry", "Order"], strip: ["Fresh daily", "Own sourdough", "Made to order"], cta: "Order" },
      advocaat: { kick: "Law firm", p: "Clear advice and determined defence, in language you understand.", btn: "Plan a first meeting", links: ["Expertise", "Firm", "Contact"], strip: ["Business law", "Family law", "Real estate"], cta: "Appointment" },
      tuinman:  { kick: "Garden design & care", p: "Design, planting and maintenance by people who know what grows in your soil.", btn: "Request a garden plan", links: ["Gardens", "Projects", "Contact"], strip: ["Design", "Planting", "Maintenance"], cta: "Quote" },
      zanger:   { kick: "Live music for your event", p: "From intimate ceremony to packed dance floor. One voice, the right mood.", btn: "Check availability", links: ["Repertoire", "Dates", "Book"], strip: ["Weddings", "Corporate events", "Festivals"], cta: "Book" },
      webshop:  { kick: "New collection", p: "Carefully made, fairly priced, at your door tomorrow.", btn: "Shop the collection", links: ["Shop", "About", "Shipping"], strip: ["Free shipping", "30-day returns", "Secure payment"], cta: "Cart" }
    },
    fr: {
      studio:   { kick: "Votre secteur · votre région", h: "Votre entreprise, en une phrase.", p: "Une première impression juste, écrite et conçue autour de votre activité.", btn: "Prendre rendez-vous", links: ["Offre", "À propos", "Contact"], strip: ["Sur mesure", "Rapide", "Un interlocuteur"], cta: "Contact" },
      kinesist: { kick: "Kinésithérapie & performance", p: "De la blessure à mieux qu'avant. Accompagnement personnel, progrès mesurables.", btn: "Réserver une séance", links: ["Soins", "Équipe", "Tarifs"], strip: ["Rééducation sportive", "Thérapie manuelle", "Réservation en ligne"], cta: "Réserver" },
      bakker:   { kick: "Boulangerie artisanale", p: "Chaque matin, tout frais sorti du four. Du pain avec du temps, des gâteaux avec amour.", btn: "Voir l'assortiment", links: ["Pain", "Pâtisserie", "Commander"], strip: ["Frais du jour", "Levain maison", "Sur commande"], cta: "Commander" },
      advocaat: { kick: "Cabinet d'avocats", p: "Des conseils clairs et une défense déterminée, dans un langage que vous comprenez.", btn: "Planifier un premier entretien", links: ["Expertise", "Cabinet", "Contact"], strip: ["Droit des affaires", "Droit familial", "Immobilier"], cta: "Rendez-vous" },
      tuinman:  { kick: "Aménagement & entretien de jardins", p: "Conception, plantation et entretien par des gens qui savent ce qui pousse dans votre sol.", btn: "Demander un plan", links: ["Jardins", "Projets", "Contact"], strip: ["Conception", "Plantation", "Entretien"], cta: "Devis" },
      zanger:   { kick: "Musique live pour votre événement", p: "De la cérémonie intime à la piste de danse pleine. Une voix, la bonne ambiance.", btn: "Vérifier les disponibilités", links: ["Répertoire", "Agenda", "Réserver"], strip: ["Mariages", "Événements d'entreprise", "Festivals"], cta: "Réserver" },
      webshop:  { kick: "Nouvelle collection", p: "Fabriqué avec soin, prix honnête, chez vous demain.", btn: "Découvrir la collection", links: ["Boutique", "À propos", "Livraison"], strip: ["Livraison gratuite", "Retour sous 30 jours", "Paiement sécurisé"], cta: "Panier" }
    }
  };
  var EXAMPLES = {
    nl: [["kinesist", "Kinesist in Diepenbeek, gespecialiseerd in sporters."], ["bakker", "Ambachtelijke bakkerij in het hart van Hasselt."], ["advocaat", "Advocatenkantoor voor ondernemers in Genk."], ["tuinman", "Tuinaanleg en onderhoud in heel Limburg."], ["zanger", "Zangeres voor bruiloften en bedrijfsfeesten."], ["webshop", "Webshop met handgemaakte Belgische sieraden."]],
    en: [["kinesist", "Physiotherapist in Diepenbeek, specialised in athletes."], ["bakker", "Artisan bakery in the heart of Hasselt."], ["advocaat", "Law firm for entrepreneurs in Genk."], ["tuinman", "Garden design and maintenance across Limburg."], ["zanger", "Singer for weddings and corporate events."], ["webshop", "Webshop with handmade Belgian jewellery."]],
    fr: [["kinesist", "Kinésithérapeute à Diepenbeek, spécialisé en sportifs."], ["bakker", "Boulangerie artisanale au cœur de Hasselt."], ["advocaat", "Cabinet d'avocats pour entrepreneurs à Genk."], ["tuinman", "Aménagement et entretien de jardins dans tout le Limbourg."], ["zanger", "Chanteuse pour mariages et fêtes d'entreprise."], ["webshop", "Boutique en ligne de bijoux belges faits main."]]
  };
  var KEYS = [
    ["kinesist", /kine|kinésith|fysio|physio|osteo|chiro|sport|rehab|revalid|personal|fitness|gym|coach|yoga|pilates|massa|podolo|logo|diëtist|dietist|tandarts|dentist|dokter|huisarts|psycholo|therap/i],
    ["bakker", /bakker|boulang|bakery|brood|patiss|pastry|taart|gâteau|chocol|koffie|café|coffee|restaurant|bistro|brasserie|traiteur|catering|frituur|pizza|sushi|slager|boucher|butcher|wijn|vin\b|wine|bier|beer|hotel|b&b|ijs|glace/i],
    ["advocaat", /advoca|avocat|lawyer|law firm|notar|jurist|boekhoud|account|comptab|fiscal|verzeker|assur|insur|consult|immo|vastgoed|makelaar|real estate|bank|financ|architect|ingenieur|engineer|kantoor|bureau|office|hr|recruit/i],
    ["tuinman", /tuin|jardin|garden|groen|hovenier|landscap|bouw|construct|dak|roof|toit|schilder|peintre|paint|loodgiet|plomb|plumb|elektr|électr|electric|aannemer|contractor|renovat|chauffag|verwarm|heating|installat|tegel|carrel|tiling|schrijnwerk|menuis|carpent|vloer|floor|zonnepan|solar|poets|clean|nettoy/i],
    ["zanger", /zang|zing|sing|chant|muziek|music|musique|band|dj\b|fotogra|photogra|artist|kunst|art\b|dans|danc|event|feest|fête|party|bruiloft|wedding|mariage|theater|théâtre|film|video|vidéo|studio|design|grafisch|graphic/i],
    ["webshop", /webshop|web shop|shop|winkel|boutique|store|verkoop|vente|sell|e-?commerce|online|kled|fashion|mode|vêtement|sieraden|bijou|jewel|cadeau|gift|cosmet|beauty|parfum|meubel|furniture|decor|déco|boek|book|speelgoed|toy|wijnshop/i]
  ];
  function detectK(text) {
    var t = (text || "").toLowerCase(); if (!t.trim()) return "studio";
    for (var i = 0; i < KEYS.length; i++) if (KEYS[i][1].test(t)) return KEYS[i][0];
    return "studio";
  }
  var ctaCurK = "studio", ctaTyped = "", idleTimer = null, idleOn = false, ctaInView = false, idleIdx = 0;
  function fillDemo(k, keepH) {
    var d = (DEMO[lang] || DEMO.nl)[k] || DEMO.nl[k];
    var set = function (id, v) { var el = $("#" + id); if (el) el.textContent = v; };
    set("dKick", d.kick); set("dP", d.p); set("dBtn", d.btn); set("dCta", d.cta);
    set("dL1", d.links[0]); set("dL2", d.links[1]); set("dL3", d.links[2]);
    set("dS1", d.strip[0]); set("dS2", d.strip[1]); set("dS3", d.strip[2]);
    set("dLogo", lang === "en" ? "Your logo" : lang === "fr" ? "Votre logo" : "Uw logo");
    if (!keepH) setDemoH(d.h || "");
  }
  function setDemoH(text) { var el = $("#dHText"); if (el) el.textContent = text; }
  function setUrl(text) {
    var u = $("#ctaUrl"); if (!u) return;
    var words = (text || "").toLowerCase().replace(/[^a-z0-9àâäéèêëïîôöùûüç\s-]/g, "").split(/\s+/).filter(function (w) { return w.length > 2 && !/^(een|van|voor|met|het|de|in|en|the|and|for|with|une|des|pour|les|dans|à|et|au|aux|du|la|le)$/.test(w); }).slice(0, 2);
    u.textContent = "www." + (words.length ? words.join("") : (lang === "en" ? "yourbusiness" : lang === "fr" ? "votreentreprise" : "uwzaak")) + ".be";
  }
  function switchK(k, instant) {
    var demo = $("#demo"); if (!demo || (k === ctaCurK && demo.getAttribute("data-k") === k)) return;
    ctaCurK = k;
    $$("#ctaChips button").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-k") === k); });
    $$(".demo__img img").forEach(function (im) { im.classList.toggle("is-on", im.getAttribute("data-k") === k); });
    if (instant || REDUCED) { demo.setAttribute("data-k", k); fillDemo(k, true); return; }
    demo.classList.add("is-switching");
    setTimeout(function () { demo.setAttribute("data-k", k); fillDemo(k, true); demo.classList.remove("is-switching"); }, 340);
  }
  function stopIdle() { idleOn = false; if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; } }
  function startIdle() {
    if (idleOn || REDUCED || ctaTyped) return; idleOn = true;
    var ex = EXAMPLES[lang] || EXAMPLES.nl, hEl = $("#dH");
    function run() {
      if (!idleOn) return;
      var item = ex[idleIdx % ex.length], text = item[1], i = 0; idleIdx++;
      switchK(item[0]); setUrl(text); if (hEl) hEl.classList.remove("is-done");
      setDemoH("");
      (function type() {
        if (!idleOn) return;
        i++; setDemoH(text.slice(0, i));
        if (i < text.length) idleTimer = setTimeout(type, 38 + Math.random() * 45);
        else { if (hEl) hEl.classList.add("is-done"); idleTimer = setTimeout(function () { if (!idleOn) return; (function erase() { if (!idleOn) return; i -= 3; setDemoH(i > 0 ? text.slice(0, i) : ""); if (i > 0) idleTimer = setTimeout(erase, 14); else idleTimer = setTimeout(run, 350); })(); }, 2600); }
      })();
    }
    idleTimer = setTimeout(run, 500);
  }
  function initLiveCTA() {
    var sec = $("#ontwerp"), inp = $("#ctaInput"), demo = $("#demo"); if (!sec || !inp || !demo) return;
    fillDemo("studio"); setUrl("");
    var field = inp.closest(".cta__field");
    var onInput = function () {
      ctaTyped = inp.value; field.classList.toggle("is-filled", !!ctaTyped.trim());
      if (ctaTyped.trim()) { stopIdle(); var t = ctaTyped.trim(); setDemoH(t.charAt(0).toUpperCase() + t.slice(1)); setUrl(t); switchK(detectK(t)); $("#dH").classList.remove("is-done"); }
      else { setDemoH(""); setUrl(""); switchK("studio"); if (ctaInView) startIdle(); }
    };
    inp.addEventListener("input", onInput);
    inp.addEventListener("focus", function () { if (!ctaTyped) { stopIdle(); setDemoH(""); } });
    inp.addEventListener("blur", function () { if (!ctaTyped && ctaInView) startIdle(); });
    $("#ctaChips").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var k = b.getAttribute("data-k"), ex = (EXAMPLES[lang] || EXAMPLES.nl).filter(function (x) { return x[0] === k; })[0];
      inp.value = ex ? ex[1].replace(/\.$/, "") : ""; onInput(); inp.focus({ preventScroll: true });
    });
    $("#ctaSend").addEventListener("click", function () {
      var v = (inp.value || "").trim(), ber = $("#bericht");
      if (ber && v) ber.value = (lang === "en" ? "My business: " : lang === "fr" ? "Mon activité : " : "Mijn zaak: ") + v + "\n";
      var c = $("#contact"); if (lenis) lenis.scrollTo(c, { duration: 1.4 }); else c.scrollIntoView({ behavior: "smooth" });
      setTimeout(function () { var n = $("#naam"); if (n) n.focus({ preventScroll: true }); }, 1500);
    });
    ScrollTrigger.create({ trigger: sec, start: "top 75%", end: "bottom 25%",
      onToggle: function (st) { ctaInView = st.isActive; if (st.isActive) { if (!ctaTyped && document.activeElement !== inp) startIdle(); } else stopIdle(); } });
    if (!REDUCED) {
      gsap.from("#ctaStage", { opacity: 0, y: 90, rotateX: 14, transformPerspective: 1400, duration: 1.4, ease: "power4.out", scrollTrigger: { trigger: sec, start: "top 70%", once: true } });
      gsap.from("#ctaBadge", { scale: 0, rotation: -40, duration: 1, ease: "back.out(2)", scrollTrigger: { trigger: sec, start: "top 55%", once: true } });
      gsap.to("#ctaBadge", { y: -8, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.from(".cta__chips button", { opacity: 0, y: 12, stagger: 0.06, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: "#ctaChips", start: "top 90%", once: true } });
    }
    window.__ctaRefresh = function () { var ex = EXAMPLES[lang] || EXAMPLES.nl; fillDemo(ctaCurK, !!ctaTyped); if (ctaTyped) setUrl(ctaTyped); else { setUrl(""); if (idleOn) { stopIdle(); startIdle(); } } };
  }

  /* ---------------- diensten & prijzen: chooser ---------------- */
  var OFFER = {
    nl: {
      site: { kind: "Website op maat", from: "vanaf", segs: [
        { name: "Starter", price: 999, sub: "Website Basic", f: "Voor freelancers, lokale zaken en starters die een professionele website nodig hebben.", incl: ["Website op maat, tot 3 pagina's", "Perfect op gsm, tablet en laptop", "Contactformulier en social media", "Live in 10 tot 14 dagen"] },
        { name: "Groei", price: 1249, sub: "Website Premium", f: "Voor bedrijven die bezoekers willen overtuigen en klanten willen winnen.", incl: ["Alles uit Starter", "Tot 5 pagina's, blog of nieuws", "Boekings- of offertesysteem", "Nieuwsbrief-integratie"] } ] },
      shop: { kind: "Webshop", from: "vanaf", segs: [ { price: 1899, sub: "Verkoop", f: "Voor wie online verkoopt: kleding, voeding, beauty en alles wat in een doos past.", incl: ["Alles uit Groei", "Winkel-setup, tot 50 producten", "Betalen, winkelwagen en afrekenen", "Uitleg zodat u zelf beheert"] } ] },
      redesign: { kind: "Herontwerp", from: "vanaf", segs: [ { price: 999, sub: "Starter of Groei", f: "Voor wie al een website heeft die niet meer overtuigt. Zelfde inhoud, nieuwe indruk.", incl: ["U behoudt uw inhoud en domeinnaam", "Nieuw ontwerp op maat, geen sjabloon", "Sneller en perfect op gsm", "Prijs volgt het pakket: Starter of Groei"] } ] },
      landing: { kind: "Landingspagina", from: "", segs: [ { price: null, ptxt: "op maat", sub: "prijs na één gesprek", f: "Voor campagnes, lanceringen en acties met één duidelijk doel.", incl: ["Eén pagina, één doel", "Gebouwd voor conversie", "Gekoppeld aan uw campagne of advertenties", "Snel online"] } ] }
    },
    en: {
      site: { kind: "Bespoke website", from: "from", segs: [
        { name: "Starter", price: 999, sub: "Website Basic", f: "For freelancers, local businesses and starters who need a professional website.", incl: ["Bespoke website, up to 3 pages", "Perfect on phone, tablet and laptop", "Contact form and social media", "Live in 10 to 14 days"] },
        { name: "Growth", price: 1249, sub: "Website Premium", f: "For businesses that want to convince visitors and win customers.", incl: ["Everything in Starter", "Up to 5 pages, blog or news", "Booking or quote system", "Newsletter integration"] } ] },
      shop: { kind: "Webshop", from: "from", segs: [ { price: 1899, sub: "Sales", f: "For anyone selling online: fashion, food, beauty and anything that fits in a box.", incl: ["Everything in Growth", "Shop setup, up to 50 products", "Payments, cart and checkout", "Guidance so you manage it yourself"] } ] },
      redesign: { kind: "Redesign", from: "from", segs: [ { price: 999, sub: "Starter or Growth", f: "For anyone with a website that no longer convinces. Same content, new impression.", incl: ["You keep your content and domain", "New bespoke design, no template", "Faster and perfect on mobile", "Price follows the package: Starter or Growth"] } ] },
      landing: { kind: "Landing page", from: "", segs: [ { price: null, ptxt: "tailored", sub: "price after one conversation", f: "For campaigns, launches and promotions with one clear goal.", incl: ["One page, one goal", "Built to convert", "Linked to your campaign or ads", "Online fast"] } ] }
    },
    fr: {
      site: { kind: "Site sur mesure", from: "à partir de", segs: [
        { name: "Starter", price: 999, sub: "Website Basic", f: "Pour indépendants, commerces locaux et starters qui ont besoin d'un site professionnel.", incl: ["Site sur mesure, jusqu'à 3 pages", "Parfait sur mobile, tablette et ordinateur", "Formulaire de contact et réseaux sociaux", "En ligne en 10 à 14 jours"] },
        { name: "Croissance", price: 1249, sub: "Website Premium", f: "Pour les entreprises qui veulent convaincre et gagner des clients.", incl: ["Tout de Starter", "Jusqu'à 5 pages, blog ou actualités", "Système de réservation ou de devis", "Intégration newsletter"] } ] },
      shop: { kind: "Boutique en ligne", from: "à partir de", segs: [ { price: 1899, sub: "Vente", f: "Pour qui vend en ligne : mode, alimentation, beauté et tout ce qui tient dans une boîte.", incl: ["Tout de Croissance", "Boutique, jusqu'à 50 produits", "Paiement, panier et commande", "Explications pour gérer vous-même"] } ] },
      redesign: { kind: "Refonte", from: "à partir de", segs: [ { price: 999, sub: "Starter ou Croissance", f: "Pour qui a déjà un site qui ne convainc plus. Même contenu, nouvelle impression.", incl: ["Vous gardez votre contenu et votre domaine", "Nouveau design sur mesure, sans modèle", "Plus rapide et parfait sur mobile", "Le prix suit la formule : Starter ou Croissance"] } ] },
      landing: { kind: "Landing page", from: "", segs: [ { price: null, ptxt: "sur mesure", sub: "prix après un entretien", f: "Pour les campagnes, lancements et actions avec un objectif clair.", incl: ["Une page, un objectif", "Conçue pour convertir", "Reliée à votre campagne ou vos annonces", "En ligne rapidement"] } ] }
    }
  };
  var ORDER_O = ["site", "shop", "redesign", "landing"], curO = "site", curSeg = 0, shownPrice = 999;
  function fmtPrice(n) { return "€" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function renderOffer(animate) {
    var panel = $("#offerPanel"); if (!panel) return;
    var data = (OFFER[lang] || OFFER.nl)[curO], seg = data.segs[Math.min(curSeg, data.segs.length - 1)];
    var segEl = $("#opSeg"), price = $("#opPrice"), incl = $("#opIncl");
    panel.setAttribute("data-o", curO);
    $("#opGhost").textContent = "0" + (ORDER_O.indexOf(curO) + 1);
    var apply = function () {
      $("#opKind").textContent = data.kind;
      $("#opFrom").textContent = data.from; $("#opFrom").hidden = !data.from;
      $("#opSub").textContent = seg.sub;
      $("#opFor").textContent = seg.f;
      if (data.segs.length > 1) { segEl.hidden = false; $$("button", segEl).forEach(function (b, i) { b.textContent = data.segs[i].name; b.classList.toggle("is-on", i === curSeg); b.setAttribute("aria-selected", i === curSeg ? "true" : "false"); }); segEl.setAttribute("data-seg", curSeg); } else segEl.hidden = true;
      incl.innerHTML = seg.incl.map(function (s) { return "<li>" + s + "</li>"; }).join("");
      if (seg.price == null) { price.textContent = seg.ptxt; price.style.fontStyle = "italic"; }
      else { price.style.fontStyle = ""; if (animate && !REDUCED) { var o = { v: shownPrice }; gsap.to(o, { v: seg.price, duration: 0.9, ease: "power3.out", onUpdate: function () { price.textContent = fmtPrice(o.v); } }); } else price.textContent = fmtPrice(seg.price); shownPrice = seg.price; }
      if (animate && !REDUCED) gsap.fromTo($$("#opIncl li, #opFor, #opKind, #opSub", panel), { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: "power3.out" });
    };
    if (animate && !REDUCED) gsap.to($$(".opanel > *:not(.opanel__ghost):not(.btn)", panel), { opacity: 0, y: -8, duration: 0.22, stagger: 0.02, ease: "power2.in", onComplete: function () { apply(); gsap.set($$(".opanel > *", panel), { clearProps: "opacity,transform" }); } });
    else apply();
  }
  function placePanel() {
    var panel = $("#offerPanel"), side = $("#offerSide"); if (!panel) return;
    if (window.matchMedia("(max-width: 979px)").matches) { var slot = $('.orow[data-o="' + curO + '"] .orow__slot'); if (slot && panel.parentNode !== slot) slot.appendChild(panel); }
    else if (panel.parentNode !== side) side.appendChild(panel);
  }
  function selectO(o, animate) {
    if (o === curO && animate) return;
    curO = o; curSeg = 0;
    $$("#offerList .orow").forEach(function (r) { var on = r.getAttribute("data-o") === o; r.classList.toggle("is-on", on); $(".orow__btn", r).setAttribute("aria-expanded", on ? "true" : "false"); });
    placePanel(); renderOffer(animate);
    setTimeout(function () { ScrollTrigger.refresh(); }, 650);
  }
  function initOffer() {
    var list = $("#offerList"); if (!list) return;
    renderOffer(false); placePanel();
    list.addEventListener("click", function (e) { var r = e.target.closest(".orow"); if (r && !e.target.closest(".opanel")) selectO(r.getAttribute("data-o"), true); });
    if (FINE) $$("#offerList .orow").forEach(function (r) { r.addEventListener("mouseenter", function () { if (window.matchMedia("(min-width: 980px)").matches) selectO(r.getAttribute("data-o"), true); }); });
    $("#opSeg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; var s = parseInt(b.getAttribute("data-seg"), 10); if (s === curSeg) return; curSeg = s; renderOffer(true); });
    window.addEventListener("resize", placePanel);
    window.__offerRefresh = function () { renderOffer(false); };
    if (!REDUCED) {
      $$("#offerList .orow").forEach(function (el, i) { gsap.from(el, { opacity: 0, x: -24, duration: 0.9, delay: i * 0.08, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } }); });
      gsap.from("#offerPanel", { opacity: 0, y: 60, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: "#diensten", start: "top 65%", once: true } });
    }
  }

  /* ---------------- numbers ---------------- */
  function initNums() {
    $$("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count")), o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: function () {
        if (REDUCED) { el.textContent = target; return; }
        gsap.to(o, { v: target, duration: 1.6, ease: "power3.out", onUpdate: function () { el.textContent = Math.round(o.v); } });
      } });
    });
  }

  /* ---------------- process: sticky number ---------------- */
  function initProcess() {
    var big = $("#procBig"), steps = $$(".pstep"); if (!big) return;
    steps.forEach(function (s, i) {
      ScrollTrigger.create({ trigger: s, start: "top 55%", end: "bottom 55%",
        onToggle: function (st) { if (st.isActive) { big.textContent = "0" + (i + 1); steps.forEach(function (o, k) { o.classList.toggle("is-on", k === i); }); } } });
    });
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
    $$(".eyebrow, .h-xl, .h-l, .h-m, .lead, .tier, .num, .about__text > p, .sig, .portret, .contact__copy > p, .form, .ba-sec__copy > *").forEach(function (el) {
      if (el.closest(".hero")) return;
      gsap.from(el, { opacity: 0, y: 24, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    gsap.from(".footer__big", { yPercent: 40, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".footer", start: "top 90%", once: true } });
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
      nav_work: "Work", nav_services: "Services &amp; pricing", nav_process: "Process", nav_pricing: "Free design", nav_contact: "Contact",
      hero_eyebrow: "Web design studio · Belgium & the Netherlands", h1_a: "Websites that", h1_b: "make an <em class=\"it\">impression.</em>",
      hero_lead: "Designed and built to measure. You see your homepage within 24 hours, free, and pay no deposit.",
      cta_design: "Request your free design", cta_work: "See our work", scroll: "Scroll", hero_tip: "Click a website to see it up close", hero_tr: "Bespoke websites · since 2024", gl_go: "Show in the gallery", gl_live: "View live", gl_close: "Close",
      mq1: "Business websites", mq2: "Webshops", mq3: "Redesigns", mq4: "Landing pages",
      statement: "Your website is the first handshake with a new customer. We make sure it is a firm one: <em class=\"it\">fast, beautiful and built to win enquiries.</em> You see your design before you decide, and you pay only when you are happy.",
      cta_how: "How we work", st_note: "No deposit · live in 2 weeks · one point of contact",
      work_eyebrow: "Selected work", work_title: "Our work", w_live: "View live", w_design: "View the design",
      w1_s: "Physio & performance · live", w1_m: "From Wix template to a bespoke site: black and white, direct, three languages and online booking.",
      w2_s: "B2B wholesale · redesign", w2_m: "Wholesaler of fresh carrots from Haspengouw. Proposal for a new homepage: product first, own fields and family in view, a quote within 24 hours.",
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
      p1_k: "Step 01", p1_t: "Conversation", p1_p: "Half an hour about your business, your customers and what the website must do. By phone or on site.",
      p2_b: "Free · within 24 hours", p2_k: "Step 02", p2_t: "Design", p2_p: "You see your homepage, designed to measure. No deposit, no obligation. You decide afterwards.",
      p3_k: "Step 03", p3_t: "Build", p3_p: "Ten to fourteen days, with you at the table at every step. Copy, imagery and tech under one roof.",
      p4_k: "Step 04", p4_t: "Live", p4_p: "Your website goes online, with guidance and support. Afterwards you stay with the same person.",
      pr_eyebrow: "Pricing", pr_title: "What it costs. <em class=\"it\">No small print.</em>", pr_lead: "Fixed starting prices, no small print. Every package starts with a free homepage design.", pr_from: "from", pr_cta: "Request your free design",
      t1_s: "Website Basic", t1_n: "Starter", t1_f: "Freelancers, local businesses and starters who need a professional website.", t1_1: "Bespoke website, up to 3 pages", t1_2: "Perfect on phone, tablet and laptop", t1_3: "Contact form and social media", t1_4: "Live in 10 to 14 days",
      t2_s: "Website Premium", t2_n: "Growth", t2_f: "Businesses that want to convince visitors and win customers.", t2_1: "Everything in Starter", t2_2: "Up to 5 pages, blog or news", t2_3: "Booking or quote system", t2_4: "Newsletter integration",
      t3_s: "Webshop", t3_n: "Sales", t3_f: "Anyone selling online: fashion, food, beauty and anything that fits in a box.", t3_1: "Everything in Growth", t3_2: "Shop setup, up to 50 products", t3_3: "Payments, cart and checkout", t3_4: "Guidance so you manage it yourself",
      pr_note: "Hosting, domain name and copywriting are not part of the package price; we arrange them on request via the quote. No deposit: you pay once the website is finished and you are happy.",
      ab_eyebrow: "Who is behind it", ab_title: "You talk to the person who <em class=\"it\">designs and builds</em> your website.",
      ab_p1: "Digital Impression is a small web design studio in Belgian Limburg, working in Belgium and the Netherlands. No account managers, no helpdesk: you talk to the person who designs and builds your website.",
      ab_p2: "We work for businesses, freelancers and organisations that want to make a strong impression online.",
      sig1: "No deposit.", sig2: "No templates.", sig3: "No promises about Google.", sig4: "One point of contact.", ab_role: "Founder",
      c_eyebrow: "Start your project", c_title: "Let's build something <em class=\"it\">that makes an impression.</em>", c_lead: "Tell us briefly about your business. Within 24 hours you receive a tailored quote plus a free design of your homepage.", region: "Belgium & the Netherlands",
      f_naam: "Name", f_naam_ph: "Your name", f_email: "Email", f_email_ph: "you@company.com", f_site: "Current website (optional)", f_site_ph: "www.yourcompany.com", f_msg: "Your project", f_msg_ph: "How can we help? Tell us briefly about your business.",
      f_fine: "By sending you agree to a no-obligation contact. No deposit, no commitment.", f_ok_t: "Thank you. We get to work.", f_ok_p: "You will hear from us within 24 hours, with a tailored quote and a first design of your homepage.", f_again: "Send another request",
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
      ct_eyebrow: "Free homepage design · within 24 hours",
      ct_title: "Type one sentence. <em class=\"it\">See your homepage.</em>",
      ct_lead: "Tell us what your business does. The screen next to it changes as you type: colour, type, mood. We really make such a first design for you, free and without a deposit. You decide afterwards.",
      ct_lbl: "Your business in one sentence", ct_ph: "For example: physiotherapist in Diepenbeek for athletes",
      ct_c1: "Physio", ct_c2: "Bakery", ct_c3: "Lawyer", ct_c4: "Gardening", ct_c5: "Musician", ct_c6: "Webshop",
      ct_btn: "Design my real homepage", ct_fine: "Free · in your inbox within 24 hours · no deposit, no obligation", ct_badge: "free design",
      of_eyebrow: "Services &amp; pricing", of_title: "What we build, <em class=\"it\">and what it costs.</em>",
      of_lead: "Fixed starting prices, no small print. Pick a service and the details appear next to it. Every project starts with a free homepage design.",
      o1_t: "Business website", o1_s: "Build trust and win enquiries.", o2_t: "Webshop", o2_s: "Sell while you sleep, without checkout hassle.", o3_t: "Redesign", o3_s: "Same content, completely new impression. See Credo.", o4_t: "Landing page", o4_s: "One page, one goal, for campaigns and promotions.", o4_p: "tailored"
    },
    fr: {
      meta_title: "Digital Impression | Des sites web qui font impression", menu: "Menu", close: "Fermer",
      nav_work: "Réalisations", nav_services: "Services &amp; tarifs", nav_process: "Méthode", nav_pricing: "Design gratuit", nav_contact: "Contact",
      hero_eyebrow: "Studio de webdesign · Belgique & Pays-Bas", h1_a: "Des sites web", h1_b: "qui font <em class=\"it\">impression.</em>",
      hero_lead: "Conçus et construits sur mesure. Vous voyez votre page d'accueil sous 24 heures, gratuitement, sans acompte.",
      cta_design: "Demandez votre design gratuit", cta_work: "Voir nos réalisations", scroll: "Défiler", hero_tip: "Cliquez sur un site pour le voir de près", hero_tr: "Sites sur mesure · depuis 2024", gl_go: "Voir dans la galerie", gl_live: "Voir en ligne", gl_close: "Fermer",
      mq1: "Sites d'entreprise", mq2: "Boutiques en ligne", mq3: "Refontes", mq4: "Landing pages",
      statement: "Votre site web est la première poignée de main avec un nouveau client. Nous veillons à ce qu'elle soit ferme : <em class=\"it\">rapide, élégante et conçue pour générer des demandes.</em> Vous voyez votre design avant de décider, et vous ne payez que lorsque vous êtes satisfait.",
      cta_how: "Notre méthode", st_note: "Sans acompte · en ligne en 2 semaines · un seul interlocuteur",
      work_eyebrow: "Réalisations choisies", work_title: "Nos réalisations", w_live: "Voir en ligne", w_design: "Voir le design",
      w1_s: "Kiné & performance · en ligne", w1_m: "D'un modèle Wix à un site sur mesure : noir et blanc, direct, trois langues et réservation en ligne.",
      w2_s: "Commerce de gros B2B · refonte", w2_m: "Grossiste en carottes fraîches de Hesbaye. Proposition de nouvelle page d'accueil : le produit d'abord, les champs et la famille en image, un devis sous 24 heures.",
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
      p1_k: "Étape 01", p1_t: "Échange", p1_p: "Une demi-heure sur votre entreprise, vos clients et ce que le site doit faire. Par téléphone ou sur place.",
      p2_b: "Gratuit · sous 24 heures", p2_k: "Étape 02", p2_t: "Design", p2_p: "Vous voyez votre page d'accueil, conçue sur mesure. Sans acompte, sans engagement. Vous décidez ensuite.",
      p3_k: "Étape 03", p3_t: "Construction", p3_p: "Dix à quatorze jours, avec vous à chaque étape. Textes, images et technique sous un même toit.",
      p4_k: "Étape 04", p4_t: "En ligne", p4_p: "Votre site est mis en ligne, avec explications et support. Ensuite, vous restez avec la même personne.",
      pr_eyebrow: "Tarifs", pr_title: "Ce que ça coûte. <em class=\"it\">Sans petits caractères.</em>", pr_lead: "Des prix de départ fixes, pas de petits caractères. Chaque formule commence par un design de page d'accueil gratuit.", pr_from: "à partir de", pr_cta: "Demandez votre design gratuit",
      t1_s: "Website Basic", t1_n: "Starter", t1_f: "Indépendants, commerces locaux et starters qui ont besoin d'un site professionnel.", t1_1: "Site sur mesure, jusqu'à 3 pages", t1_2: "Parfait sur mobile, tablette et ordinateur", t1_3: "Formulaire de contact et réseaux sociaux", t1_4: "En ligne en 10 à 14 jours",
      t2_s: "Website Premium", t2_n: "Croissance", t2_f: "Entreprises qui veulent convaincre les visiteurs et gagner des clients.", t2_1: "Tout de Starter", t2_2: "Jusqu'à 5 pages, blog ou actualités", t2_3: "Système de réservation ou de devis", t2_4: "Intégration newsletter",
      t3_s: "Boutique en ligne", t3_n: "Vente", t3_f: "Qui vend en ligne : mode, alimentation, beauté et tout ce qui tient dans une boîte.", t3_1: "Tout de Croissance", t3_2: "Boutique, jusqu'à 50 produits", t3_3: "Paiement, panier et commande", t3_4: "Explications pour gérer vous-même",
      pr_note: "L'hébergement, le nom de domaine et la rédaction ne font pas partie du prix du forfait ; nous les organisons sur demande via le devis. Pas d'acompte : vous payez quand le site est terminé et que vous êtes satisfait.",
      ab_eyebrow: "Qui est derrière", ab_title: "Vous parlez à la personne qui <em class=\"it\">conçoit et construit</em> votre site.",
      ab_p1: "Digital Impression est un petit studio de webdesign dans le Limbourg belge, actif en Belgique et aux Pays-Bas. Pas de chargés de compte, pas de helpdesk : vous parlez à la personne qui conçoit et construit votre site.",
      ab_p2: "Nous travaillons pour des entreprises, indépendants et organisations qui veulent faire forte impression en ligne.",
      sig1: "Pas d'acompte.", sig2: "Pas de modèles.", sig3: "Pas de promesses sur Google.", sig4: "Un seul interlocuteur.", ab_role: "Fondateur",
      c_eyebrow: "Démarrez votre projet", c_title: "Construisons quelque chose <em class=\"it\">qui fait impression.</em>", c_lead: "Parlez-nous brièvement de votre entreprise. Sous 24 heures, vous recevez un devis sur mesure et un design gratuit de votre page d'accueil.", region: "Belgique & Pays-Bas",
      f_naam: "Nom", f_naam_ph: "Votre nom", f_email: "E-mail", f_email_ph: "vous@entreprise.be", f_site: "Site web actuel (facultatif)", f_site_ph: "www.votreentreprise.be", f_msg: "Votre projet", f_msg_ph: "Comment pouvons-nous vous aider ? Parlez-nous brièvement de votre entreprise.",
      f_fine: "En envoyant, vous acceptez une prise de contact sans engagement. Pas d'acompte, pas d'obligation.", f_ok_t: "Merci. Nous nous mettons au travail.", f_ok_p: "Vous aurez de nos nouvelles sous 24 heures, avec un devis sur mesure et un premier design de votre page d'accueil.", f_again: "Envoyer une autre demande",
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
      ct_eyebrow: "Design de page d'accueil gratuit · sous 24 heures",
      ct_title: "Tapez une phrase. <em class=\"it\">Voyez votre page d'accueil.</em>",
      ct_lead: "Dites ce que fait votre entreprise. L'écran à côté change pendant que vous tapez : couleur, typographie, ambiance. Nous réalisons vraiment ce premier design pour vous, gratuitement et sans acompte. Vous décidez ensuite.",
      ct_lbl: "Votre entreprise en une phrase", ct_ph: "Par exemple : kinésithérapeute à Diepenbeek pour sportifs",
      ct_c1: "Kiné", ct_c2: "Boulangerie", ct_c3: "Avocat", ct_c4: "Jardins", ct_c5: "Musicien", ct_c6: "Boutique",
      ct_btn: "Concevez ma vraie page d'accueil", ct_fine: "Gratuit · dans votre boîte mail sous 24 heures · sans acompte, sans engagement", ct_badge: "design gratuit",
      of_eyebrow: "Services &amp; tarifs", of_title: "Ce que nous créons, <em class=\"it\">et ce que ça coûte.</em>",
      of_lead: "Des prix de départ fixes, sans petits caractères. Choisissez un service, les détails apparaissent à côté. Chaque projet commence par un design de page d'accueil gratuit.",
      o1_t: "Site d'entreprise", o1_s: "Inspirer confiance et générer des demandes.", o2_t: "Boutique en ligne", o2_s: "Vendre pendant que vous dormez, sans tracas à la caisse.", o3_t: "Refonte", o3_s: "Même contenu, impression entièrement nouvelle. Voyez Credo.", o4_t: "Landing page", o4_s: "Une page, un objectif, pour campagnes et actions.", o4_p: "sur mesure"
    }
  };
  var NL = {};
  function initI18n() {
    $$("[data-i18n]").forEach(function (el) { var k = el.getAttribute("data-i18n"); if (!(k in NL)) NL[k] = el.innerHTML; });
    $$("[data-i18n-ph]").forEach(function (el) { var k = el.getAttribute("data-i18n-ph"); if (!(k in NL)) NL[k] = el.getAttribute("placeholder"); });
    NL.meta_title = document.title;
    $("#lang").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) applyLang(b.getAttribute("data-lang")); });
    var saved = null; try { saved = localStorage.getItem("di_lang"); } catch (e) {}
    if (saved && saved !== "nl" && I18N[saved]) applyLang(saved, true);
  }
  function applyLang(l, silent) {
    lang = l; var d = I18N[l];
    $$("[data-i18n]").forEach(function (el) { var k = el.getAttribute("data-i18n"); var v = d ? d[k] : NL[k]; if (v != null) el.innerHTML = v; });
    $$("[data-i18n-ph]").forEach(function (el) { var k = el.getAttribute("data-i18n-ph"); var v = d ? d[k] : NL[k]; if (v != null) el.setAttribute("placeholder", v); });
    document.title = (d && d.meta_title) || NL.meta_title; document.documentElement.lang = l;
    $$("#lang button").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-lang") === l); });
    // statement words were wrapped: rewrap
    var st = $("#statement"); if (st) { wrapWords(st); $$(".w", st).forEach(function (w) { w.classList.add("on"); }); }
    if (!silent) { $$(".hero .line-mask > span").forEach(function (s) { s.style.transform = "none"; }); }
    initIntro();
    if (window.__ctaRefresh) window.__ctaRefresh(); if (window.__offerRefresh) window.__offerRefresh();
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
    initI18n(); initLenis(); initMenu(); initCursor(); initTheme(); initGL(); initIntro(); initWork(); initLiveCTA(); initOffer(); initTilt(); initProcess(); initReveals(); initForm(); initPre();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
