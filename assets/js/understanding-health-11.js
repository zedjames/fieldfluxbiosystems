/* Paper III, Lesson 11: compare positive-only and failure-aware response profiles.
   All challenge results remain legible without JavaScript. The selector changes emphasis. */
(() => {
  "use strict";
  const buttons=[...document.querySelectorAll("[data-ulh-challenge-choice]")];
  const section=document.querySelector(".ulh-challenge-explorer");
  const summary=document.querySelector("[data-ulh-challenge-summary]");
  if(buttons.length!==2||!section||!summary)return;
  const explanations={
    positive:"Using only successful responses, Systems A and B have the same positive challenge profile. That information cannot distinguish their failure-aware robustness.",
    full:"Once admitted failures are included, System B has a failing wind response and System A does not. Assuming present health, the declared robust-persistence answers differ."
  };
  function setMode(mode){
    if(!Object.prototype.hasOwnProperty.call(explanations,mode))return;
    buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ulhChallengeChoice===mode)));
    section.dataset.focus=mode;
    summary.textContent=explanations[mode];
  }
  buttons.forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.ulhChallengeChoice)));
  setMode("positive");
})();
