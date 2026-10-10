/* Lesson 6: raw-capacity transport versus health-visible target transport.
   Both formal examples remain readable without JavaScript. */
(() => {
"use strict";
const buttons=[...document.querySelectorAll("[data-ulh-transport-choice]")];
const views=[...document.querySelectorAll("[data-ulh-transport-view]")];
const summary=document.querySelector("[data-ulh-transport-summary]");
if(buttons.length!==2 || views.length!==2)return;
const descriptions={
raw:"For the raw target capacity, two related targets disagree. Exact deterministic transport from this source-capacity value is impossible.",
visible:"For the adult health-visible quotient, both targets agree on every licensed adequacy answer. One target class is determined even though the full capacity is not."
};
function select(mode){
 if(!Object.prototype.hasOwnProperty.call(descriptions,mode))return;
 buttons.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.ulhTransportChoice===mode)));
 views.forEach(view=>{view.hidden=view.dataset.ulhTransportView!==mode});
 if(summary)summary.textContent=descriptions[mode];
}
buttons.forEach(button=>button.addEventListener("click",()=>select(button.dataset.ulhTransportChoice)));
select("raw");
})();
