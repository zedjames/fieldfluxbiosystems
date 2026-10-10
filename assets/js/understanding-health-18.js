/* Lesson 18 — progressive enhancement: coarse vs fine observer and knowledge check. */
(()=>{"use strict";
const panel=document.querySelector("[data-ulh18-explorer]");
if(panel){
 const buttons=[...panel.querySelectorAll("[data-ulh18-view]")];
 const a=panel.querySelector("[data-ulh18-a]"),b=panel.querySelector("[data-ulh18-b]");
 const ca=panel.querySelector("[data-ulh18-caption-a]"),cb=panel.querySelector("[data-ulh18-caption-b]");
 const summary=panel.querySelector("[data-ulh18-summary]");
 const show=view=>{buttons.forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.ulh18View===view)));
 if(view==="fine"){if(a)a.textContent="0 / 100 juveniles";if(b)b.textContent="50 / 100 juveniles";if(ca)ca.textContent="No stem is strictly below 10 cm";if(cb)cb.textContent="Fifty stems measure 9 cm";if(summary)summary.textContent="The underlying juvenile counts differ despite the identical coarse summary. The coarse observer cannot reconstruct this distinction.";}
 else {if(a)a.textContent="100 · 10 cm";if(b)b.textContent="100 · 10 cm";if(ca)ca.textContent="0.7854 m² basal area";if(cb)cb.textContent="0.7854 m² basal area";if(summary)summary.textContent="The two coarse records are identical. A calculation using only those records cannot distinguish the collections.";}}
 buttons.forEach(x=>x.addEventListener("click",()=>show(x.dataset.ulh18View)));
}
const quiz=document.querySelector("[data-ulh18-quiz]");
if(quiz){const btn=quiz.querySelector("[data-ulh18-check]"),fb=quiz.querySelector("[data-ulh18-feedback]");
 if(btn&&fb)btn.addEventListener("click",()=>{const selected=quiz.querySelector('input[name="ulh18-answer"]:checked');
 if(!selected){fb.textContent="Choose an answer first.";fb.removeAttribute("data-result");return;}
 const correct=selected.value==="insufficient";fb.dataset.result=correct?"correct":"incorrect";
 fb.textContent=correct?"Correct. Two fine states with identical coarse count/RMS/basal-area data have different juvenile-existence answers, so no coarse-only function can always recover that query.":"That conclusion is not supported. The RMS and basal-area calculations are exactly correct; the information about which diameters fall below the threshold is absent from the coarse summary.";
 });}
})();