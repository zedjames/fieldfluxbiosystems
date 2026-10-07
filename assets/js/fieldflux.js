/* Fieldflux Biosystems — site interactions. Minimal, dependency-free. */
(function () {
  "use strict";

  try {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("fieldflux-theme");
  } catch (e) {}

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function initLightbox() {
    var imgs = document.querySelectorAll(".figure--data img");
    if (!imgs.length) return;
    var ov = document.createElement("div");
    ov.className = "lightbox";
    ov.setAttribute("aria-hidden", "true");
    ov.innerHTML = '<button class="lightbox__close" aria-label="Close">×</button><img alt="">';
    document.body.appendChild(ov);
    var big = ov.querySelector("img");
    function open(src, alt) {
      big.src = src; big.alt = alt || "";
      ov.classList.add("is-open"); ov.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
    }
    function close() {
      ov.classList.remove("is-open"); ov.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
    }
    imgs.forEach(function (im) {
      im.setAttribute("tabindex", "0"); im.setAttribute("role", "button");
      im.addEventListener("click", function () { open(im.currentSrc || im.src, im.alt); });
      im.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(im.currentSrc || im.src, im.alt); }
      });
    });
    ov.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  function initContactForm() {
    var f = document.querySelector("[data-contact-form]");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = f.getAttribute("data-to") || "support@fieldfluxbiosystems.com";
      var g = function (n) { var el = f.elements[n]; return el ? (el.value || "").trim() : ""; };
      var name = g("fullname"), email = g("email"), org = g("org"), topic = g("topic"), msg = g("message");
      if (!name || !email || !msg) { note(f, "Please add your name, email, and a message."); return; }
      var subject = "Fieldflux enquiry — " + (topic || "General") + (name ? " — " + name : "");
      var body = "Name: " + name + "\nEmail: " + email + (org ? "\nOrganization: " + org : "") + "\nTopic: " + topic + "\n\n" + msg;
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      note(f, "Opening your email app… if nothing happens, write to " + to + ".");
    });
  }

  function initNewsletter() {
    document.querySelectorAll("[data-newsletter-form]").forEach(function (f) {
      var sent = false;
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var hp = f.querySelector("[name='hp_url']");
        if (hp && hp.value) { note(f, "Thanks — check your inbox to confirm."); f.reset(); return; }
        var el = f.elements["email"];
        var email = el ? (el.value || "").trim() : "";
        if (!email) return;
        var endpoint = (f.getAttribute("data-endpoint") || "").trim();
        if (!endpoint) { note(f, "Signups aren’t wired up yet — please write to contact@fieldfluxbiosystems.com."); return; }
        if (sent) return;
        sent = true;
        var btn = f.querySelector('button[type="submit"]');
        var label = btn ? btn.textContent : "";
        if (btn) { btn.disabled = true; btn.textContent = "Adding you…"; }
        function reset() { sent = false; if (btn) { btn.disabled = false; btn.textContent = label; } }
        fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ email: email }) })
          .then(function (r) { return r.json().catch(function () { return {}; }); })
          .then(function (data) {
            if (data && data.ok) { note(f, "Thanks — check your inbox to confirm."); f.reset(); reset(); }
            else { reset(); note(f, "Hmm — that didn’t go through. Try again, or a different email."); }
          })
          .catch(function () { reset(); note(f, "Couldn’t reach the server — check your connection and try again."); });
      });
    });
    document.querySelectorAll("[data-newsletter]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); window.location.href = "contact.html#follow"; });
    });
  }

  function note(f, msg) {
    var n = f.querySelector("[data-form-note]");
    if (n) { n.textContent = msg; n.hidden = false; }
  }

  function loadPolishStyle() {
    if (document.querySelector('link[data-fieldflux-legacy-polish]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "assets/css/fieldflux-legacy-polish.css?v=1";
    l.dataset.fieldfluxLegacyPolish = "true";
    document.head.appendChild(l);
  }

  function loadDimension() {
    if (!document.querySelector('link[data-fieldflux-dimension]')) {
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "assets/css/fieldflux-dimension.css?v=1";
      l.dataset.fieldfluxDimension = "true";
      document.head.appendChild(l);
    }
    if (document.querySelector('script[data-fieldflux-dimension]')) return;
    var d = document.createElement("script");
    d.src = "assets/js/fieldflux-dimension.js?v=1";
    d.async = false;
    d.dataset.fieldfluxDimension = "true";
    document.body.appendChild(d);
  }

  function loadCinema() {
    if (!document.querySelector('link[data-fieldflux-cinema]')) {
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "assets/css/fieldflux-cinema.css?v=1";
      l.dataset.fieldfluxCinema = "true";
      document.head.appendChild(l);
    }
    var existing = document.querySelector('script[data-fieldflux-cinema]');
    if (existing) {
      if (window.__fieldfluxCinema) loadDimension();
      else existing.addEventListener("load", loadDimension, { once:true });
      return;
    }
    var c = document.createElement("script");
    c.src = "assets/js/fieldflux-cinema.js?v=1";
    c.async = false;
    c.dataset.fieldfluxCinema = "true";
    c.addEventListener("load", loadDimension, { once:true });
    document.body.appendChild(c);
  }

  function loadPass3() {
    var existing = document.querySelector('script[data-fieldflux-pass3]');
    if (existing) {
      if (window.__fieldfluxPass3) loadCinema();
      else existing.addEventListener("load", loadCinema, { once:true });
      return;
    }
    var p3 = document.createElement("script");
    p3.src = "assets/js/fieldflux-pass3.js?v=2";
    p3.async = false;
    p3.dataset.fieldfluxPass3 = "true";
    p3.addEventListener("load", loadCinema, { once:true });
    document.body.appendChild(p3);
  }

  function loadPass2Overrides() {
    if (document.querySelector('link[data-fieldflux-pass2-overrides]')) { loadPass3(); return; }
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "assets/css/fieldflux-pass2-overrides.css?v=1";
    l.dataset.fieldfluxPass2Overrides = "true";
    document.head.appendChild(l);
    loadPass3();
  }

  function loadPass2() {
    if (document.querySelector('script[data-fieldflux-pass2]')) { loadPass2Overrides(); return; }
    var p = document.createElement("script");
    p.src = "assets/js/fieldflux-pass2.js?v=2";
    p.async = false;
    p.dataset.fieldfluxPass2 = "true";
    p.addEventListener("load", loadPass2Overrides, { once:true });
    document.body.appendChild(p);
  }

  function loadResearchAtlas() {
    if (document.querySelector('script[data-research-atlas]')) return;
    var a = document.createElement("script");
    a.src = "assets/js/research-atlas.js?v=5";
    a.async = false;
    a.dataset.researchAtlas = "true";
    document.body.appendChild(a);
  }

  function loadExperientialLayer() {
    var existing = document.querySelector('script[data-fieldflux-next]');
    if (existing) {
      if (window.__fieldfluxExperientialNext) loadPass2();
      else existing.addEventListener("load", loadPass2, { once:true });
      return;
    }
    var s = document.createElement("script");
    s.src = "assets/js/fieldflux-next.js?v=7";
    s.async = false;
    s.dataset.fieldfluxNext = "true";
    s.addEventListener("load", loadPass2, { once:true });
    document.body.appendChild(s);
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadPolishStyle();
    initReveal();
    initLightbox();
    initContactForm();
    initNewsletter();
    loadExperientialLayer();
    loadResearchAtlas();
  });
})();


/* Retain historical records while showing the canonical ILC scholarly destination. */
(function(){
  var base="https://zedjames.github.io/institute-lux-consilio/";
  var historical={"question-behind-our-research.html":{"id":"note-question","type":"notebook"},"boundary-comes-first.html":{"id":"note-boundary","type":"notebook"},"fixedness.html":{"id":"note-fixedness","type":"notebook"},"algebra-before-ai.html":{"id":"note-algebra-ai","type":"notebook"},"living-boundary.html":{"id":"note-living-boundary","type":"notebook"},"residue-and-residual.html":{"id":"note-residual","type":"notebook"},"one-plus-one.html":{"id":"note-one-plus-one","type":"notebook"},"what-is-new.html":{"id":"note-what-new","type":"notebook"},"certification-algebra.html":{"id":"note-certification","type":"notebook"},"temperament.html":{"id":"note-temperament","type":"notebook"},"making-of-an-observable.html":{"id":"note-observable","type":"notebook"},"make-the-signal-fail.html":{"id":"note-failure","type":"notebook"},"research-continuation-anatomy-navier-stokes.html":{"id":"ns1","type":"publications","series":"navier-stokes"},"research-critical-regularity-navier-stokes.html":{"id":"ns2","type":"publications","series":"navier-stokes"},"research-endpoint-rigidity-periodic-navier-stokes-flow.html":{"id":"ns3","type":"publications","series":"navier-stokes"},"research-critical-schwarzschild-scalar-dynamics.html":{"id":"sqg1","type":"publications","series":"schwarzschild-qg"},"research-friedrichs-selected-schwarzschild-quantum-dynamics.html":{"id":"sqg2","type":"publications","series":"schwarzschild-qg"},"research-friedrichs-selected-schwarzschild-quantum-matter.html":{"id":"sqg3","type":"publications","series":"schwarzschild-qg"},"research-self-consistent-einstein-scalar-quantum-sector.html":{"id":"sqg4","type":"publications","series":"schwarzschild-qg"},"research-master-action-ownership-self-consistent-einstein-scalar-quantum-sector.html":{"id":"sqg5","type":"publications","series":"schwarzschild-qg"},"research-quantum-gauge-structure-self-consistent-einstein-scalar-sector.html":{"id":"sqg6","type":"publications","series":"schwarzschild-qg"},"research-regulated-palatini-bv-quantization-self-consistent-einstein-scalar-sector.html":{"id":"sqg7","type":"publications","series":"schwarzschild-qg"},"research-relational-quantum-gravity-self-consistent-einstein-scalar-sector.html":{"id":"sqg8","type":"publications","series":"schwarzschild-qg"},"research-closed-matter-current-gaussian-physical-moduli.html":{"id":"gps1","type":"publications","series":"gaussian"},"research-pair-generated-completion-gaussian-physical-states.html":{"id":"gps2","type":"publications","series":"gaussian"},"research-from-pair-generated-fock-structure-to-physical-particle-semantics.html":{"id":"gps3","type":"publications","series":"gaussian"},"research-gaussian-pair-geometry-physical-radiative-response.html":{"id":"gps4","type":"publications","series":"gaussian"},"research-source-aware-weyl-reduced-celestial-representation.html":{"id":"gps5","type":"publications","series":"gaussian"},"research-physical-celestial-clebsch-gordan-transform-radiative-bose-pair.html":{"id":"gps6","type":"publications","series":"gaussian"},"research-relational-anatomy-cell-fate.html":{"id":"bio1","type":"publications","series":"relational-biology"},"research-relational-organization-directional-stability-mouse-organogenesis.html":{"id":"bio2","type":"publications","series":"relational-biology"},"research-present-state-resolution-lineage-history-early-mouse-embryogenesis.html":{"id":"bio3","type":"publications","series":"relational-biology"},"research-constitutive-continuation-capacity.html":{"id":"hfd1","type":"publications","series":"health-formally-defined"},"research-prospective-health-across-contexts.html":{"id":"hfd2","type":"publications","series":"health-formally-defined"}};
  var series={"research-series-health-formally-defined.html":"research-health-formally-defined.html","research-series-relational-systems-biology.html":"research-relational-morphogenesis.html","research-series-gaussian.html":"research-gaussian-celestial.html","research-series-schwarzschild-quantum-gravity.html":"research-relational-quantum-gravity.html","research-series-navier-stokes.html":"research-navier-stokes.html"};
  function init(){
    var path=(location.pathname.split("/").pop()||"").toLowerCase();
    var isPaper=historical[path]&&historical[path].type==="publications";
    var isNote=historical[path]&&historical[path].type==="notebook";
    var isSeries=!!series[path];
    var isTheme=/^research-theme-.*\.html$/.test(path);
    if(!(isPaper||isNote||isSeries||isTheme))return;
    var header=document.querySelector("header.nav");
    if(!header||document.querySelector(".research-provenance-link"))return;
    var css=document.createElement("link");css.rel="stylesheet";css.href="assets/css/institutional-bridge.css?v=1";document.head.appendChild(css);
    var href=isSeries?base+series[path]:isPaper?base+"publication.html?id="+encodeURIComponent(historical[path].id):isNote?base+"note.html?id="+encodeURIComponent(historical[path].id):base+"research.html";
    var section=document.createElement("aside");section.className="research-provenance-link";
    section.setAttribute("aria-label","Scientific research archive");
    var wrap=document.createElement("div");wrap.className="wrap";
    var label=document.createElement("strong");label.textContent=isPaper?"Historical publication record":isNote?"Original research note":isSeries?"Research series": "Research theme";
    var msg=document.createElement("span");msg.textContent=isPaper?"Explore its scientific program and surrounding publications at Institute Lux Consilio.":isNote?"Explore the complete institute research notebook.":"Explore the complete scientific program at Institute Lux Consilio.";
    var link=document.createElement("a");link.href=href;link.textContent="View at ILC ↗";link.rel="noopener";
    wrap.appendChild(label);wrap.appendChild(msg);wrap.appendChild(link);section.appendChild(wrap);
    header.insertAdjacentElement("afterend",section);
    var navs=document.querySelectorAll('a[href="research-atlas.html"],a[href="research.html"]');
    navs.forEach(function(a){if(a.closest("nav.nav__links")&&a.textContent.trim()==="Research")a.textContent="Research foundations";});
    document.querySelectorAll(".footer__col a").forEach(function(a){
      if(a.getAttribute("href")==="research-atlas.html")a.textContent="Technology & science map";
      if(a.getAttribute("href")==="research.html")a.textContent="Research foundations";
      if(a.getAttribute("href")==="notebook.html")a.textContent="Engineering notebook";
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
