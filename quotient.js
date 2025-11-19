// quotient.js

// use the same parsePartitionString helper as core.js if it exists
if (typeof parsePartitionString !== "function") {
  function parsePartitionString(str) {
    return str
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(Number)
      .filter(n => Number.isInteger(n) && n > 0);
  }
}

// hooks parser: accept "()" or "0" as empty
function parseHooksList(str) {
  if (!str || !str.trim()) return [];

  const pieces = str.split(";");
  const result = [];

  for (let raw of pieces) {
    let s = raw.trim();
    if (!s) continue;

    // treat "()" or "0" as empty
    if (s === "()" || s === "0") {
      result.push([]);
      continue;
    }

    if (s.startsWith("(") && s.endsWith(")")) {
      s = s.slice(1, -1).trim();
    }

    const part = parsePartitionString(s);
    if (part.length === 0) {
      throw new Error(`Could not parse hooks piece "${raw}". Use e.g. 2,1 or ().`);
    }
    result.push(part);
  }

  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  const coreMInput    = document.getElementById("core-m");
  const corePartInput = document.getElementById("core-result");
  const hooksInput    = document.getElementById("quot-hooks");
  const mDisplaySpan  = document.getElementById("quot-m-display");
  const panel         = document.getElementById("quotient-panel");
  const errorDiv      = document.getElementById("quotient-error");
  const finalDiv      = document.getElementById("final-partition");

  if (!coreMInput || !corePartInput || !hooksInput ||
      !mDisplaySpan || !panel || !errorDiv || !finalDiv) {
    return;
  }

  function getMVal() {
    const val = parseInt(coreMInput.value, 10);
    return Number.isInteger(val) && val > 0 ? val : null;
  }

  function syncMDisplay() {
    const m = getMVal();
    mDisplaySpan.textContent = m !== null ? String(m) : "m";
  }

function showFinal(partition) {
  finalDiv.innerHTML = "";

  // Always update the diagram:
  if (typeof window.renderPartitionWithHooks === "function") {
    window.renderPartitionWithHooks(partition || []);
  }

  // NEW: always update Frobenius fence (clears itself on empty)
  if (typeof window.renderForbinusFence === "function") {
    window.renderForbinusFence(partition || []);
  }

  if (!partition || partition.length === 0) {
    return; // no text card, keep partition blank
  }

  const card = document.createElement("div");
  card.className = "final-partition-card";
  const body = document.createElement("div");
  body.className = "final-partition-body";
  body.innerHTML =
    "Recovered partition λ: <br>(" + partition.join(", ") + ")";

  card.appendChild(body);
  finalDiv.appendChild(card);
}


  function updateAll() {
    panel.classList.remove("quotient-valid");
    errorDiv.textContent = "";
    showFinal(null);
    syncMDisplay();

    // clear quotient diagrams by default
    if (typeof window.renderQuotientPartitions === "function") {
      window.renderQuotientPartitions([]);
    }
    // clear quotient abacus by default
    if (typeof window.renderQuotientAbacus === "function") {
      window.renderQuotientAbacus([], null);
    }

    const m = getMVal();
    if (m === null) {
      if (hooksInput.value.trim() !== "") {
        errorDiv.textContent = "Set m in the Cor line first.";
      }
      return;
    }

    const corePart = parsePartitionString(corePartInput.value || "");
    if (corePart.length === 0) {
      if (hooksInput.value.trim() !== "") {
        errorDiv.textContent = "Enter the core partition (e.g. 2,2).";
      }
      return;
    }

    let hooksList;
    try {
      hooksList = parseHooksList(hooksInput.value || "");
    } catch (e) {
      errorDiv.textContent = e.message;
      return;
    }

    if (hooksList.length === 0) return;

    if (hooksList.length !== m) {
      errorDiv.textContent =
        `You must give exactly m = ${m} hook partitions; currently: ${hooksList.length}.`;
      // still show whatever quotients we parsed, even if count is wrong
      if (typeof window.renderQuotientPartitions === "function") {
        window.renderQuotientPartitions(hooksList);
      }
      return;
    }
    let charVec = null;
if (typeof window.getCaracteristicVector === "function") {
  // corePart is already parsed, m is known
  charVec = window.getCaracteristicVector(corePart, m);
}

// existing plain quotient abacus:
if (typeof window.renderQuotientAbacus === "function") {
  window.renderQuotientAbacus(hooksList, m);
}

// NEW: characteristic quotient abacus:
if (typeof window.renderCharacteristicQuotientAbacus === "function") {
  window.renderCharacteristicQuotientAbacus(hooksList, m, charVec);
}
if (typeof window.renderCharacteristicQuotientAbacus === "function") {
  window.renderCharacteristicQuotientAbacus(corePart, hooksList, m);
}



    // at this point hooksList is valid and length = m
    if (typeof window.renderQuotientPartitions === "function") {
      window.renderQuotientPartitions(hooksList);
    }
    if (typeof window.renderQuotientAbacus === "function") {
      window.renderQuotientAbacus(hooksList, m);
    }

    try {
      const lam = window.ProgramCoreQuotient(corePart, hooksList, m);
      panel.classList.add("quotient-valid");
      showFinal(lam);
    } catch (e) {
      errorDiv.textContent = e.message;
    }
  }

  ["input", "change", "keyup"].forEach(evt => {
    coreMInput.addEventListener(evt, e => {
      if (evt !== "keyup" || e.key === "Enter") updateAll();
    });
    corePartInput.addEventListener(evt, e => {
      if (evt !== "keyup" || e.key === "Enter") updateAll();
    });
    hooksInput.addEventListener(evt, e => {
      if (evt !== "keyup" || e.key === "Enter") updateAll();
    });
  });

  syncMDisplay();
});
