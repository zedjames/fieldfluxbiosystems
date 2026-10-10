/* Understanding Health: optional exploration of a fixed finite mathematical example.
   Lesson remains fully readable without JavaScript. */
(() => {
  "use strict";
  const controls = [...document.querySelectorAll("[data-ulh-requirement]")];
  if (!controls.length) return;
  const outcomes = {
    short: document.querySelector('[data-ulh-outcome="short"]'),
    long: document.querySelector('[data-ulh-outcome="long"]')
  };
  const reading = document.querySelector("[data-ulh-result-reading]");
  function select(requirement) {
    const stable = requirement === "stable";
    controls.forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.ulhRequirement === requirement));
    });
    if (outcomes.short) {
      outcomes.short.textContent = stable ? "Does not meet the stable requirement" : "Meets the any-response requirement";
      outcomes.short.dataset.state = stable ? "fail" : "pass";
    }
    if (outcomes.long) {
      outcomes.long.textContent = stable ? "Meets the stable requirement" : "Meets the any-response requirement";
      outcomes.long.dataset.state = "pass";
    }
    if (reading) {
      reading.textContent = stable
        ? "A stable response is required. The short-horizon capacity has no stable response; the long-horizon capacity includes one."
        : "Only a nonempty viable-response capacity is required. Both horizons satisfy that weaker requirement because each includes an exposed response.";
    }
  }
  controls.forEach(button => button.addEventListener("click", () => select(button.dataset.ulhRequirement)));
  select("stable");
})();
