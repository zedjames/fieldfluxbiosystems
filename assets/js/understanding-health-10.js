/* Lesson 10: one fixed finite cost fixture viewed under different declared budgets.
   Static markup remains intelligible with JavaScript disabled. */
(() => {
 "use strict";
 const slider=document.querySelector("#ulh-budget-range");
 const value=document.querySelector("[data-ulh-budget-value]");
 const summary=document.querySelector("[data-ulh-budget-summary]");
 if(!slider||!value||!summary)return;
 const cases=[["A",1],["B",3]];
 function update(raw) {
   const b=Number(raw);
   if(!Number.isInteger(b)||b<0||b>5)return;
   value.textContent=b===1?"1 unit":b+" units";
   slider.setAttribute("aria-valuetext",value.textContent);
   for(const [key,cost] of cases) {
     const passed=b>=cost;
     const status=document.querySelector('[data-ulh-budget-status="'+key+'"]');
     const explain=document.querySelector('[data-ulh-budget-explain="'+key+'"]');
     if(status){status.textContent=passed?"Affordable":"Not affordable";status.dataset.state=passed?"pass":"fail";}
     if(explain)explain.textContent=passed
       ?"The attained minimum cost is "+cost+", within the declared budget of "+b+"."
       :"The attained minimum cost is "+cost+", which exceeds the declared budget of "+b+".";
   }
   const a=b>=1,c=b>=3;
   summary.textContent="At budget "+b+", Case A "+(a?"is":"is not")+" affordable and Case B "+(c?"is":"is not")+" affordable. The viability question is the same; the declared budget changes the affordability answers.";
 }
 slider.addEventListener("input",()=>update(slider.value));
 update(slider.value);
})();
