(function(){
  "use strict";
  if(window.__fieldfluxInvestorStatus)return;
  window.__fieldfluxInvestorStatus=true;
  if((location.pathname.split("/").pop()||"index.html")!=="investors.html")return;

  if(!document.querySelector('link[data-fieldflux-investor-status]')){
    var style=document.createElement("link");
    style.rel="stylesheet";
    style.href="assets/css/fieldflux-investor-status.css?v=1";
    style.dataset.fieldfluxInvestorStatus="true";
    document.head.appendChild(style);
  }

  function q(s,c){return(c||document).querySelector(s);}
  function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function afterGenerated(selector,fn){var tries=0;(function wait(){var el=q(selector);if(el){fn(el);return;}if(++tries<160)setTimeout(wait,50);})();}

  function build(){
    var page=q(".ffx-page"),hero=q(".ffx-pagehero",page),risk=q(".ffx-risk",page);
    if(!page||!hero||!risk||q(".ffx-investor-status",page))return;

    var heroTitle=q("h1",hero),heroLede=q(".lede",hero);
    if(heroTitle)heroTitle.innerHTML='Built foundations. Active products. A <em>long evidence horizon.</em>';
    if(heroLede)heroLede.textContent="Fieldflux has completed the formal foundation and measurement architecture, with Membrane Health at release stage. DRTT 2.0 is in-house alpha testing now, Rev B is the focus of the current capital raise, hospital bedside QPCI has a 36-month development horizon, and empirical authority accumulates through studies, pilots, and trials over the coming decade.";

    var section=document.createElement("section");
    section.className="ffx-investor-status";
    section.innerHTML='<div class="wrap"><div class="ffx-investor-status__intro ffx-reveal is-in"><p class="eyebrow">Development status</p><h2 class="h-section">What is built. What is active. What comes next.</h2><p class="lede">The program spans several horizons at once. The formal foundation is in place. Membrane Health carries that foundation into a release-stage consumer application. DRTT 2.0 is moving through product testing, Rev B is the immediate hardware financing target, bedside QPCI is a 36-month development program, and empirical authority grows through a continuing research and clinical evidence program.</p><div class="ffx-investor-status__legend"><span>Built</span><span>Release stage</span><span>Testing now</span><span>Current raise</span><span>36 months</span><span>Decade-scale evidence</span></div></div><div class="ffx-investor-roadmap"><article data-state="built"><span class="ffx-investor-roadmap__state">Built</span><h3>Formal foundation + measurement architecture</h3><p>The positive health definition, machine-checked formal system, measurement contracts, packet semantics, distributed topology architecture, and evidence-authority logic form the existing foundation.</p><strong>Completed foundation · actively expanding</strong></article><article data-state="release"><span class="ffx-investor-roadmap__state">Release stage</span><h3>Membrane Health</h3><p>The consumer application brings the formal health structure into everyday Apple Health measurements, personal calibration, four physiological manifolds, longitudinal state, and defined interfaces for deeper evidence when available.</p><strong>Consumer application · release stage</strong></article><article data-state="now"><span class="ffx-investor-roadmap__state">Testing now</span><h3>DRTT 2.0</h3><p>Distributed Real-Time Topology is in-house alpha testing now, exercising the current site, route, timing, coherence, laminarity, recovery, drift, entrainment, and packet-provenance architecture.</p><strong>Closed beta scheduled · Q2 2027</strong></article><article data-state="now"><span class="ffx-investor-roadmap__state">Current raise</span><h3>Rev B Boundary Witness Instrument</h3><p>Rev B is the immediate capital target: source-witnessed, battery-isolated multi-node hardware designed to close the measurement into calibrated physical units and portable research use.</p><strong>Capital → build · verify · calibrate</strong></article><article data-state="next"><span class="ffx-investor-roadmap__state">36-month horizon</span><h3>Hospital bedside QPCI</h3><p>The bedside system carries the same measurement architecture into a hospital instrument with the sensing depth, calibration, workflow, reliability, and evidence infrastructure required for bedside research and clinical translation.</p><strong>Development target · 36 months</strong></article><article data-state="long"><span class="ffx-investor-roadmap__state">Underway + ongoing</span><h3>Empirical authority</h3><p>Studies, pilots, and trials are already beginning the empirical program. Each program adds calibrated evidence, repeatability, physiological interpretation, and eventually the authority required for progressively stronger research and clinical claims.</p><strong>Evidence program · now through the next decade</strong></article></div><div class="ffx-investor-now"><span>Current financing frontier</span><strong><b>Rev B</b> is the immediate capital raise. Membrane Health is at release stage, DRTT 2.0 continues in-house alpha toward a Q2 2027 closed beta, and the broader empirical program proceeds in parallel.</strong></div></div>';
    hero.insertAdjacentElement("afterend",section);

    var riskEyebrow=q(".ffx-risk .sec-head .eyebrow",page),riskTitle=q(".ffx-risk .sec-head .h-section",page),riskLede=q(".ffx-risk .sec-head .lede",page);
    if(riskEyebrow)riskEyebrow.textContent="How the work compounds";
    if(riskTitle)riskTitle.textContent="Each layer carries a different part of the risk.";
    if(riskLede)riskLede.textContent="The development-status map above gives the current timeline. The sequence below shows what each layer contributes to the company and why later stages build on earlier ones.";

    qa(".ffx-riskstep",page).forEach(function(step){
      var title=(q("h3",step)||{}).textContent||"",kicker=q(".kicker",step),body=q("p:last-child",step);
      if(title==="Consumer implementation"){
        if(kicker)kicker.textContent="Release stage";
        if(body)body.textContent="Membrane Health carries the formal health structure into a consumer Apple Health application with personal calibration, four physiological manifolds, longitudinal state, and traceable evidence interfaces.";
      }
      if(title==="Research instrument"){
        if(kicker)kicker.textContent="In-house alpha · closed beta Q2 2027";
        if(body)body.textContent="DRTT 2.0 is in-house alpha testing now. Its next scheduled product milestone is closed beta in Q2 2027, carrying the current distributed topology, timing, route, laminarity, and provenance architecture into a controlled external cohort.";
      }
      if(title==="Source-witnessed hardware"){
        if(kicker)kicker.textContent="Current capital raise";
        if(body)body.textContent="Rev B is the immediate financing target: direct source witness, calibrated fixtures, multi-node acquisition, physical units, repeatability testing, and the hardware base for the next translational phase.";
      }
      if(title==="Empirical authority"){
        if(kicker)kicker.textContent="Underway · decade-scale program";
        if(body)body.textContent="Studies, pilots, and trials are underway and continue across the coming decade. Each program adds the empirical evidence required to expand physiological interpretation, translational utility, and eventual clinical claim authority.";
      }
    });

    var capital=q(".ffx-capital",page);
    if(capital){
      var eye=q(".eyebrow",capital),title=q(".h-section",capital),lede=q(".lede",capital);
      if(eye)eye.textContent="Current raise";
      if(title)title.textContent="Capital closes Rev B and advances the next evidence layer.";
      if(lede)lede.textContent="The current raise centers on Rev B build and verification, followed by repeatability and sensitivity work, prospective calibration, pilot readiness, evidence infrastructure, and the manufacturing path.";
    }
  }

  afterGenerated(".ffx-risk",build);
})();
