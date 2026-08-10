(function(){
  "use strict";
  if(window.__fieldfluxWorld)return;
  window.__fieldfluxWorld=true;

  var page=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  var root=document.documentElement,body=document.body;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TAU=Math.PI*2;
  function q(s,c){return(c||document).querySelector(s);}
  function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function lerp(a,b,t){return a+(b-a)*t;}
  function smooth(t){t=clamp(t,0,1);return t*t*(3-2*t);}
  function hash(n){var x=Math.sin(n*127.1)*43758.5453123;return x-Math.floor(x);}
  function rgba(hex,a){var h=hex;if(/^#[0-9a-f]{6}$/i.test(h)){var n=parseInt(h.slice(1),16);return"rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")";}return h;}

  if(!q('link[data-fieldflux-world]')){
    var css=document.createElement("link");css.rel="stylesheet";css.href="assets/css/fieldflux-world.css?v=1";css.dataset.fieldfluxWorld="true";document.head.appendChild(css);
  }
  body.classList.add("ffx-world-thread");

  var BEATS=[
    {id:"boundary",k:"01 · Boundary",t:"Difference becomes form.",b:"A living thing remains itself by maintaining regulated differences across a boundary: charge, pressure, temperature, concentration, timing, and exchange held in relation.",href:"boundary-comes-first.html",label:"Read The Boundary Comes First →"},
    {id:"site",k:"02 · Site",t:"A boundary can answer locally.",b:"A known interrogation meets an accessible site. The source, timing, geometry, contact, and response establish a local event whose lineage can be preserved.",href:"living-boundary.html",label:"Read the living boundary →"},
    {id:"relation",k:"03 · Relation",t:"The second site changes the object.",b:"With two sites, the measurement becomes relational. Lead and lag, timing agreement, coherence, amplitude, and response can now be read between distinct, supported events.",href:"one-plus-one.html",label:"Why 1 + 1 has to equal 2 →"},
    {id:"route",k:"04 · Route",t:"Relation acquires a path.",b:"Registered relationships join into routes. A route carries order, branch points, transitions, gradients, shared structure, and the history of how a disturbance moved through the field.",href:"platform.html#measurement",label:"Enter Distributed Real-Time Topology →"},
    {id:"laminarity",k:"05 · Laminar field",t:"Order becomes visible in motion.",b:"Laminarity asks how coherently relational movement remains organized across sites and routes. The field is read through the way timing and response preserve ordered transport as change moves through it.",href:"laminar-demo.html",label:"Open the live laminarity measurement →"},
    {id:"residue",k:"06 · Residue",t:"The return remembers the exchange.",b:"Some response remains after the initiating exchange should have resolved. Its decay, persistence, timing, and distribution become a measurable residue carried by the living boundary.",href:"residue-and-residual.html",label:"Follow residue into residual →"},
    {id:"observable",k:"07 · Observable",t:"A signal earns a physical meaning.",b:"Calibration, admissibility, closure, fixedness, boundary accounting, and provenance determine which structure can cross from a recorded signal into a physical observable.",href:"making-of-an-observable.html",label:"See the making of an observable →"},
    {id:"instrument",k:"08 · Instrument",t:"The witness becomes physical.",b:"DRTT, Rev B, and bedside QPCI interrogate the same measurement object at increasing levels of source closure, calibration, physical witness, granularity, and translational depth.",href:"products.html",label:"Follow the instrument scale →"},
    {id:"evidence",k:"09 · Evidence",t:"Authority accumulates around the result.",b:"Coverage, calibration, uncertainty, deletion tests, repeatability, provenance, studies, pilots, and trials determine the scope a result has earned at this moment in the evidence program.",href:"investors.html",label:"See the development and evidence horizon →"},
    {id:"health",k:"10 · Health",t:"Preserved relation through regulated difference.",b:"The full chain returns to the premise that began it: health is a living system preserving enough regulated difference and relational organization to remain itself through change.",href:"science.html",label:"Return to the definition of health →"}
  ];

  var PAGE_STAGE={
    "index.html":"health","science.html":"health","platform.html":"laminarity","products.html":"instrument","research.html":"observable","investors.html":"evidence","about.html":"health","ethics.html":"evidence","careers.html":"health","contact.html":"health",
    "boundary-comes-first.html":"boundary","living-boundary.html":"site","one-plus-one.html":"relation","fixedness.html":"relation","residue-and-residual.html":"residue","making-of-an-observable.html":"observable","certification-algebra.html":"observable","temperament.html":"observable","algebra-before-ai.html":"observable","make-the-signal-fail.html":"evidence"
  };
  function stageForPage(){return PAGE_STAGE[page]||"relation";}
  function rememberStage(id){try{sessionStorage.setItem("ffxWorldStage",id);}catch(e){}}

  function upgradeNav(){
    qa(".nav__links").forEach(function(nav){
      var links=[["world.html","World"],["science.html","Science"],["platform.html","Platform"],["products.html","Products"],["research.html","Research"],["about.html","Company"],["investors.html","Investors"]];
      nav.innerHTML=links.map(function(x){var active=page===x[0]?' class="is-active" aria-current="page"':"";var world=x[0]==="world.html"?' data-world-link="true"':"";return'<a href="'+x[0]+'"'+world+active+'>'+x[1]+'</a>';}).join("");
    });
    var homePrimary=q(".ffx-homehero .ffx-actions .btn--primary");
    if(homePrimary){homePrimary.href="world.html";homePrimary.textContent="Enter the world";homePrimary.classList.add("ffx-world-entry");}
  }

  var COMPASS=[
    ["boundary","Boundary"],["site","Site"],["relation","Relation"],["laminarity","Laminar field"],["residue","Residue"],["observable","Observable"],["instrument","Instrument"],["evidence","Evidence"],["health","Health"]
  ];
  function compass(){
    if(page==="world.html"||q(".ffx-field-compass"))return;
    var active=stageForPage(),label=(COMPASS.filter(function(x){return x[0]===active;})[0]||["relation","Relation"])[1];
    var el=document.createElement("aside");el.className="ffx-field-compass";el.setAttribute("aria-label","Field compass");
    el.innerHTML='<div class="ffx-field-compass__panel">'+COMPASS.map(function(x){return'<a href="world.html#'+x[0]+'" data-stage="'+x[0]+'" class="'+(x[0]===active?'is-active':'')+'"><i></i><span>'+x[1]+'</span></a>';}).join("")+'<a class="ffx-field-compass__world" href="world.html#'+active+'" data-stage="'+active+'"><i></i><span>Open the Fieldflux world</span></a></div><button class="ffx-field-compass__button" type="button" aria-expanded="false"><span class="ffx-field-compass__glyph"><i></i></span><span><small>Field position</small><b>'+label+'</b></span><span>+</span></button>';
    body.appendChild(el);
    var btn=q(".ffx-field-compass__button",el);btn.addEventListener("click",function(){var open=el.classList.toggle("is-open");btn.setAttribute("aria-expanded",open?"true":"false");});
    qa("a[data-stage]",el).forEach(function(a){a.addEventListener("click",function(){rememberStage(a.dataset.stage);});});
  }

  function canvasSize(canvas,host){var ctx=canvas.getContext("2d",{alpha:true}),W=1,H=1,D=1;function resize(){var r=host.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);D=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(D,0,0,D,0,0);}if("ResizeObserver" in window)new ResizeObserver(resize).observe(host);else addEventListener("resize",resize,{passive:true});resize();return{ctx:ctx,getW:function(){return W;},getH:function(){return H;}};}
  function curve(ctx,a,b,bend,color,alpha,width){var dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(lerp(a.x,b.x,.34)+nx*bend,lerp(a.y,b.y,.34)+ny*bend,lerp(a.x,b.x,.66)+nx*bend,lerp(a.y,b.y,.66)+ny*bend,b.x,b.y);ctx.strokeStyle=rgba(color,alpha);ctx.lineWidth=width||1;ctx.stroke();}
  function glow(ctx,x,y,r,color,a){var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(color,a));g.addColorStop(.3,rgba(color,a*.23));g.addColorStop(1,rgba(color,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}

  function initHero(){
    var canvas=q("#ffx-world-hero-canvas"),host=q(".ffx-world-hero");if(!canvas||!host)return;
    var S=canvasSize(canvas,host),ctx=S.ctx,clock=0,last=performance.now(),pointer={x:0,y:0,tx:0,ty:0};
    var nodes=Array.from({length:48},function(_,i){return{a:i/48*TAU+hash(i*8.1)*.13,r:.22+.72*hash(i*3.7),z:hash(i*4.9),p:hash(i*9.6)*TAU};});
    host.addEventListener("pointermove",function(e){var r=host.getBoundingClientRect();pointer.tx=(e.clientX-r.left)/r.width-.5;pointer.ty=(e.clientY-r.top)/r.height-.5;},{passive:true});host.addEventListener("pointerleave",function(){pointer.tx=pointer.ty=0;},{passive:true});
    function frame(now){var dt=Math.min(50,now-last);last=now;if(!reduce)clock+=dt;pointer.x=lerp(pointer.x,pointer.tx,.035);pointer.y=lerp(pointer.y,pointer.ty,.035);var W=S.getW(),H=S.getH(),cx=W*.71+pointer.x*22,cy=H*.50+pointer.y*14,R=Math.min(W*.31,H*.40);ctx.clearRect(0,0,W,H);glow(ctx,cx,cy,R*1.45,"#70C8D8",.045);glow(ctx,cx+R*.20,cy-R*.08,R*.86,"#F1C46C",.025);
      for(var sh=0;sh<18;sh++){var d=sh/17,rr=R*(1-d*.55),rot=clock*.000012*(sh%2?1:-1)+sh*.08;ctx.beginPath();ctx.ellipse(cx,cy,rr,rr*.70,rot,0,TAU);ctx.strokeStyle=rgba(sh%5===0?"#F1C46C":"#70C8D8",.018+.035*(1-d));ctx.lineWidth=.7;ctx.stroke();}
      var pts=nodes.map(function(n){var aa=n.a+Math.sin(clock*.00005+n.p)*.035,rr=n.r*R*(.86+.12*n.z);return{x:cx+Math.cos(aa)*rr,y:cy+Math.sin(aa)*rr*.70,z:n.z};});
      for(var i=0;i<25;i++){var A=pts[i],B=pts[(i*7+13)%pts.length];curve(ctx,A,B,(i%2?1:-1)*R*.025,i%4===0?"#F1C46C":"#70C8D8",.045,0.7);var u=(clock*.000035+i*.071)%1;var x=lerp(A.x,B.x,u),y=lerp(A.y,B.y,u);ctx.beginPath();ctx.arc(x,y,1.25,0,TAU);ctx.fillStyle=rgba(i%4===0?"#F1C46C":"#70C8D8",.5);ctx.fill();}
      pts.forEach(function(p,i){ctx.beginPath();ctx.arc(p.x,p.y,i%9===0?2.5:1.1,0,TAU);ctx.fillStyle=rgba(i%7===0?"#F1C46C":"#70C8D8",.22+.25*p.z);ctx.fill();});requestAnimationFrame(frame);}
    requestAnimationFrame(frame);
  }

  function initWorldCinema(){
    var cinema=q(".ffx-world-cinema__track"),stage=q(".ffx-world-stage"),canvas=q("#ffx-world-stage-canvas");if(!cinema||!stage||!canvas)return;
    cinema.style.minHeight=(BEATS.length*100)+"vh";
    var S=canvasSize(canvas,stage),ctx=S.ctx,copy=q(".ffx-world-stage__copy"),k=q(".kicker",copy),h=q("h2",copy),p=q("p",copy),a=q("a",copy),count=q(".ffx-world-stage__counter b"),meter=q(".ffx-world-stage__counter i"),clock=0,last=performance.now(),active=-1;
    var nodes=Array.from({length:24},function(_,i){return{a:i/24*TAU+(i%3)*.08,r:.30+.56*hash(i*5.3),p:hash(i*7.1)*TAU};});
    function progress(){var r=cinema.getBoundingClientRect(),vh=Math.max(1,innerHeight),travel=Math.max(1,r.height-vh);return clamp((-r.top)/travel,0,1);}
    function point(n,cx,cy,R){var aa=n.a+Math.sin(clock*.000055+n.p)*.025;return{x:cx+Math.cos(aa)*n.r*R,y:cy+Math.sin(aa)*n.r*R*.70};}
    function draw(x){var W=S.getW(),H=S.getH(),cx=W*.70,cy=H*.49,R=Math.min(W*.29,H*.38),idx=Math.floor(x),f=smooth(x-idx);ctx.clearRect(0,0,W,H);glow(ctx,cx,cy,R*1.35,"#70C8D8",.035);var pts=nodes.map(function(n){return point(n,cx,cy,R);});
      // persistent boundary
      for(var sh=0;sh<10;sh++){var rr=R*(1-sh*.035);ctx.beginPath();ctx.ellipse(cx,cy,rr,rr*.70,clock*.000009*(sh%2?1:-1),0,TAU);ctx.strokeStyle=rgba(sh%4===0?"#F1C46C":"#70C8D8",.02+.012*(10-sh));ctx.lineWidth=.65;ctx.stroke();}
      if(x>=1){var site=pts[3],sx=cx-R*1.25,sy=cy-R*.22;ctx.beginPath();ctx.arc(sx,sy,5,0,TAU);ctx.fillStyle=rgba("#F1C46C",.82);ctx.fill();curve(ctx,{x:sx,y:sy},site,-R*.06,"#F1C46C",.25,1);for(var r=0;r<4;r++){var u=(clock*.00013+r*.23)%1;ctx.beginPath();ctx.arc(sx,sy,8+u*R*.27,0,TAU);ctx.strokeStyle=rgba("#F1C46C",(1-u)*.12);ctx.stroke();}}
      if(x>=2){[3,14].forEach(function(n,i){ctx.beginPath();ctx.arc(pts[n].x,pts[n].y,4.2,0,TAU);ctx.fillStyle=rgba(i?"#70C8D8":"#F1C46C",.82);ctx.fill();});curve(ctx,pts[3],pts[14],R*.10,"#70C8D8",.24,1.3);var u2=(clock*.00008)%1;ctx.beginPath();ctx.arc(lerp(pts[3].x,pts[14].x,u2),lerp(pts[3].y,pts[14].y,u2),2,0,TAU);ctx.fillStyle=rgba("#F1C46C",.78);ctx.fill();}
      if(x>=3){var order=[3,7,11,15,19,23,4,8,12,16];for(var j=0;j<order.length-1;j++){curve(ctx,pts[order[j]],pts[order[j+1]],(j%2?1:-1)*R*.035,j%3===0?"#F1C46C":"#70C8D8",.13,1);}}
      if(x>=4){for(var line=0;line<16;line++){var off=(line-7.5)*R*.047;ctx.beginPath();for(var s=0;s<=46;s++){var u3=s/46,xx=cx-R*1.02+u3*R*2.04,amp=R*.020*(1+.4*Math.sin(line*.9)),yy=cy+off+Math.sin(u3*TAU+line*.48+clock*.00020)*amp;if(s)ctx.lineTo(xx,yy);else ctx.moveTo(xx,yy);}ctx.strokeStyle=rgba(line%5===0?"#F1C46C":"#70C8D8",.055+.035*f);ctx.lineWidth=.72;ctx.stroke();}}
      if(x>=5){for(var tail=0;tail<8;tail++){var ang=.4+tail*.32,rad=R*(.28+tail*.055),alpha=.14*(1-tail/8);ctx.beginPath();ctx.arc(cx+Math.cos(ang)*rad,cy+Math.sin(ang)*rad*.70,4+tail*2,0,TAU);ctx.strokeStyle=rgba("#F1C46C",alpha);ctx.stroke();}}
      if(x>=6){var labels=["admissible","closed","fixed","witnessed","mature"];labels.forEach(function(lbl,i){var xx=cx+R*.83+i*7,yy=cy-R*.56+i*R*.23;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+R*.26,yy);ctx.strokeStyle=rgba(i<3?"#70C8D8":"#F1C46C",.18);ctx.stroke();ctx.font="500 9px ui-sans-serif,system-ui";ctx.fillStyle=rgba(i<3?"#70C8D8":"#F1C46C",.62);ctx.fillText(lbl,xx+5,yy-5);});}
      if(x>=7){[.64,.82,1.02].forEach(function(sc,i){ctx.beginPath();ctx.ellipse(cx,cy,R*sc,R*.70*sc,0,0,TAU);ctx.setLineDash(i<2?[4,8]:[]);ctx.strokeStyle=rgba(i===0?"#70C8D8":"#F1C46C",.12+.07*i);ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([]);});}
      if(x>=8){for(var e=0;e<6;e++){var yy=cy-R*.52+e*R*.20;ctx.beginPath();ctx.moveTo(cx-R*.78,yy);ctx.lineTo(cx-R*.42,yy);ctx.strokeStyle=rgba(e<5?"#70C8D8":"#F1C46C",.12+.02*e);ctx.stroke();}}
      pts.forEach(function(pt,i){ctx.beginPath();ctx.arc(pt.x,pt.y,i%8===0?2.3:1,0,TAU);ctx.fillStyle=rgba(i%6===0?"#F1C46C":"#70C8D8",.16+(x>=9?.20:.05));ctx.fill();});
      if(x>=9){ctx.beginPath();ctx.ellipse(cx,cy,R*.91,R*.64,0,0,TAU);ctx.strokeStyle=rgba("#F1C46C",.48);ctx.lineWidth=1.5;ctx.stroke();glow(ctx,cx,cy,R*.42,"#70C8D8",.028);}
    }
    function updateCopy(idx,pr){if(idx===active)return;active=idx;var b=BEATS[idx];k.textContent=b.k;h.textContent=b.t;p.textContent=b.b;a.href=b.href;a.textContent=b.label;count.textContent=String(idx+1).padStart(2,"0");meter.style.setProperty("--world-progress",(idx+1)/BEATS.length);rememberStage(b.id);}
    function frame(now){var dt=Math.min(50,now-last);last=now;if(!reduce)clock+=dt;var pr=progress(),x=pr*(BEATS.length-1),idx=Math.round(x);updateCopy(idx,pr);draw(x);requestAnimationFrame(frame);}requestAnimationFrame(frame);

    // Restore the visitor to the corresponding position when World is entered from elsewhere.
    setTimeout(function(){var id=(location.hash||"").replace("#","");if(!id){try{id=sessionStorage.getItem("ffxWorldStage")||"";}catch(e){}}var ix=BEATS.findIndex(function(b){return b.id===id;});if(ix>0){var r=cinema.getBoundingClientRect(),top=scrollY+r.top,travel=Math.max(1,cinema.offsetHeight-innerHeight),target=top+(ix/(BEATS.length-1))*travel;scrollTo({top:target,behavior:reduce?"auto":"smooth"});}},180);
    qa(".ffx-world-stage__copy a").forEach(function(link){link.addEventListener("click",function(){rememberStage(BEATS[active].id);});});
  }

  function initWorldPage(){if(page!=="world.html")return;body.classList.add("ffx-world-page");initHero();initWorldCinema();qa("[data-world-stage]").forEach(function(a){a.addEventListener("click",function(){rememberStage(a.dataset.worldStage);});});}

  function boot(){upgradeNav();compass();initWorldPage();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
