/* Lesson 14 — optional interactive explanations. Static article remains accessible without JS. */
(()=>{"use strict";
const range=document.getElementById("ulh-uncertain-survival");
if(range){const value=document.querySelector("[data-ulh-survival-value]"),unresolved=document.querySelector("[data-ulh-unresolved-count]"),total=document.querySelector("[data-ulh-expected]");const update=()=>{const p=Number(range.value)/100;const expected=20*p;const format=n=>Number.isInteger(n)?String(n):n.toFixed(1);if(value)value.textContent=range.value+"%";if(unresolved)unresolved.textContent=format(expected);if(total)total.textContent=format(70+expected)};range.addEventListener("input",update);update();}
const quiz=document.querySelector("[data-ulh-quiz]");
if(quiz){const button=quiz.querySelector("[data-ulh-check-answer]"),feedback=quiz.querySelector("[data-ulh-answer-feedback]");
if(button&&feedback)button.addEventListener("click",()=>{const selected=quiz.querySelector('input[name="ulh-14-answer"]:checked');if(!selected){feedback.textContent="Choose an answer first.";feedback.removeAttribute("data-result");return}const correct=selected.value==="uncertain";feedback.setAttribute("data-result",correct?"correct":"incorrect");feedback.textContent=correct?"Correct. A later-only record establishes a fact about the census, not an unambiguous biological entry event.":"Not quite. The same later-only record may be produced by different underlying histories. The available evidence alone cannot identify which one happened.";});
}}
)();