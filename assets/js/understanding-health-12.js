/* Paper IV: first source of information loss in the five-to-four-to-three ladder.
   Every original distinction remains explained in static HTML. */
(() => {
 "use strict";
 const buttons=[...document.querySelectorAll("[data-ulh-loss-choice]")];
 const cards=[...document.querySelectorAll("[data-ulh-loss-card]")];
 const summary=document.querySelector("[data-ulh-loss-summary]");
 if(buttons.length!==2||cards.length!==2||!summary)return;
 const text={
  erased:"Recovered and adapted become indistinguishable when the projection merges S_R and S_A. The capacity representation itself has erased that information.",
  ignored:"Baseline and recovered remain distinguishable by simplified capacities, {S,E} and {S}. Their distinction is retained by capacity but ignored by the declared Health questions."
 };
 function focus(mode){
  if(!Object.prototype.hasOwnProperty.call(text,mode))return;
  buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ulhLossChoice===mode)));
  cards.forEach(c=>{c.dataset.active=String(c.dataset.ulhLossCard===mode)});
  summary.textContent=text[mode];
 }
 buttons.forEach(b=>b.addEventListener("click",()=>focus(b.dataset.ulhLossChoice)));
 focus("erased");
})();
