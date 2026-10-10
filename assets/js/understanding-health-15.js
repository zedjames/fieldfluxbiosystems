/* Lesson 15 — requirement-relative threshold lab. The example bank is fixed. */
(()=>{"use strict";
const range=document.getElementById("ulh15-threshold");
if(!range)return;
const label=document.querySelector("[data-ulh-threshold-label]");
const q1=document.querySelector("[data-ulh-q1-status]");
const q2=document.querySelector("[data-ulh-q2-status]");
const ticks=[...document.querySelectorAll("[data-ulh-threshold-tick]")];
const value=(x)=>Number.isInteger(x)?String(x):x.toFixed(1);
const render=()=>{
 const theta=Number(range.value);
 if(label)label.textContent=value(theta)+"%";
 for(const tick of ticks)tick.style.left=theta+"%";
 const r1=75>=theta,r2=62.5>=theta;
 if(q1){q1.dataset.result=r1?"pass":"fail";q1.textContent=(r1?"Adequate":"Inadequate")+" · 75% "+(r1?"≥":"<")+" "+value(theta)+"%";}
 if(q2){q2.dataset.result=r2?"pass":"fail";q2.textContent=(r2?"Adequate":"Inadequate")+" · 62.5% "+(r2?"≥":"<")+" "+value(theta)+"%";}
};
range.addEventListener("input",render);render();
})();