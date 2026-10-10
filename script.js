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
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
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
    gsap.timeline({ onComplete: function () { pre.remove(); document.documentElement.classList.remove("lenis-stopped"); heroIn(); } })
      .to(o, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: function () { num.textContent = Math.round(o.v); } })
      .to(bar, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0)
      .to(pre, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "+=0.15");
  }
  function heroIn() {
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(".hero .line-mask > span", { y: 0, duration: 1.2, stagger: 0.12 }, 0)
      .from("#heroEyebrow", { opacity: 0, y: 10, duration: 0.8 }, 0.2)
      .from(["#heroLead", "#heroCta"], { opacity: 0, y: 16, duration: 1, stagger: 0.1 }, 0.6);
    if (REDUCED) tl.progress(1);
  }

  /* ---------------- WebGL hero: floating site cards ---------------- */
  function initGL() {
    var canvas = $("#gl"); if (!canvas || typeof THREE === "undefined") return;
    var hero = $("#hero");
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
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
      [-0.6, -1.3, -10], [2.6, 0.5, -11.5], [-2.4, 1.1, -13], [1.4, -1.0, -14.5], [-1.8, -0.2, -16], [3.0, -1.3, -17.5]
    ];
    var frameGeo = new THREE.PlaneGeometry(2.3, 1.475, 1, 1);
    seeded.forEach(function (p, i) {
      var site = SITES[i % SITES.length];
      var tex = loader.load("assets/img/" + site.src + ".jpg");
      tex.minFilter = THREE.LinearFilter; tex.center.set(0.5, 0.5);
      var geo = new THREE.PlaneGeometry(2.2, 1.375, 1, 1);
      var mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
      var m = new THREE.Mesh(geo, mat);
      m.position.set(p[0], p[1], p[2]);
      m.rotation.set(rnd(-0.12, 0.12), rnd(-0.35, 0.35), rnd(-0.06, 0.06));
      // gold frame behind the card, shown on hover / focus
      var frame = new THREE.Mesh(frameGeo, new THREE.MeshBasicMaterial({ color: 0xC9A24A, transparent: true, opacity: 0, side: THREE.DoubleSide }));
      frame.position.z = -0.01; m.add(frame);
      m.userData = { site: site, base: p.slice(), ph: rnd(0, Math.PI * 2), sp: rnd(0.4, 0.8), rx: m.rotation.x, ry: m.rotation.y, rz: m.rotation.z, frame: frame, tex: tex, hover: 0, s: 1 };
      group.add(m); cards.push(m);
    });
    var N = 260, pos = new Float32Array(N * 3);
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
      var hits = ray.intersectObjects(cards, false).filter(function (hh) { return hh.object.position.z < cam.position.z - 0.8 && (hh.object.material.opacity > 0.3); });
      var obj = hits.length ? hits[0].object : null;
      if (obj !== hovered) {
        hovered = obj;
        canvas.style.cursor = obj ? "pointer" : "";
        if (obj) canvas.setAttribute("data-cursor", lang === "en" ? "View" : lang === "fr" ? "Voir" : "Bekijk"); else canvas.removeAttribute("data-cursor");
        document.dispatchEvent(new CustomEvent("di:cursorcheck"));
      }
    }
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
    gsap.to([".hero__in", ".hero__tip", ".scrollcue"], { opacity: 0, y: -30, ease: "none", scrollTrigger: { trigger: "#stage", start: "top top", end: "+=55%", scrub: true } });
    var clock = new THREE.Clock(), visible = true, stageEl = $("#stage");
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(stageEl || hero);
    function tick() {
      requestAnimationFrame(tick);
      if (!visible && prog >= 1) return;
      var dt = Math.min(clock.getDelta(), 0.05), t = clock.getElapsedTime();
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      cam.position.z = 6 - prog * 12;
      cam.position.x = mx * 0.6; cam.position.y = -my * 0.4;
      cam.lookAt(mx * 0.3, -my * 0.2, cam.position.z - 6);
      if (FINE && !focused) pick();
      cards.forEach(function (c) {
        var u = c.userData;
        if (c === focused) { return; }
        // slow conveyor towards the viewer, wrapping to the back
        u.base[2] += dt * 0.55;
        if (u.base[2] > cam.position.z - 2.2) { u.base[2] -= 19; u.base[0] = rnd(-3.2, 3.2); u.base[1] = rnd(-1.5, 1.6); }
        c.position.z = u.base[2];
        c.position.y = u.base[1] + Math.sin(t * u.sp + u.ph) * 0.22;
        c.position.x = u.base[0] + Math.cos(t * u.sp * 0.7 + u.ph) * 0.14;
        c.rotation.y = u.ry + Math.sin(t * 0.3 + u.ph) * 0.12 + mx * 0.12;
        c.rotation.x = Math.sin(t * 0.25 + u.ph) * 0.07 - my * 0.07;
        c.rotation.z = u.rz + Math.sin(t * 0.2 + u.ph) * 0.03;
        var want = (c === hovered && !focused) ? 1 : 0;
        u.hover += (want - u.hover) * 0.12;
        var sc = 1 + u.hover * 0.08; c.scale.set(sc, sc, 1);
        u.frame.material.opacity = u.hover * 0.7;
        if (!focused) c.material.opacity = 0.92 + u.hover * 0.08;
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
    var x = -100, y = -100, rx = -100, ry = -100, pts = [], ctx = null, iw = 0, ih = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), visible = false;
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
      var inter = t && t.closest && t.closest("a, button, .svc__row, [role='slider']");
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
  function initIntro() {
    var sec = $(".intro"); if (!sec) return;
    var l1 = $("#il1"), l2 = $("#il2"), u1 = $("#usp1"), u2 = $("#usp2"), u3 = $("#usp3");
    var m1 = $$(".line-mask > span", l1), m2 = $$(".line-mask > span", l2);
    gsap.set([l1, l2, u1, u2, u3], { autoAlpha: 0 });
    if (REDUCED) { gsap.set([l1], { autoAlpha: 1 }); gsap.set(m1, { y: 0 }); return; }
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.7 } });
    tl.to(l1, { autoAlpha: 1, duration: 4 }, 0)
      .fromTo(m1, { yPercent: 110 }, { yPercent: 0, duration: 8, stagger: 1.5, ease: "power3.out" }, 0)
      .to(l1, { autoAlpha: 0, y: -40, duration: 6, ease: "power2.in" }, 20)
      .to(l2, { autoAlpha: 1, duration: 4 }, 24)
      .fromTo(m2, { yPercent: 110 }, { yPercent: 0, duration: 8, stagger: 1.5, ease: "power3.out" }, 24)
      .to(l2, { autoAlpha: 0, y: -40, duration: 6, ease: "power2.in" }, 44);
    [[u1, 50], [u2, 68], [u3, 86]].forEach(function (pair, i) {
      var el = pair[0], at = pair[1], last = i === 2;
      tl.fromTo(el, { autoAlpha: 0, scale: 0.86, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 8, ease: "power3.out" }, at);
      if (!last) tl.to(el, { autoAlpha: 0, scale: 1.08, y: -40, duration: 6, ease: "power2.in" }, at + 13);
    });
    tl.to({}, { duration: 6 }, 100);
  }

  /* ---------------- sketch CTA ---------------- */
  function initSketch() {
    var sec = $("#ontwerp"); if (!sec) return;
    var paths = $$(".sk", sec), stamp = $(".sk-stamp", sec), pen = $("#sketchPen");
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 70%", end: "center 40%", scrub: 0.8 } });
    paths.forEach(function (p, i) { tl.to(p, { strokeDashoffset: 0, duration: 1, ease: "none" }, i * 0.55); });
    tl.fromTo(stamp, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%", rotation: -12 }, { opacity: 1, scale: 1, rotation: -8, duration: 1.2, ease: "back.out(2)" }, paths.length * 0.55);
    if (pen) { tl.to(pen, { opacity: 1, duration: 0.3 }, 0); tl.to(pen, { motionPath: undefined, opacity: 0, duration: 0.5 }, paths.length * 0.55); }
    var btn = $("#sketchBtn"), inp = $("#sketchInput");
    if (btn) btn.addEventListener("click", function () {
      var v = (inp.value || "").trim(), ber = $("#bericht");
      if (ber && v) ber.value = (lang === "en" ? "My business: " : lang === "fr" ? "Mon activité : " : "Mijn zaak: ") + v + "\n";
      var c = $("#contact"); if (lenis) lenis.scrollTo(c, { duration: 1.4 }); else c.scrollIntoView({ behavior: "smooth" });
      setTimeout(function () { var n = $("#naam"); if (n) n.focus({ preventScroll: true }); }, 1500);
    });
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
        var dist = function () { return track.scrollWidth - window.innerWidth; };
        var tween = gsap.to(track, { x: function () { return -dist(); }, ease: "none",
          scrollTrigger: { id: "workST", trigger: pin, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
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

  /* ---------------- services: accordion + cursor image ---------------- */
  function initServices() {
    var imgWrap = $("#svcImg");
    $$("#svcList, #planList").forEach(function (list) { initAccordion(list, imgWrap); });
  }
  function initAccordion(list, imgWrap) {
    $$(".svc__item", list).forEach(function (it) {
      var row = $(".svc__row", it);
      row.addEventListener("click", function () {
        var open = it.classList.toggle("is-open"); row.setAttribute("aria-expanded", open ? "true" : "false");
        $$(".svc__item", list).forEach(function (o) { if (o !== it) { o.classList.remove("is-open"); $(".svc__row", o).setAttribute("aria-expanded", "false"); } });
        setTimeout(function () { ScrollTrigger.refresh(); }, 650);
      });
      if (FINE && imgWrap) {
        it.addEventListener("mouseenter", function () { var k = it.getAttribute("data-img"); if (!k) return; $$("img", imgWrap).forEach(function (im) { im.classList.toggle("is-on", im.getAttribute("data-k") === k); }); imgWrap.classList.add("is-on"); });
        it.addEventListener("mouseleave", function () { imgWrap.classList.remove("is-on"); });
      }
    });
    if (FINE && imgWrap && list.id === "svcList") {
      var qx = gsap.quickTo(imgWrap, "left", { duration: 0.6, ease: "power3" }), qy = gsap.quickTo(imgWrap, "top", { duration: 0.6, ease: "power3" });
      list.addEventListener("mousemove", function (e) { qx(e.clientX + 40); qy(e.clientY); });
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
    $$(".svc__item").forEach(function (el, i) { gsap.from(el, { opacity: 0, x: -20, duration: 0.8, delay: i * 0.05, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } }); });
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
      nav_work: "Work", nav_services: "Services", nav_process: "Process", nav_pricing: "Pricing", nav_contact: "Contact",
      hero_eyebrow: "Web design studio · Belgium & the Netherlands", h1_a: "Websites that", h1_b: "make an <em class=\"it\">impression.</em>",
      hero_lead: "Designed and built to measure. You see your homepage within 24 hours, free, and pay no deposit.",
      cta_design: "Request your free design", cta_work: "See our work", scroll: "Scroll", hero_tip: "Click a website to see it up close", gl_go: "Show in the gallery", gl_live: "View live", gl_close: "Close",
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
      usp1s: "You pay once your website is finished and you are happy with it.",
      usp2: "Live in 2 weeks",
      usp2s: "From first conversation to online, for most projects.",
      usp3: "One point of contact",
      usp3s: "You talk to the person who designs and builds your website.",
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
      sk_eyebrow: "Free homepage design",
      sk_title: "Your homepage, <em class=\"it\">drawn within 24 hours.</em>",
      sk_lead: "Tell us in one sentence what your business does. We draw your homepage, free and without a deposit. Only when you like it do we build on.",
      sk_ph: "For example: physiotherapist in Diepenbeek, specialised in athletes",
      sk_btn: "Draw my homepage",
      sk_fine: "In your inbox within 24 hours · no obligation · you decide afterwards"
    },
    fr: {
      meta_title: "Digital Impression | Des sites web qui font impression", menu: "Menu", close: "Fermer",
      nav_work: "Réalisations", nav_services: "Services", nav_process: "Méthode", nav_pricing: "Tarifs", nav_contact: "Contact",
      hero_eyebrow: "Studio de webdesign · Belgique & Pays-Bas", h1_a: "Des sites web", h1_b: "qui font <em class=\"it\">impression.</em>",
      hero_lead: "Conçus et construits sur mesure. Vous voyez votre page d'accueil sous 24 heures, gratuitement, sans acompte.",
      cta_design: "Demandez votre design gratuit", cta_work: "Voir nos réalisations", scroll: "Défiler", hero_tip: "Cliquez sur un site pour le voir de près", gl_go: "Voir dans la galerie", gl_live: "Voir en ligne", gl_close: "Fermer",
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
      usp1s: "Vous payez quand votre site est terminé et que vous êtes satisfait.",
      usp2: "En ligne en 2 semaines",
      usp2s: "Du premier échange à la mise en ligne, pour la plupart des projets.",
      usp3: "Un seul interlocuteur",
      usp3s: "Vous parlez à la personne qui conçoit et construit votre site.",
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
      sk_eyebrow: "Design de page d'accueil gratuit",
      sk_title: "Votre page d'accueil, <em class=\"it\">dessinée sous 24 heures.</em>",
      sk_lead: "Dites-nous en une phrase ce que fait votre entreprise. Nous dessinons votre page d'accueil, gratuitement et sans acompte. Nous ne construisons la suite que si elle vous plaît.",
      sk_ph: "Par exemple : kinésithérapeute à Diepenbeek, spécialisé en sportifs",
      sk_btn: "Dessinez ma page d'accueil",
      sk_fine: "Dans votre boîte mail sous 24 heures · sans engagement · vous décidez ensuite"
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
    try { localStorage.setItem("di_lang", l); } catch (e) {}
    ScrollTrigger.refresh();
  }

  /* ---------------- init ---------------- */
  function init() {
    initI18n(); initLenis(); initMenu(); initCursor(); initTheme(); initGL(); initIntro(); initWork(); initServices(); initSketch(); initProcess(); initReveals(); initForm(); initPre();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
