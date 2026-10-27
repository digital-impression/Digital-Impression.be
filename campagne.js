/* Digital Impression · campagne "Wij schenken één ondernemer een website" */
(function () {
  "use strict";
  var ENDPOINT = "https://formspree.io/f/xlgqkgbd";
  var DEADLINE = new Date("2026-11-04T23:59:59+01:00");
  var WINNER = new Date("2026-11-06T00:00:00+01:00");
  var SHARE_URL = "https://digital-impression.be/gratis-website";
  var SHARE_TEXT = "Digital Impression schenkt één ondernemer een nieuwe website. Kent u iemand die het verdient? Nomineren kan tot en met 4 november:";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ?nu=2026-11-25 laat de pagina zien zoals op die datum (om te testen)
  var offset = 0;
  try { var q = new URLSearchParams(location.search).get("nu"); if (q) { var d = new Date(q + (q.length <= 10 ? "T12:00:00+01:00" : "")); if (!isNaN(d)) offset = d - Date.now(); } } catch (e) {}
  var now = function () { return new Date(Date.now() + offset); };

  /* ---------- binnenkomen ---------- */
  var ready = function () { requestAnimationFrame(function () { html.classList.add("is-ready"); }); };
  if (document.fonts && document.fonts.ready) { Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 900); })]).then(ready); } else ready();

  /* ---------- header ---------- */
  var top = $("#gwTop");
  var onScroll = function () { top.classList.toggle("is-scrolled", window.scrollY > 30); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- fase en aftellen ---------- */
  var closed = false;
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var cnt = $("#gwCount"), cells = {};
  $$("[data-c]").forEach(function (b) { cells[b.getAttribute("data-c")] = b; });
  function setClosed() {
    closed = true;
    html.classList.add("is-closed");
    cnt.classList.add("is-closed");
    var after = now() >= WINNER;
    $("#gwCountK").textContent = after ? "De winnaar is getrokken" : "Nominaties gesloten · trekking op 5 november";
    var lab = $("[data-phase-label]"); if (lab) lab.textContent = after ? "Actie afgelopen · bedankt voor elke nominatie" : "Nominaties gesloten · trekking op 5 november";
    $("#gwForm").hidden = true; $("#gwOk").hidden = true; $("#gwClosed").hidden = false;
    if (after) $("[data-closed-text]").textContent = "Bedankt aan iedereen die een zaak voordroeg. De winnaar is getrokken en de nieuwe website is in de maak. Volg het verhaal op Instagram.";
  }
  function tick() {
    var ms = DEADLINE - now();
    if (ms <= 0) { if (!closed) setClosed(); return; }
    var s = Math.floor(ms / 1000);
    cells.d.textContent = pad(Math.floor(s / 86400)); cells.h.textContent = pad(Math.floor(s / 3600) % 24);
    cells.m.textContent = pad(Math.floor(s / 60) % 60); cells.s.textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  $$("#gwSteps .gw-step").forEach(function (st) {
    var from = new Date(st.getAttribute("data-from") + (st.getAttribute("data-from").length <= 10 ? "T00:00:00+01:00" : "")), to = new Date(st.getAttribute("data-to") + "+01:00"), n = now();
    st.classList.toggle("is-now", n >= from && n <= to);
    st.classList.toggle("is-past", n > to);
  });

  /* ---------- onthullen bij scrollen ---------- */
  if ("IntersectionObserver" in window && !REDUCED) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -12% 0px" });
    $$(".gw-rv").forEach(function (el) { io.observe(el); });
  } else { $$(".gw-rv").forEach(function (el) { el.classList.add("is-in"); }); }

  /* ---------- diepte in de hero ---------- */
  var art = $(".gw-hero__art");
  if (art && !REDUCED) {
    var floats = $$("[data-depth]", art), mx = 0, my = 0, sy = 0, raf = 0;
    var base = floats.map(function (f) { return getComputedStyle(f).transform === "none" ? "" : getComputedStyle(f).transform; });
    var draw = function () {
      raf = 0;
      floats.forEach(function (f, i) {
        var d = parseFloat(f.getAttribute("data-depth")) || 0.3;
        f.style.transform = "translate3d(" + (mx * d * 22).toFixed(2) + "px," + (my * d * 18 - sy * d * 0.12).toFixed(2) + "px,0) " + base[i];
      });
    };
    var ask = function () { if (!raf) raf = requestAnimationFrame(draw); };
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", function (e) { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; ask(); }, { passive: true });
    }
    window.addEventListener("scroll", function () { sy = Math.min(window.scrollY, window.innerHeight); ask(); }, { passive: true });
  }

  /* ---------- formulier ---------- */
  var form = $("#gwForm"), err = $("#gwErr"), btn = $("#gwSubmit"), ok = $("#gwOk"), mot = $("#f-motivatie"), chars = $("#gwChars");
  function role() { var r = $("input[name=rol]:checked", form); return r && r.value === "Mijn eigen zaak" ? "zelf" : "ander"; }
  function applyRole() {
    var r = role();
    $$("[data-only]").forEach(function (el) { el.hidden = el.getAttribute("data-only") !== r; });
  }
  $$("input[name=rol]", form).forEach(function (i) { i.addEventListener("change", applyRole); });
  applyRole();

  function countChars() {
    var n = mot.value.trim().length, left = 40 - n;
    chars.textContent = left > 0 ? "Nog minstens " + left + " teken" + (left === 1 ? "" : "s") : n + " tekens · top";
    chars.classList.toggle("is-ok", left <= 0);
  }
  mot.addEventListener("input", countChars); countChars();

  $$("input, textarea", form).forEach(function (el) {
    el.addEventListener("input", function () { var f = el.closest(".gw-field, .gw-check"); if (f) f.classList.remove("is-bad"); });
    el.addEventListener("change", function () { var f = el.closest(".gw-check"); if (f) f.classList.remove("is-bad"); });
  });

  function bad(id) { var el = $("#" + id); var f = el.closest(".gw-field, .gw-check"); if (f) f.classList.add("is-bad"); return el; }
  function showErr(msg, el) { err.textContent = msg; err.hidden = false; if (el) el.focus({ preventScroll: false }); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (closed) return;
    err.hidden = true;
    var v = function (id) { return ($("#" + id).value || "").trim(); };
    var first = null, need = ["f-zaak", "f-gemeente", "f-sector", "f-naam", "f-email"];
    need.forEach(function (id) { if (!v(id)) { var el = bad(id); first = first || el; } });
    if (v("f-motivatie").length < 40) { var m = bad("f-motivatie"); first = first || m; }
    if (first) return showErr("Vul a.u.b. alle velden met een * in. De motivatie telt minstens 40 tekens.", first);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("f-email"))) return showErr("Vul a.u.b. een geldig e-mailadres in.", bad("f-email"));
    if (!$("#f-akkoord").checked) return showErr("Vink a.u.b. aan dat u akkoord gaat met het reglement en het privacybeleid.", bad("f-akkoord"));

    var r = role(), data = {
      _subject: "Nominatie gratis website: " + v("f-zaak") + " (" + v("f-gemeente") + ")" + (r === "zelf" ? " · zelf" : ""),
      soort: "Nominatie gratis website",
      nominatie_door: r === "zelf" ? "De zaak zelf" : "Iemand anders",
      zaak: v("f-zaak"), gemeente: v("f-gemeente"), wat_doet_de_zaak: v("f-sector"), website_of_instagram: v("f-site"),
      motivatie: v("f-motivatie"),
      naam: v("f-naam"), email: v("f-email"), telefoon: v("f-tel"),
      motivatie_mag_gedeeld: $("input[name=motivatie_delen]", form).checked ? "ja" : "nee",
      akkoord_reglement: "ja"
    };
    if (r === "ander") {
      data.zaakvoerder = v("f-wie"); data.contact_zaak = v("f-contact");
      data.naam_mag_vermeld = $("input[name=naam_vermelden]", form).checked ? "ja" : "nee";
    }
    var label = btn.innerHTML; btn.disabled = true; btn.innerHTML = "<span>Verzenden…</span>";
    fetch(ENDPOINT, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (res) { if (!res.ok) throw new Error("status " + res.status); success(); })
      .catch(function () { showErr("Er ging iets mis bij het verzenden. Probeer het opnieuw, of mail uw nominatie naar info@digital-impression.be."); })
      .then(function () { btn.disabled = false; btn.innerHTML = label; });
  });

  function success() {
    form.hidden = true; ok.hidden = false;
    ok.focus({ preventScroll: true });
    var box = ok.closest(".gw-form-box"); if (box) box.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "center" });
  }
  $("#gwAgain").addEventListener("click", function () {
    form.reset(); applyRole(); countChars(); ok.hidden = true; form.hidden = false; $("#f-zaak").focus();
  });

  /* ---------- delen ---------- */
  var enc = encodeURIComponent;
  $("#gwShareWa").href = "https://wa.me/?text=" + enc(SHARE_TEXT + " " + SHARE_URL);
  $("#gwShareFb").href = "https://www.facebook.com/sharer/sharer.php?u=" + enc(SHARE_URL);
  $("#gwShareLi").href = "https://www.linkedin.com/sharing/share-offsite/?url=" + enc(SHARE_URL);
  var nat = $("#gwShareNative");
  if (navigator.share) {
    nat.hidden = false;
    nat.addEventListener("click", function () { navigator.share({ title: "Wij schenken één ondernemer een nieuwe website", text: SHARE_TEXT, url: SHARE_URL }).catch(function () {}); });
  }
  $("#gwCopy").addEventListener("click", function () {
    var b = this, done = function () { b.textContent = "Gekopieerd"; setTimeout(function () { b.textContent = "Kopieer link"; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(SHARE_URL).then(done, function () { prompt("Kopieer de link:", SHARE_URL); });
    else prompt("Kopieer de link:", SHARE_URL);
  });

  /* ---------- knop onderaan op gsm ---------- */
  var dock = $("#gwDock"), hero = $(".gw-hero"), nom = $("#nomineer");
  function dockTick() {
    if (!dock) return;
    var past = window.scrollY > hero.offsetHeight * 0.7;
    var r = nom.getBoundingClientRect(), inForm = r.top < window.innerHeight * 0.9 && r.bottom > 0; var en = $(".gw-end").getBoundingClientRect(); if (en.top < window.innerHeight * 0.9) inForm = true;
    dock.classList.toggle("is-on", past && !inForm && !closed);
  }
  window.addEventListener("scroll", dockTick, { passive: true }); window.addEventListener("resize", dockTick); dockTick();
})();
