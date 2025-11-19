// quotientAbacus.js
// Show a one-runner abacus for each quotient, side by side.
// Uses legsArmsBitarrays(partition, m=1) from characteristic.js.

(function() {
  // hooks -> partition [λ1,...,λd] with λ_i = h_i - (d - i)
  function partitionFromHooksLocal(hooks) {
    const d = hooks.length;
    const partition = [];
    for (let i = 0; i < d; i++) {
      const h = hooks[i];
      const lam_i = h - (d - (i + 1));
      if (lam_i <= 0) {
        throw new Error(
          `Invalid hook sequence ${JSON.stringify(hooks)}: ` +
          `λ_${i + 1} = ${lam_i} must be > 0.`
        );
      }
      partition.push(lam_i);
    }
    return partition;
  }

  // Get raw arms / legs bits for a 1-runner abacus from a partition
  function rawRunnerBitsFromPartition(partition) {
    if (typeof window.legsArmsBitarrays !== "function") {
      throw new Error("legsArmsBitarrays not found (characteristic.js missing).");
    }
    const bits = window.legsArmsBitarrays(partition, 1);
    return {
      legsBits: bits.legsBits || [],
      armsBits: bits.armsBits || []
    };
  }

  function renderQuotientAbacus(hooksList, m) {
    const container = document.getElementById("quotient-abacus");
    if (!container) return;

    container.innerHTML = "";

    if (!hooksList || hooksList.length === 0 || !m || m <= 0) {
      return;
    }

    // ---------- FIRST PASS ----------
    // For each quotient store raw bits, plus armLen / legLen
    const runners = [];
    hooksList.forEach((hooks, idx) => {
      let armsBits = [];
      let legsBits = [];
      let armLen = 0;
      let legLen = 0;
      let error = null;

      try {
        if (!hooks || hooks.length === 0) {
          // empty quotient: keep arrays empty; armLen = legLen = 0
          armsBits = [];
          legsBits = [];
        } else {
          const part = partitionFromHooksLocal(hooks);
          const rb   = rawRunnerBitsFromPartition(part);
          armsBits   = rb.armsBits;
          legsBits   = rb.legsBits;
        }

        // arms: only count until final *black* bead ⇒ last index where bit === 0
        let lastArmBlack = -1;
        for (let i = 0; i < armsBits.length; i++) {
          if (armsBits[i] === 0) lastArmBlack = i;
        }
        armLen = (lastArmBlack === -1) ? 0 : lastArmBlack + 1;

        // legs: only count until final *white* bead ⇒ last index where bit === 1
        let lastLegWhite = -1;
        for (let i = 0; i < legsBits.length; i++) {
          if (legsBits[i] === 1) lastLegWhite = i;
        }
        legLen = (lastLegWhite === -1) ? 0 : lastLegWhite + 1;

      } catch (e) {
        error = e;
      }

      runners.push({ idx, hooks, armsBits, legsBits, armLen, legLen, error });
    });

    // Determine global rowsAbove / rowsBelow
    let rowsAbove = 0;
    let rowsBelow = 0;
    runners.forEach(r => {
      if (r.error) return;
      if (r.armLen > rowsAbove) rowsAbove = r.armLen;
      if (r.legLen > rowsBelow) rowsBelow = r.legLen;
    });

    // Ensure at least one row each so columns don't collapse
    if (rowsAbove === 0) rowsAbove = 1;
    if (rowsBelow === 0) rowsBelow = 1;

    // ---------- TITLE ----------
    const title = document.createElement("div");
    title.className = "quot-abacus-title";
    title.textContent = "Quotient Abacus:";
    container.appendChild(title);

    const row = document.createElement("div");
    row.className = "quot-abacus-row";

    // ---------- SECOND PASS: pad + draw ----------
    runners.forEach(r => {
      const runner = document.createElement("div");
      runner.className = "quot-runner";

      const label = document.createElement("div");
      label.textContent = `Q${r.idx + 1}`;
      runner.appendChild(label);

      const column = document.createElement("div");
      column.className = "quot-runner-column";

      if (r.error) {
        const err = document.createElement("div");
        err.style.fontSize = "10px";
        err.style.color = "#c33";
        err.textContent = "bad hooks";
        runner.appendChild(err);
        row.appendChild(runner);
        return;
      }

      // Build trimmed arrays according to armLen / legLen
      let above = (r.armLen > 0) ? r.armsBits.slice(0, r.armLen) : [];
      let below = (r.legLen > 0) ? r.legsBits.slice(0, r.legLen) : [];

      // Pad to global rowsAbove / rowsBelow with *white* beads (bit = 1)
      while (above.length < rowsAbove) above.push(1);
      while (below.length < rowsBelow) below.push(0);

      // Draw above (top -> fence); you like reverse plus 0 = black
      above.slice().reverse().forEach(bit => {
        const bead = document.createElement("div");
        bead.className = "qab-bead";
        if (bit === 0) bead.classList.add("qab-bead-one");
        column.appendChild(bead);
      });

      // Fence
      const fence = document.createElement("div");
      fence.className = "qab-fence";
      column.appendChild(fence);

      // Draw below (fence -> bottom); 0 = black, 1 = white
       // Draw below (fence -> bottom); 0 = black, 1 = white
      below.slice().forEach(bit => {
        const bead = document.createElement("div");
        bead.className = "qab-bead";
        if (bit === 0) bead.classList.add("qab-bead-one");
        column.appendChild(bead);
      });


      runner.appendChild(column);
      row.appendChild(runner);
    });

    container.appendChild(row);
  }

  // expose globally for quotient.js
  window.renderQuotientAbacus = renderQuotientAbacus;
})();
