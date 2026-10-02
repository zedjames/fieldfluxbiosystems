(function(){
  "use strict";
  if(window.__fieldfluxResearchAtlas)return;
  window.__fieldfluxResearchAtlas=true;

  var relevant=document.querySelector("[data-research-graph],[data-atlas-corpus],.paper-shell,.note");
  if(!relevant)return;

  function q(s,c){return (c||document).querySelector(s);}
  function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(ch){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch];});}
  function page(){return location.pathname.split("/").pop()||"index.html";}
  function loadStyle(){
    if(q('link[data-research-atlas-style]')||q('link[href*="research-atlas.css"]'))return;
    var l=document.createElement("link");l.rel="stylesheet";l.href="assets/css/research-atlas.css?v=2";l.dataset.researchAtlasStyle="true";document.head.appendChild(l);
  }
  loadStyle();

  fetch("research/catalog.json",{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("catalog "+r.status);return r.json();}).then(init).catch(function(){/* static pages remain fully usable */});

  function init(C){
    var byId={};C.items.forEach(function(i){byId[i.id]=i;});
    var themes={};C.themes.forEach(function(t,i){themes[t.id]={data:t,index:i};});
    var series={};C.series.forEach(function(s,i){series[s.id]={data:s,index:i};});
    var relTypes={};C.relation_types.forEach(function(t){relTypes[t.id]=t;});

    qa("[data-research-graph]").forEach(function(el){renderGraph(el,C,byId,themes,series,relTypes);});
    initFilters(C);
    injectContext(C,byId,relTypes);
  }

  function renderGraph(host,C,byId,themes,series,relTypes){
    var svg=q("svg",host);if(!svg)return;
    while(svg.firstChild)svg.removeChild(svg.firstChild);
    var NS="http://www.w3.org/2000/svg";
    var scope=host.dataset.scope||"all";
    var items=C.items.filter(function(i){return scope==="all"||i.collection===scope;});
    var allowed={};items.forEach(function(i){allowed[i.id]=true;});
    var counts={};
    var positions={};

    items.forEach(function(i){
      var ti=(themes[i.primary_theme]||{index:0}).index;
      var key=i.collection+"|"+i.primary_theme;
      var n=counts[key]||0;counts[key]=n+1;
      var x,y;
      if(scope==="notebook"||i.collection==="notebook"){
        x=scope==="notebook"?170+(ti%4)*250:170+(n%3)*105;
        y=scope==="notebook"?105+Math.floor(ti/4)*250+(n%3)*55:85+ti*78+(n%2)*22;
      }else{
        var si=(series[i.series]||{index:0}).index;
        x=690+si*135+(n%2)*22;
        y=80+ti*78+((i.order||1)-1)*13;
      }
      positions[i.id]={x:x,y:y};
    });

    C.relations.forEach(function(r){
      if(!allowed[r.from]||!allowed[r.to])return;
      var A=positions[r.from],B=positions[r.to];if(!A||!B)return;
      var p=document.createElementNS(NS,"path");
      var mx=(A.x+B.x)/2,my=(A.y+B.y)/2-22;
      p.setAttribute("d","M"+A.x+" "+A.y+" Q"+mx+" "+my+" "+B.x+" "+B.y);
      p.setAttribute("class","atlas-edge");
      p.dataset.type=r.type;p.dataset.from=r.from;p.dataset.to=r.to;
      svg.appendChild(p);
    });

    items.forEach(function(i){
      var P=positions[i.id],g=document.createElementNS(NS,"g");
      g.setAttribute("class","atlas-node "+i.collection);
      g.setAttribute("transform","translate("+P.x+" "+P.y+")");
      g.setAttribute("tabindex","0");g.setAttribute("role","button");
      g.setAttribute("aria-label",i.title);
      g.dataset.id=i.id;g.dataset.themes=(i.themes||[]).join(" ");
      var label=i.collection==="publications"?(series[i.series]?series[i.series].data.label.split(" ")[0]:"Paper")+" "+roman(i.order||1):short(i.title);
      var kind=i.collection==="publications"?"preprint":(i.subtype==="founder_reflection"?"founder":"notebook");
      g.innerHTML='<circle class="atlas-node__halo" r="20"></circle><circle class="atlas-node__core" r="11"></circle><text y="-19" text-anchor="middle">'+esc(label)+'</text><text class="atlas-node__kind" y="26" text-anchor="middle">'+esc(kind)+'</text><title>'+esc(i.title)+'</title>';
      function select(){selectNode(host,i,C,byId,relTypes);qa(".atlas-node",host).forEach(function(n){n.classList.toggle("is-active",n.dataset.id===i.id);});}
      g.addEventListener("click",select);g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();select();}});
      svg.appendChild(g);
    });

    var controls=q("[data-atlas-thread-controls]",host)||host.previousElementSibling;
    if(controls){
      qa("[data-theme]",controls).forEach(function(b){
        b.addEventListener("click",function(){
          qa("[data-theme]",controls).forEach(function(x){x.classList.toggle("is-active",x===b);});
          var t=b.dataset.theme;
          qa(".atlas-node",host).forEach(function(n){n.classList.toggle("is-muted",t!=="all"&&(" "+n.dataset.themes+" ").indexOf(" "+t+" ")<0);});
          qa(".atlas-edge",host).forEach(function(e){
            var a=q('.atlas-node[data-id="'+e.dataset.from+'"]',host),z=q('.atlas-node[data-id="'+e.dataset.to+'"]',host);
            e.classList.toggle("is-muted",t!=="all"&&((a&&a.classList.contains("is-muted"))||(z&&z.classList.contains("is-muted"))));
          });
        });
      });
    }
    if(items.length)selectNode(host,items[0],C,byId,relTypes);
  }

  function selectNode(host,item,C,byId,relTypes){
    var d=q(".atlas-graph__detail",host);if(!d)return;
    var related=[];
    C.relations.forEach(function(r){
      if(r.from===item.id&&byId[r.to])related.push({item:byId[r.to],type:r.type});
      else if(r.to===item.id&&byId[r.from])related.push({item:byId[r.from],type:r.type});
    });
    var type=item.collection==="publications"?"Preprint":item.subtype==="founder_reflection"?"Founder reflection":item.subtype==="reflection"?"Reflection":"Field note";
    d.innerHTML='<span>'+esc(type)+'</span><strong>'+esc(item.title)+'</strong><p>'+esc(item.summary)+'</p><div class="atlas-detail__links"><a href="'+esc(item.href)+'">Open →</a>'+(item.pdf?'<a href="'+esc(item.pdf)+'" target="_blank" rel="noopener">PDF →</a>':'')+'</div>'+(related.length?'<p><small>Direct relations</small><br>'+related.slice(0,5).map(function(x){return '<a href="'+esc(x.item.href)+'">'+esc(x.item.title)+'</a> <small>('+esc((relTypes[x.type]||{label:x.type}).label)+')</small>';}).join("<br>")+'</p>':'');
  }

  function initFilters(C){
    var corpus=q("[data-atlas-corpus]");if(!corpus)return;
    var collection="all",theme="all",term="";
    var buttons=qa("[data-collection-filter]"),select=q("[data-theme-filter]"),input=q("[data-atlas-search]"),count=q("[data-atlas-count]");
    function apply(){
      var visible=0;
      qa("[data-atlas-card]",corpus).forEach(function(card){
        var okCollection=collection==="all"||card.dataset.collection===collection;
        var okTheme=theme==="all"||(" "+card.dataset.themes+" ").indexOf(" "+theme+" ")>=0;
        var okTerm=!term||card.dataset.search.indexOf(term)>=0;
        var ok=okCollection&&okTheme&&okTerm;card.hidden=!ok;if(ok)visible++;
      });
      if(count)count.textContent=visible+" "+(visible===1?"work":"works");
    }
    buttons.forEach(function(b){b.addEventListener("click",function(){collection=b.dataset.collectionFilter;buttons.forEach(function(x){x.classList.toggle("is-active",x===b);});apply();});});
    if(select)select.addEventListener("change",function(){theme=select.value;apply();});
    if(input)input.addEventListener("input",function(){term=input.value.trim().toLowerCase();apply();});
  }

  function injectContext(C,byId,relTypes){
    var current=page(),item=C.items.find(function(i){return i.href===current;});
    if(!item||q(".research-context"))return;
    var related=[];
    C.relations.forEach(function(r){
      if(r.from===item.id&&byId[r.to])related.push({item:byId[r.to],type:r.type});
      else if(r.to===item.id&&byId[r.from])related.push({item:byId[r.from],type:r.type});
    });
    if(!related.length)return;
    var aside=document.createElement("aside");aside.className="research-context reveal";
    aside.innerHTML='<div class="research-context__head"><span>This work in context</span><a href="research-atlas.html">Open Research Atlas →</a></div><h3>'+esc(item.title)+'</h3><p>Direct connections from the public research catalog. These relations are navigational metadata unless the linked works state a stronger dependency explicitly.</p><div class="research-context__links">'+related.slice(0,6).map(function(x){return '<a href="'+esc(x.item.href)+'">'+esc(x.item.title)+'<small>'+esc((relTypes[x.type]||{label:x.type}).label)+'</small></a>';}).join("")+'</div>';
    var target=q(".paper-series-nav")||q(".note__foot");
    if(target&&target.parentNode)target.parentNode.insertBefore(aside,target);
    else{var main=q("main")||q("section.section");if(main)main.appendChild(aside);}
  }

  function short(s){
    var words=String(s).replace(/<[^>]+>/g,"").split(/\s+/).filter(Boolean);
    return words.slice(0,2).join(" ").slice(0,22);
  }
  function roman(n){var r=["","I","II","III","IV","V","VI","VII","VIII","IX","X"];return r[n]||String(n);}
})();