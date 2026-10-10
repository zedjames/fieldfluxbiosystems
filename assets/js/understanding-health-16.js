/* Lesson 16 — small numerical changes near a fixed requirement boundary. */
(()=>{"use strict";const control=document.getElementById("ulh16-estimate");if(!control)return;
const value=document.querySelector("[data-ulh16-value]"),margin=document.querySelector("[data-ulh16-margin]"),verdict=document.querySelector("[data-ulh16-adequacy]"),marker=document.querySelector("[data-ulh16-marker]");
const render=()=>{const p=Number(control.value),delta=Math.round((p-75)*10)/10;
 if(value)value.textContent=p.toFixed(1)+"%";
 if(marker)marker.style.left=((p-70)*10)+"%";
 if(margin){const signed=(delta>0?"+":"")+(delta===0?"0.0":delta.toFixed(1));margin.textContent=signed+" percentage points";}
 if(verdict){const okay=p>=75;verdict.textContent=okay?"True · at or above threshold":"False · below threshold";verdict.dataset.result=okay?"pass":"fail";}
};
control.addEventListener("input",render);render();})();