(function(){
  "use strict";
  if(window.__fieldfluxCinema)return;
  window.__fieldfluxCinema=true;

  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root=document.documentElement;
  var TAU=Math.PI*2;

  function q(s,c){return (c||document).querySelector(s);}
  function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function lerp(a,b,t){return a+(b-a)*t;}
  function smooth(t){t=clamp(t,0,1);return t*t*(3-2*t);}
  function hash(n){var x=Math.sin(n*127.1)*43758.5453123;return x-Math.floor(x);}
  function rgba(hex,a){
    var h=String(hex||"").trim();
    if(/^#[0-9a-f]{3}$/i.test(h))h="#"+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
    if(/^#[0-9a-f]{6}$/i.test(h)){
      var n=parseInt(h.slice(1),16);
      return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")";
    }
    return h;
  }
  function palette(){var cs=getComputedStyle(root);return{
    paper:cs.getPropertyValue("--paper").trim()||"#FBF5EC",
    paper2:cs.getPropertyValue("--paper-2").trim()||"#FFFBF4",
    navy:cs.getPropertyValue("--navy").trim()||"#1E4065",
    deep:cs.getPropertyValue("--deep").trim()||"#162C46",
    gold:cs.getPropertyValue("--gold").trim()||"#9A6A12",
    goldDeep:cs.getPropertyValue("--gold-on-deep").trim()||"#F4C267",
    aqua:"#6FB6CE",
    aqua2:"#9AD7E7",
    red:"#CB6149"
  };}
  function page(){var p=location.pathname.split("/").pop();return p||"index.html";}
  function afterGenerated(selector,fn){var tries=0;(function wait(){var el=q(selector);if(el){fn(el);return;}if(++tries<160)setTimeout(wait,50);})();}
  function glow(ctx,x,y,r,c,a){if(r<=0)return;var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(c,a));g.addColorStop(.28,rgba(c,a*.34));g.addColorStop(1,rgba(c,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  function line(ctx,a,b,c,alpha,w){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=rgba(c,alpha);ctx.lineWidth=w||1;ctx.stroke();}
  function curve(ctx,a,b,bend,c,alpha,w){var dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,c1={x:lerp(a.x,b.x,.33)+nx*bend,y:lerp(a.y,b.y,.33)+ny*bend},c2={x:lerp(a.x,b.x,.67)+nx*bend,y:lerp(a.y,b.y,.67)+ny*bend};ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(c1.x,c1.y,c2.x,c2.y,b.x,b.y);ctx.strokeStyle=rgba(c,alpha);ctx.lineWidth=w||1;ctx.stroke();return[c1,c2];}
  function curvePoint(a,b,bend,u){var dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,c1={x:lerp(a.x,b.x,.33)+nx*bend,y:lerp(a.y,b.y,.33)+ny*bend},c2={x:lerp(a.x,b.x,.67)+nx*bend,y:lerp(a.y,b.y,.67)+ny*bend},v=1-u,uu=u*u,vv=v*v;return{x:vv*v*a.x+3*vv*u*c1.x+3*v*uu*c2.x+uu*u*b.x,y:vv*v*a.y+3*vv*u*c1.y+3*v*uu*c2.y+uu*u*b.y};}

  function makeSurface(stage,cls){
    stage.classList.add("is-cinematic");
    var c=document.createElement("canvas");c.className="ffx-cinema-canvas "+cls;c.setAttribute("aria-hidden","true");stage.appendChild(c);
    return c;
  }
  function pointerState(stage){
    var p={x:0,y:0,tx:0,ty:0};
    stage.addEventListener("pointermove",function(e){var r=stage.getBoundingClientRect();p.tx=clamp(((e.clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1);p.ty=clamp(((e.clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1);},{passive:true});
    stage.addEventListener("pointerleave",function(){p.tx=0;p.ty=0;},{passive:true});
    p.tick=function(){p.x=lerp(p.x,p.tx,.055);p.y=lerp(p.y,p.ty,.055);};return p;
  }
  function progressFor(cinema,topFrac,bottomFrac){var r=cinema.getBoundingClientRect(),vh=Math.max(1,innerHeight||1),travel=Math.max(1,r.height-vh*(bottomFrac||.78));return clamp((-r.top+vh*(topFrac||.10))/travel,0,1);}
  function setupCanvas(canvas,stage){var ctx=canvas.getContext("2d",{alpha:true}),S={W:1,H:1,D:1};function resize(){var r=stage.getBoundingClientRect();S.W=Math.max(1,r.width);S.H=Math.max(1,r.height);S.D=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(S.W*S.D);canvas.height=Math.round(S.H*S.D);canvas.style.width=S.W+"px";canvas.style.height=S.H+"px";ctx.setTransform(S.D,0,0,S.D,0,0);}new ResizeObserver(resize).observe(stage);resize();return{ctx:ctx,S:S};}

  function homeMotes(){return Array.from({length:320},function(_,i){var z=hash(i*3.13)*2-1,a=hash(i*5.17)*TAU,r=Math.sqrt(hash(i*7.91))*.88,s=Math.sqrt(Math.max(0,1-z*z));return{x:Math.cos(a)*r*s,y:Math.sin(a)*r*s,z:z*r,p:hash(i*11.7)*TAU,size:.45+hash(i*13.3)*1.4,band:i%7};});}

  function initHomeCinema(stage){
    if(stage.dataset.cinema)return;stage.dataset.cinema="true";
    var cinema=stage.closest(".ffx-chain__cinema"),canvas=makeSurface(stage,"ffx-cinema-canvas--home"),pack=setupCanvas(canvas,stage),ctx=pack.ctx,S=pack.S,pointer=pointerState(stage),motes=homeMotes(),last=performance.now(),clock=0;
    function project(m,cx,cy,R,camZ,align,settle){
      var a=Math.atan2(m.y,m.x),rad=Math.hypot(m.x,m.y),band=Math.round((a+Math.PI)/TAU*10)/10*TAU-Math.PI;
      var aa=lerp(a,band,align*.48),rr=rad*(1-.10*settle)+Math.sin(m.p+clock*.00018)*.018*(1-settle),x=Math.cos(aa)*rr,y=Math.sin(aa)*rr*.72,z=m.z*.62;
      var persp=1/(1.22+(z-camZ)*.42);return{x:cx+x*R*persp,y:cy+y*R*persp,z:z,scale:persp};
    }
    function drawMembrane(cx,cy,R,x,P){
      var constrain=smooth((x-.45)/1.1),verify=smooth((x-1.45)/.85),physical=smooth((x-2.55)/.85),engineer=smooth((x-3.55)/.8),witness=smooth((x-4.45)/.8),qualify=smooth((x-5.45)/.75);
      glow(ctx,cx,cy,R*1.55,P.navy,.035+physical*.018);glow(ctx,cx+R*.18,cy-R*.08,R*.82,P.gold,.026+qualify*.025);
      for(var sh=0;sh<22;sh++){
        var d=sh/21,rr=R*(.98-d*.44),phase=clock*.000025*(sh%2?1:-1)+sh*.11,warp=(1-verify)*(.015+.010*Math.sin(clock*.00025+sh));ctx.beginPath();
        for(var k=0;k<=120;k++){var a=k/120*TAU,r=rr*(1+warp*Math.sin(a*3+phase)+warp*.55*Math.sin(a*7-phase)),px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r*.72;if(k)ctx.lineTo(px,py);else ctx.moveTo(px,py);}ctx.closePath();ctx.strokeStyle=rgba(sh%5===0?P.gold:P.navy,.018+.040*(1-d)+verify*.015);ctx.lineWidth=sh===0?1.2:.55;ctx.stroke();
      }
      if(constrain>.05){ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,R*.96,R*.69,0,0,TAU);ctx.clip();for(var g=-5;g<=5;g++){var xx=cx+g*R*.13;ctx.beginPath();ctx.moveTo(xx,cy-R*.65);ctx.lineTo(xx,cy+R*.65);ctx.strokeStyle=rgba(P.navy,.025*constrain);ctx.stroke();}for(var gy=-4;gy<=4;gy++){var yy=cy+gy*R*.14;ctx.beginPath();ctx.moveTo(cx-R*.85,yy);ctx.lineTo(cx+R*.85,yy);ctx.strokeStyle=rgba(P.gold,.018*constrain);ctx.stroke();}ctx.restore();}
      if(verify>.05){for(var n=0;n<8;n++){var a2=n/8*TAU+clock*.00002,px2=cx+Math.cos(a2)*R*.76,py2=cy+Math.sin(a2)*R*.55;glow(ctx,px2,py2,16,P.gold,.025*verify);ctx.beginPath();ctx.arc(px2,py2,2.4,0,TAU);ctx.fillStyle=rgba(P.gold,.55*verify);ctx.fill();line(ctx,{x:px2,y:py2},{x:cx+Math.cos(a2)*R*.93,y:cy+Math.sin(a2)*R*.67},P.gold,.08*verify,.8);}}
      if(physical>.05){for(var e=0;e<24;e++){var a3=-1.3+e/23*2.6,edge={x:cx+Math.cos(a3)*R*.98,y:cy+Math.sin(a3)*R*.705},out={x:edge.x+Math.cos(a3)*R*(.25+.16*hash(e*2.4)),y:edge.y+Math.sin(a3)*R*(.18+.11*hash(e*5.4))};var u=(clock*.00006+e*.073)%1,p0={x:lerp(out.x,edge.x,u),y:lerp(out.y,edge.y,u)};curve(ctx,out,edge,(e%2?1:-1)*R*.025,e%4===0?P.aqua:P.gold,.045*physical,.7);ctx.beginPath();ctx.arc(p0.x,p0.y,1.2,0,TAU);ctx.fillStyle=rgba(e%4===0?P.aqua:P.gold,.42*physical);ctx.fill();}}
      if(engineer>.05){for(var s=0;s<8;s++){var a4=s/8*TAU+.18,px3=cx+Math.cos(a4)*R*1.16,py3=cy+Math.sin(a4)*R*.84;glow(ctx,px3,py3,14,s%3===0?P.aqua:P.gold,.035*engineer);ctx.beginPath();ctx.arc(px3,py3,4,0,TAU);ctx.fillStyle=rgba(s%3===0?P.aqua:P.gold,.62*engineer);ctx.fill();line(ctx,{x:px3,y:py3},{x:cx+Math.cos(a4)*R*.93,y:cy+Math.sin(a4)*R*.67},s%3===0?P.aqua:P.gold,.11*engineer,.8);}for(var frame=0;frame<4;frame++){var rw=R*(2.46-frame*.12),rh=R*(1.74-frame*.085);ctx.strokeStyle=rgba(frame%2?P.gold:P.navy,.025*engineer);ctx.strokeRect(cx-rw/2,cy-rh/2,rw,rh);}}
      if(witness>.05){var sx=cx-R*1.48,sy=cy-R*.18;glow(ctx,sx,sy,R*.34,P.gold,.10*witness);ctx.beginPath();ctx.arc(sx,sy,7,0,TAU);ctx.fillStyle=rgba(P.gold,.92*witness);ctx.fill();for(var w=0;w<7;w++){var u2=(clock*.00013+w/7)%1,rad=12+u2*R*.68;ctx.beginPath();ctx.arc(sx,sy,rad,0,TAU);ctx.strokeStyle=rgba(P.gold,(1-u2)*.12*witness);ctx.stroke();}for(var beam=0;beam<14;beam++){var u3=(clock*.00008+beam*.071)%1,tx=cx-R*.86+u3*R*1.55,ty=lerp(sy,cy,u3)+Math.sin(u3*Math.PI*2+beam)*R*.035;ctx.beginPath();ctx.arc(tx,ty,1.4,0,TAU);ctx.fillStyle=rgba(beam%4===0?P.aqua:P.gold,.62*witness);ctx.fill();}}
      if(qualify>.05){ctx.save();ctx.globalCompositeOperation="screen";for(var sec=0;sec<6;sec++){var a5=-.9+sec*.32,inner=R*.72,outer=R*1.08;ctx.beginPath();ctx.moveTo(cx+Math.cos(a5)*inner,cy+Math.sin(a5)*inner*.72);ctx.lineTo(cx+Math.cos(a5)*outer,cy+Math.sin(a5)*outer*.72);ctx.strokeStyle=rgba(sec<5?P.aqua:P.gold,.10*qualify);ctx.lineWidth=1;ctx.stroke();}ctx.restore();glow(ctx,cx,cy,R*.30,P.gold,.07*qualify);}
    }
    function frame(now){var dt=Math.min(50,now-last);last=now;if(!reduce)clock+=dt;pointer.tick();var x=progressFor(cinema,.12,.72)*6,P=palette(),cx=S.W*.68+pointer.x*S.W*.022,cy=S.H*.53+pointer.y*S.H*.018,R=Math.min(S.W*.245,S.H*.38);ctx.clearRect(0,0,S.W,S.H);drawMembrane(cx,cy,R,x,P);var align=smooth((x-.55)/1.0),settle=smooth((x-1.4)/.9),pts=motes.map(function(m){return{m:m,p:project(m,cx,cy,R,pointer.x*.12,align,settle)};}).sort(function(a,b){return a.p.z-b.p.z;});pts.forEach(function(o,i){var p=o.p,m=o.m,depth=(p.z+1)/2,physical=smooth((x-2.4)/1),c=m.band%5===0?P.aqua:P.gold,alpha=.035+.16*depth+physical*.025;glow(ctx,p.x,p.y,(2.2+m.size*3)*p.scale,c,.012*alpha);ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.45,m.size*p.scale),0,TAU);ctx.fillStyle=rgba(c,alpha);ctx.fill();});requestAnimationFrame(frame);}requestAnimationFrame(frame);
  }

  function platformSites(){return Array.from({length:28},function(_,i){var band=i%4,ring=.34+.15*band+hash(i*3.1)*.08,a=i/28*TAU+band*.19,z=-.75+1.5*hash(i*8.3);return{x:Math.cos(a)*ring,y:Math.sin(a)*ring*.74,z:z*.34,p:hash(i*11.7)*TAU,band:band};});}
  function platformMotes(){return Array.from({length:420},function(_,i){var a=hash(i*3.2)*TAU,r=Math.sqrt(hash(i*5.8))*.93,z=hash(i*9.1)*2-1;return{x:Math.cos(a)*r,y:Math.sin(a)*r*.72,z:z*.72,p:hash(i*13.7)*TAU,size:.35+hash(i*17.1)*1.15};});}
  var ROUTES=[[0,5],[5,11],[11,16],[16,22],[22,27],[2,8],[8,14],[14,20],[20,25],[3,10],[10,17],[17,24],[6,12],[12,19],[19,26],[1,15],[4,18],[7,21],[9,23],[13,27]];

  function initPlatformCinema(stage){
    if(stage.dataset.cinema)return;stage.dataset.cinema="true";
    var cinema=stage.closest(".ffx-measurement__cinema"),canvas=makeSurface(stage,"ffx-cinema-canvas--platform"),pack=setupCanvas(canvas,stage),ctx=pack.ctx,S=pack.S,pointer=pointerState(stage),sites=platformSites(),motes=platformMotes(),last=performance.now(),clock=0;
    function projection(pt,cx,cy,R){var z=pt.z+pointer.y*.04,persp=1/(1.14+z*.28);return{x:cx+(pt.x+pointer.x*.035*(1-z))*R*persp,y:cy+(pt.y+pointer.y*.025*(1-z))*R*persp,z:z,scale:persp};}
    function familyIndex(){var spans=qa(".ffx-familyring span",stage),sel=spans.findIndex(function(s){return s.classList.contains("is-selected");});return sel<0?0:sel;}
    function drawWorld(x,P){var cx=S.W*.66,cy=S.H*.53,R=Math.min(S.W*.29,S.H*.40),stageN=Math.floor(x),source=smooth((x-.05)/.55),response=smooth((x-.75)/.65),phase=smooth((x-1.65)/.65),family=smooth((x-2.55)/.65),routesA=smooth((x-3.55)/.65),recon=smooth((x-4.55)/.65),evidence=smooth((x-5.55)/.65),scaleA=smooth((x-6.55)/.55);
      glow(ctx,cx,cy,R*1.75,P.aqua,.045);glow(ctx,cx+R*.22,cy-R*.12,R*.92,P.goldDeep,.025+evidence*.025);
      for(var sh=0;sh<20;sh++){var d=sh/19,rr=R*(1.02-d*.50),rot=clock*.000018*(sh%2?1:-1)+sh*.08;ctx.beginPath();ctx.ellipse(cx,cy,rr,rr*.72,rot,0,TAU);ctx.strokeStyle=rgba(sh%5===0?P.goldDeep:P.aqua,.014+.035*(1-d));ctx.lineWidth=sh===0?1.1:.55;ctx.stroke();}
      var projectedSites=sites.map(function(s){return projection(s,cx,cy,R);});
      var projectedMotes=motes.map(function(m){var mm={x:m.x+Math.sin(clock*.00013+m.p)*.012,y:m.y+Math.cos(clock*.00011+m.p)*.010,z:m.z};return{m:m,p:projection(mm,cx,cy,R)};}).sort(function(a,b){return a.p.z-b.p.z;});
      projectedMotes.forEach(function(o){var p=o.p,m=o.m,depth=(p.z+1)/2,c=m.size>1.1?P.goldDeep:P.aqua,a=.018+.09*depth;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.35,m.size*p.scale),0,TAU);ctx.fillStyle=rgba(c,a);ctx.fill();if(m.size>1.2)glow(ctx,p.x,p.y,7*p.scale,c,.012);});
      var sx=cx-R*1.55,sy=cy-R*.18;if(source>.02){glow(ctx,sx,sy,R*.36,P.goldDeep,.12*source);ctx.beginPath();ctx.arc(sx,sy,7,0,TAU);ctx.fillStyle=rgba(P.goldDeep,.95*source);ctx.fill();for(var w=0;w<8;w++){var u=(clock*.00011+w/8)%1,rad=10+u*R*.74;ctx.beginPath();ctx.arc(sx,sy,rad,0,TAU);ctx.strokeStyle=rgba(P.goldDeep,(1-u)*.12*source);ctx.stroke();}curve(ctx,{x:sx+8,y:sy},{x:cx-R*.86,y:cy-R*.12},R*.035,P.goldDeep,.16*source,1);}
      if(response>.02){projectedSites.forEach(function(p,i){var delay=(i%7)*.11,pulse=.55+.45*Math.sin(clock*.004-delay*TAU);glow(ctx,p.x,p.y,11+8*pulse,i%5===0?P.goldDeep:P.aqua,.025*response);ctx.beginPath();ctx.arc(p.x,p.y,2.2+1.3*pulse,0,TAU);ctx.fillStyle=rgba(i%5===0?P.goldDeep:P.aqua,(.45+.35*pulse)*response);ctx.fill();});}
      if(phase>.02){for(var i=0;i<projectedSites.length;i+=2){var A=projectedSites[i],B=projectedSites[(i+9)%projectedSites.length],bend=(i%4?1:-1)*R*.035;curve(ctx,A,B,bend,i%6===0?P.goldDeep:P.aqua,.05*phase,.8);var u2=(clock*.000055+i*.071)%1,pt=curvePoint(A,B,bend,u2);ctx.beginPath();ctx.arc(pt.x,pt.y,1.6,0,TAU);ctx.fillStyle=rgba(i%6===0?P.goldDeep:P.aqua,.62*phase);ctx.fill();}}
      if(family>.02){drawFamily(familyIndex(),projectedSites,cx,cy,R,P,family);}
      if(routesA>.02){ROUTES.forEach(function(r,i){var A=projectedSites[r[0]],B=projectedSites[r[1]],bend=(i%2?1:-1)*R*(.022+.010*(i%3));curve(ctx,A,B,bend,i%4===0?P.goldDeep:P.aqua,.085*routesA,1.1);for(var k=0;k<2;k++){var u3=(clock*.000055+k*.47+i*.037)%1,pt2=curvePoint(A,B,bend,u3);glow(ctx,pt2.x,pt2.y,6,i%4===0?P.goldDeep:P.aqua,.025*routesA);ctx.beginPath();ctx.arc(pt2.x,pt2.y,1.5,0,TAU);ctx.fillStyle=rgba(i%4===0?P.goldDeep:P.aqua,.70*routesA);ctx.fill();}});}
      if(recon>.02){for(var s=0;s<34;s++){var yy=(s-16.5)*R*.027,phase0=s*.43+clock*.00013,amp=R*(.010+.013*hash(s*4.2)),turb=s>24?.7:0;ctx.beginPath();for(var n=0;n<=48;n++){var u4=n/48,xx=cx-R*1.02+u4*R*2.04,y0=cy+yy+Math.sin(u4*TAU+phase0)*amp+Math.sin(u4*TAU*3+s)*amp*turb;if(n)ctx.lineTo(xx,y0);else ctx.moveTo(xx,y0);}ctx.strokeStyle=rgba(s%7===0?P.goldDeep:P.aqua,.024+.036*recon);ctx.lineWidth=.6;ctx.stroke();}}
      if(evidence>.02){var del=stage.dataset.pass3Delete||"none",bad=del!=="none";for(var e=0;e<6;e++){var a0=-1.0+e*.38,inner=R*.74,outer=R*1.14,ok=!bad||e!==({source:0,coverage:2,calibration:4}[del]||-1);ctx.beginPath();ctx.moveTo(cx+Math.cos(a0)*inner,cy+Math.sin(a0)*inner*.72);ctx.lineTo(cx+Math.cos(a0)*outer,cy+Math.sin(a0)*outer*.72);ctx.strokeStyle=rgba(ok?P.aqua:P.red,ok?.11*evidence:.30*evidence);ctx.lineWidth=ok?1:2;ctx.stroke();}glow(ctx,cx,cy,R*.34,bad?P.red:P.goldDeep,bad?.035*evidence:.065*evidence);if(bad){ctx.save();ctx.globalCompositeOperation="destination-out";ctx.beginPath();ctx.arc(cx+R*.62,cy-R*.26,R*.20,0,TAU);ctx.fillStyle="rgba(0,0,0,.30)";ctx.fill();ctx.restore();}}
      if(scaleA>.02){[1.12,1.30,1.49].forEach(function(sc,j){ctx.beginPath();ctx.ellipse(cx,cy,R*sc,R*.72*sc,0,0,TAU);ctx.strokeStyle=rgba(j===0?P.aqua:P.goldDeep,(.06+.04*j)*scaleA);ctx.setLineDash(j<2?[4,10]:[]);ctx.stroke();ctx.setLineDash([]);});for(var h=0;h<12;h++){var a1=h/12*TAU,px=cx+Math.cos(a1)*R*1.49,py=cy+Math.sin(a1)*R*1.07;ctx.beginPath();ctx.arc(px,py,3,0,TAU);ctx.fillStyle=rgba(h%3===0?P.aqua:P.goldDeep,.42*scaleA);ctx.fill();}}
    }
    function drawFamily(fam,pts,cx,cy,R,P,a){
      if(fam===0){for(var i=0;i<pts.length;i+=3){var A=pts[i],B=pts[(i+6)%pts.length],bend=(i%2?1:-1)*R*.03;curve(ctx,A,B,bend,P.goldDeep,.12*a,1);for(var k=0;k<3;k++){var u=(clock*.00008+k*.31+i*.03)%1,p=curvePoint(A,B,bend,u);ctx.beginPath();ctx.arc(p.x,p.y,1.8,0,TAU);ctx.fillStyle=rgba(P.goldDeep,.72*a);ctx.fill();}}}
      if(fam===1){for(var r=0;r<7;r++){var pulse=.7+.3*Math.sin(clock*.0018+r*.6);ctx.beginPath();ctx.ellipse(cx,cy,R*(.18+r*.085)*pulse,R*(.13+r*.061)*pulse,r*.13,0,TAU);ctx.strokeStyle=rgba(r%2?P.aqua:P.goldDeep,.07*a);ctx.stroke();}}
      if(fam===2){for(var s=0;s<26;s++){var yy=(s-12.5)*R*.033;ctx.beginPath();for(var n=0;n<=40;n++){var u2=n/40,xx=cx-R*.84+u2*R*1.68,y=cy+yy+Math.sin(u2*TAU+s*.37+clock*.00018)*R*.008;if(n)ctx.lineTo(xx,y);else ctx.moveTo(xx,y);}ctx.strokeStyle=rgba(s%6===0?P.goldDeep:P.aqua,.085*a);ctx.stroke();}}
      if(fam===3){var recover=.5+.5*Math.sin(clock*.0012);for(var g=0;g<7;g++){var ang=g/7*TAU,p0={x:cx+Math.cos(ang)*R*(.58-.18*recover),y:cy+Math.sin(ang)*R*(.42-.13*recover)},p1={x:cx+Math.cos(ang)*R*.28,y:cy+Math.sin(ang)*R*.20};line(ctx,p0,p1,P.aqua,.14*a,1);glow(ctx,p1.x,p1.y,8,P.goldDeep,.025*a);}}
      if(fam===4){for(var d=0;d<5;d++){ctx.beginPath();for(var h=0;h<24;h++){var u3=h/23,xx=cx-R*.55+u3*R*1.08,y=cy-R*.28+d*R*.14+Math.sin(u3*5+d+clock*.00012)*R*.04*u3;if(h)ctx.lineTo(xx,y);else ctx.moveTo(xx,y);}ctx.strokeStyle=rgba(d%2?P.aqua:P.goldDeep,.11*a);ctx.stroke();}}
      if(fam===5){for(var w=0;w<10;w++){var u4=(clock*.00008+w/10)%1,rad=R*(.14+u4*.92);ctx.beginPath();ctx.ellipse(cx,cy,rad,rad*.72,0,0,TAU);ctx.strokeStyle=rgba(w%3?P.aqua:P.goldDeep,(1-u4)*.10*a);ctx.stroke();}pts.forEach(function(p,i){var pulse=.5+.5*Math.sin(clock*.004+i*.38);ctx.beginPath();ctx.arc(p.x,p.y,1.4+1.2*pulse,0,TAU);ctx.fillStyle=rgba(i%4===0?P.goldDeep:P.aqua,.30*a+.25*pulse*a);ctx.fill();});}
    }
    function frame(now){var dt=Math.min(50,now-last);last=now;if(!reduce)clock+=dt;pointer.tick();var x=progressFor(cinema,.10,.80)*7;ctx.clearRect(0,0,S.W,S.H);drawWorld(x,palette());requestAnimationFrame(frame);}requestAnimationFrame(frame);
  }

  function initScienceCinema(boundary){
    if(boundary.dataset.cinema)return;boundary.dataset.cinema="true";boundary.classList.add("is-cinematic-threshold");var canvas=document.createElement("canvas");canvas.className="ffx-threshold-cinema";canvas.setAttribute("aria-hidden","true");boundary.prepend(canvas);var pack=setupCanvas(canvas,boundary),ctx=pack.ctx,S=pack.S,last=performance.now(),clock=0;
    function frame(now){var dt=Math.min(50,now-last);last=now;if(!reduce)clock+=dt;ctx.clearRect(0,0,S.W,S.H);var P=palette(),left=S.W*.22,right=S.W*.78,cy=S.H*.50,R=Math.min(S.W*.16,S.H*.34);glow(ctx,left,cy,R*1.35,P.navy,.025);glow(ctx,right,cy,R*1.45,P.gold,.028);for(var i=0;i<14;i++){var rr=R*(.25+i*.05);ctx.beginPath();ctx.ellipse(left,cy,rr,rr*.64,i*.08,0,TAU);ctx.strokeStyle=rgba(i%4===0?P.gold:P.navy,.025+.008*i);ctx.stroke();}for(var m=0;m<90;m++){var a=hash(m*4.2)*TAU,r=Math.sqrt(hash(m*8.7))*R*.92,x=right+Math.cos(a)*r,y=cy+Math.sin(a)*r*.62+Math.sin(clock*.0006+m)*3;ctx.beginPath();ctx.arc(x,y,m%9===0?1.8:.8,0,TAU);ctx.fillStyle=rgba(m%7===0?P.gold:P.navy,.08+.08*hash(m*3.1));ctx.fill();}var gateX=S.W*.50;for(var g=0;g<5;g++){var u=(clock*.00009+g/5)%1,rad=7+u*R*.52;ctx.beginPath();ctx.arc(gateX,cy,rad,0,TAU);ctx.strokeStyle=rgba(P.gold,(1-u)*.08);ctx.stroke();}requestAnimationFrame(frame);}requestAnimationFrame(frame);
  }

  function boot(){var p=page();if(p==="index.html")afterGenerated(".ffx-chain__stage",initHomeCinema);if(p==="platform.html")afterGenerated(".ffx-measurement__stage",initPlatformCinema);if(p==="science.html")afterGenerated(".ffx-truth-boundary--empirical",initScienceCinema);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
