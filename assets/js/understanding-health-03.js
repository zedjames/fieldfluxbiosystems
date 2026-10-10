/* Lesson 3 — exact, finite quotient-classification demonstration.
   The base two-requirement grouping is readable without JavaScript. */
(() => {
  "use strict";
  const controls=[...document.querySelectorAll("[data-ulh-quotient]")];
  const views=[...document.querySelectorAll("[data-ulh-quotient-view]")];
  const message=document.querySelector("[data-ulh-quotient-explanation]");
  if(controls.length!==2 || views.length!==2) return;
  const descriptions={
    base:"With the original two requirements, {S} and {S, E} belong to the same group because both answer “yes” to every declared requirement.",
    extended:"When I also ask whether an exposed response is available, {S} and {S, E} give different answers. All four subsets are now in separate requirement-visible groups."
  };
  function choose(mode) {
    if(mode!=="base" && mode!=="extended")return;
    controls.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.ulhQuotient===mode)));
    views.forEach(view=>{view.hidden=view.dataset.ulhQuotientView!==mode;});
    if(message) message.textContent=descriptions[mode];
  }
  controls.forEach(button=>button.addEventListener("click",()=>choose(button.dataset.ulhQuotient)));
  choose("base");
})();
