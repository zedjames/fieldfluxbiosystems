/* Paper III: the information visible to one declared threshold question.
   All three descriptions remain readable without scripts. */
(() => {
  "use strict";
  const controls=[...document.querySelectorAll("[data-ulh-measure-choice]")];
  const cards=[...document.querySelectorAll("[data-ulh-measure-card]")];
  const summary=document.querySelector("[data-ulh-measure-summary]");
  if(controls.length!==3||cards.length!==3||!summary)return;
  const explanation={
    possible:"Possibility alone is insufficient: it returns the same value for systems with opposite 50% threshold answers.",
    probability:"Exact probability is sufficient: 99.9% and 0.1% distinguish the systems and determine whether each meets the 50% requirement.",
    threshold:"The threshold answer itself is sufficient and task-visible for this one question: System A passes, System B does not."
  };
  function focus(mode){
    if(!Object.prototype.hasOwnProperty.call(explanation,mode))return;
    controls.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.ulhMeasureChoice===mode)));
    cards.forEach(card=>{card.dataset.active=String(card.dataset.ulhMeasureCard===mode)});
    summary.textContent=explanation[mode];
  }
  controls.forEach(button=>button.addEventListener("click",()=>focus(button.dataset.ulhMeasureChoice)));
  focus("possible");
})();
