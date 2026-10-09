/* Digital Impression v2 · "Karakter" */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var FORM_ENDPOINT = "https://formspree.io/f/xlgqkgbd";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var lang = "nl";

  /* =====================================================================
     1 · De kiezer: six characters, one demo site
     ===================================================================== */
  var K = {
    tuinman: {
      nl: { logo: "Tuinen Mertens", l: ["Tuinen", "Projecten", "Contact"], cta: "Offerte", kick: "Tuinaanleg & onderhoud", h: "Een tuin die met u meegroeit.", p: "Ontwerp, aanleg en onderhoud door mensen die weten wat er in uw grond groeit.", btn: "Vraag een tuinplan", s: ["Ontwerp", "Aanleg", "Onderhoud"] },
      en: { logo: "Mertens Gardens", l: ["Gardens", "Projects", "Contact"], cta: "Quote", kick: "Garden design & care", h: "A garden that grows with you.", p: "Design, planting and care by people who know what grows in your soil.", btn: "Request a garden plan", s: ["Design", "Planting", "Care"] },
      fr: { logo: "Jardins Mertens", l: ["Jardins", "Projets", "Contact"], cta: "Devis", kick: "Aménagement & entretien", h: "Un jardin qui grandit avec vous.", p: "Conception, aménagement et entretien par des gens qui savent ce qui pousse dans votre sol.", btn: "Demander un plan", s: ["Conception", "Aménagement", "Entretien"] }
    },
    kinesist: {
      nl: { logo: "Kine Noord", l: ["Revalidatie", "Performance", "Team"], cta: "Boek", kick: "Revalidatie & performance", h: "Sterker terug.", p: "Van blessure tot wedstrijd. Begeleiding op maat, geen standaardschema's.", btn: "Boek een afspraak", s: ["Manuele therapie", "Dry needling", "Krachttraining"] },
      en: { logo: "Kine Noord", l: ["Rehab", "Performance", "Team"], cta: "Book", kick: "Rehab & performance", h: "Come back stronger.", p: "From injury to match day. Tailored guidance, no standard schemes.", btn: "Book a session", s: ["Manual therapy", "Dry needling", "Strength"] },
      fr: { logo: "Kine Noord", l: ["Rééducation", "Performance", "Équipe"], cta: "Réserver", kick: "Rééducation & performance", h: "Revenir plus fort.", p: "De la blessure au match. Un suivi sur mesure, pas de schémas standard.", btn: "Prendre rendez-vous", s: ["Thérapie manuelle", "Dry needling", "Force"] }
    },
    bakker: {
      nl: { logo: "Bakkerij Lievens", l: ["Brood", "Patisserie", "Bestellen"], cta: "Bestel", kick: "Elke dag vers gebakken", h: "Elke ochtend om vijf uur.", p: "Zuurdesem, croissants en taarten zoals ze horen te zijn. Ambacht, geen fabriek.", btn: "Bestel voor morgen", s: ["Zuurdesem", "Croissants", "Taarten"] },
      en: { logo: "Lievens Bakery", l: ["Bread", "Pastry", "Order"], cta: "Order", kick: "Baked fresh every day", h: "Every morning at five.", p: "Sourdough, croissants and cakes the way they should be. Craft, not factory.", btn: "Order for tomorrow", s: ["Sourdough", "Croissants", "Cakes"] },
      fr: { logo: "Boulangerie Lievens", l: ["Pain", "Pâtisserie", "Commander"], cta: "Commander", kick: "Cuit chaque jour", h: "Chaque matin à cinq heures.", p: "Levain, croissants et gâteaux comme il se doit. De l'artisanat, pas d'usine.", btn: "Commander pour demain", s: ["Levain", "Croissants", "Gâteaux"] }
    },
    advocaat: {
      nl: { logo: "De Wit & Partners", l: ["Expertise", "Kantoor", "Contact"], cta: "Gesprek", kick: "Advocaten · ondernemingsrecht", h: "Helder advies. Geen kleine lettertjes.", p: "Juridische begeleiding voor ondernemers, in gewone mensentaal en met een vast tarief waar het kan.", btn: "Plan een gesprek", s: ["Contracten", "Geschillen", "Overnames"] },
      en: { logo: "De Wit & Partners", l: ["Expertise", "Firm", "Contact"], cta: "Talk", kick: "Lawyers · business law", h: "Clear advice. No small print.", p: "Legal guidance for businesses, in plain language and at a fixed fee where possible.", btn: "Book a consultation", s: ["Contracts", "Disputes", "Acquisitions"] },
      fr: { logo: "De Wit & Partners", l: ["Expertise", "Cabinet", "Contact"], cta: "Entretien", kick: "Avocats · droit des affaires", h: "Un conseil clair. Sans petits caractères.", p: "Un accompagnement juridique pour entrepreneurs, en langage clair et à tarif fixe quand c'est possible.", btn: "Planifier un entretien", s: ["Contrats", "Litiges", "Reprises"] }
    },
    zanger: {
      nl: { logo: "LENN", l: ["Agenda", "Muziek", "Boeken"], cta: "Boek Lenn", kick: "Zanger & entertainer", h: "Live. Overal.", p: "Van huwelijksfeest tot festivalweide. Nieuwe single nu overal te beluisteren.", btn: "Bekijk de agenda", s: ["Feesten", "Festivals", "Bedrijfsevents"] },
      en: { logo: "LENN", l: ["Dates", "Music", "Book"], cta: "Book Lenn", kick: "Singer & entertainer", h: "Live. Everywhere.", p: "From wedding party to festival field. New single out now on every platform.", btn: "See the dates", s: ["Parties", "Festivals", "Corporate"] },
      fr: { logo: "LENN", l: ["Agenda", "Musique", "Réserver"], cta: "Réserver", kick: "Chanteur & entertainer", h: "Live. Partout.", p: "Du mariage au festival. Nouveau single disponible partout.", btn: "Voir l'agenda", s: ["Fêtes", "Festivals", "Événements"] }
    },
    webshop: {
      nl: { logo: "Atelier Nova", l: ["Nieuw", "Collectie", "Winkelwagen"], cta: "Shop", kick: "Tijdloze basics, eerlijk gemaakt", h: "Nieuwe collectie.", p: "Jassen en truien die jaren meegaan. Gemaakt in Europa, geleverd binnen twee dagen.", btn: "Shop nu", s: ["Gratis verzending", "Retour binnen 30 dagen", "Veilig betalen"] },
      en: { logo: "Atelier Nova", l: ["New", "Collection", "Cart"], cta: "Shop", kick: "Timeless basics, honestly made", h: "New collection.", p: "Coats and knits that last for years. Made in Europe, delivered in two days.", btn: "Shop now", s: ["Free shipping", "30-day returns", "Secure payment"] },
      fr: { logo: "Atelier Nova", l: ["Nouveau", "Collection", "Panier"], cta: "Boutique", kick: "Des basiques intemporels, faits honnêtement", h: "Nouvelle collection.", p: "Des manteaux et des pulls qui durent des années. Fabriqués en Europe, livrés en deux jours.", btn: "Découvrir", s: ["Livraison offerte", "Retours 30 jours", "Paiement sécurisé"] }
    }
  };
  var ORDER = ["tuinman", "kinesist", "bakker", "advocaat", "zanger", "webshop"];
  var currentK = "tuinman", kTimer = null, kAuto = true;

  function fillDemo(k) {
    var d = K[k][lang] || K[k].nl;
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
    set("dLogo", d.logo); set("dL1", d.l[0]); set("dL2", d.l[1]); set("dL3", d.l[2]); set("dCta", d.cta);
    set("dKick", d.kick); set("dH", d.h); set("dP", d.p); set("dBtn", d.btn);
    set("dS1", d.s[0]); set("dS2", d.s[1]); set("dS3", d.s[2]);
  }
  function switchK(k, instant) {
    var demo = $("#demo"); if (!demo) return;
    currentK = k;
    $$(".kiezer__tab").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-k") === k); b.setAttribute("aria-selected", b.getAttribute("data-k") === k ? "true" : "false"); });
    $$(".demo__img img").forEach(function (im) { im.classList.toggle("is-on", im.getAttribute("data-k") === k); });
    if (instant || REDUCED) { demo.setAttribute("data-k", k); fillDemo(k); return; }
    demo.classList.add("is-switching");
    setTimeout(function () { demo.setAttribute("data-k", k); fillDemo(k); demo.classList.remove("is-switching"); }, 340);
  }
  function nextK() { var i = ORDER.indexOf(currentK); switchK(ORDER[(i + 1) % ORDER.length]); }
  function startAuto() { if (kTimer || REDUCED) return; kTimer = setInterval(function () { if (kAuto && !document.hidden) nextK(); }, 4500); }
  function initKiezer() {
    var tabs = $("#kiezerTabs"); if (!tabs) return;
    fillDemo(currentK);
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest(".kiezer__tab"); if (!b) return;
      kAuto = false; switchK(b.getAttribute("data-k"));
    });
    var hero = $("#proloog");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) startAuto(); else if (kTimer) { clearInterval(kTimer); kTimer = null; } }); }, { threshold: 0.2 }).observe(hero);
    } else startAuto();
  }

  /* =====================================================================
     2 · De pen: gold ink trail following the cursor
     ===================================================================== */
  function initPen() {
    var c = $("#pen"); if (!c || !FINE || REDUCED) return;
    document.documentElement.classList.add("has-pen");
    var ctx = c.getContext("2d"), pts = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mx = -100, my = -100, raf = null, hover = false, visible = false;
    function size() { w = window.innerWidth; h = window.innerHeight; c.width = w * dpr; c.height = h * dpr; c.style.width = w + "px"; c.style.height = h + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener("resize", size);
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY; visible = true;
      var t = e.target;
      hover = !!(t && t.closest && t.closest("a, button, [role='slider'], .kiezer__tab, .faq__q"));
      pts.push({ x: mx, y: my, t: performance.now() });
      if (pts.length > 40) pts.shift();
      if (!raf) raf = requestAnimationFrame(draw);
    }, { passive: true });
    window.addEventListener("mouseout", function (e) { if (!e.relatedTarget) visible = false; });
    document.addEventListener("mousedown", function () { pts.push({ x: mx, y: my, t: performance.now(), tap: true }); });
    function draw() {
      raf = null;
      ctx.clearRect(0, 0, w, h);
      var now = performance.now(), life = 650;
      pts = pts.filter(function (p) { return now - p.t < life; });
      if (pts.length > 1) {
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        for (var i = 1; i < pts.length; i++) {
          var a = pts[i - 1], b = pts[i], age = (now - b.t) / life, al = Math.max(0, 1 - age);
          ctx.strokeStyle = "rgba(201,162,74," + (al * 0.9) + ")";
          ctx.lineWidth = 1.2 + al * 1.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      if (visible) {
        var r = hover ? 7 : 4.5;
        ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fillStyle = "#C9A24A"; ctx.fill();
        if (hover) { ctx.beginPath(); ctx.arc(mx, my, 14, 0, Math.PI * 2); ctx.strokeStyle = "rgba(201,162,74,0.55)"; ctx.lineWidth = 1; ctx.stroke(); }
      }
      if (pts.length || visible) raf = requestAnimationFrame(draw);
    }
    draw();
  }

  /* =====================================================================
     3 · Reveal, theme switch, chapters, progress
     ===================================================================== */
  function initReveal() {
    var els = $$(".rv");
    if (!("IntersectionObserver" in window) || REDUCED) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } }); }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  function initChapters() {
    var secs = $$("[data-chapter]"), rail = $$("#rail a"), navLinks = $$(".nav a");
    var html = document.documentElement;
    function update() {
      var y = window.scrollY + window.innerHeight * 0.45, cur = secs[0], idx = 0;
      secs.forEach(function (s, i) { if (s.offsetTop <= y) { cur = s; idx = i; } });
      html.classList.toggle("is-light", cur.getAttribute("data-theme") === "light");
      rail.forEach(function (a, i) { a.classList.toggle("is-active", i === idx); a.classList.toggle("is-past", i < idx); });
      var id = cur.id;
      navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + id); });
      var doc = document.documentElement, p = window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight);
      $("#rail") && $("#rail").style.setProperty("--p", p.toFixed(4));
      $("#progressBar") && $("#progressBar").style.setProperty("--p", p.toFixed(4));
      $("#top").classList.toggle("is-scrolled", window.scrollY > 24);
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* =====================================================================
     4 · Het doorstrepen
     ===================================================================== */
  function initCliches() {
    var wrap = $("#cliches"); if (!wrap) return;
    var lines = $$(".cliche:not(.cliche--truth)", wrap);
    var run = function () {
      lines.forEach(function (l, i) { setTimeout(function () { l.classList.add("is-struck"); }, REDUCED ? 0 : 260 * i + 200); });
      setTimeout(function () { wrap.classList.add("is-done"); }, REDUCED ? 0 : 260 * lines.length + 350);
    };
    if (!("IntersectionObserver" in window)) { run(); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { run(); io.disconnect(); } }); }, { threshold: 0.35 });
    io.observe(wrap);
  }

  /* =====================================================================
     5 · De filmstrook (horizontal on vertical scroll)
     ===================================================================== */
  function initStrip() {
    var strip = $("#strip"), track = $("#stripTrack"), count = $("#stripCount"), sticky = $("#stripSticky");
    if (!strip || !track) return;
    var stories = $$(".story", track), n = stories.length;
    var mq = window.matchMedia("(min-width: 900px)");
    function update() {
      if (!mq.matches) { track.style.transform = ""; return; }
      var rect = strip.getBoundingClientRect(), total = strip.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
      var x = -p * (n - 1) * window.innerWidth;
      track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
      var i = Math.min(n - 1, Math.round(p * (n - 1)));
      stories.forEach(function (s, k) { s.classList.toggle("is-current", k === i); });
      if (count) count.textContent = (i + 1) + " / " + n;
      sticky.style.setProperty("--sp", p.toFixed(4));
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* =====================================================================
     6 · Werkwijze line, before/after, FAQ
     ===================================================================== */
  function initSteps() {
    var steps = $("#steps"); if (!steps) return;
    var items = $$(".step", steps);
    function update() {
      var r = steps.getBoundingClientRect(), line = window.innerHeight * 0.7;
      var horizontal = window.matchMedia("(min-width: 900px)").matches;
      var p = horizontal ? Math.max(0, Math.min(1, (line - r.top) / (window.innerHeight * 0.6))) : Math.max(0, Math.min(1, (line - r.top) / r.height));
      steps.style.setProperty("--sp", p.toFixed(3));
      items.forEach(function (it, i) { var ok = horizontal ? p >= (i + 0.5) / items.length : it.getBoundingClientRect().top < line; it.classList.toggle("is-past", ok); });
    }
    window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update); update();
  }

  function initBeforeAfter() {
    var root = $("#ba"), before = $("#baBefore"), handle = $("#baHandle"); if (!root) return;
    var dragging = false;
    function syncW() { before.firstElementChild.style.setProperty("--w", root.getBoundingClientRect().width + "px"); }
    syncW(); window.addEventListener("resize", syncW);
    function setPos(x) {
      var r = root.getBoundingClientRect(), pct = Math.max(3, Math.min(97, ((x - r.left) / r.width) * 100));
      before.style.width = pct + "%"; handle.style.left = pct + "%"; handle.setAttribute("aria-valuenow", Math.round(pct));
    }
    var start = function (e) { dragging = true; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    var move = function (e) { if (!dragging) return; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    var end = function () { dragging = false; };
    root.addEventListener("mousedown", start); root.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("mousemove", move); window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("mouseup", end); window.addEventListener("touchend", end);
    handle.addEventListener("keydown", function (e) {
      var v = parseFloat(handle.getAttribute("aria-valuenow")) || 50, r = root.getBoundingClientRect();
      if (e.key === "ArrowLeft") { setPos(r.left + r.width * (v - 5) / 100); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPos(r.left + r.width * (v + 5) / 100); e.preventDefault(); }
    });
  }

  function initFaq() {
    $$(".faq__item").forEach(function (it) {
      var q = $(".faq__q", it);
      q.addEventListener("click", function () {
        var open = it.classList.toggle("is-open"); q.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* =====================================================================
     7 · Header, drawer, hero load
     ===================================================================== */
  function initHeader() {
    var burger = $("#burger"), drawer = $("#drawer");
    if (burger) burger.addEventListener("click", function () {
      var open = drawer.classList.toggle("is-open"); burger.classList.toggle("is-open", open); burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("a", drawer).forEach(function (a) { a.addEventListener("click", function () { drawer.classList.remove("is-open"); burger.classList.remove("is-open"); document.body.style.overflow = ""; }); });
    setTimeout(function () { $("#proloog").classList.add("is-loaded"); }, 80);
  }

  /* =====================================================================
     8 · Formulier (Formspree)
     ===================================================================== */
  function initForm() {
    var btn = $("#submitBtn"), fields = $("#formFields"), ok = $("#formSuccess"), err = $("#formError"), reset = $("#resetBtn");
    if (!btn) return;
    var ids = ["zaak", "naam", "email", "website"];
    var msg = function (nl, en, fr) { return lang === "en" ? en : lang === "fr" ? fr : nl; };
    var showErr = function (m) { err.textContent = m; err.hidden = false; };
    btn.addEventListener("click", function () {
      var v = {}; ids.forEach(function (id) { v[id] = ($("#" + id).value || "").trim(); });
      if (!v.zaak || !v.naam || !v.email) { showErr(msg("Vul a.u.b. uw zaak, uw naam en uw e-mailadres in.", "Please fill in your business, your name and your email.", "Veuillez indiquer votre activité, votre nom et votre e-mail.")); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) { showErr(msg("Vul a.u.b. een geldig e-mailadres in.", "Please enter a valid email address.", "Veuillez saisir une adresse e-mail valide.")); return; }
      err.hidden = true;
      v._subject = "Karakterschets aangevraagd via digital-impression.be door " + v.naam;
      var original = btn.innerHTML; btn.disabled = true; btn.textContent = msg("Verzenden…", "Sending…", "Envoi…");
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify(v) })
        .then(function (r) { if (!r.ok) throw new Error("bad"); fields.hidden = true; ok.hidden = false; })
        .catch(function () { showErr(msg("Er ging iets mis. Probeer opnieuw of mail ons rechtstreeks.", "Something went wrong. Please try again or email us directly.", "Une erreur s'est produite. Réessayez ou écrivez-nous directement.")); })
        .finally(function () { btn.disabled = false; btn.innerHTML = original; });
    });
    if (reset) reset.addEventListener("click", function () { ids.forEach(function (id) { $("#" + id).value = ""; }); ok.hidden = true; fields.hidden = false; });
  }

  /* =====================================================================
     9 · i18n
     ===================================================================== */
  var I18N = {
    en: {
      meta_title: "Digital Impression | Websites with character",
      rail_0: "Prologue", rail_6: "Epilogue",
      nav_stories: "The stories", nav_how: "How we work", nav_price: "Pricing", nav_who: "Who",
      cta_sketch_short: "Free character sketch", cta_sketch: "Request your free character sketch", cta_stories: "Read the stories",
      ch_0: "Prologue", ch_1: "Chapter I", ch_2: "Chapter II", ch_3: "Chapter III", ch_4: "Chapter IV", ch_5: "Chapter V", ch_6: "Epilogue",
      h1_a: "Every business has <em class=\"kw\">character.</em>", h1_b: "Most websites hide it.",
      hero_lead: "We build websites that show who you really are, so the right customers feel it straight away. No template, no deposit, and you see your design before you decide.",
      k_label: "Pick a business", k_tuinman: "gardener", k_kinesist: "physio", k_bakker: "baker", k_advocaat: "lawyer", k_zanger: "singer", k_webshop: "webshop", k_note: "example",
      p_title: "The same story, everywhere.",
      c1: "Welcome to our website.", c2: "We stand for quality and service.", c3: "Your partner in tailored solutions.", c4: "25 years of experience.", c5: "The customer comes first.", c6: "Craftsmanship is our passion.", c7: "Contact us without obligation.", c_truth: "Every business has character.",
      p_lead: "Sound familiar? Everyone writes it, so nobody believes it.",
      p_body: "A visitor decides in a few seconds whether you are the real thing. Not from what it says, but from how it feels. A website without character says: we are like the others. And you are not.",
      ba_before: "Before", ba_after: "After", ba_hint: "Drag to compare · Credo Rehab & Performance, Diepenbeek",
      ba_eyebrow: "One practice, two websites", ba_title: "The same physios. This time with character.",
      ba_body: "Left, the Wix template that was there. Right, the website we built for them: black and white, direct, with their own imagery and online booking. Same people, same practice. Different impression.",
      s_title: "Five businesses, five characters.", st_live: "Visit the site",
      st1_who: "Wholesaler of fresh carrots, on the road every day to customers across Europe.", st1_what: "Fresh and direct, like the product: one photo, one promise, one button. No detours for a buyer who wants to know quickly if this is the right place.",
      st2_who: "Guided tours through centuries-old marl caves under Zichen.", st2_what: "Dark, warm and quiet, like the corridors themselves. The story comes before the practical details, because people come here for the atmosphere.",
      st3_who: "Garden design and maintenance, with patience for what grows slowly.", st3_what: "Green, calm and spacious. The site lets the gardens speak, not the gardener. One button for a quote, no noise beyond that.",
      st4_who: "A singer with a full calendar and an audience that comes back.", st4_what: "Big, festive and moving. Calendar, fan shop and bookings in one place, so fans and organisers each find their own door.",
      st5_who: "Physios in Diepenbeek who bring athletes back to their level, and beyond.", st5_what: "Black and white, hard and honest, like a training room at six in the morning. Three languages and online booking, without turning into a brochure.",
      w_title: "First listen. Then draw. Only then build.", w_lead: "You do not find character in a template. You find it in a conversation. So every project starts with listening, and you see your website before you pay anything.",
      w1_n: "One", w1_t: "Listen", w1_p: "A half-hour conversation about your business, not about your website. Who your customers are, what you are proud of, what everyone should know.",
      w2_badge: "Free · within 24 hours", w2_n: "Two", w2_t: "The character sketch", w2_p: "You see your homepage, designed from that conversation. No deposit, no obligation. You decide afterwards.",
      w3_n: "Three", w3_t: "Build", w3_p: "Ten to fourteen days, with you at the table at every step. Copy, imagery and tech, all under one roof.",
      w4_n: "Four", w4_t: "Live", w4_p: "Your website goes online, with guidance and support. And afterwards you stay with the same person, not a helpdesk.",
      pr_title: "Character has a price. An honest one.", pr_lead: "Three packages, fixed starting prices, no small print. Every package starts with a free character sketch.", pr_from: "from",
      t1_sub: "Website Basic", t1_name: "The business card", t1_for: "For those who want to be found and trusted straight away. Freelancers, local businesses, starters.", t1_1: "Bespoke website, up to 3 pages", t1_2: "Perfect on phone, tablet and laptop", t1_3: "Contact form and social media", t1_4: "Live in 10 to 14 days",
      t2_sub: "Website Premium", t2_name: "The story", t2_for: "For those who want to convince visitors and win customers. Growing businesses, practices, service providers.", t2_1: "Everything in The business card", t2_2: "Up to 5 pages, blog or news", t2_3: "Booking or quote system", t2_4: "Newsletter integration",
      t3_sub: "Webshop", t3_name: "The shop", t3_for: "For those who sell online. Fashion, food, beauty, and anything that fits in a box.", t3_1: "Everything in The story", t3_2: "Shop setup, up to 50 products", t3_3: "Payments, cart and checkout", t3_4: "Guidance so you manage products yourself",
      pr_cta: "Start with a character sketch",
      pr_note: "Hosting, domain name and copywriting are not part of the package price; we arrange them on request via the quote. No deposit: you pay once the website is finished and you are happy.",
      wie_role: "Founder, Digital Impression", wie_title: "One person. From the first conversation to long after launch.",
      wie_p1: "Digital Impression is a small web design studio in Belgian Limburg, working in Belgium and the Netherlands. No account managers, no helpdesk, no anonymous supplier: you talk to the person who designs and builds your website.",
      wie_p2: "We work for businesses, freelancers and organisations that have something to say and want it felt online too.",
      sig1: "No deposit.", sig2: "No templates.", sig3: "No promises about Google.", sig4: "No anonymous supplier.", sig5: "Character, yes.",
      e_title: "What character does your business have?", e_lead: "Tell us in one sentence. Within 24 hours you will see what that looks like as a website. Free, and you decide afterwards.",
      f_zaak: "Your business in one sentence", f_zaak_ph: "For example: we have been making bespoke wooden garden houses for 30 years, with many loyal customers.",
      f_naam: "Name", f_naam_ph: "Your name", f_email: "Email", f_email_ph: "you@company.com", f_site: "Current website (optional)", f_site_ph: "www.yourcompany.com",
      f_fine: "By sending you agree to a no-obligation contact. No deposit, no commitment.", f_ok_t: "Thank you. We start drawing.", f_ok_p: "You will hear from us within 24 hours, with a first sketch of your homepage.", f_again: "Send another request",
      ph_region: "Belgium & the Netherlands", faq_eyebrow: "Frequently asked questions",
      q1: "What exactly is a character sketch?", a1: "A design of your homepage, made from one conversation about your business. You get it within 24 hours, free, with no deposit or obligation. If you decide to go ahead, it becomes the basis of your website.",
      q2: "How fast will my website be online?", a2: "Most websites are online within 10 to 14 days after your go-ahead. A webshop or a site in three languages can take a little longer; we agree on that beforehand.",
      q3: "What does a website cost exactly?", a3: "From €999. The exact price depends on what you need and is written down in the quote, with no hidden costs. Hosting, domain name and copy are arranged separately on request.",
      q4: "Can I update my website myself later?", a4: "Yes. You get guidance to manage texts and images yourself, and for everything else you stay with the same person, also after launch.",
      foot_tag: "Websites with character. For businesses, freelancers and organisations in Belgium and the Netherlands.", foot_story: "The story", foot_contact: "Contact",
      foot_rights: "© 2026 Digital Impression. All rights reserved.", foot_privacy: "Privacy policy", foot_terms: "Terms & conditions"
    },
    fr: {
      meta_title: "Digital Impression | Des sites web avec du caractère",
      rail_0: "Prologue", rail_6: "Épilogue",
      nav_stories: "Les histoires", nav_how: "Méthode", nav_price: "Tarifs", nav_who: "Qui",
      cta_sketch_short: "Esquisse gratuite", cta_sketch: "Demandez votre esquisse de caractère gratuite", cta_stories: "Lire les histoires",
      ch_0: "Prologue", ch_1: "Chapitre I", ch_2: "Chapitre II", ch_3: "Chapitre III", ch_4: "Chapitre IV", ch_5: "Chapitre V", ch_6: "Épilogue",
      h1_a: "Chaque entreprise a du <em class=\"kw\">caractère.</em>", h1_b: "La plupart des sites web le cachent.",
      hero_lead: "Nous créons des sites web qui montrent qui vous êtes vraiment, pour que les bons clients le sentent tout de suite. Pas de modèle, pas d'acompte, et vous voyez votre design avant de décider.",
      k_label: "Choisissez une activité", k_tuinman: "jardinier", k_kinesist: "kiné", k_bakker: "boulanger", k_advocaat: "avocat", k_zanger: "chanteur", k_webshop: "boutique", k_note: "exemple",
      p_title: "La même histoire, partout.",
      c1: "Bienvenue sur notre site.", c2: "La qualité et le service avant tout.", c3: "Votre partenaire pour des solutions sur mesure.", c4: "25 ans d'expérience.", c5: "Le client est au centre.", c6: "L'artisanat est notre passion.", c7: "Contactez-nous sans engagement.", c_truth: "Chaque entreprise a du caractère.",
      p_lead: "Ça vous parle ? Tout le monde l'écrit, donc personne n'y croit.",
      p_body: "Un visiteur décide en quelques secondes si vous êtes le bon. Pas d'après ce qui est écrit, mais d'après ce qu'il ressent. Un site sans caractère dit : nous sommes comme les autres. Et vous ne l'êtes pas.",
      ba_before: "Avant", ba_after: "Après", ba_hint: "Glissez pour comparer · Credo Rehab & Performance, Diepenbeek",
      ba_eyebrow: "Un cabinet, deux sites", ba_title: "Les mêmes kinés. Cette fois avec du caractère.",
      ba_body: "À gauche, le modèle Wix qui était en place. À droite, le site que nous avons créé : noir et blanc, direct, avec leurs propres images et la prise de rendez-vous en ligne. Mêmes personnes, même cabinet. Autre impression.",
      s_title: "Cinq entreprises, cinq caractères.", st_live: "Voir le site",
      st1_who: "Grossiste en carottes fraîches, chaque jour sur la route vers des clients dans toute l'Europe.", st1_what: "Frais et direct, comme le produit : une photo, une promesse, un bouton. Pas de détour pour un acheteur qui veut vite savoir s'il est au bon endroit.",
      st2_who: "Visites guidées dans des galeries de marne centenaires sous Zichen.", st2_what: "Sombre, chaud et silencieux, comme les galeries elles-mêmes. L'histoire passe avant les infos pratiques, car on vient ici pour l'ambiance.",
      st3_who: "Aménagement et entretien de jardins, avec de la patience pour ce qui pousse lentement.", st3_what: "Vert, calme et spacieux. Le site laisse parler les jardins, pas le jardinier. Un bouton pour un devis, rien de plus.",
      st4_who: "Un chanteur à l'agenda bien rempli et au public fidèle.", st4_what: "Grand, festif et en mouvement. Agenda, boutique et réservations au même endroit, pour que fans et organisateurs trouvent chacun leur porte.",
      st5_who: "Des kinés à Diepenbeek qui ramènent les sportifs à leur niveau, et au-delà.", st5_what: "Noir et blanc, dur et honnête, comme une salle d'entraînement à six heures du matin. Trois langues et réservation en ligne, sans devenir une brochure.",
      w_title: "D'abord écouter. Puis dessiner. Construire ensuite.", w_lead: "Le caractère ne se trouve pas dans un modèle. Il se trouve dans une conversation. Chaque projet commence donc par l'écoute, et vous voyez votre site avant de payer quoi que ce soit.",
      w1_n: "Un", w1_t: "Écouter", w1_p: "Une conversation d'une demi-heure sur votre entreprise, pas sur votre site. Qui sont vos clients, de quoi êtes-vous fier, que faut-il savoir.",
      w2_badge: "Gratuit · sous 24 heures", w2_n: "Deux", w2_t: "L'esquisse de caractère", w2_p: "Vous voyez votre page d'accueil, conçue à partir de cette conversation. Sans acompte, sans engagement. Vous décidez ensuite.",
      w3_n: "Trois", w3_t: "Construire", w3_p: "Dix à quatorze jours, avec vous à chaque étape. Textes, images et technique, tout sous un même toit.",
      w4_n: "Quatre", w4_t: "En ligne", w4_p: "Votre site est mis en ligne, avec explications et support. Et ensuite, vous restez avec la même personne, pas un helpdesk.",
      pr_title: "Le caractère a un prix. Un prix honnête.", pr_lead: "Trois formules, des prix de départ fixes, pas de petits caractères. Chaque formule commence par une esquisse gratuite.", pr_from: "à partir de",
      t1_sub: "Website Basic", t1_name: "La carte de visite", t1_for: "Pour qui veut être trouvé et inspirer confiance immédiatement. Indépendants, commerces locaux, starters.", t1_1: "Site sur mesure, jusqu'à 3 pages", t1_2: "Parfait sur mobile, tablette et ordinateur", t1_3: "Formulaire de contact et réseaux sociaux", t1_4: "En ligne en 10 à 14 jours",
      t2_sub: "Website Premium", t2_name: "L'histoire", t2_for: "Pour qui veut convaincre les visiteurs et gagner des clients. Entreprises en croissance, cabinets, prestataires.", t2_1: "Tout de La carte de visite", t2_2: "Jusqu'à 5 pages, blog ou actualités", t2_3: "Système de réservation ou de devis", t2_4: "Intégration newsletter",
      t3_sub: "Boutique en ligne", t3_name: "La boutique", t3_for: "Pour qui vend en ligne. Mode, alimentation, beauté, et tout ce qui tient dans une boîte.", t3_1: "Tout de L'histoire", t3_2: "Boutique, jusqu'à 50 produits", t3_3: "Paiement, panier et commande", t3_4: "Explications pour gérer vos produits vous-même",
      pr_cta: "Commencer par une esquisse",
      pr_note: "L'hébergement, le nom de domaine et la rédaction ne font pas partie du prix du forfait ; nous les organisons sur demande via le devis. Pas d'acompte : vous payez quand le site est terminé et que vous êtes satisfait.",
      wie_role: "Fondateur, Digital Impression", wie_title: "Une seule personne. Du premier échange jusqu'à longtemps après le lancement.",
      wie_p1: "Digital Impression est un petit studio de webdesign dans le Limbourg belge, actif en Belgique et aux Pays-Bas. Pas de chargés de compte, pas de helpdesk, pas de fournisseur anonyme : vous parlez à la personne qui conçoit et construit votre site.",
      wie_p2: "Nous travaillons pour des entreprises, des indépendants et des organisations qui ont quelque chose à dire et veulent qu'on le ressente aussi en ligne.",
      sig1: "Pas d'acompte.", sig2: "Pas de modèles.", sig3: "Pas de promesses sur Google.", sig4: "Pas de fournisseur anonyme.", sig5: "Du caractère, oui.",
      e_title: "Quel caractère a votre entreprise ?", e_lead: "Dites-le-nous en une phrase. Sous 24 heures, vous verrez à quoi cela ressemble en site web. Gratuit, et vous décidez ensuite.",
      f_zaak: "Votre entreprise en une phrase", f_zaak_ph: "Par exemple : nous fabriquons depuis 30 ans des abris de jardin en bois sur mesure, avec beaucoup de clients fidèles.",
      f_naam: "Nom", f_naam_ph: "Votre nom", f_email: "E-mail", f_email_ph: "vous@entreprise.be", f_site: "Site web actuel (facultatif)", f_site_ph: "www.votreentreprise.be",
      f_fine: "En envoyant, vous acceptez une prise de contact sans engagement. Pas d'acompte, pas d'obligation.", f_ok_t: "Merci. Nous commençons à dessiner.", f_ok_p: "Vous aurez de nos nouvelles sous 24 heures, avec une première esquisse de votre page d'accueil.", f_again: "Envoyer une autre demande",
      ph_region: "Belgique & Pays-Bas", faq_eyebrow: "Questions fréquentes",
      q1: "Qu'est-ce qu'une esquisse de caractère ?", a1: "Un design de votre page d'accueil, réalisé à partir d'une seule conversation sur votre entreprise. Vous le recevez sous 24 heures, gratuitement, sans acompte ni engagement. Si vous décidez de continuer, il devient la base de votre site.",
      q2: "En combien de temps mon site sera-t-il en ligne ?", a2: "La plupart des sites sont en ligne 10 à 14 jours après votre accord. Une boutique ou un site en trois langues peut prendre un peu plus de temps ; nous le convenons à l'avance.",
      q3: "Combien coûte exactement un site web ?", a3: "À partir de 999 €. Le prix exact dépend de vos besoins et figure noir sur blanc dans le devis, sans frais cachés. Hébergement, nom de domaine et textes sont organisés séparément sur demande.",
      q4: "Puis-je modifier mon site moi-même par la suite ?", a4: "Oui. Vous recevez des explications pour gérer textes et images vous-même, et pour tout le reste vous restez avec la même personne, aussi après le lancement.",
      foot_tag: "Des sites web avec du caractère. Pour les entreprises, indépendants et organisations en Belgique et aux Pays-Bas.", foot_story: "L'histoire", foot_contact: "Contact",
      foot_rights: "© 2026 Digital Impression. Tous droits réservés.", foot_privacy: "Politique de confidentialité", foot_terms: "Conditions générales"
    }
  };
  var NL = {};
  function snapshotNL() {
    $$("[data-i18n]").forEach(function (el) { var k = el.getAttribute("data-i18n"); if (!(k in NL)) NL[k] = el.innerHTML; });
    $$("[data-i18n-ph]").forEach(function (el) { var k = el.getAttribute("data-i18n-ph"); if (!(k in NL)) NL[k] = el.getAttribute("placeholder"); });
    NL.meta_title = document.title;
  }
  function applyLang(l) {
    lang = l; var d = I18N[l];
    $$("[data-i18n]").forEach(function (el) { var k = el.getAttribute("data-i18n"); var v = d ? d[k] : NL[k]; if (v != null) el.innerHTML = v; });
    $$("[data-i18n-ph]").forEach(function (el) { var k = el.getAttribute("data-i18n-ph"); var v = d ? d[k] : NL[k]; if (v != null) el.setAttribute("placeholder", v); });
    document.title = (d && d.meta_title) || NL.meta_title;
    document.documentElement.lang = l;
    $$("#lang button").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-lang") === l); });
    fillDemo(currentK);
    try { localStorage.setItem("di_lang", l); } catch (e) {}
  }
  function initI18n() {
    snapshotNL();
    $("#lang").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) applyLang(b.getAttribute("data-lang")); });
    var saved = null; try { saved = localStorage.getItem("di_lang"); } catch (e) {}
    if (saved && saved !== "nl" && I18N[saved]) applyLang(saved);
  }

  /* ===================================================================== */
  function init() {
    initI18n(); initHeader(); initKiezer(); initPen(); initReveal(); initChapters(); initCliches(); initStrip(); initSteps(); initBeforeAfter(); initFaq(); initForm();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
