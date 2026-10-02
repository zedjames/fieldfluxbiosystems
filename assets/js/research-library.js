(function(){
  "use strict";
  if(window.__fieldfluxResearchLibrary)return;
  window.__fieldfluxResearchLibrary=true;

  function qa(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
  function q(s,c){return (c||document).querySelector(s);}

  qa("[data-research-archive]").forEach(function(root){
    var cards=qa("[data-archive-card]",root);
    if(!cards.length)return;

    var search=q("[data-archive-search]",root);
    var type=q("[data-archive-type]",root);
    var series=q("[data-archive-series]",root);
    var themeSelect=q("[data-archive-theme]",root);
    var sort=q("[data-archive-sort]",root);
    var count=q("[data-archive-count]",root);
    var pager=q("[data-archive-pagination]",root);
    var pageSize=parseInt(root.dataset.pageSize||"12",10);
    var currentPage=1;

    function value(el,def){return el?el.value:def;}
    function matches(card){
      var term=(value(search,"")||"").trim().toLowerCase();
      var wantedType=value(type,"all");
      var wantedSeries=value(series,"all");
      var wantedTheme=value(themeSelect,theme);
      if(term && (card.dataset.search||"").indexOf(term)<0)return false;
      if(wantedType!=="all" && card.dataset.type!==wantedType)return false;
      if(wantedSeries!=="all" && card.dataset.series!==wantedSeries)return false;
      if(wantedTheme!=="all" && (" "+(card.dataset.themes||"")+" ").indexOf(" "+wantedTheme+" ")<0)return false;
      return true;
    }
    function sortedVisible(){
      var arr=cards.filter(matches);
      var mode=value(sort,"newest");
      arr.sort(function(a,b){
        var da=a.dataset.date||"", db=b.dataset.date||"";
        var oa=parseInt(a.dataset.order||"0",10), ob=parseInt(b.dataset.order||"0",10);
        if(mode==="oldest") return da.localeCompare(db)||oa-ob;
        if(mode==="editorial") return oa-ob;
        if(mode==="title") return (a.dataset.title||"").localeCompare(b.dataset.title||"");
        return db.localeCompare(da)||ob-oa;
      });
      return arr;
    }
    function drawPager(totalPages){
      if(!pager)return;
      pager.innerHTML="";
      if(totalPages<=1)return;
      function button(label,page,disabled,active){
        var b=document.createElement("button");
        b.type="button";b.textContent=label;
        if(disabled)b.disabled=true;
        if(active)b.classList.add("is-active");
        b.addEventListener("click",function(){currentPage=page;render();root.scrollIntoView({behavior:"smooth",block:"start"});});
        pager.appendChild(b);
      }
      button("←",Math.max(1,currentPage-1),currentPage===1,false);
      var start=Math.max(1,currentPage-2), end=Math.min(totalPages,start+4);
      start=Math.max(1,end-4);
      for(var p=start;p<=end;p++)button(String(p),p,false,p===currentPage);
      button("→",Math.min(totalPages,currentPage+1),currentPage===totalPages,false);
    }
    function render(){
      var arr=sortedVisible();
      var totalPages=Math.max(1,Math.ceil(arr.length/pageSize));
      if(currentPage>totalPages)currentPage=totalPages;
      cards.forEach(function(card){card.hidden=true;card.style.order="";});
      var from=(currentPage-1)*pageSize,to=Math.min(arr.length,from+pageSize);
      arr.forEach(function(card,idx){card.style.order=idx; if(idx>=from&&idx<to)card.hidden=false;});
      if(count){
        if(!arr.length)count.textContent="No matching works";
        else count.textContent=arr.length+" "+(arr.length===1?"work":"works")+" · showing "+(from+1)+"–"+to;
      }
      drawPager(totalPages);
    }
    if(themeSelect&&theme!=="all")themeSelect.value=theme;
    if(search&&term)search.value=term;
    [search,type,series,themeSelect,sort].forEach(function(el){
      if(!el)return;
      el.addEventListener(el===search?"input":"change",function(){currentPage=1;render();});
    });
    render();
  });
})();