/* Understanding Health Lesson 9: compare a fixed source relation with two
   target information demands. All outcomes remain visible without scripts. */
(() => {
"use strict";
const buttons=[...document.querySelectorAll("[data-ulh-target-choice]")];
const cards=[...document.querySelectorAll("[data-ulh-target-card]")];
const summary=document.querySelector("[data-ulh-target-summary]");
if(buttons.length!==2||cards.length!==2||!summary)return;
const explanations={
raw:"Detailed capacity transport fails: source P is related to targets with different raw capacity values, {S, E} and {S}.",
class:"The adult query-visible target is exactly determinate. Both related targets answer (yes, yes) to the two licensed adequacy questions."
};
function select(mode){
 if(!Object.prototype.hasOwnProperty.call(explanations,mode))return;
 buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ulhTargetChoice===mode)));
 cards.forEach(c=>{c.dataset.active=String(c.dataset.ulhTargetCard===mode)});
 summary.textContent=explanations[mode];
}
buttons.forEach(b=>b.addEventListener("click",()=>select(b.dataset.ulhTargetChoice)));
select("raw");
})();
