/* Lesson 17 — accessible knowledge check. All essential explanatory text is static. */
(()=>{"use strict";const panel=document.querySelector("[data-ulh17-quiz]");
if(!panel)return;
const button=panel.querySelector("[data-ulh17-check]"),feedback=panel.querySelector("[data-ulh17-feedback]");
if(!button||!feedback)return;
button.addEventListener("click",()=>{const picked=panel.querySelector('input[name="ulh17-answer"]:checked');
if(!picked){feedback.textContent="Choose an answer first.";feedback.removeAttribute("data-result");return;}
const correct=picked.value==="calibration";
feedback.dataset.result=correct?"correct":"incorrect";
feedback.textContent=correct?
"Correct. The observed hemlock death count is far outside the mortality model's predictive distribution on the selected adult risk set. This establishes a serious component-level calibration problem.":
"That conclusion exceeds the evidence. The mortality model is badly miscalibrated for this selected hemlock population; the comparison does not disprove the formal Health definition or identify a unique biological cause.";
});})();