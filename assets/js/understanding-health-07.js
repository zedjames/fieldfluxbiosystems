/* Understanding Health Lesson 7 — a finite, exact, two-horizon capacity comparison.
   The original four-state table remains readable with scripts disabled. */
(() => {
  "use strict";
  const controls=[...document.querySelectorAll("[data-ulh-support-choice]")];
  const summary=document.querySelector("[data-ulh-support-summary]");
  const intermittent=document.querySelector('[data-ulh-support-capacity="intermittent"]');
  const note=document.querySelector('[data-ulh-support-note="intermittent"]');
  const status=document.querySelector('[data-ulh-support-status="intermittent"]');
  if(controls.length!==2||!summary||!intermittent||!note||!status)return;
  function choose(horizon) {
    if(horizon!=="short"&&horizon!=="long")return;
    const long=horizon==="long";
    controls.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ulhSupportChoice===horizon)));
    intermittent.textContent=long?"∅":"{reserve}";
    note.textContent=long?"No viable reserve response remains at this horizon.":"A reserve response is available at this horizon.";
    status.textContent=long?"Fails reserve requirement":"Meets reserve requirement";
    status.dataset.state=long?"fail":"pass";
    summary.textContent=long
      ?"At the long horizon, Persistent support still has {reserve} while Intermittent support has ∅. The reserve-Health judgments now differ."
      :"At the short horizon, both states have the capacity {reserve}. Both satisfy the reserve requirement.";
  }
  controls.forEach(b=>b.addEventListener("click",()=>choose(b.dataset.ulhSupportChoice)));
  choose("short");
})();
