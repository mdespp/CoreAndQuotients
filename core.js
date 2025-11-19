// core.js

// Parse a string like "2,2" or "2 2" into [2, 2]
function parsePartitionString(str) {
  return str
    .split(/[,\s]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(Number)
    .filter(n => Number.isInteger(n) && n > 0);
}

document.addEventListener("DOMContentLoaded", () => {
  const mInput    = document.getElementById("core-m");
  const coreInput = document.getElementById("core-result");

  function updateFromInputs() {
    const mVal     = parseInt(mInput.value, 10);
    const corePart = parsePartitionString(coreInput.value);

    const hasChar        = (typeof updateCharacteristicDisplay === "function");
    const hasAbacus      = (typeof updateCoreAbacus === "function");
    const hasCoreDiagram = (typeof window.renderCorePartition === "function");

    // If either m or core is missing/invalid → clear displays
    if (!Number.isInteger(mVal) || mVal <= 0 || corePart.length === 0) {
      if (hasChar)        updateCharacteristicDisplay(null, null);
      if (hasAbacus)      updateCoreAbacus(null, null);
      if (hasCoreDiagram) window.renderCorePartition([]);  // blank core diagram
      return;
    }

    // Both are valid → update all displays
    if (hasChar)        updateCharacteristicDisplay(mVal, corePart);
    if (hasAbacus)      updateCoreAbacus(mVal, corePart);
    if (hasCoreDiagram) window.renderCorePartition(corePart);
  }

  // Update when typing in *either* box
  ["input", "change", "keyup"].forEach(evt => {
    mInput.addEventListener(evt, (e) => {
      if (evt !== "keyup" || e.key === "Enter") {
        updateFromInputs();
      }
    });
    coreInput.addEventListener(evt, (e) => {
      if (evt !== "keyup" || e.key === "Enter") {
        updateFromInputs();
      }
    });
  });
});
