(function(){
  "use strict";

  if(window.__fieldfluxPass2)return;
  window.__fieldfluxPass2=true;

  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root=document.documentElement;

  function q(s,c){return (c||document).querySelector(s);}
  function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function lerp(a,b,t){return a+(b-a)*t;}
  function smooth(t){t=clamp(t,0,1);return t*t*(3-2*t);}
  function hash(n){var x=Math.sin(n*127.1)*43758.5453123;return x-Math.floor(x);}
  function page(){var p=location.pathname.split("/").pop();return p||"index.html";}
  function cssvar(name,fallback){var v=getComputedStyle(root).getPropertyValue(name).trim();return v||fallback;}
  function rgba(hex,a){
    var h=String(hex||"").trim();
    if(/^#[0-9a-f]{3}$/i.test(h))h="#"+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
    if(/^#[0-9a-f]{6}$/i.test(h)){
      var n=parseInt(h.slice(1),16);
      return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")";
    }
    return h;
  }
  function pal(){return{navy:cssvar("--navy","#1E4065"),deep:cssvar("--deep","#162C46"),gold:cssvar("--gold","#9A6A12"),goldDeep:cssvar("--gold-on-deep","#F4C267"),paper:cssvar("--paper","#FBF5EC"),aqua:"#6FB6CE",ink:cssvar("--ink","#23262C")};}

  function loadStyle(){
    if(q('link[data-fieldflux-pass2]'))return;
    var l=document.createElement("link");
    l.rel="stylesheet";
    l.href="assets/css/fieldflux-pass2.css?v=1";
    l.dataset.fieldfluxPass2="true";
    document.head.appendChild(l);
  }
  loadStyle();

  function afterGenerated(selector,fn){
    var attempts=0;
    function tryNow(){
      var el=q(selector);
      if(el){fn(el);return;}
      attempts++;
      if(attempts<120)setTimeout(tryNow,50);
    }
    tryNow();
  }

  var HOME_MOTION=[
    ["FORM","a bounded object appears"],
    ["CONSTRAIN","language becomes structure"],
    ["VERIFY","the formal system closes"],
    ["PROJECT","structure acquires physical meaning"],
    ["ENGINEER","an instrument is built around the question"],
    ["WITNESS","nature returns an observation"],
    ["QUALIFY","evidence earns the final claim"]
  ];
  var PLATFORM_MOTION=[
    ["WITNESS","the source is independently known"],
    ["PROPAGATE","response appears across registered sites"],
    ["RELATE","timing becomes distributed geometry"],
    ["INTERROGATE","families ask different questions of one field"],
    ["ROUTE","site relationships become paths"],
    ["RECONSTRUCT","order and residual structure become visible"],
    ["QUALIFY","evidence tests the authority of the image"],
    ["RESOLVE","one architecture survives the instrument scale"]
  ];

  function injectMotionVerb(stage,list,counterSelector){
    if(!stage||q(".ffx-motion-verb",stage))return;
    var box=document.createElement("div");
    box.className="ffx-motion-verb";
    box.innerHTML='<span class="ffx-motion-verb__label">motion</span><strong></strong><small></small>';
    stage.appendChild(box);
    var strong=q("strong",box),small=q("small",box),last=-1;
    function sync(){
      var counter=q(counterSelector,stage)||q(counterSelector);
      var idx=counter?Math.max(0,(parseInt(counter.textContent,10)||1)-1):0;
      idx=clamp(idx,0,list.length-1);
      if(idx!==last){
        last=idx;
        stage.dataset.motionVerb=list[idx][0].toLowerCase();
        strong.textContent=list[idx][0];
        small.textContent=list[idx][1];
        box.classList.remove("is-pulse");
        void box.offsetWidth;
        box.classList.add("is-pulse");
      }
      requestAnimationFrame(sync);
    }
    sync();
  }

  function canvasOverlay(stage,className){
    var c=document.createElement("canvas");
    c.className=className;
    c.setAttribute("aria-hidden","true");
    stage.appendChild(c);
    return c;
  }

  function initHomeDepth(){
    var stage=q(".ffx-chain__stage");
    if(!stage||stage.dataset.pass2)return;
    stage.dataset.pass2="true";
    injectMotionVerb(stage,HOME_MOTION,".ffx-chain__meter span:first-child");
    var canvas=canvasOverlay(stage,"ffx-pass2-canvas ffx-pass2-canvas--home"),ctx=canvas.getContext("2d",{alpha:true});
    var W=1,H=1,D=1,last=performance.now(),clock=0;
    function resize(){var r=stage.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);D=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(D,0,0,D,0,0);}
    new ResizeObserver(resize).observe(stage);resize();
    function frame(now){var dt=Math.min(50,now-last);last=now;if(!reduce)clock+=dt;var n=parseInt((q(".ffx-chain__meter span:first-child",stage)||{}).textContent||"1",10)||1;drawHomeOverlay(n-1);requestAnimationFrame(frame);}
    function drawHomeOverlay(idx){
      var P=pal(),cx=W*.66,cy=H*.53,R=Math.min(W*.23,H*.34);ctx.clearRect(0,0,W,H);
      if(idx===0){
        for(var s=0;s<9;s++){var rr=R*(.34+s*.065);ctx.beginPath();ctx.ellipse(cx,cy,rr,rr*.72,Math.sin(clock*.00009+s)*.02,0,Math.PI*2);ctx.strokeStyle=rgba(P.gold,.035+.012*s);ctx.stroke();}
      }
      if(idx===1){
        ctx.save();ctx.translate(cx,cy);ctx.rotate(-.12);for(var x=-4;x<=4;x++){ctx.beginPath();ctx.moveTo(x*R*.14,-R*.62);ctx.lineTo(x*R*.14,R*.62);ctx.strokeStyle=rgba(P.navy,.055);ctx.stroke();}for(var y=-3;y<=3;y++){ctx.beginPath();ctx.moveTo(-R*.68,y*R*.17);ctx.lineTo(R*.68,y*R*.17);ctx.strokeStyle=rgba(P.navy,.055);ctx.stroke();}ctx.restore();
      }
      if(idx===2){
        for(var a=0;a<8;a++){var ang=a/8*Math.PI*2,px=cx+Math.cos(ang)*R*.74,py=cy+Math.sin(ang)*R*.53;ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.strokeStyle=rgba(P.gold,.34);ctx.stroke();ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(cx+Math.cos(ang)*R*.92,cy+Math.sin(ang)*R*.66);ctx.strokeStyle=rgba(P.gold,.16);ctx.stroke();}
      }
      if(idx===3){
        for(var g=0;g<18;g++){var ang2=-1.2+g/17*2.4,edge={x:cx+Math.cos(ang2)*R*.94,y:cy+Math.sin(ang2)*R*.68},out={x:edge.x+Math.cos(ang2)*R*.42,y:edge.y+Math.sin(ang2)*R*.31};ctx.beginPath();ctx.moveTo(out.x,out.y);ctx.quadraticCurveTo((out.x+edge.x)/2+Math.sin(ang2)*12,(out.y+edge.y)/2-Math.cos(ang2)*12,edge.x,edge.y);ctx.strokeStyle=rgba(g%4===0?P.gold:P.aqua,.10);ctx.stroke();}
      }
      if(idx===4){
        for(var r=0;r<5;r++){var rw=R*(1.16-r*.11),rh=R*(.78-r*.08),rx=cx-rw/2,ry=cy-rh/2;ctx.beginPath();ctx.rect(rx,ry,rw,rh);ctx.strokeStyle=rgba(r%2?P.gold:P.navy,.06+.025*r);ctx.stroke();}for(var p=0;p<6;p++){var ang3=p/6*Math.PI*2+clock*.00007,px2=cx+Math.cos(ang3)*R*.77,py2=cy+Math.sin(ang3)*R*.55;ctx.beginPath();ctx.arc(px2,py2,3,0,Math.PI*2);ctx.fillStyle=rgba(P.gold,.45);ctx.fill();}
      }
      if(idx===5){
        var sx=cx-R*1.18,sy=cy-R*.18;ctx.beginPath();ctx.arc(sx,sy,7,0,Math.PI*2);ctx.fillStyle=rgba(P.gold,.8);ctx.fill();for(var q1=0;q1<5;q1++){var u=(clock*.00018+q1/5)%1,rad=8+u*R*.52;ctx.beginPath();ctx.arc(sx,sy,rad,0,Math.PI*2);ctx.strokeStyle=rgba(P.gold,(1-u)*.13);ctx.stroke();}for(var k=0;k<10;k++){var u2=(clock*.00008+k*.11)%1,x2=lerp(sx+10,cx-R*.16,u2),y2=lerp(sy,cy,u2)+Math.sin(u2*Math.PI+k)*10;ctx.beginPath();ctx.arc(x2,y2,1.5,0,Math.PI*2);ctx.fillStyle=rgba(k%3?P.aqua:P.gold,.6);ctx.fill();}
      }
      if(idx===6){
        for(var i=0;i<7;i++){var yy=cy-R*.46+i*R*.15,ok=i<6;ctx.beginPath();ctx.moveTo(cx-R*.56,yy);ctx.lineTo(cx+R*.36,yy);ctx.strokeStyle=rgba(ok?P.navy:P.gold,.13);ctx.stroke();ctx.beginPath();ctx.arc(cx-R*.62,yy,3,0,Math.PI*2);ctx.fillStyle=rgba(ok?P.navy:P.gold,.55);ctx.fill();}ctx.font="600 10px ui-sans-serif,system-ui";ctx.fillStyle=rgba(P.gold,.7);ctx.fillText("AUTHORITY GRANTED",cx-R*.12,cy+R*.63);
      }
    }
    requestAnimationFrame(frame);
  }

  var FAMILIES=["Timing","Coherence","Laminarity","Recovery","Drift","Entrainment"];
  function initPlatformDepth(){
    var stage=q(".ffx-measurement__stage");
    if(!stage||stage.dataset.pass2)return;
    stage.dataset.pass2="true";
    injectMotionVerb(stage,PLATFORM_MOTION,".ffx-measurement__counter b");

    var hud=document.createElement("div");hud.className="ffx-evidence-hud";hud.innerHTML='<div><span>source</span><b data-hud="source">waiting</b></div><div><span>clock</span><b data-hud="clock">shared</b></div><div><span>coverage</span><b data-hud="coverage">—</b></div><div><span>authority</span><b data-hud="authority">withheld</b></div><small data-hud-note>measurement has not started</small>';stage.appendChild(hud);

    var familyRing=q(".ffx-familyring",stage)||q(".ffx-familyring");var selectedFamily=0,userFamily=false;
    if(familyRing){familyRing.removeAttribute("aria-hidden");qa("span",familyRing).forEach(function(el,i){el.setAttribute("role","button");el.setAttribute("tabindex","0");el.dataset.family=FAMILIES[i];function choose(){selectedFamily=i;userFamily=true;qa("span",familyRing).forEach(function(x,j){x.classList.toggle("is-selected",j===i);});}el.addEventListener("click",choose);el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();choose();}});});}

    var canvas=canvasOverlay(stage,"ffx-pass2-canvas ffx-pass2-canvas--platform"),ctx=canvas.getContext("2d",{alpha:true});var W=1,H=1,D=1,last=performance.now(),clock=0,lastCycle=0;
    function resize(){var r=stage.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);D=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(D,0,0,D,0,0);}new ResizeObserver(resize).observe(stage);resize();
    function idx(){return clamp((parseInt((q(".ffx-measurement__counter b",stage)||{}).textContent||"1",10)||1)-1,0,7);}
    function updateHud(i){var src=q('[data-hud="source"]',hud),clk=q('[data-hud="clock"]',hud),cov=q('[data-hud="coverage"]',hud),auth=q('[data-hud="authority"]',hud),note=q('[data-hud-note]',hud);src.textContent=i===0?"witnessing":i>0?"witnessed":"waiting";clk.textContent=i<1?"shared":"locked";cov.textContent=i<1?"—":i<6?"building":"qualified";auth.textContent=i<6?"withheld":i===6?"tested":"scoped";note.textContent=i===0?"the source exists independently of the response":i===1?"registered sites preserve their own observation state":i===2?"lead, lag, sequence, and phase become relational":i===3?"choose a family to interrogate the same substrate":i===4?"routes preserve how sites relate across the field":i===5?"reconstruction exposes order and residual structure":i===6?"deletion tests can remove authority without removing numerical resolution":"the same evidence contract survives the hardware scale";hud.dataset.stage=String(i);}
    function frame(now){var dt=Math.min(50,now-last);last=now;if(!reduce)clock+=dt;var i=idx();updateHud(i);if(i===3&&!userFamily&&clock-lastCycle>1800){selectedFamily=(selectedFamily+1)%FAMILIES.length;lastCycle=clock;if(familyRing)qa("span",familyRing).forEach(function(x,j){x.classList.toggle("is-selected",j===selectedFamily);});}drawOverlay(i,selectedFamily);requestAnimationFrame(frame);}
    function drawOverlay(i,fam){var P=pal(),cx=W*.65,cy=H*.53,R=Math.min(W*.28,H*.37);ctx.clearRect(0,0,W,H);if(i===3){
        if(fam===0){for(var k=0;k<5;k++){var y=cy-R*.32+k*R*.16;ctx.beginPath();ctx.moveTo(cx-R*.62,y);ctx.bezierCurveTo(cx-R*.22,y-12,cx+R*.22,y+12,cx+R*.62,y);ctx.strokeStyle=rgba(k%2?P.aqua:P.goldDeep,.18);ctx.stroke();for(var p=0;p<3;p++){var u=(clock*.00008+p*.31+k*.08)%1,x=lerp(cx-R*.62,cx+R*.62,u),yy=y+Math.sin(u*Math.PI*2+k)*7;ctx.beginPath();ctx.arc(x,yy,1.8,0,Math.PI*2);ctx.fillStyle=rgba(P.goldDeep,.7);ctx.fill();}}}
        if(fam===1){for(var r=0;r<6;r++){ctx.beginPath();ctx.ellipse(cx,cy,R*(.18+r*.09),R*(.13+r*.065),clock*.000035+r*.19,0,Math.PI*2);ctx.strokeStyle=rgba(r%2?P.aqua:P.goldDeep,.08+.02*r);ctx.stroke();}}
        if(fam===2){for(var s=0;s<22;s++){var y2=(s-10.5)*R*.035;ctx.beginPath();for(var n=0;n<=34;n++){var u2=n/34,x2=cx-R*.82+u2*R*1.64,y3=cy+y2+Math.sin(u2*Math.PI*2+s*.44+clock*.00018)*R*.012;if(n)ctx.lineTo(x2,y3);else ctx.moveTo(x2,y3);}ctx.strokeStyle=rgba(s%5===0?P.goldDeep:P.aqua,.09);ctx.stroke();}}
        if(fam===3){for(var g=0;g<5;g++){var a=g/5*Math.PI*2,p0={x:cx+Math.cos(a)*R*.55,y:cy+Math.sin(a)*R*.40},p1={x:cx+Math.cos(a)*R*.35,y:cy+Math.sin(a)*R*.25};ctx.setLineDash([3,7]);ctx.beginPath();ctx.ellipse(p0.x,p0.y,18,12,0,0,Math.PI*2);ctx.strokeStyle=rgba("#CB6149",.18);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.strokeStyle=rgba("#8FB06A",.28);ctx.stroke();}}
        if(fam===4){for(var d=0;d<5;d++){ctx.beginPath();for(var h=0;h<20;h++){var u3=h/19,x3=cx-R*.48+u3*R*.92,y4=cy-R*.26+d*R*.13+Math.sin(u3*4.8+d)*R*.035*u3;if(h)ctx.lineTo(x3,y4);else ctx.moveTo(x3,y4);}ctx.strokeStyle=rgba(d%2?P.aqua:P.goldDeep,.13);ctx.stroke();}}
        if(fam===5){for(var w=0;w<8;w++){var u4=(clock*.00009+w/8)%1,rad=R*(.18+u4*.86);ctx.beginPath();ctx.ellipse(cx,cy,rad,rad*.72,0,0,Math.PI*2);ctx.strokeStyle=rgba(w%3?P.aqua:P.goldDeep,(1-u4)*.10);ctx.stroke();}}
      }
      if(i===6){var phase=(clock%6200)/6200,missing=phase>.38&&phase<.68;var labels=["source witness","coverage","calibration","uncertainty","provenance"];labels.forEach(function(l,j){var yy=cy-R*.43+j*R*.18,xx=cx+R*.60,fail=missing&&j===1;ctx.beginPath();ctx.arc(xx,yy,4,0,Math.PI*2);ctx.fillStyle=rgba(fail?"#CB6149":P.aqua,fail?.88:.58);ctx.fill();ctx.font="500 9px ui-sans-serif,system-ui";ctx.fillStyle=rgba(fail?"#CB6149":P.aqua,.72);ctx.fillText(l+(fail?" · DELETED":""),xx+10,yy+3);});ctx.font="600 11px ui-sans-serif,system-ui";ctx.fillStyle=rgba(missing?"#CB6149":P.goldDeep,.78);ctx.fillText(missing?"AUTHORITY WITHHELD":"AUTHORITY AVAILABLE BY SCOPE",cx+R*.30,cy+R*.57);q('[data-hud="authority"]',hud).textContent=missing?"withheld":"tested";}
    }
    requestAnimationFrame(frame);
  }

  function initScienceTruthBoundary(){
    var track=q(".ffx-science-track");if(!track||q(".ffx-truth-boundary"))return;var steps=qa(".ffx-science-step",track);if(steps.length<4)return;
    var b=document.createElement("section");b.className="ffx-truth-boundary";b.innerHTML='<div class="ffx-truth-boundary__formal"><span>FORMAL SYSTEM</span><strong>internally closed</strong><small>proof establishes consequences inside the declared system</small><i></i></div><div class="ffx-truth-boundary__gap"><b>THE TRUTH BOUNDARY</b><span></span><em>proof ends here</em><em>measurement begins here</em></div><div class="ffx-truth-boundary__nature"><span>PHYSICAL WORLD</span><strong>still unanswered</strong><small>nature must be interrogated by an engineered measurement</small><i></i></div>';
    steps[2].insertAdjacentElement("afterend",b);
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){b.classList.add("is-in");io.unobserve(b);}});},{threshold:.35});io.observe(b);
  }

  function initProductsBranch(){
    var hero=q(".ffx-pagehero"),main=q(".ffx-page");if(!hero||!main||q(".ffx-product-branch"))return;var s=document.createElement("section");s.className="ffx-product-branch";s.innerHTML='<div class="wrap"><div class="ffx-product-branch__root"><span>FORMAL FOUNDATION</span><strong>One health structure</strong><i></i></div><div class="ffx-product-branch__fork"><article><span>APPLICATIONS</span><h3>Interpret state</h3><p>Bring the formal structure into daily or professional use.</p><b>Membrane Health</b></article><article><span>INSTRUMENTS</span><h3>Deepen physical evidence</h3><p>Increase source witness, calibration, sensing depth, and reconstruction authority.</p><b>DRTT → Rev B → QPCI</b></article></div></div>';hero.insertAdjacentElement("afterend",s);requestAnimationFrame(function(){s.classList.add("is-in");});
  }

  function initInvestorLocks(){
    var track=q(".ffx-risktrack");if(!track||track.dataset.pass2)return;track.dataset.pass2="true";var rail=document.createElement("i");rail.className="ffx-risk-rail";track.prepend(rail);var steps=qa(".ffx-riskstep",track),locked=0;
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var idx=steps.indexOf(e.target);if(idx<0)return;for(var i=0;i<=idx;i++)steps[i].classList.add("is-locked");locked=Math.max(locked,idx+1);rail.style.setProperty("--risk-progress",String(locked/steps.length));io.unobserve(e.target);});},{threshold:.45,rootMargin:"0px 0px -12% 0px"});steps.forEach(function(s){io.observe(s);});
  }

  var MAP_NODES=[
    ["boundary-comes-first.html","Boundary","Foundations",.12,.27],
    ["fixedness.html","Fixedness","Foundations",.28,.13],
    ["algebra-before-ai.html","Algebra before AI","Formal methods",.49,.18],
    ["certification-algebra.html","Certification","Formal methods",.72,.12],
    ["making-of-an-observable.html","Observable","Measurement",.43,.43],
    ["living-boundary.html","Living boundary","Measurement",.18,.56],
    ["residue-and-residual.html","Residual","Reconstruction",.68,.48],
    ["make-the-signal-fail.html","Failure","Evidence",.83,.66],
    ["one-plus-one.html","1 + 1 = 2","Relations",.48,.73],
    ["temperament.html","Temperament","Relations",.24,.82]
  ];
  var MAP_EDGES=[[0,1],[0,5],[1,2],[2,3],[2,4],[3,7],[4,5],[4,6],[4,8],[6,7],[6,8],[8,9]];
  function initResearchMap(){
    var pageSec=q(".ffx-research-page");if(!pageSec||q(".ffx-research-map"))return;var wrap=q(".wrap",pageSec)||pageSec;var s=document.createElement("section");s.className="ffx-research-map";s.innerHTML='<div class="ffx-research-map__copy"><p class="eyebrow">Research map</p><h2 class="h-section">The essays are connected by the problems they solve.</h2><p class="lede">Move through the map as a set of linked questions: what makes a system itself, how that becomes measurable, how reconstruction fails, and what evidence can honestly support.</p></div><div class="ffx-research-map__field"><svg viewBox="0 0 1000 620" role="img" aria-label="Research map connecting Fieldflux essays across foundations, formal methods, measurement, reconstruction, evidence, and relations."></svg><div class="ffx-research-map__detail"><span>Research notebook</span><strong>Select a node</strong><p>The map preserves the conceptual relationships between the essays instead of presenting them only as a chronology.</p></div></div>';
    wrap.prepend(s);var svg=q("svg",s),NS="http://www.w3.org/2000/svg";MAP_EDGES.forEach(function(e){var A=MAP_NODES[e[0]],B=MAP_NODES[e[1]],path=document.createElementNS(NS,"path");var x1=A[3]*1000,y1=A[4]*620,x2=B[3]*1000,y2=B[4]*620,mx=(x1+x2)/2,my=(y1+y2)/2-35;path.setAttribute("d","M"+x1+" "+y1+" Q"+mx+" "+my+" "+x2+" "+y2);path.setAttribute("class","ffx-research-edge");svg.appendChild(path);});MAP_NODES.forEach(function(n,i){var g=document.createElementNS(NS,"g");g.setAttribute("class","ffx-research-node");g.setAttribute("transform","translate("+(n[3]*1000)+" "+(n[4]*620)+")");g.setAttribute("tabindex","0");g.setAttribute("role","link");g.setAttribute("aria-label",n[1]+", "+n[2]);g.innerHTML='<circle r="10"></circle><circle class="halo" r="28"></circle><text y="-18" text-anchor="middle">'+n[1]+'</text><text class="cat" y="28" text-anchor="middle">'+n[2]+'</text>';function select(){qa(".ffx-research-node",svg).forEach(function(x){x.classList.remove("is-active");});g.classList.add("is-active");var d=q(".ffx-research-map__detail",s);q("span",d).textContent=n[2];q("strong",d).textContent=n[1];q("p",d).textContent="Open this field note to follow the "+n[2].toLowerCase()+" thread in the larger measurement science.";d.dataset.href=n[0];}g.addEventListener("click",function(){if(g.classList.contains("is-active"))location.href=n[0];else select();});g.addEventListener("keydown",function(e){if(e.key==="Enter"){if(g.classList.contains("is-active"))location.href=n[0];else select();}});svg.appendChild(g);if(i===4)select();});
  }

  function boot(){var p=page();if(p==="index.html")afterGenerated(".ffx-chain__stage",initHomeDepth);if(p==="platform.html")afterGenerated(".ffx-measurement__stage",initPlatformDepth);if(p==="science.html")afterGenerated(".ffx-science-track",initScienceTruthBoundary);if(p==="products.html")afterGenerated(".ffx-products-apps",initProductsBranch);if(p==="investors.html")afterGenerated(".ffx-risktrack",initInvestorLocks);if(p==="research.html")afterGenerated(".ffx-research-page",initResearchMap);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
