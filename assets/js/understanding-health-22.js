/* Lesson 22 — accessible evidence-family comparison.
   All interpretations and mathematical limitations are present in HTML; this
   module simply makes the three registered illustrative views selectable. */
(() => {
  "use strict";
  const root = document.querySelector("[data-ulh22-explorer]");
  if (!root) return;
  const buttons = [...root.querySelectorAll("[data-evidence-mode]")];
  const panels = [...root.querySelectorAll("[data-evidence-panel]")];
  const valid = new Set(["mixed", "agreed", "empty"]);
  const select = (mode) => {
    if (!valid.has(mode)) return;
    buttons.forEach((button) => {
      const active = button.dataset.evidenceMode === mode;
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.evidencePanel !== mode;
    });
  };
  buttons.forEach((button) => {
    button.addEventListener("click", () => select(button.dataset.evidenceMode));
  });
  select("mixed");
})();
