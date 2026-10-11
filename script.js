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
    tl.fromTo(".hero .hw", { yPercent: 110, rotateX: -35, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.6, stagger: 0.11, ease: "power4.out", clearProps: "opacity" }, 0)
      .add(function () { hero.classList.add("is-drawn"); }, 1.0)
      .add(function () { hero.classList.add("is-loaded-ui"); }, 1.2);
    if (REDUCED) { tl.progress(1); hero.classList.add("is-drawn", "is-loaded-ui"); }
    if (window.__heroShowEnter) window.__heroShowEnter(); else { showOn = true; showArm(); }
  }

  /* ---------------- hero: one big screen, slow rotation ---------------- */
  var KINDS = {
    k_credo: { nl: "Kinesitherapie · live", en: "Physio · live", fr: "Kiné · en ligne" },
    k_simonta: { nl: "Groothandel · herontwerp", en: "Wholesale · redesign", fr: "Commerce de gros · refonte" },
    k_mergel: { nl: "Toerisme · herontwerp", en: "Tourism · redesign", fr: "Tourisme · refonte" },
    k_fleet: { nl: "Software · concept", en: "Software · concept", fr: "Logiciel · concept" },
    k_noor: { nl: "Architectuur · concept", en: "Architecture · concept", fr: "Architecture · concept" }
  };
  var showIdx = 0, showTimer = null, showOn = false, showPaused = false, showBarTween = null;
  function showFill(i, animate) {
    var imgs = $$(".show__img"), img = imgs[i], show = $("#heroShow");
    var apply = function () {
      imgs.forEach(function (im, k) { im.classList.toggle("is-on", k === i); });
      $("#showIdx").textContent = "0" + (i + 1) + " / 0" + imgs.length;
      $("#showName").innerHTML = img.getAttribute("data-name");
      var kk = KINDS[img.getAttribute("data-kind")]; $("#showKind").textContent = kk ? (kk[lang] || kk.nl) : "";
      $("#showUrl").textContent = img.getAttribute("data-url");
    };
    if (!animate || REDUCED) { apply(); return; }
    show.classList.add("is-switching");
    setTimeout(function () { apply(); show.classList.remove("is-switching"); }, 320);
  }
  function showArm() {
    if (showTimer) { clearTimeout(showTimer); showTimer = null; }
    if (showBarTween) showBarTween.kill();
    var bar = $("#showBar"); if (!bar) return;
    if (REDUCED) return;
    showBarTween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 6, ease: "none", paused: !showOn || showPaused });
    showTimer = setTimeout(function () { if (showOn && !showPaused) { showIdx = (showIdx + 1) % $$(".show__img").length; showFill(showIdx, true); } showArm(); }, 6000);
  }
  function initHero() {
    var hero = $("#hero"), show = $("#heroShow"); if (!hero || !show) return;
    $$(".show__meta > *").forEach(function (el) { el.classList.add("t"); });
    showFill(0, false);
    var open = function () { var img = $$(".show__img")[showIdx]; if (window.__gotoWork) window.__gotoWork(parseInt(img.getAttribute("data-panel"), 10)); };
    $("#showFrame").addEventListener("click", open); $("#showMeta").addEventListener("click", open);
    $("#showFrame").setAttribute("data-cursor", lang === "en" ? "View" : lang === "fr" ? "Voir" : "Bekijk");
    if (FINE) { show.addEventListener("mouseenter", function () { showPaused = true; if (showBarTween) showBarTween.pause(); }); show.addEventListener("mouseleave", function () { showPaused = false; if (showBarTween) showBarTween.play(); }); }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { showOn = en[0].isIntersecting; if (showBarTween) { if (showOn && !showPaused) showBarTween.play(); else showBarTween.pause(); } }, { threshold: 0.25 }).observe(hero); else showOn = true;
    if (FINE && !REDUCED) window.addEventListener("mousemove", function (e) { var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5; hero.style.setProperty("--px", (x * -14) + "px"); hero.style.setProperty("--py", (y * -10) + "px"); }, { passive: true });
    if (REDUCED) return;
    // scroll: the title drifts up and fades, the screen comes a touch closer
    gsap.to(".hero__h1", { y: -70, opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "+=60%", scrub: true } });
    gsap.fromTo(show, { yPercent: 0, scale: 1 }, { yPercent: -6, scale: 1.025, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    window.__heroShowEnter = function () {
      gsap.fromTo(show, { y: 140, opacity: 0, rotateX: 10, transformPerspective: 1600 }, { y: 0, opacity: 1, rotateX: 0, duration: 1.8, ease: "power4.out", delay: 0.35, clearProps: "transform,opacity", onComplete: function () { showOn = true; showArm(); } });
    };
    window.__heroRefresh = function () { showFill(showIdx, false); };
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
    var sec = $(".intro"); if (!sec) return;
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
    $$(".eyebrow, .h-xl, .h-l, .h-m, .lead, .sig, .portret, .contact__copy > p, .form, .cta__actions, .proc__steps").forEach(function (el) {
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
      hero_eyebrow: "Web design studio · Belgium & the Netherlands", h1_a: "<span class=\"hw\">Websites</span> <span class=\"hw\">that</span>", h1_b: "<span class=\"hw\">make</span> <span class=\"hw\">an</span> <span class=\"hw\"><em class=\"it kw\">impression.</em></span>",
      hero_lead: "Designed and built to measure. You see your homepage within 24 hours, free, and pay no deposit.",
      cta_design: "Request your free design", cta_work: "See our work", scroll: "Scroll", show_open: "View in the gallery", hero_tip: "Click a website to see it up close", hero_tr: "Bespoke websites · since 2024", gl_go: "Show in the gallery", gl_live: "View live", gl_close: "Close",
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
      ct_eyebrow: "Free homepage design", ct_title: "Curious what your homepage <em class=\"it\">could look like?</em>",
      ct_lead: "Tell us briefly about your business. Within 24 hours you receive a first design of your homepage. Free, no deposit, no obligation.", ct_link: "See services and pricing",
      of_eyebrow: "Services &amp; pricing", of_title: "What we build, <em class=\"it\">and what it costs.</em>",
      of_lead: "Fixed starting prices, no small print. Pick a service and the details appear next to it. Every project starts with a free homepage design.",
      o1_t: "Business website", o1_s: "Build trust and win enquiries.", o2_t: "Webshop", o2_s: "Sell while you sleep, without checkout hassle.", o3_t: "Redesign", o3_s: "Same content, completely new impression. See Credo.", o4_t: "Landing page", o4_s: "One page, one goal, for campaigns and promotions.", o4_p: "tailored"
    },
    fr: {
      meta_title: "Digital Impression | Des sites web qui font impression", menu: "Menu", close: "Fermer",
      nav_work: "Réalisations", nav_services: "Services &amp; tarifs", nav_process: "Méthode", nav_pricing: "Design gratuit", nav_contact: "Contact",
      hero_eyebrow: "Studio de webdesign · Belgique & Pays-Bas", h1_a: "<span class=\"hw\">Des</span> <span class=\"hw\">sites</span> <span class=\"hw\">web</span>", h1_b: "<span class=\"hw\">qui</span> <span class=\"hw\">font</span> <span class=\"hw\"><em class=\"it kw\">impression.</em></span>",
      hero_lead: "Conçus et construits sur mesure. Vous voyez votre page d'accueil sous 24 heures, gratuitement, sans acompte.",
      cta_design: "Demandez votre design gratuit", cta_work: "Voir nos réalisations", scroll: "Défiler", show_open: "Voir dans la galerie", hero_tip: "Cliquez sur un site pour le voir de près", hero_tr: "Sites sur mesure · depuis 2024", gl_go: "Voir dans la galerie", gl_live: "Voir en ligne", gl_close: "Fermer",
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
      ct_eyebrow: "Design de page d'accueil gratuit", ct_title: "Curieux de voir à quoi votre page d'accueil <em class=\"it\">pourrait ressembler ?</em>",
      ct_lead: "Parlez-nous brièvement de votre entreprise. Sous 24 heures, vous recevez un premier design de votre page d'accueil. Gratuit, sans acompte, sans engagement.", ct_link: "Voir services et tarifs",
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
    if (!silent) { $$(".hero .hw").forEach(function (s) { s.style.transform = "none"; s.style.opacity = "1"; }); }
    initIntro(); if (window.__heroRefresh) window.__heroRefresh();
    if (window.__offerRefresh) window.__offerRefresh();
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
    initI18n(); initLenis(); initMenu(); initCursor(); initTheme(); initHero(); initIntro(); initWork(); initOffer(); initTilt(); initProcess(); initReveals(); initForm(); initPre();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
