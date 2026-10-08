/* ==========================================================================
   Digital Impression interactivity (vanilla JS, no framework)
   Premium interactive layer: scroll progress, hero constellation canvas,
   custom cursor + magnetic buttons, 3D tilt + spotlight cards, count-up
   stats, client marquee, before/after slider, FAQ accordion, reveals,
   contact form (no <form> tag).
   ========================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  /* ---- Contact form endpoint ----
     Paste your Formspree endpoint here to receive submissions by e-mail,
     e.g. "https://formspree.io/f/abcdwxyz". Leave empty to keep demo mode
     (shows the success message without sending). */
  var FORM_ENDPOINT = "https://formspree.io/f/xlgqkgbd";

  /* ---- Language state (used by count-up + i18n) ---- */
  var currentLang = "nl";
  function sufOf(el) {
    if (currentLang === "fr" && el.getAttribute("data-suffix-fr") != null) return el.getAttribute("data-suffix-fr");
    if (currentLang === "en" && el.getAttribute("data-suffix-en") != null) return el.getAttribute("data-suffix-en");
    return el.getAttribute("data-suffix") || "";
  }

  /* ---- Lucide icons ---- */
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /* ---- Scroll progress bar ---- */
  function initProgress() {
    var bar = document.getElementById("scrollProgress");
    if (!bar) return;
    var update = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
      bar.style.transform = "scaleX(" + pct + ")";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---- Sticky header state ---- */
  function initHeader() {
    var navbar = document.querySelector(".navbar");
    if (!navbar) return;
    var onScroll = function () {
      navbar.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile menu ---- */
  function initMobileMenu() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;
    var open = function (state) {
      menu.hidden = !state;
      toggle.setAttribute("aria-expanded", String(state));
      toggle.setAttribute("aria-label", state ? "Menu sluiten" : "Menu openen");
      toggle.innerHTML = '<i data-lucide="' + (state ? "x" : "menu") + '"></i>';
      renderIcons();
    };
    toggle.addEventListener("click", function () { open(menu.hidden); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) open(false); });
  }

  /* ---- Reveal on scroll ---- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!items.length) return;
    if (REDUCED || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
        el.style.transitionDelay = delay + "ms";
        el.classList.add("is-visible");
        obs.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { obs.observe(el); });
  }

  /* ---- Count-up stats ---- */
  function initCountUp() {
    var nums = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (!nums.length) return;

    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      if (REDUCED) { el.textContent = target + sufOf(el); el.classList.add("counted"); return; }
      var dur = 1500, start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + sufOf(el);
        if (p < 1) requestAnimationFrame(step);
        else { el.textContent = target + sufOf(el); el.classList.add("counted"); }
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { obs.observe(el); });
  }

  /* ---- Hero constellation canvas ---- */
  function initHeroCanvas() {
    var canvas = document.getElementById("heroCanvas");
    if (!canvas || REDUCED) return;
    var ctx = canvas.getContext("2d");
    var dots = [], raf = null, w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var GOLD = "201,162,74";

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(70, Math.floor(w / 22));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + GOLD + ",0.55)";
        ctx.fill();
        for (var j = i + 1; j < dots.length; j++) {
          var e = dots[j], dx = d.x - e.x, dy = d.y - e.y, dist = dx * dx + dy * dy;
          if (dist < 13000) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y); ctx.lineTo(e.x, e.y);
            ctx.strokeStyle = "rgba(" + GOLD + "," + (0.16 * (1 - dist / 13000)) + ")";
            ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    window.addEventListener("resize", function () {
      if (raf) cancelAnimationFrame(raf);
      resize(); frame();
    });
  }

  /* ---- Custom cursor + magnetic buttons ---- */
  function initCursor() {
    if (!FINE || REDUCED) return;
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if (!dot || !ring) return;
    document.body.classList.add("has-cursor");

    var mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
    });
    (function loop() {
      rx += (mx - rx) * 0.22; ry += (my - ry) * 0.22;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(loop);
    })();

    var hot = "a, button, .work, .card, .price, input, textarea, select, .ba__handle";
    document.querySelectorAll(hot).forEach(function (el) {
      el.addEventListener("mouseenter", function () { document.body.classList.add("cursor-hot"); });
      el.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-hot"); });
    });

    // magnetic buttons: a subtle nudge, not a jump
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + x * 0.1 + "px," + y * 0.12 + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---- 3D tilt + cursor spotlight on cards ---- */
  function initTilt() {
    var cards = document.querySelectorAll(".card, .work");
    cards.forEach(function (card) {
      if (card.closest(".carousel--portfolio")) return; // no tilt on full-width slides
      // a card that still has a pending reveal must not receive an inline
      // transform, or the entrance animation (translateY) is overridden.
      var ready = function () { return !card.classList.contains("reveal") || card.classList.contains("is-visible"); };
      card.addEventListener("mousemove", function (e) {
        if (!ready()) return;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (px * 100) + "%");
        card.style.setProperty("--my", (py * 100) + "%");
        if (!FINE || REDUCED) return;
        var rotX = (0.5 - py) * 6;
        var rotY = (px - 0.5) * 6;
        card.style.transform = "perspective(900px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---- Before/After slider ---- */
  function initBeforeAfter() {
    var root = document.getElementById("ba");
    if (!root) return;
    var before = root.querySelector(".ba__before");
    var handle = root.querySelector(".ba__handle");
    var dragging = false;

    function syncW() { root.style.setProperty("--w", root.getBoundingClientRect().width + "px"); }
    syncW();
    window.addEventListener("resize", syncW);

    function setPos(clientX) {
      var r = root.getBoundingClientRect();
      var pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      before.style.width = pct + "%";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", Math.round(pct));
    }

    var start = function () { dragging = true; root.classList.add("is-dragging"); };
    var end = function () { dragging = false; root.classList.remove("is-dragging"); };
    var move = function (e) {
      if (!dragging) return;
      var x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
    };

    handle.addEventListener("mousedown", start);
    handle.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("mouseup", end);
    window.addEventListener("touchend", end);
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: true });
    // click anywhere on track to jump
    root.addEventListener("click", function (e) {
      if (e.target === handle || handle.contains(e.target)) return;
      setPos(e.clientX);
    });
    // keyboard
    handle.addEventListener("keydown", function (e) {
      var cur = parseFloat(before.style.width) || 50;
      if (e.key === "ArrowLeft") { e.preventDefault(); var r = root.getBoundingClientRect(); setPos(r.left + r.width * (cur - 4) / 100); }
      if (e.key === "ArrowRight") { e.preventDefault(); var r2 = root.getBoundingClientRect(); setPos(r2.left + r2.width * (cur + 4) / 100); }
    });
  }

  /* ---- FAQ accordion ---- */
  function initFaq() {
    var items = document.querySelectorAll(".faq__item");
    items.forEach(function (item) {
      var btn = item.querySelector(".faq__q");
      var panel = item.querySelector(".faq__a");
      if (!btn || !panel) return;
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        // close siblings for a clean accordion feel
        items.forEach(function (other) {
          if (other !== item) {
            other.classList.remove("open");
            var ob = other.querySelector(".faq__q");
            var op = other.querySelector(".faq__a");
            if (ob) ob.setAttribute("aria-expanded", "false");
            if (op) op.style.maxHeight = null;
          }
        });
        item.classList.toggle("open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
        panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
      });
    });
  }

  /* ---- Services carousel: draggable + auto-rotating ---- */
  function initCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (root) {
      var viewport = root.querySelector(".carousel__viewport");
      var track = root.querySelector(".carousel__track");
      var cards = Array.prototype.slice.call(track.children);
      var dotsWrap = root.querySelector(".carousel__dots");
      var arrows = root.querySelectorAll(".carousel__arrow");
      if (!viewport || !track || !cards.length) return;

      var gap = parseFloat(getComputedStyle(track).columnGap) || 24;
      var index = 0, perView = 3, maxIndex = 0, step = 0;
      var autoplay = parseInt(root.getAttribute("data-autoplay") || "0", 10);
      var timer = null;

      function calcPerView() {
        var forced = parseInt(root.getAttribute("data-per-view") || "0", 10);
        if (forced > 0) {
          // forced count is for tablet/desktop; show 1 on small screens
          return Math.min(viewport.clientWidth < 640 ? 1 : forced, cards.length);
        }
        var w = viewport.clientWidth;
        var n = w >= 1024 ? 3 : w >= 640 ? 2 : 1;
        return Math.min(n, cards.length);
      }

      function layout() {
        perView = calcPerView();
        maxIndex = Math.max(0, cards.length - perView);
        var cw = (viewport.clientWidth - gap * (perView - 1)) / perView;
        step = cw + gap;
        cards.forEach(function (c) { c.style.width = cw + "px"; });
        buildDots();
        if (index > maxIndex) index = maxIndex;
        goTo(index, true);
      }

      function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = "";
        for (var i = 0; i <= maxIndex; i++) {
          (function (i) {
            var d = document.createElement("button");
            d.className = "carousel__dot" + (i === index ? " is-active" : "");
            d.setAttribute("aria-label", "Ga naar groep " + (i + 1));
            d.addEventListener("click", function () { stop(); goTo(i); });
            dotsWrap.appendChild(d);
          })(i);
        }
      }

      function updateDots() {
        if (!dotsWrap) return;
        Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
          d.classList.toggle("is-active", i === index);
        });
      }

      function goTo(i, instant) {
        index = Math.max(0, Math.min(i, maxIndex));
        if (instant) track.style.transition = "none";
        track.style.transform = "translateX(" + (-index * step) + "px)";
        if (instant) { void track.offsetWidth; track.style.transition = ""; }
        updateDots();
      }

      arrows.forEach(function (btn) {
        btn.addEventListener("click", function () {
          stop();
          var dir = parseInt(btn.getAttribute("data-dir"), 10);
          var next = index + dir;
          if (next < 0) next = maxIndex;
          if (next > maxIndex) next = 0;
          goTo(next);
        });
      });

      /* drag / swipe */
      var dragging = false, startX = 0, base = 0, moved = false;
      function down(e) {
        dragging = true; moved = false;
        startX = e.clientX != null ? e.clientX : (e.touches && e.touches[0].clientX);
        base = -index * step;
        if (autoplay) stop();
      }
      function move(e) {
        if (!dragging) return;
        var x = e.clientX != null ? e.clientX : (e.touches && e.touches[0].clientX);
        var dx = x - startX;
        if (Math.abs(dx) > 6 && !moved) { moved = true; root.classList.add("is-dragging"); }
        if (moved) { track.style.transition = "none"; track.style.transform = "translateX(" + (base + dx) + "px)"; }
      }
      function up(e) {
        if (!dragging) return;
        dragging = false;
        if (moved) {
          var x = (e.clientX != null ? e.clientX : (e.changedTouches && e.changedTouches[0].clientX));
          var dx = x - startX;
          track.style.transition = "";
          goTo(Math.round((-base - dx) / step));
          setTimeout(function () { root.classList.remove("is-dragging"); }, 0);
        }
      }

      viewport.addEventListener("pointerdown", down);
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerup", up);

      /* autoplay */
      function play() {
        if (!autoplay || REDUCED) return;
        stop();
        timer = setInterval(function () { goTo(index >= maxIndex ? 0 : index + 1); }, autoplay);
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }

      root.addEventListener("mouseenter", stop);
      root.addEventListener("mouseleave", play);
      root.addEventListener("focusin", stop);
      root.addEventListener("focusout", play);
      document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });

      var rid = null;
      window.addEventListener("resize", function () {
        if (rid) cancelAnimationFrame(rid);
        rid = requestAnimationFrame(layout);
      });

      layout();
      play();
    });
  }

  /* ---- Contact form (no <form> tag) ---- */
  function initContactForm() {
    var btn = document.getElementById("submitBtn");
    var fields = document.getElementById("formFields");
    var success = document.getElementById("formSuccess");
    var errorEl = document.getElementById("formError");
    var resetBtn = document.getElementById("resetBtn");
    if (!btn || !fields || !success) return;

    var ids = ["naam", "bedrijf", "email", "telefoon", "bericht", "type", "project", "gevonden"];
    var showError = function (m) { if (errorEl) { errorEl.textContent = m; errorEl.hidden = false; } };
    var clearError = function () { if (errorEl) errorEl.hidden = true; };

    var msg = function (nl, en, fr) { return currentLang === "en" ? en : currentLang === "fr" ? (fr || en) : nl; };
    var showSuccess = function () {
      fields.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
    };

    btn.addEventListener("click", function () {
      var naam = (document.getElementById("naam").value || "").trim();
      var email = (document.getElementById("email").value || "").trim();
      var bericht = (document.getElementById("bericht").value || "").trim();
      if (!naam || !email || !bericht) { showError(msg("Vul a.u.b. uw naam, e-mailadres en bericht in.", "Please fill in your name, email and message.", "Veuillez indiquer votre nom, votre e-mail et votre message.")); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(msg("Vul a.u.b. een geldig e-mailadres in.", "Please enter a valid email address.", "Veuillez saisir une adresse e-mail valide.")); return; }
      clearError();

      if (!FORM_ENDPOINT) { showSuccess(); return; } // demo mode

      var payload = {};
      ids.forEach(function (id) { var el = document.getElementById(id); if (el) payload[id] = el.value; });
      payload._subject = "Nieuwe aanvraag via digital-impression.be" + (payload.naam ? " van " + payload.naam : "");
      btn.disabled = true;
      var original = btn.textContent;
      btn.textContent = msg("Verzenden…", "Sending…", "Envoi…");
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw new Error("bad status");
        showSuccess();
      }).catch(function () {
        showError(msg("Er ging iets mis. Probeer opnieuw of mail ons rechtstreeks.", "Something went wrong. Please try again or email us directly.", "Une erreur s'est produite. Réessayez ou envoyez-nous un e-mail directement."));
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = original;
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        ids.forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ""; });
        clearError();
        success.hidden = true;
        fields.hidden = false;
      });
    }
  }

  /* ---- i18n: NL default in the DOM, EN from dictionary ---- */
  var I18N_EN = {
    meta_title: "Digital Impression | Premium Websites for Entrepreneurs",
    meta_desc: "We build fast, professional websites that attract customers. Get a tailored quote within 24h plus a free homepage design.",
    ph_address: "Belgium &amp; the Netherlands", ph_email: "info@digital-impression.be", ph_phone: "+32 496 25 14 45", news_ph: "Your email",
    nav_home: "Home", nav_services: "Services", nav_work: "Work", nav_pricing: "Pricing", nav_about: "About",
    cta_quote: "Get a Quote",
    hero_eyebrow: "Premium Web Design",
    hero_title: "Your Business Deserves A Website That Works <em>As Hard As You Do</em>",
    hero_sub: "We build professional websites for entrepreneurs. Fast, beautiful and built to attract customers. Get a tailored quote within 24h plus a free homepage design.",
    hero_cta1: "Get a Quote &amp; Free Design",
    hero_cta2: "See Our Work",
    hero_trust1: "Website live in 2 weeks", hero_trust2: "Free homepage design", hero_trust3: "Dedicated contact person",
    rd_eyebrow: "The Difference",
    rd_title: "From Outdated To <em>Stunning</em>",
    rd_lead: "Your website is your digital storefront, and for most businesses it works against them. An outdated site drives customers away before they ever call. Drag the handle and see how we turn the same content into something that builds trust and wins enquiries.",
    rd_hint: "Drag to compare before &amp; after",
    rd_from1: "Slow &amp; outdated", rd_to1: "Lightning-fast &amp; modern",
    rd_from2: "Weak first impression", rd_to2: "Strong first impression",
    rd_from3: "Not mobile-friendly", rd_to3: "Perfect on every screen",
    rd_from4: "Visitors bounce", rd_to4: "Visitors become customers",
    rd_cta: "Request a free redesign proposal",
    ba_before: "Before", ba_after: "After",
    marquee_label: "Trusted by entrepreneurs and brands",
    svc_eyebrow: "Our Services", svc_title: "What We <em>Build</em>",
    svc_aside: "Not sure what you need?<br /><a href=\"#contact\" class=\"link-gold\">We'll figure it out together</a>",
    svc_cta: "Request a quote",
    svc1_title: "Business websites", svc1_body: "Sleek, professional websites that build trust and generate leads.",
    svc1_f1: "Trust-building design", svc1_f2: "Fast and secure", svc1_f3: "Smart lead forms",
    svc2_title: "Landing pages", svc2_body: "Single pages designed for one goal: conversions. Perfect for campaigns and product launches.",
    svc2_f1: "One clear goal", svc2_f2: "Built for conversion", svc2_f3: "Ideal for campaigns",
    svc3_title: "Webshops", svc3_body: "Sell online with a webshop built to convert, with beautiful product pages and seamless checkout.",
    svc3_f1: "Beautiful product pages", svc3_f2: "Seamless checkout", svc3_f3: "Secure payments",
    svc4_title: "Redesigns", svc4_body: "Transform your existing website into something you're proud of. Same content, a completely new impression.",
    svc4_f1: "Fresh, modern look", svc4_f2: "Keep your content", svc4_f3: "Faster &amp; mobile",
    work_eyebrow: "Portfolio", work_title: "Our <em>Work</em>",
    work_aside: "A selection of the websites we built for entrepreneurs, from wholesale to tourism.",
    work_live: "View live",
    work_tag_simonta: "B2B Wholesale", work_desc_simonta: "Wholesale in fresh carrots, B2B, delivery across Europe.",
    work_tag_mergel: "Tourism &amp; Culture", work_desc_mergel: "Guided cave tours, atmospheric &amp; historic.",
    work_tag_tuin: "Garden &amp; Landscape", work_desc_tuin: "Garden design &amp; maintenance, elegant and green.",
    work_tag_fadim: "Artist &amp; Events", work_desc_fadim: "Artist/singer with agenda, fan shop &amp; bookings.",
    fi_eyebrow: "First Impressions",
    fi_title: "First Impressions Happen Online, Before You Even Pick Up The <em>Phone</em>",
    fi_stat1: "judge a company's credibility based on its website, before reading a single word.",
    fi_stat2: "That's all the time you get. A slow or outdated website sends customers straight to your competitors.",
    fi_stat3: "You only get one shot at a great first impression. Don't waste it.",
    proc_eyebrow: "How It Works", proc_title: "From Request To Live Website In Less Than <em>2 Weeks</em>",
    proc_step: "Step 1", proc_step2: "Step 2", proc_step3: "Step 3", proc_step4: "Step 4",
    proc1_title: "Tell us about your project", proc1_body: "A short 3-minute chat where you tell us your goals and wishes.",
    proc2_title: "Quote &amp; design", proc2_body: "Within 24h you receive a tailored quote plus a free homepage design.",
    proc3_title: "We build your website", proc3_body: "In 10 to 14 days we build your site and keep you in the loop at every step.",
    proc4_title: "You go live", proc4_body: "Your website goes online, with ongoing support and one dedicated contact.",
    proc_band: "<strong>No obligation, no deposit.</strong> Your free homepage design costs nothing and commits you to nothing. We earn your trust before we ask for anything.",
    about_badge: "Active in BE &amp; NL", about_eyebrow: "About Us", about_title: "What Is <em>Digital Impression?</em>",
    about_intro: "Digital Impression is a web design studio that helps local entrepreneurs get a website that doesn't just look beautiful, but actually wins customers. No anonymous foreign supplier, but a dedicated local point of contact who thinks along with you, from first conversation to launch and beyond.",
    about_l1: "One dedicated contact", about_l2: "Transparent pricing", about_l3: "Local &amp; involved", about_l4: "Results-driven",
    about_cta: "Discuss your project",
    why_eyebrow: "Why Choose Digital Impression", why_title: "Entrepreneurs Choose <em>Us</em>",
    why1_title: "Local point of contact", why1_body: "A local team that understands you and your market, with no anonymous foreign supplier.",
    why2_title: "Fast delivery", why2_body: "Your website live in 10 to 14 days, without endless waiting.",
    why3_title: "Personal approach", why3_body: "One dedicated contact, from first conversation to launch and beyond.",
    price_eyebrow: "Pricing", price_title: "Simple, Transparent <em>Pricing</em>", price_lead: "No hidden costs. No surprises.",
    price_from: "from", price_badge: "⭐ Most Popular",
    price_incl: "Included", price_ideal: "Ideal for",
    price1_amount: "<span class=\"price__now\">€999</span><span class=\"price__old\">€1,200</span>",
    price2_amount: "<span class=\"price__now\">€1,249</span><span class=\"price__old\">€1,799</span>",
    price3_amount: "<span class=\"price__now\">€1,899</span><span class=\"price__old\">€2,499</span>",
    price1_sub: "Perfect for freelancers, local businesses and startups that need a professional online presence.",
    price2_sub: "Designed for businesses that want to generate leads and convert visitors into customers.",
    price3_sub: "A complete e-commerce solution built to maximize online sales.",
    b_incl1: "Custom website design", b_incl2: "Up to 3 pages", b_incl3: "Mobile-responsive design", b_incl4: "Contact form", b_incl5: "Social media links",
    b_ideal1: "Restaurants", b_ideal2: "Consultants", b_ideal3: "Small businesses", b_ideal4: "Personal brands",
    p_incl1: "Everything from Website Basic", p_incl2: "Up to 5 pages", p_incl3: "Newsletter integration", p_incl4: "Blog/news section", p_incl5: "Booking or quote system",
    p_ideal1: "Growing companies", p_ideal2: "Service businesses", p_ideal3: "Agencies", p_ideal4: "Professional firms",
    s_incl1: "Everything from Website Premium", s_incl2: "Online store setup", s_incl3: "Up to 50 products uploaded", s_incl4: "Payment integration", s_incl5: "Shopping cart and checkout",
    s_ideal1: "Clothing brands", s_ideal2: "Food and beverage brands", s_ideal3: "Beauty products", s_ideal4: "E-commerce businesses",
    feat_pages: "Up to 5 pages", feat_responsive: "Mobile-responsive design", feat_form: "Contact form",
    feat_seo: "SSL security", feat_online: "Online within 10 to 14 days", feat_free: "Free homepage design",
    cta_request: "Request a quote", cta_contact: "Get in touch",
    price_note: "Every project includes a free homepage design, sent within 24 hours of your request, with no obligation whatsoever.",
    faq_eyebrow: "Frequently Asked Questions", faq_title: "Everything You Want To <em>Know</em>",
    faq_lead: "No answer found? <a href=\"#contact\" class=\"link-gold\">Ask your question</a> and we'll reply within 24 hours.",
    faq_q1: "How fast will my website be online?",
    faq_a1: "Most projects go live within 10 to 14 days. After your request you receive a tailored quote plus a free homepage design within 24 hours.",
    faq_q2: "How much does a website cost exactly?",
    faq_a2: "A professional website starts from €999. The exact price depends on your wishes. You always get a transparent quote with no hidden costs or surprises.",
    faq_q3: "Is the free design really no-obligation?",
    faq_a3: "Absolutely. Your free homepage design costs nothing and commits you to nothing. No deposit, no obligation. We earn your trust first.",
    faq_q4: "Can I update my website myself later?",
    faq_a4: "Yes. We build your site so you can easily manage text and images, and you get one dedicated contact for support, even after launch.",
    faq_q5: "Do you also handle hosting and domain?",
    faq_a5: "Certainly. If you wish, we arrange hosting, domain name and the technical setup, so you don't have to worry about anything.",
    contact_eyebrow: "Start Your Project Today", contact_title: "Let's Build Something <em>Beautiful Together</em>",
    contact_lead: "Tell us about your project and we'll send you a tailored quote plus a free <span class=\"gold\">homepage design</span> within 24 hours. Completely without obligation.",
    contact_pt1: "Tailored quote + free design within 24 hours",
    contact_pt2: "No deposit, you only pay when you're 100% satisfied",
    f_naam: "Name", f_naam_ph: "Your name", f_bedrijf: "Company name", f_bedrijf_ph: "Your company",
    f_email: "Email", f_email_ph: "you@company.be", f_tel: "Phone number",
    f_bericht: "Message", f_bericht_ph: "How can we help you?",
    f_type: "Website type", f_select: "Select...",
    f_opt1: "Business website", f_opt2: "Landing page", f_opt3: "Webshop", f_opt4: "Redesign", f_opt5: "Other",
    f_project: "Tell us about your project", f_project_ph: "Goals, examples, deadlines...",
    f_found: "How did you find us?", f_found_ph: "Referral, social media, network...",
    f_submit: "Send", f_fine: "By submitting you agree to a no-obligation contact.",
    f_success_title: "Thank you for your request!",
    f_success_body: "We've received your message. You'll hear from us within 24 hours with a tailored quote plus your free homepage design.",
    f_again: "Send another request",
    footer_tagline: "Premium websites for entrepreneurs. Fast, beautiful and built to attract customers.",
    footer_company: "Company", footer_contact: "Contact",
    footer_stay: "Stay In The Loop", footer_stay_sub: "Tips &amp; insights on web design for entrepreneurs.",
    footer_rights: "© 2026 Digital Impression. All rights reserved.",
    footer_privacy: "Privacy policy", footer_terms: "Terms & conditions", about_c_title: "What you can expect from us", why_v1a: "Can we still change the text?", why_v1b: "Sure. It will be live within the hour.", why_v1m: "Reply within 24h", why_v2a: "Day 1 · Call", why_v2b: "Day 2 · Design", why_v2c: "Day 14 · Live", why_v3a: "Intro call", why_v3b: "Design", why_v3c: "Your feedback", why_v3d: "Live", work_tag_credo: "Physio &amp; Performance", work_desc_credo: "Rehab and performance practice, modern and trustworthy.", swipe_hint: "Swipe for more →"
  };

  var I18N_FR = {
    meta_title: "Digital Impression | Sites web premium pour entrepreneurs",
    meta_desc: "Nous créons des sites web rapides et professionnels qui attirent des clients. Recevez un devis sur mesure sous 24h et un design de page d'accueil gratuit.",
    ph_address: "Belgique &amp; Pays-Bas", ph_email: "info@digital-impression.be", ph_phone: "+32 496 25 14 45", news_ph: "Votre e-mail",
    nav_home: "Accueil", nav_services: "Services", nav_work: "Réalisations", nav_pricing: "Tarifs", nav_about: "À propos",
    cta_quote: "Demander un devis",
    hero_eyebrow: "Webdesign Premium",
    hero_title: "Votre Entreprise Mérite Un Site Qui Travaille <em>Aussi Dur Que Vous</em>",
    hero_sub: "Nous créons des sites web professionnels pour les entrepreneurs. Rapides, élégants et conçus pour attirer des clients. Recevez un devis sur mesure sous 24h et un design de page d'accueil gratuit.",
    hero_cta1: "Devis &amp; design gratuit",
    hero_cta2: "Voir nos réalisations",
    hero_trust1: "Site en ligne en 2 semaines", hero_trust2: "Design de page d'accueil gratuit", hero_trust3: "Un interlocuteur dédié",
    rd_eyebrow: "La Différence",
    rd_title: "De Dépassé À <em>Époustouflant</em>",
    rd_lead: "Votre site web est votre vitrine numérique, et pour la plupart des entreprises, il joue contre elles. Un site dépassé fait fuir les clients avant même qu'ils n'appellent. Faites glisser le curseur et voyez comment nous transformons le même contenu en quelque chose qui inspire confiance et génère des demandes.",
    rd_hint: "Glissez pour comparer avant &amp; après",
    rd_from1: "Lent &amp; dépassé", rd_to1: "Ultra-rapide &amp; moderne",
    rd_from2: "Première impression faible", rd_to2: "Première impression forte",
    rd_from3: "Pas adapté au mobile", rd_to3: "Parfait sur chaque écran",
    rd_from4: "Les visiteurs partent", rd_to4: "Les visiteurs deviennent clients",
    rd_cta: "Demandez une proposition de redesign gratuite",
    ba_before: "Avant", ba_after: "Après",
    marquee_label: "La confiance des entrepreneurs et des marques",
    svc_eyebrow: "Nos Services", svc_title: "Ce Que Nous <em>Créons</em>",
    svc_aside: "Vous ne savez pas ce qu'il vous faut ?<br /><a href=\"#contact\" class=\"link-gold\">Trouvons-le ensemble</a>",
    svc_cta: "Demander un devis",
    svc1_title: "Sites web d'entreprise", svc1_body: "Des sites web élégants et professionnels qui inspirent confiance et génèrent des leads.",
    svc1_f1: "Design qui inspire confiance", svc1_f2: "Rapide et sécurisé", svc1_f3: "Formulaires de contact intelligents",
    svc2_title: "Landing pages", svc2_body: "Des pages uniques conçues pour un seul objectif : la conversion. Parfaites pour les campagnes et les lancements de produits.",
    svc2_f1: "Un objectif clair", svc2_f2: "Conçue pour convertir", svc2_f3: "Idéale pour les campagnes",
    svc3_title: "Boutiques en ligne", svc3_body: "Vendez en ligne avec une boutique conçue pour convertir, avec de belles pages produits et un paiement fluide.",
    svc3_f1: "De belles pages produits", svc3_f2: "Paiement fluide", svc3_f3: "Paiements sécurisés",
    svc4_title: "Refontes", svc4_body: "Transformez votre site actuel en quelque chose dont vous êtes fier. Le même contenu, une toute nouvelle impression.",
    svc4_f1: "Un look frais et moderne", svc4_f2: "Gardez votre contenu", svc4_f3: "Plus rapide &amp; mobile",
    work_eyebrow: "Portfolio", work_title: "Nos <em>Réalisations</em>",
    work_aside: "Une sélection des sites web que nous avons créés pour des entrepreneurs, du commerce de gros au tourisme.",
    work_live: "Voir en ligne",
    work_tag_simonta: "Commerce de gros B2B", work_desc_simonta: "Grossiste en carottes fraîches, B2B, livraison dans toute l'Europe.",
    work_tag_mergel: "Tourisme &amp; Culture", work_desc_mergel: "Visites guidées de grottes, atmosphériques &amp; historiques.",
    work_tag_tuin: "Jardin &amp; Paysage", work_desc_tuin: "Aménagement &amp; entretien de jardins, élégant et vert.",
    work_tag_fadim: "Artiste &amp; Événements", work_desc_fadim: "Artiste/chanteur avec agenda, boutique fan &amp; réservations.",
    fi_eyebrow: "Premières Impressions",
    fi_title: "Les Premières Impressions Se Font En Ligne, Avant Même Que Vous Ne Décrochiez Le <em>Téléphone</em>",
    fi_stat1: "jugent la crédibilité d'une entreprise d'après son site web, avant d'avoir lu un seul mot.",
    fi_stat2: "C'est tout le temps dont vous disposez. Un site lent ou dépassé envoie les clients droit chez vos concurrents.",
    fi_stat3: "Vous n'avez qu'une seule chance de faire une bonne première impression. Ne la gâchez pas.",
    proc_eyebrow: "Comment Ça Marche", proc_title: "De La Demande Au Site En Ligne En Moins De <em>2 Semaines</em>",
    proc_step: "Étape 1", proc_step2: "Étape 2", proc_step3: "Étape 3", proc_step4: "Étape 4",
    proc1_title: "Parlez-nous de votre projet", proc1_body: "Un bref échange de 3 minutes où vous nous exposez vos objectifs et vos souhaits.",
    proc2_title: "Devis &amp; design", proc2_body: "Sous 24h, vous recevez un devis sur mesure et un design de page d'accueil gratuit.",
    proc3_title: "Nous créons votre site", proc3_body: "En 10 à 14 jours, nous créons votre site en vous tenant informé à chaque étape.",
    proc4_title: "Vous passez en ligne", proc4_body: "Votre site est mis en ligne, avec un support continu et un interlocuteur dédié.",
    proc_band: "<strong>Sans engagement, sans acompte.</strong> Votre design de page d'accueil gratuit ne coûte rien et ne vous engage à rien. Nous gagnons votre confiance avant de vous demander quoi que ce soit.",
    about_badge: "Actif en BE &amp; NL", about_eyebrow: "À Propos", about_title: "Qu'est-ce Que <em>Digital Impression ?</em>",
    about_intro: "Digital Impression est un studio de webdesign qui aide les entrepreneurs locaux à obtenir un site qui n'est pas seulement magnifique, mais qui séduit réellement des clients. Pas de fournisseur étranger anonyme, mais un interlocuteur local et dédié qui réfléchit avec vous, du premier échange au lancement et au-delà.",
    about_l1: "Un interlocuteur dédié", about_l2: "Tarifs transparents", about_l3: "Local &amp; impliqué", about_l4: "Orienté résultats",
    about_cta: "Discuter de votre projet",
    why_eyebrow: "Pourquoi Choisir Digital Impression", why_title: "Les Entrepreneurs Nous <em>Choisissent</em>",
    why1_title: "Interlocuteur local", why1_body: "Une équipe locale qui vous comprend, vous et votre marché, sans fournisseur étranger anonyme.",
    why2_title: "Livraison rapide", why2_body: "Votre site en ligne en 10 à 14 jours, sans attente interminable.",
    why3_title: "Approche personnelle", why3_body: "Un interlocuteur dédié, du premier échange au lancement et au-delà.",
    price_eyebrow: "Tarifs", price_title: "Des Tarifs Simples Et <em>Transparents</em>", price_lead: "Pas de coûts cachés. Pas de surprises.",
    price_from: "à partir de", price_badge: "⭐ Le plus populaire",
    price_incl: "Inclus", price_ideal: "Idéal pour",
    price1_amount: "<span class=\"price__now\">€999</span><span class=\"price__old\">€1.200</span>",
    price2_amount: "<span class=\"price__now\">€1.249</span><span class=\"price__old\">€1.799</span>",
    price3_amount: "<span class=\"price__now\">€1.899</span><span class=\"price__old\">€2.499</span>",
    price1_sub: "Parfait pour les indépendants, les entreprises locales et les startups qui ont besoin d'une présence en ligne professionnelle.",
    price2_sub: "Conçu pour les entreprises qui veulent générer des leads et convertir les visiteurs en clients.",
    price3_sub: "Une solution e-commerce complète conçue pour maximiser les ventes en ligne.",
    b_incl1: "Design de site sur mesure", b_incl2: "Jusqu'à 3 pages", b_incl3: "Design responsive (mobile)", b_incl4: "Formulaire de contact", b_incl5: "Liens vers les réseaux sociaux",
    b_ideal1: "Restaurants", b_ideal2: "Consultants", b_ideal3: "Petites entreprises", b_ideal4: "Marques personnelles",
    p_incl1: "Tout de Website Basic", p_incl2: "Jusqu'à 5 pages", p_incl3: "Intégration newsletter", p_incl4: "Section blog/actualités", p_incl5: "Système de réservation ou de devis",
    p_ideal1: "Entreprises en croissance", p_ideal2: "Entreprises de services", p_ideal3: "Agences", p_ideal4: "Cabinets professionnels",
    s_incl1: "Tout de Website Premium", s_incl2: "Configuration de la boutique en ligne", s_incl3: "Jusqu'à 50 produits importés", s_incl4: "Intégration des paiements", s_incl5: "Panier et paiement",
    s_ideal1: "Marques de vêtements", s_ideal2: "Marques food &amp; boissons", s_ideal3: "Produits de beauté", s_ideal4: "Entreprises e-commerce",
    feat_pages: "Jusqu'à 5 pages", feat_responsive: "Design responsive (mobile)", feat_form: "Formulaire de contact",
    feat_seo: "Sécurité SSL", feat_online: "En ligne en 10 à 14 jours", feat_free: "Design de page d'accueil gratuit",
    cta_request: "Demander un devis", cta_contact: "Nous contacter",
    price_note: "Chaque projet inclut un design de page d'accueil gratuit, envoyé dans les 24 heures suivant votre demande, sans le moindre engagement.",
    faq_eyebrow: "Questions Fréquentes", faq_title: "Tout Ce Que Vous Voulez <em>Savoir</em>",
    faq_lead: "Pas de réponse ? <a href=\"#contact\" class=\"link-gold\">Posez votre question</a> et nous vous répondrons sous 24 heures.",
    faq_q1: "En combien de temps mon site sera-t-il en ligne ?",
    faq_a1: "La plupart des projets sont en ligne en 10 à 14 jours. Après votre demande, vous recevez un devis sur mesure et un design de page d'accueil gratuit sous 24 heures.",
    faq_q2: "Combien coûte exactement un site web ?",
    faq_a2: "Un site web professionnel démarre à 999 €. Le prix exact dépend de vos souhaits. Vous recevez toujours un devis transparent, sans coûts cachés ni surprises.",
    faq_q3: "Le design gratuit est-il vraiment sans engagement ?",
    faq_a3: "Absolument. Votre design de page d'accueil gratuit ne coûte rien et ne vous engage à rien. Pas d'acompte, pas d'engagement. Nous gagnons d'abord votre confiance.",
    faq_q4: "Puis-je mettre à jour mon site moi-même par la suite ?",
    faq_a4: "Oui. Nous construisons votre site pour que vous puissiez facilement gérer les textes et les images, et vous bénéficiez d'un interlocuteur dédié pour le support, même après le lancement.",
    faq_q5: "Gérez-vous aussi l'hébergement et le nom de domaine ?",
    faq_a5: "Bien sûr. Si vous le souhaitez, nous nous occupons de l'hébergement, du nom de domaine et de la configuration technique, pour que vous n'ayez à vous soucier de rien.",
    contact_eyebrow: "Démarrez Votre Projet Aujourd'hui", contact_title: "Créons Ensemble Quelque Chose De <em>Magnifique</em>",
    contact_lead: "Parlez-nous de votre projet et nous vous enverrons un devis sur mesure et un <span class=\"gold\">design de page d'accueil</span> gratuit sous 24 heures. Totalement sans engagement.",
    contact_pt1: "Devis sur mesure + design gratuit sous 24 heures",
    contact_pt2: "Pas d'acompte, vous ne payez que lorsque vous êtes 100 % satisfait",
    f_naam: "Nom", f_naam_ph: "Votre nom", f_bedrijf: "Nom de l'entreprise", f_bedrijf_ph: "Votre entreprise",
    f_email: "E-mail", f_email_ph: "vous@entreprise.be", f_tel: "Numéro de téléphone",
    f_bericht: "Message", f_bericht_ph: "Comment pouvons-nous vous aider ?",
    f_type: "Type de site web", f_select: "Sélectionnez...",
    f_opt1: "Site web d'entreprise", f_opt2: "Landing page", f_opt3: "Boutique en ligne", f_opt4: "Refonte", f_opt5: "Autre",
    f_project: "Parlez-nous de votre projet", f_project_ph: "Objectifs, exemples, délais...",
    f_found: "Comment nous avez-vous trouvés ?", f_found_ph: "Recommandation, réseaux sociaux, réseau...",
    f_submit: "Envoyer", f_fine: "En envoyant, vous acceptez une prise de contact sans engagement.",
    f_success_title: "Merci pour votre demande !",
    f_success_body: "Nous avons bien reçu votre message. Vous aurez de nos nouvelles sous 24 heures avec un devis sur mesure et votre design de page d'accueil gratuit.",
    f_again: "Envoyer une autre demande",
    footer_tagline: "Sites web premium pour entrepreneurs. Rapides, élégants et conçus pour attirer des clients.",
    footer_company: "Entreprise", footer_contact: "Contact",
    footer_stay: "Restez Informé", footer_stay_sub: "Conseils &amp; idées sur le webdesign pour entrepreneurs.",
    footer_rights: "© 2026 Digital Impression. Tous droits réservés.",
    footer_privacy: "Politique de confidentialité", footer_terms: "Conditions générales", about_c_title: "Ce que vous pouvez attendre de nous", why_v1a: "Peut-on encore modifier le texte ?", why_v1b: "Bien sûr. En ligne dans l'heure.", why_v1m: "Réponse sous 24h", why_v2a: "Jour 1 · Appel", why_v2b: "Jour 2 · Design", why_v2c: "Jour 14 · En ligne", why_v3a: "Prise de contact", why_v3b: "Design", why_v3c: "Vos retours", why_v3d: "En ligne", work_tag_credo: "Kiné &amp; performance", work_desc_credo: "Cabinet de rééducation et performance, moderne et rassurant.", swipe_hint: "Glissez pour voir plus →"
  };

  var I18N = { en: I18N_EN, fr: I18N_FR };
  var LANG_LABELS = { nl: "NL", en: "EN", fr: "FR" };

  function initI18n() {
    var nl = {};
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      nl[el.getAttribute("data-i18n")] = el.innerHTML;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      nl["__ph_" + el.getAttribute("data-i18n-ph")] = el.getAttribute("placeholder") || "";
    });
    nl.meta_title = document.title;
    var metaDesc = document.querySelector('meta[name="description"]');
    nl.meta_desc = metaDesc ? metaDesc.getAttribute("content") : "";

    function updateLangUI(lang) {
      var dl = document.getElementById("langLabel"); if (dl) dl.textContent = LANG_LABELS[lang] || "NL";
      document.querySelectorAll(".lang-menu__item, .lang-seg__btn").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
      });
    }

    function apply(lang, isToggle) {
      currentLang = lang;
      document.documentElement.lang = lang;
      var dict = I18N[lang]; // nl has no dict -> use captured DOM defaults
      document.querySelectorAll("[data-i18n]").forEach(function (el) {
        var k = el.getAttribute("data-i18n");
        var val = dict ? dict[k] : null;
        if (val == null) val = nl[k];
        if (val != null) el.innerHTML = val;
      });
      document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
        var k = el.getAttribute("data-i18n-ph");
        var val = dict ? dict[k] : null;
        if (val == null) val = nl["__ph_" + k];
        if (val != null) el.setAttribute("placeholder", val);
      });
      document.title = (dict && dict.meta_title) || nl.meta_title;
      if (metaDesc) metaDesc.setAttribute("content", (dict && dict.meta_desc) || nl.meta_desc);
      // already-counted stats: re-render with the right suffix
      document.querySelectorAll("[data-count].counted").forEach(function (el) {
        el.textContent = el.getAttribute("data-count") + sufOf(el);
      });
      updateLangUI(lang);
      try { localStorage.setItem("di_lang", lang); } catch (e) {}
      renderIcons();
    }

    var saved = "nl";
    try { saved = localStorage.getItem("di_lang") || "nl"; } catch (e) {}
    if (saved !== "nl" && I18N[saved]) apply(saved, false); else { currentLang = "nl"; updateLangUI("nl"); }

    // desktop dropdown open/close
    var sw = document.getElementById("langSwitch");
    var tog = document.getElementById("langToggle");
    if (sw && tog) {
      tog.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = sw.classList.toggle("is-open");
        tog.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.addEventListener("click", function (e) {
        if (!sw.contains(e.target)) { sw.classList.remove("is-open"); tog.setAttribute("aria-expanded", "false"); }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { sw.classList.remove("is-open"); tog.setAttribute("aria-expanded", "false"); }
      });
    }

    // language buttons: desktop menu items + mobile segmented control
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.addEventListener("click", function () {
        apply(b.getAttribute("data-lang"), true);
        if (sw) { sw.classList.remove("is-open"); if (tog) tog.setAttribute("aria-expanded", "false"); }
      });
    });
  }


  /* ---- Werkwijze: gold progress line follows the scroll ---- */
  function initTimelineProgress() {
    var tl = document.querySelector(".timeline"); if (!tl) return;
    var items = tl.querySelectorAll(".tl-item");
    function upd() {
      var r = tl.getBoundingClientRect(), vh = window.innerHeight, line = vh * 0.72;
      var p = Math.max(0, Math.min(1, (line - r.top) / r.height));
      tl.style.setProperty("--tl", p.toFixed(3));
      items.forEach(function (it) { it.classList.toggle("is-past", it.getBoundingClientRect().top < line); });
    }
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  /* ---- init ---- */
  function init() {
    renderIcons();
    initProgress();
    initHeader();
    initMobileMenu();
    initReveal();
    initI18n();
    initCountUp();
    initHeroCanvas();
    initCursor();
    initTilt();
    initTimelineProgress();
    initBeforeAfter();
    initFaq();
    initCarousel();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

  
