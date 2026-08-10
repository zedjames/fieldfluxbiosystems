(function(){
  "use strict";

  if(window.__fieldfluxPass3)return;
  window.__fieldfluxPass3=true;

  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function q(s,c){return (c||document).querySelector(s);}
  function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function page(){var p=location.pathname.split("/").pop();return p||"index.html";}

  function loadStyle(){
    if(q('link[data-fieldflux-pass3]'))return;
    var l=document.createElement("link");
    l.rel="stylesheet";
    l.href="assets/css/fieldflux-pass3.css?v=1";
    l.dataset.fieldfluxPass3="true";
    document.head.appendChild(l);
  }
  loadStyle();

  function afterGenerated(selector,fn){
    var attempts=0;
    (function wait(){
      var el=q(selector);
      if(el){fn(el);return;}
      attempts++;
      if(attempts<140)setTimeout(wait,50);
    })();
  }

  function observeOne(el,threshold,fn){
    if(!el)return;
    if(reduce||!("IntersectionObserver" in window)){fn(el);return;}
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting){fn(e.target);io.unobserve(e.target);}});
    },{threshold:threshold||.25,rootMargin:"0px 0px -8% 0px"});
    io.observe(el);
  }

  function initHomeContinuity(){
    var stage=q(".ffx-chain__stage");
    if(!stage||q(".ffx-continuity",stage))return;

    var bar=document.createElement("div");
    bar.className="ffx-continuity";
    bar.innerHTML='<span class="ffx-continuity__label">object continuity</span><div class="ffx-continuity__invariants"><i></i><b>boundary</b><i></i><b>relation</b><i></i><b>identity</b></div><div class="ffx-continuity__carry"><span>carried forward</span><strong></strong></div>';
    stage.appendChild(bar);

    var carry=["the bounded whole is declared","the same whole is constrained","the same structure is verified","the verified object is physically interpreted","the instrument is built around the same question","the world answers that same question","only supported parts of the original claim survive"];
    var last=-1;
    (function sync(){
      var counter=q(".ffx-chain__meter span:first-child",stage);
      var idx=counter?clamp((parseInt(counter.textContent,10)||1)-1,0,6):0;
      if(idx!==last){
        last=idx;
        q(".ffx-continuity__carry strong",bar).textContent=carry[idx];
        bar.style.setProperty("--continuity-progress",String(idx/6));
        qa(".ffx-continuity__invariants i",bar).forEach(function(dot){
          dot.classList.remove("is-pulse");void dot.offsetWidth;dot.classList.add("is-pulse");
        });
      }
      requestAnimationFrame(sync);
    })();
  }

  function initScienceContinuity(){
    var track=q(".ffx-science-track");
    if(!track||track.dataset.pass3)return;
    track.dataset.pass3="true";
    var steps=qa(".ffx-science-step",track);
    if(steps.length<6)return;

    var boundary=q(".ffx-truth-boundary");
    if(boundary){
      steps[4].insertAdjacentElement("afterend",boundary);
      boundary.classList.add("ffx-truth-boundary--empirical");
      boundary.innerHTML='<div class="ffx-truth-boundary__formal"><span>FORMAL + PHYSICAL PROPOSAL</span><strong>the question is fully formed</strong><small>ontology, proof, physical interpretation, and engineering can all be coherent while nature still remains unanswered</small><i></i></div><div class="ffx-truth-boundary__gap"><b>THE EMPIRICAL THRESHOLD</b><span></span><em>engineering can ask</em><em>only measurement can answer</em></div><div class="ffx-truth-boundary__nature"><span>NATURE</span><strong>returns evidence</strong><small>the observed world can agree, disagree, weaken the claim, or leave it unresolved</small><i></i></div>';
      boundary.classList.remove("is-in");
      observeOne(boundary,.3,function(el){el.classList.add("is-in");});
    }

    if(!q(".ffx-interpretive-bridge",track)){
      var bridge=document.createElement("div");
      bridge.className="ffx-interpretive-bridge";
      bridge.innerHTML='<span>formal closure achieved</span><i></i><strong>physical interpretation begins</strong><small>The formal object remains intact; the question changes from internal consequence to proposed physical meaning.</small>';
      steps[2].insertAdjacentElement("afterend",bridge);
    }

    var claim=document.createElement("aside");
    claim.className="ffx-science-claim";
    claim.innerHTML='<span>one persistent claim</span><blockquote>A bounded aggregate can preserve itself through regulated relation under change.</blockquote><div class="ffx-science-claim__state"><b>ONTOLOGY</b><i></i><strong>meaning declared</strong></div>';
    track.insertAdjacentElement("beforebegin",claim);

    var states=[
      ["ONTOLOGY","meaning declared"],
      ["FORMALIZATION","meaning encoded"],
      ["VERIFICATION","consequences certified"],
      ["PHYSICS","physical interpretation proposed"],
      ["ENGINEERING","interrogator constructed"],
      ["EMPIRICAL VALIDATION","nature answers"]
    ];
    var current=-1;
    function activate(idx){
      idx=clamp(idx,0,states.length-1);
      if(idx===current)return;
      current=idx;
      q(".ffx-science-claim__state b",claim).textContent=states[idx][0];
      q(".ffx-science-claim__state strong",claim).textContent=states[idx][1];
      claim.style.setProperty("--science-progress",String(idx/(states.length-1)));
      steps.forEach(function(s,i){s.classList.toggle("is-claim-current",i===idx);s.classList.toggle("is-claim-past",i<idx);});
    }
    var io=new IntersectionObserver(function(entries){
      var visible=entries.filter(function(e){return e.isIntersecting;}).sort(function(a,b){return b.intersectionRatio-a.intersectionRatio;});
      if(visible.length)activate(steps.indexOf(visible[0].target));
    },{threshold:[.22,.4,.6],rootMargin:"-18% 0px -34% 0px"});
    steps.forEach(function(s){io.observe(s);});
    activate(0);
  }

  var FAMILY_COPY={
    Timing:["lead · lag · sequence","Who moves first, who follows, and how much timing burden separates registered parts of the field."],
    Coherence:["mutual organization","Whether timing relationships remain stable and structurally coordinated across windows and edges."],
    Laminarity:["ordered transport","Whether relational movement stays route-consistent and flowing or requires repeated correction."],
    Recovery:["return after challenge","How the distributed state moves back toward an organized reference after disturbance."],
    Drift:["history-relative movement","How the retained field migrates through time without erasing the states that came before it."],
    Entrainment:["selective alignment","How parts of the field align with repeated external forcing, and where that alignment does not occur."]
  };

  function initPlatformConsequence(){
    var stage=q(".ffx-measurement__stage");
    if(!stage||stage.dataset.pass3)return;
    stage.dataset.pass3="true";

    var familyRing=q(".ffx-familyring",stage)||q(".ffx-familyring");
    if(familyRing&&!q(".ffx-family-readout",stage)){
      var readout=document.createElement("div");
      readout.className="ffx-family-readout";
      readout.innerHTML='<span>family lens</span><strong>Timing</strong><b>lead · lag · sequence</b><p>'+FAMILY_COPY.Timing[1]+'</p>';
      stage.appendChild(readout);
      function updateFamily(name){
        var data=FAMILY_COPY[name]||FAMILY_COPY.Timing;
        q("strong",readout).textContent=name;
        q("b",readout).textContent=data[0];
        q("p",readout).textContent=data[1];
      }
      qa("span",familyRing).forEach(function(el){
        el.addEventListener("click",function(){updateFamily(el.dataset.family||el.textContent.trim());});
        el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" ")updateFamily(el.dataset.family||el.textContent.trim());});
      });
      var mo=new MutationObserver(function(){var selected=q("span.is-selected",familyRing);if(selected)updateFamily(selected.dataset.family||selected.textContent.trim());});
      mo.observe(familyRing,{subtree:true,attributes:true,attributeFilter:["class"]});
    }

    var panel=document.createElement("div");
    panel.className="ffx-deletion-panel";
    panel.innerHTML='<span class="ffx-deletion-panel__eyebrow">evidence deletion test</span><div class="ffx-deletion-panel__state"><div><small>numerical state</small><b>RESOLVED</b></div><div><small>claim authority</small><b data-pass3-authority>AVAILABLE BY SCOPE</b></div></div><div class="ffx-deletion-panel__buttons"><button type="button" data-delete="coverage">Remove coverage</button><button type="button" data-delete="source">Remove source witness</button><button type="button" data-delete="calibration">Remove calibration</button><button type="button" data-delete="restore">Restore evidence</button></div><p data-pass3-delete-note>The reconstruction is resolved and the supporting evidence is intact.</p>';
    stage.appendChild(panel);

    function setDeletion(kind){
      qa("button",panel).forEach(function(b){b.classList.toggle("is-active",b.dataset.delete===kind);});
      var authority=q("[data-pass3-authority]",panel),note=q("[data-pass3-delete-note]",panel);
      if(kind==="restore"){
        authority.textContent="AVAILABLE BY SCOPE";
        panel.dataset.authority="available";
        note.textContent="The reconstruction is resolved and the supporting evidence is intact.";
      }else{
        authority.textContent="WITHHELD";
        panel.dataset.authority="withheld";
        note.textContent=kind==="coverage"?"The field can remain numerically resolved while missing coverage removes authority for the larger claim.":kind==="source"?"Without an independently witnessed source, the response can no longer support the same causal measurement claim.":"Without valid calibration, the numerical object persists but its physical interpretation is weakened beyond the authorized scope.";
      }
      stage.dataset.pass3Delete=kind;
    }
    qa("button",panel).forEach(function(b){b.addEventListener("click",function(){setDeletion(b.dataset.delete);});});
    setDeletion("restore");

    var counter=q(".ffx-measurement__counter b",stage);
    (function syncPanel(){
      var idx=counter?clamp((parseInt(counter.textContent,10)||1)-1,0,7):0;
      panel.classList.toggle("is-visible",idx===6);
      if(familyRing){
        var readout=q(".ffx-family-readout",stage);
        if(readout)readout.classList.toggle("is-visible",idx===3);
      }
      requestAnimationFrame(syncPanel);
    })();
  }

  function initProductsConvergence(){
    var branch=q(".ffx-product-branch");
    if(!branch||q(".ffx-product-convergence",branch))return;
    var node=document.createElement("div");
    node.className="ffx-product-convergence";
    node.innerHTML='<div class="ffx-product-convergence__lines"><i></i><i></i></div><span>DEFINED INTERFACE</span><strong>Qualified evidence can deepen interpretation without collapsing the acquisition paths.</strong><p>Applications and instruments remain distinct. They meet only where the formal contracts specify how evidence may enter, what provenance must travel with it, and which interpretation is allowed to change.</p>';
    q(".wrap",branch).appendChild(node);
    observeOne(node,.25,function(el){el.classList.add("is-in");});
  }

  function initInvestorFrontier(){
    var track=q(".ffx-risktrack");
    if(!track||q(".ffx-risk-frontier"))return;
    var steps=qa(".ffx-riskstep",track);
    if(!steps.length)return;

    var hud=document.createElement("div");
    hud.className="ffx-risk-frontier";
    hud.innerHTML='<div><span>behind us</span><b>foundational risk retired</b></div><div class="is-frontier"><span>current frontier</span><b>ontology</b></div><div><span>ahead</span><b>evidence still to earn</b></div><small>Capital moves the frontier; it does not restart the chain.</small>';
    track.parentNode.insertBefore(hud,track);

    var titles=steps.map(function(s){return (q("h3",s)||{}).textContent||"";});
    var current=-1;
    function setCurrent(idx){
      idx=clamp(idx,0,steps.length-1);if(idx===current)return;current=idx;
      q(".is-frontier b",hud).textContent=titles[idx];
      steps.forEach(function(s,i){s.classList.toggle("is-behind",i<idx);s.classList.toggle("is-frontier",i===idx);s.classList.toggle("is-ahead",i>idx);});
      hud.style.setProperty("--frontier-progress",String(idx/(steps.length-1)));
    }
    var io=new IntersectionObserver(function(entries){
      var v=entries.filter(function(e){return e.isIntersecting;}).sort(function(a,b){return b.intersectionRatio-a.intersectionRatio;});
      if(v.length)setCurrent(steps.indexOf(v[0].target));
    },{threshold:[.25,.5,.7],rootMargin:"-20% 0px -38% 0px"});
    steps.forEach(function(s){io.observe(s);});
    setCurrent(0);
  }

  var THREADS={
    Foundations:["Boundary","Fixedness","Living boundary","Temperament"],
    Formalization:["Fixedness","Algebra before AI","Certification","Observable"],
    Measurement:["Boundary","Living boundary","Observable","Residual"],
    Evidence:["Certification","Observable","Residual","Failure"]
  };
  function initResearchGenealogy(){
    var map=q(".ffx-research-map");
    if(!map||q(".ffx-research-threads",map))return;
    var field=q(".ffx-research-map__field",map),nodes=qa(".ffx-research-node",map);
    var bar=document.createElement("div");
    bar.className="ffx-research-threads";
    bar.innerHTML='<span>follow a thread</span>'+Object.keys(THREADS).map(function(k){return '<button type="button" data-thread="'+k+'">'+k+'</button>';}).join('')+'<button type="button" data-thread="all" class="is-active">All</button>';
    field.parentNode.insertBefore(bar,field);

    function apply(name){
      qa("button",bar).forEach(function(b){b.classList.toggle("is-active",b.dataset.thread===name);});
      var wanted=name==="all"?null:THREADS[name];
      nodes.forEach(function(n){
        var label=(q("text:not(.cat)",n)||{}).textContent||"";
        n.classList.toggle("is-thread-muted",!!wanted&&wanted.indexOf(label)<0);
        n.classList.toggle("is-thread-active",!!wanted&&wanted.indexOf(label)>=0);
      });
      qa(".ffx-research-edge",map).forEach(function(e){e.classList.toggle("is-thread-muted",!!wanted);});
      if(wanted){
        var detail=q(".ffx-research-map__detail",map);
        q("span",detail).textContent=name+" thread";
        q("strong",detail).textContent=wanted.join(" → ");
        q("p",detail).textContent=name==="Evidence"?"This thread follows the movement from certification and observability into reconstruction, deletion, and claim authority.":name==="Measurement"?"This thread follows the boundary from a conceptual primitive into an observable and then into reconstructed structure.":name==="Formalization"?"This thread follows the work required to turn a declared ontology into machine-checkable and certifiable structure.":"This thread follows the ideas that make a changing system distinguishable enough to remain itself.";
      }
    }
    qa("button",bar).forEach(function(b){b.addEventListener("click",function(){apply(b.dataset.thread);});});
    apply("all");
  }

  function boot(){
    var p=page();
    if(p==="index.html")afterGenerated(".ffx-chain__stage",initHomeContinuity);
    if(p==="science.html")afterGenerated(".ffx-science-track",initScienceContinuity);
    if(p==="platform.html")afterGenerated(".ffx-measurement__stage",initPlatformConsequence);
    if(p==="products.html")afterGenerated(".ffx-product-branch",initProductsConvergence);
    if(p==="investors.html")afterGenerated(".ffx-risktrack",initInvestorFrontier);
    if(p==="research.html")afterGenerated(".ffx-research-map",initResearchGenealogy);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();