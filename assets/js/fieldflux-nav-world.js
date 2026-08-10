(function(){
  "use strict";
  if(window.__fieldfluxNavWorld)return;
  window.__fieldfluxNavWorld=true;

  var page=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  var body=document.body;
  function q(s,c){return(c||document).querySelector(s);}
  function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

  if(!q('link[data-fieldflux-nav-world]')){
    var css=document.createElement("link");css.rel="stylesheet";css.href="assets/css/fieldflux-nav-world.css?v=1";css.dataset.fieldfluxNavWorld="true";document.head.appendChild(css);
  }

  var PRIMARY=[["science.html","Science"],["platform.html","Platform"],["products.html","Products"],["research.html","Research"],["about.html","Company"],["investors.html","Investors"]];
  var PAGE_PRIMARY={
    "index.html":0,"science.html":0,"platform.html":1,"products.html":2,"research.html":3,"about.html":4,"careers.html":4,"ethics.html":4,"contact.html":4,"investors.html":5,
    "boundary-comes-first.html":3,"living-boundary.html":3,"one-plus-one.html":3,"fixedness.html":3,"residue-and-residual.html":3,"making-of-an-observable.html":3,"certification-algebra.html":3,"temperament.html":3,"algebra-before-ai.html":3,"make-the-signal-fail.html":3
  };
  var PAGE_STAGE={
    "index.html":"health","science.html":"health","platform.html":"laminarity","products.html":"instrument","research.html":"observable","about.html":"health","careers.html":"health","ethics.html":"evidence","contact.html":"health","investors.html":"evidence",
    "boundary-comes-first.html":"boundary","living-boundary.html":"site","one-plus-one.html":"relation","fixedness.html":"relation","residue-and-residual.html":"residue","making-of-an-observable.html":"observable","certification-algebra.html":"observable","temperament.html":"observable","algebra-before-ai.html":"observable","make-the-signal-fail.html":"evidence","world.html":"health"
  };
  var STAGES=[
    {id:"health",label:"Health",sub:"definition",title:"Preserved relation through regulated difference.",body:"The field begins with a positive definition of health: a bounded living system maintaining enough regulated difference and relational organization to remain itself through change.",links:[["science.html","Science","definition → empirical contact"],["https://membrane-health.com","Membrane Health","everyday application"],["boundary-comes-first.html","The Boundary Comes First","what a boundary is"]]},
    {id:"boundary",label:"Boundary",sub:"exchange surface",title:"Difference becomes a living edge.",body:"A boundary is a maintained gradient of exchange. It is where source, response, interior, exterior, identity, and regulated difference become physically available to measurement.",links:[["boundary-comes-first.html","The Boundary Comes First","ontology"],["living-boundary.html","Reading the Living Boundary","measurement stance"],["science.html","Science","formal chain"]]},
    {id:"site",label:"Site",sub:"local response",title:"The boundary answers somewhere.",body:"A known interrogation meets an accessible site. Timing, geometry, source history, contact, and response establish a local event whose lineage can be carried forward.",links:[["living-boundary.html","Reading the Living Boundary","near side / far side"],["platform.html","Platform","registered sites"],["laminar-demo.html","Laminarity demo","real measured sites"]]},
    {id:"relation",label:"Relation",sub:"between sites",title:"The second site changes the object.",body:"With two supported sites the measurement becomes relational: lead and lag, phase, coherence, amplitude, support, distinction, and the path by which one response remains related to another.",links:[["one-plus-one.html","1 + 1 = 2","support + distinguishability"],["fixedness.html","Fixedness","identity through transformation"],["platform.html","Platform","sites → routes"]]},
    {id:"laminarity",label:"Laminar Field",sub:"ordered transport",title:"Relation becomes visible in motion.",body:"Laminarity reads how coherently relational movement remains organized across registered sites and routes. It is the visible thread connecting local response to distributed topology.",links:[["platform.html","Platform","DRTT / QPCI"],["laminar-demo.html","Open live laminarity","20-site capture"],["living-boundary.html","Reading the Living Boundary","field reading"]]},
    {id:"residue",label:"Residue",sub:"retained return",title:"The return remembers the exchange.",body:"Some response remains after an exchange should have resolved. Its decay, timing, persistence, distribution, and transport become a measurable property of the living return.",links:[["residue-and-residual.html","Residue and Residual","living return → law-side account"],["living-boundary.html","Reading the Living Boundary","residue + laminarity"],["platform.html","Platform","reconstruction"]]},
    {id:"observable",label:"Observable",sub:"claim discipline",title:"A signal earns physical meaning.",body:"Calibration, admissibility, closure, fixedness, boundary accounting, source witness, and provenance determine what may cross from recorded structure into a physical observable.",links:[["making-of-an-observable.html","The Making of an Observable","signal → observable"],["certification-algebra.html","Certification Algebra","freedom → maturity"],["temperament.html","Temperament","character of the certifier"],["algebra-before-ai.html","Algebra Before AI","define the measurement space first"]]},
    {id:"instrument",label:"Instrument",sub:"physical witness",title:"The witness becomes hardware.",body:"Membrane Health, DRTT 2.0, Rev B, and bedside QPCI occupy different positions in the same measurement architecture, increasing physical witness and translational depth.",links:[["products.html","Products","application + instruments"],["platform.html#instrument-scale","Instrument scale","DRTT → Rev B → QPCI"],["https://membrane-health.com","Membrane Health","application layer"]]},
    {id:"evidence",label:"Evidence",sub:"earned authority",title:"Authority accumulates around the result.",body:"Coverage, calibration, uncertainty, deletion tests, repeatability, provenance, studies, pilots, and trials determine the scope a result has earned at this point in the evidence program.",links:[["investors.html","Investors","development + evidence horizon"],["make-the-signal-fail.html","How We Try to Make the Signal Fail","empirical discipline"],["science.html","Science","formal truth → physical truth"]]}
  ];
  var stageIndex={};STAGES.forEach(function(s,i){stageIndex[s.id]=i;});
  var activeStage=PAGE_STAGE[page]||"health";
  var activePrimary=PAGE_PRIMARY.hasOwnProperty(page)?PAGE_PRIMARY[page]:0;

  function remember(stage,primary){try{sessionStorage.setItem("ffxFieldStage",stage||activeStage);if(primary!=null)sessionStorage.setItem("ffxPrimary",String(primary));}catch(e){}}
  function priorPrimary(){try{var x=parseInt(sessionStorage.getItem("ffxPrimary"),10);return isFinite(x)?clamp(x,0,PRIMARY.length-1):activePrimary;}catch(e){return activePrimary;}}

  function navMarkup(){
    return '<div class="ffx-nav-primary">'+PRIMARY.map(function(x,i){var current=page===x[0]||(PAGE_PRIMARY[page]===i&&page!=="index.html"&&page.indexOf(".html")>-1&&PRIMARY.every(function(y){return y[0]!==page;}));return'<a href="'+x[0]+'" data-primary="'+i+'"'+(current?' class="is-active" aria-current="page"':'')+'>'+x[1]+'</a>';}).join("")+'</div><svg class="ffx-nav-flow" viewBox="0 0 100 18" preserveAspectRatio="none" aria-hidden="true"><path class="base" d="M1 9 C18 2 30 16 48 9 S78 2 99 9"/><path class="live" d="M1 9 C18 2 30 16 48 9 S78 2 99 9"/></svg><span class="ffx-nav-carrier" aria-hidden="true"></span><button class="ffx-fieldmap-toggle" type="button" aria-label="Open Fieldflux field map" aria-expanded="false"><span class="ffx-fieldmap-toggle__glyph" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></span><span class="ffx-fieldmap-toggle__text"><small>Field position</small><b>'+STAGES[stageIndex[activeStage]].label+'</b></span></button>';
  }

  function setCarrier(nav,index,instant){var link=q('.ffx-nav-primary a[data-primary="'+index+'"]',nav),car=q('.ffx-nav-carrier',nav);if(!link||!car)return;var nr=nav.getBoundingClientRect(),lr=link.getBoundingClientRect(),x=lr.left-nr.left+lr.width*.5;if(instant){var old=car.style.transition;car.style.transition="none";car.style.left=x+"px";requestAnimationFrame(function(){car.style.transition=old||"";});}else car.style.left=x+"px";}
  function setStage(stage){if(!stageIndex.hasOwnProperty(stage)||stage===activeStage)return;activeStage=stage;body.dataset.ffxFieldStage=stage;qa(".ffx-fieldmap-toggle__text b").forEach(function(b){b.textContent=STAGES[stageIndex[stage]].label;});qa(".ffx-fieldmap-toggle__glyph b").forEach(function(b){b.style.left=(stageIndex[stage]/(STAGES.length-1)*24)+"px";});if(q(".ffx-field-atlas.is-open"))selectAtlas(stage);}

  function upgradeNav(){
    qa(".nav__links").forEach(function(nav){nav.classList.add("ffx-nav-map");nav.innerHTML=navMarkup();var prev=priorPrimary();setCarrier(nav,prev,true);setTimeout(function(){setCarrier(nav,activePrimary,false);},70);
      qa(".ffx-nav-primary a",nav).forEach(function(a){var i=+a.dataset.primary;a.addEventListener("mouseenter",function(){setCarrier(nav,i,false);});a.addEventListener("click",function(){remember(PAGE_STAGE[(a.getAttribute("href")||"").split("/").pop()]||activeStage,i);});});
      var primary=q(".ffx-nav-primary",nav);if(primary)primary.addEventListener("mouseleave",function(){setCarrier(nav,activePrimary,false);});
      var toggle=q(".ffx-fieldmap-toggle",nav);if(toggle)toggle.addEventListener("click",function(){openAtlas(activeStage);});
      var dot=q(".ffx-fieldmap-toggle__glyph b",nav);if(dot)dot.style.left=(stageIndex[activeStage]/(STAGES.length-1)*24)+"px";
    });
    var home=q(".ffx-homehero .ffx-actions .btn--primary");if(home){home.textContent="Explore the field";home.href="#field-map";home.addEventListener("click",function(e){e.preventDefault();openAtlas(activeStage);});}
    qa(".ffx-field-compass").forEach(function(x){x.remove();});
  }

  function atlasMarkup(){return '<div class="ffx-field-atlas" id="field-map" aria-hidden="true"><div class="ffx-field-atlas__shell"><header class="ffx-field-atlas__head"><div><p class="eyebrow">Fieldflux · navigation field</p><h2>The site is one connected measurement world.</h2><p>Move along the relation. Each position opens the pages, instruments, and research that belong to that part of the same object.</p></div><button class="ffx-field-atlas__close" type="button" aria-label="Close field map">×</button></header><div class="ffx-field-atlas__body"><nav class="ffx-field-atlas__route" aria-label="Field positions"><span class="ffx-field-atlas__carrier" aria-hidden="true"></span>'+STAGES.map(function(s){return'<button class="ffx-field-atlas__node" type="button" data-stage="'+s.id+'"><i></i><span>'+s.label+'<small>'+s.sub+'</small></span></button>';}).join("")+'</nav><section class="ffx-field-atlas__detail"><p class="kicker"></p><h3></h3><p></p><div class="ffx-field-atlas__links"></div><div class="ffx-field-atlas__current">current field position · <b></b></div></section></div></div></div>';}
  function ensureAtlas(){var a=q(".ffx-field-atlas");if(a)return a;var host=document.createElement("div");host.innerHTML=atlasMarkup();a=host.firstElementChild;body.appendChild(a);q(".ffx-field-atlas__close",a).addEventListener("click",closeAtlas);a.addEventListener("click",function(e){if(e.target===a)closeAtlas();});qa(".ffx-field-atlas__node",a).forEach(function(n){n.addEventListener("click",function(){selectAtlas(n.dataset.stage);});});document.addEventListener("keydown",function(e){if(e.key==="Escape"&&a.classList.contains("is-open"))closeAtlas();});return a;}
  function selectAtlas(stage){var a=ensureAtlas(),s=STAGES[stageIndex[stage]||0];qa(".ffx-field-atlas__node",a).forEach(function(n){n.classList.toggle("is-active",n.dataset.stage===s.id);});var node=q('.ffx-field-atlas__node[data-stage="'+s.id+'"]',a),carrier=q(".ffx-field-atlas__carrier",a);if(node&&carrier)carrier.style.top=(node.offsetTop+node.offsetHeight*.5-4)+"px";q(".ffx-field-atlas__detail .kicker",a).textContent=String(stageIndex[s.id]+1).padStart(2,"0")+" · "+s.sub;q(".ffx-field-atlas__detail h3",a).textContent=s.title;q(".ffx-field-atlas__detail>p",a).textContent=s.body;q(".ffx-field-atlas__current b",a).textContent=STAGES[stageIndex[activeStage]].label;var links=q(".ffx-field-atlas__links",a);links.innerHTML=s.links.map(function(x){var ext=/^https?:/.test(x[0]);return'<a href="'+x[0]+'" data-stage-link="'+s.id+'"'+(ext?' target="_blank" rel="noopener"':'')+'><span>'+x[1]+'<small>'+x[2]+'</small></span><b>→</b></a>';}).join("");qa("a[data-stage-link]",links).forEach(function(link){link.addEventListener("click",function(){remember(link.dataset.stageLink,PAGE_PRIMARY[(link.getAttribute("href")||"").split("/").pop()]);});});}
  function openAtlas(stage){var a=ensureAtlas();selectAtlas(stage||activeStage);a.classList.add("is-open");a.setAttribute("aria-hidden","false");body.classList.add("ffx-field-atlas-open");qa(".ffx-fieldmap-toggle").forEach(function(b){b.setAttribute("aria-expanded","true");});setTimeout(function(){var n=q('.ffx-field-atlas__node[data-stage="'+(stage||activeStage)+'"]',a);if(n)n.focus();},20);}
  function closeAtlas(){var a=q(".ffx-field-atlas");if(!a)return;a.classList.remove("is-open");a.setAttribute("aria-hidden","true");body.classList.remove("ffx-field-atlas-open");qa(".ffx-fieldmap-toggle").forEach(function(b){b.setAttribute("aria-expanded","false");});if(page==="world.html")location.href="index.html";}

  function coreScrollStage(){
    if(page==="platform.html"){
      var c=q(".ffx-measurement__cinema");if(c){var r=c.getBoundingClientRect(),vh=Math.max(1,innerHeight);if(r.top<vh*.55&&r.bottom>vh*.25){var p=clamp((-r.top+vh*.12)/Math.max(1,r.height-vh*.8),0,1),i=Math.round(p*7),map=["site","site","relation","laminarity","laminarity","residue","evidence","instrument"];return map[i];}}
      if(q(".ffx-evidence")&&q(".ffx-evidence").getBoundingClientRect().top<innerHeight*.6)return"evidence";
      return"site";
    }
    if(page==="index.html"){
      var chain=q(".ffx-chain__cinema");if(chain){var cr=chain.getBoundingClientRect(),vh2=Math.max(1,innerHeight);if(cr.top<vh2*.58&&cr.bottom>vh2*.25){var pp=clamp((-cr.top+vh2*.12)/Math.max(1,cr.height-vh2*.72),0,1),ii=Math.round(pp*6),mm=["health","boundary","observable","observable","instrument","evidence","evidence"];return mm[ii];}}
      var ins=q(".ffx-instruments");if(ins&&ins.getBoundingClientRect().top<innerHeight*.58&&ins.getBoundingClientRect().bottom>0)return"instrument";
      var proof=q(".ffx-proofband");if(proof&&proof.getBoundingClientRect().top<innerHeight*.58&&proof.getBoundingClientRect().bottom>0)return"observable";
      return"health";
    }
    return PAGE_STAGE[page]||activeStage;
  }
  var scrollQueued=false;function onScroll(){if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(function(){scrollQueued=false;setStage(coreScrollStage());});}

  function boot(){upgradeNav();ensureAtlas();body.dataset.ffxFieldStage=activeStage;addEventListener("resize",function(){qa(".nav__links.ffx-nav-map").forEach(function(nav){setCarrier(nav,activePrimary,true);});},{passive:true});addEventListener("scroll",onScroll,{passive:true});onScroll();
    if(page==="world.html")setTimeout(function(){openAtlas((location.hash||"").replace("#","")||activeStage);},100);
    qa("a[href]").forEach(function(a){if(a.closest(".ffx-field-atlas"))return;a.addEventListener("click",function(){var href=a.getAttribute("href")||"";if(!href||href.charAt(0)==="#"||/^mailto:|^tel:|^javascript:/i.test(href))return;var dest=href.split("#")[0].split("/").pop();remember(PAGE_STAGE[dest]||activeStage,PAGE_PRIMARY.hasOwnProperty(dest)?PAGE_PRIMARY[dest]:activePrimary);});});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
