(function(){
  "use strict";
  if(window.__fieldfluxWorld)return;
  window.__fieldfluxWorld=true;

  function hideLegacyWorldLinks(){
    document.querySelectorAll('.nav__links > a[href="world.html"],.nav__links a[data-world-link]').forEach(function(a){
      a.style.display="none";
      a.setAttribute("aria-hidden","true");
      a.tabIndex=-1;
    });
  }
  hideLegacyWorldLinks();
  var mo=new MutationObserver(hideLegacyWorldLinks);
  if(document.body)mo.observe(document.body,{subtree:true,childList:true});

  if(!document.querySelector('script[data-fieldflux-nav-world-runtime]')){
    var s=document.createElement("script");
    s.src="assets/js/fieldflux-nav-world.js?v=1";
    s.async=false;
    s.dataset.fieldfluxNavWorldRuntime="true";
    s.addEventListener("load",function(){hideLegacyWorldLinks();setTimeout(hideLegacyWorldLinks,300);setTimeout(hideLegacyWorldLinks,1000);},{once:true});
    document.body.appendChild(s);
  }
})();
