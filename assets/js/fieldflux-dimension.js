(function(){
  "use strict";
  if(window.__fieldfluxDimension)return;
  window.__fieldfluxDimension=true;

  var root=document.documentElement,body=document.body;
  root.classList.add("ffx-dimensional");

  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TAU=Math.PI*2;
  function q(s,c){return(c||document).querySelector(s);}
  function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function lerp(a,b,t){return a+(b-a)*t;}
  function hash(n){var x=Math.sin(n*127.1)*43758.5453123;return x-Math.floor(x);}
  function rgba(hex,a){var h=hex;if(/^#[0-9a-f]{6}$/i.test(h)){var n=parseInt(h.slice(1),16);return"rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")";}return h;}

  var REGIMES={
    origin:{bg:"#F0E3CF",a:"#173B5A",b:"#A56E20",cx:.76,cy:.47,r:.33,coh:.55,flux:.18,routes:.15,lattice:.06,turb:.10,closure:.48},
    mineral:{bg:"#D4E1E2",a:"#173B5A",b:"#B87542",cx:.70,cy:.50,r:.35,coh:.66,flux:.26,routes:.30,lattice:.18,turb:.09,closure:.62},
    slate:{bg:"#B8CBD0",a:"#123E54",b:"#A56E20",cx:.66,cy:.52,r:.36,coh:.72,flux:.32,routes:.42,lattice:.30,turb:.11,closure:.72},
    observatory:{bg:"#06131C",a:"#70C8D8",b:"#F1C46C",cx:.68,cy:.52,r:.40,coh:.80,flux:.76,routes:.64,lattice:.16,turb:.20,closure:.78},
    deep:{bg:"#102638",a:"#70C8D8",b:"#F1C46C",cx:.72,cy:.50,r:.35,coh:.92,flux:.20,routes:.46,lattice:.70,turb:.035,closure:.95},
    research:{bg:"#D4E1E2",a:"#173B5A",b:"#B87542",cx:.60,cy:.54,r:.42,coh:.61,flux:.22,routes:.72,lattice:.18,turb:.17,closure:.60}
  };
  var current=Object.assign({},REGIMES.origin),target=Object.assign({},REGIMES.origin),regime="origin";

  var canvas=document.createElement("canvas");
  canvas.className="ffx-world-field";
  canvas.setAttribute("aria-hidden","true");
  body.appendChild(canvas);
  var ctx=canvas.getContext("2d",{alpha:true}),W=1,H=1,D=1,clock=0,last=performance.now();
  function resize(){W=Math.max(1,innerWidth||1);H=Math.max(1,innerHeight||1);D=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(D,0,0,D,0,0);}
  addEventListener("resize",resize,{passive:true});resize();

  var pointer={x:0,y:0,tx:0,ty:0};
  addEventListener("pointermove",function(e){pointer.tx=clamp((e.clientX/W-.5)*2,-1,1);pointer.ty=clamp((e.clientY/H-.5)*2,-1,1);},{passive:true});
  addEventListener("pointerleave",function(){pointer.tx=0;pointer.ty=0;},{passive:true});

  var motes=Array.from({length:150},function(_,i){var a=hash(i*3.17)*TAU,r=Math.sqrt(hash(i*5.41)),z=hash(i*8.23)*2-1;return{a:a,r:r,z:z,p:hash(i*11.2)*TAU,s:.5+hash(i*13.8)*1.7,band:i%9};});
  var routePairs=Array.from({length:18},function(_,i){return[i%42,(i*7+11)%42];});
  var nodes=Array.from({length:42},function(_,i){var a=i/42*TAU+hash(i*3.4)*.12,r=.28+.65*hash(i*5.8),z=-.55+1.1*hash(i*7.6);return{a:a,r:r,z:z,p:hash(i*12.1)*TAU};});

  function classify(el){
    if(!el)return"origin";
    if(el.matches(".ffx-chain,.ffx-measurement-cinema,.ffx-measurement__stage"))return"observatory";
    if(el.matches(".ffx-proofband,.ffx-formal,.ffx-evidence,.ffx-products-instruments,.ffx-capital,.ffx-final,.ffx-pagehero.deep,.band-deep,.footer"))return"deep";
    if(el.matches(".ffx-science-descent,.ffx-three-truths,.ffx-risk,.ffx-defensibility"))return"slate";
    if(el.matches(".ffx-research-preview,.ffx-research-page"))return"research";
    if(el.matches(".ffx-instruments,.ffx-instrument-scale,.ffx-products-apps,.ffx-product-branch,.ffx-pagehero,.page-hero,.section"))return"mineral";
    if(el.matches(".ffx-homehero,.hero"))return"origin";
    return"mineral";
  }
  function relevantSections(){
    var modern=qa(".ffx-page>section");
    if(modern.length)return modern;
    return qa("body>section").concat(qa("body>footer"));
  }
  var sections=[];
  function refreshSections(){sections=relevantSections();}
  refreshSections();
  setTimeout(refreshSections,300);setTimeout(refreshSections,1000);

  function updateRegime(){
    var center=H*.48,best=null,bestDist=Infinity;
    sections.forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom<0||r.top>H)return;var c=(Math.max(0,r.top)+Math.min(H,r.bottom))/2,d=Math.abs(c-center);if(d<bestDist){bestDist=d;best=el;}});
    var next=classify(best);
    if(next!==regime){regime=next;body.dataset.ffxRegime=next;target=Object.assign({},REGIMES[next]);}
  }
  addEventListener("scroll",updateRegime,{passive:true});updateRegime();

  function blendState(){["cx","cy","r","coh","flux","routes","lattice","turb","closure"].forEach(function(k){current[k]=lerp(current[k],target[k],.025);});current.a=target.a;current.b=target.b;current.bg=target.bg;}
  function project(n,cx,cy,R){var wob=(1-current.coh)*current.turb,aa=n.a+Math.sin(clock*.00009+n.p)*wob*.26,rr=n.r*(.78+.22*current.closure)+Math.sin(clock*.00013+n.p)*wob*.04,z=n.z,depth=1/(1.30+z*.32);return{x:cx+Math.cos(aa)*rr*R*depth+pointer.x*18*(1+z),y:cy+Math.sin(aa)*rr*R*.70*depth+pointer.y*12*(1+z),z:z,depth:depth};}
  function curve(a,b,bend,c,alpha){var dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(lerp(a.x,b.x,.33)+nx*bend,lerp(a.y,b.y,.33)+ny*bend,lerp(a.x,b.x,.67)+nx*bend,lerp(a.y,b.y,.67)+ny*bend,b.x,b.y);ctx.strokeStyle=rgba(c,alpha);ctx.lineWidth=.65;ctx.stroke();}
  function glow(x,y,r,c,a){var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(c,a));g.addColorStop(.35,rgba(c,a*.22));g.addColorStop(1,rgba(c,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}

  function draw(){
    blendState();pointer.x=lerp(pointer.x,pointer.tx,.04);pointer.y=lerp(pointer.y,pointer.ty,.04);
    ctx.clearRect(0,0,W,H);var cx=W*current.cx,cy=H*current.cy,R=Math.min(W,H)*current.r;
    glow(cx,cy,R*1.25,current.a,regime==="observatory"||regime==="deep"?.035:.018);glow(cx+R*.24,cy-R*.08,R*.72,current.b,regime==="observatory"||regime==="deep"?.025:.012);

    for(var sh=0;sh<12;sh++){var d=sh/11,rr=R*(1.02-d*.48),rot=clock*.000013*(sh%2?1:-1)+sh*.09;ctx.beginPath();ctx.ellipse(cx+pointer.x*6*d,cy+pointer.y*4*d,rr,rr*.70,rot,0,TAU);ctx.strokeStyle=rgba(sh%4===0?current.b:current.a,(regime==="observatory"||regime==="deep"?.012:.008)+(.028*(1-d)*current.closure));ctx.lineWidth=.55;ctx.stroke();}

    var pts=nodes.map(function(n){return project(n,cx,cy,R);});
    if(current.routes>.05){routePairs.forEach(function(pair,i){var a=pts[pair[0]],b=pts[pair[1]],bend=(i%2?1:-1)*R*.025;curve(a,b,bend,i%4===0?current.b:current.a,.025+.055*current.routes);});}
    if(current.lattice>.08){ctx.save();ctx.globalAlpha=.18*current.lattice;for(var gx=-4;gx<=4;gx++){ctx.beginPath();ctx.moveTo(cx+gx*R*.12,cy-R*.58);ctx.lineTo(cx+gx*R*.12,cy+R*.58);ctx.strokeStyle=rgba(current.a,.12);ctx.stroke();}for(var gy=-3;gy<=3;gy++){ctx.beginPath();ctx.moveTo(cx-R*.72,cy+gy*R*.15);ctx.lineTo(cx+R*.72,cy+gy*R*.15);ctx.strokeStyle=rgba(current.b,.09);ctx.stroke();}ctx.restore();}

    motes.map(function(m){return{m:m,p:project(m,cx,cy,R)};}).sort(function(a,b){return a.p.z-b.p.z;}).forEach(function(o,i){var p=o.p,m=o.m,c=m.band%5===0?current.b:current.a,a=(regime==="observatory"||regime==="deep"?.06:.035)+.10*(p.z+1)/2;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.35,m.s*p.depth),0,TAU);ctx.fillStyle=rgba(c,a);ctx.fill();if(i%31===0&&current.flux>.15){var u=(clock*.000055+i*.031)%1;ctx.beginPath();ctx.arc(lerp(p.x,cx,u),lerp(p.y,cy,u),1.1,0,TAU);ctx.fillStyle=rgba(current.b,.25*current.flux);ctx.fill();}});

    requestAnimationFrame(frame);
  }
  function frame(now){var dt=Math.min(50,now-last);last=now;if(!reduce)clock+=dt;draw();}
  requestAnimationFrame(frame);

  var copy=document.createElement("script");
  copy.src="assets/js/fieldflux-copy-polish.js?v=1";
  copy.async=false;
  copy.dataset.fieldfluxCopyPolish="true";
  document.body.appendChild(copy);

  var investor=document.createElement("script");
  investor.src="assets/js/fieldflux-investor-status.js?v=1";
  investor.async=false;
  investor.dataset.fieldfluxInvestorStatus="true";
  document.body.appendChild(investor);
})();
