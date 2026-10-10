/* Paper II Lesson 5: a stage-only licensing comparison.
   Both stage panels remain visible when JavaScript is unavailable. */
(() => {
  "use strict";
  const buttons=[...document.querySelectorAll("[data-ulh-stage-choice]")];
  const views=[...document.querySelectorAll("[data-ulh-stage-view]")];
  const summary=document.querySelector("[data-ulh-stage-summary]");
  if(buttons.length!==2 || views.length!==2) return;
  const explanations={
    newborn:"Newborn: P and R agree on every licensed adequacy question. Their capacities remain {exposed} and {stable}.",
    adult:"Adult: P fails the newly licensed stable-response question; R passes. Their capacities have not changed."
  };
  function focusStage(stage) {
    if(!Object.hasOwn(explanations,stage))return;
    buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ulhStageChoice===stage)));
    views.forEach(v=>{v.hidden=v.dataset.ulhStageView!==stage;});
    if(summary)summary.textContent=explanations[stage];
  }
  buttons.forEach(b=>b.addEventListener("click",()=>focusStage(b.dataset.ulhStageChoice)));
  focusStage("newborn");
})();
