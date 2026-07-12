/* Fieldflux Biosystems — site interactions. Minimal, dependency-free.
   1) Light/dark toggle (light is the institutional default), persisted.
   2) Reveal-on-scroll (honors prefers-reduced-motion). */
(function () {
  "use strict";

  /* Light-only, institutional. Clear any stale dark-mode state from earlier builds
     so a returning visitor never sees the crest on a dark ground. */
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

  /* Lightbox — click a data figure to view it larger. */
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

  /* Contact form → composes an email (works with no backend). */
  function initContactForm() {
    var f = document.querySelector("[data-contact-form]");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = f.getAttribute("data-to") || "support@fieldfluxbiosystems.com";
      var g = function (n) { var el = f.elements[n]; return el ? (el.value || "").trim() : ""; };
      var name = g("fullname"), email = g("email"), org = g("org"), topic = g("topic"), msg = g("message");
      if (!name || !email || !msg) {
        note(f, "Please add your name, email, and a message.");
        return;
      }
      var subject = "Fieldflux enquiry — " + (topic || "General") + (name ? " — " + name : "");
      var body = "Name: " + name + "\nEmail: " + email +
        (org ? "\nOrganization: " + org : "") + "\nTopic: " + topic + "\n\n" + msg;
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      note(f, "Opening your email app… if nothing happens, write to " + to + ".");
    });
  }

  /* Newsletter → POST to a Cloudflare Worker that subscribes via the Buttondown
     API server-side (bypasses Buttondown's CAPTCHA, hides the key, returns JSON).
     A signup lands on the list directly — it never routes to a human inbox. */
  function initNewsletter() {
    document.querySelectorAll("[data-newsletter-form]").forEach(function (f) {
      var sent = false;
      f.addEventListener("submit", function (e) {
        e.preventDefault();

        /* Honeypot: a bot fills this; feign success and send nothing. */
        var hp = f.querySelector("[name='hp_url']");
        if (hp && hp.value) { note(f, "Thanks — check your inbox to confirm."); f.reset(); return; }

        var el = f.elements["email"];
        var email = el ? (el.value || "").trim() : "";
        if (!email) return;

        var endpoint = (f.getAttribute("data-endpoint") || "").trim();
        if (!endpoint) {
          note(f, "Signups aren’t wired up yet — please write to contact@fieldfluxbiosystems.com.");
          return;
        }
        if (sent) return;
        sent = true;

        var btn = f.querySelector('button[type="submit"]');
        var label = btn ? btn.textContent : "";
        if (btn) { btn.disabled = true; btn.textContent = "Adding you…"; }
        function reset() { sent = false; if (btn) { btn.disabled = false; btn.textContent = label; } }

        /* form-encoded keeps this a "simple" request — no CORS preflight. */
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ email: email })
        })
          .then(function (r) { return r.json().catch(function () { return {}; }); })
          .then(function (data) {
            if (data && data.ok) { note(f, "Thanks — check your inbox to confirm."); f.reset(); reset(); }
            else { reset(); note(f, "Hmm — that didn’t go through. Try again, or a different email."); }
          })
          .catch(function () {
            reset();
            note(f, "Couldn’t reach the server — check your connection and try again.");
          });
      });
    });
    /* "Follow the research" buttons elsewhere → jump to the signup. */
    document.querySelectorAll("[data-newsletter]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = "contact.html#follow";
      });
    });
  }

  function note(f, msg) {
    var n = f.querySelector("[data-form-note]");
    if (n) { n.textContent = msg; n.hidden = false; }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initLightbox();
    initContactForm();
    initNewsletter();
  });
})();
