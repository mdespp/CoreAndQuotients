// characteristicQuotient.js
// Same look as quotientAbacus.js, but with the characteristic shift
// applied to each quotient runner before we trim/pad and draw.
//
// Called from quotient.js as:
//   renderCharacteristicQuotientAbacus(corePartitionArray, hooksList, m)

(function () {
  // ----------------- hooks → partition -----------------

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
      armsBits: bits.armsBits || [],
    };
  }

  // ----------------- characteristic shift -----------------

  // JS version of your Python addCharacter, but for a *single* runner.
  // bits: { legsBits, armsBits }, number ∈ { -1, 0, 1 } (in practice)
  function applyShift(bits, number) {
    let legs = bits.legsBits.slice();
    let arms = bits.armsBits.slice();

    if (!Number.isInteger(number) || number === 0) {
      return { legsBits: legs, armsBits: arms };
    }

    // If somehow magnitude > 1, apply sign(number) times
    const step = number > 0 ? 1 : -1;
    const times = Math.abs(number);

    for (let t = 0; t < times; t++) {
      if (step === 1) {
        // +1 case (your "elif number == 1")
        const first = legs.length ? legs[0] : 0;
        legs = legs.slice(1).concat([0]);
        if (arms.length === 0) {
          arms = [first];
        } else {
          arms = [first].concat(arms.slice(0, -1));
        }
      } else {
        // -1 case (your "else")
        const first = arms.length ? arms[0] : 1;
        arms = arms.slice(1).concat([1]);
        if (legs.length === 0) {
          legs = [first];
        } else {
          legs = [first].concat(legs.slice(0, -1));
        }
      }
    }

    return { legsBits: legs, armsBits: arms };
  }

  // ----------------- main renderer -----------------

  // corePart:   array of ints (core partition)
  // hooksList:  list of hook-partitions (each an array of ints)
  // m:          modulus (same m as in Cor)
  function renderCharacteristicQuotientAbacus(corePart, hooksList, m) {
    const container = document.getElementById("characteristic-quotient-abacus");
    if (!container) return;

    container.innerHTML = "";

    if (
      !hooksList ||
      hooksList.length === 0 ||
      !m ||
      m <= 0 ||
      !corePart ||
      corePart.length === 0
    ) {
      return;
    }

    if (typeof window.getCaracteristicVector !== "function") {
      const warn = document.createElement("div");
      warn.style.color = "#c33";
      warn.textContent = "getCaracteristicVector not found.";
      container.appendChild(warn);
      return;
    }

    // Characteristic vector from the core, like in Python Program
    let charVec;
    try {
      charVec = window.getCaracteristicVector(corePart, m);
    } catch (e) {
      const warn = document.createElement("div");
      warn.style.color = "#c33";
      warn.textContent = e.message;
      container.appendChild(warn);
      return;
    }

    // ---------- FIRST PASS ----------
    // For each quotient store shifted bits, plus armLen / legLen
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
          const rb = rawRunnerBitsFromPartition(part);

          // apply characteristic shift for this quotient i
          const shift = charVec[idx] || 0;
          const shifted = applyShift(rb, shift);

          armsBits = shifted.armsBits;
          legsBits = shifted.legsBits;
        }

        // arms: only count until final *black* bead ⇒ last index where bit === 0
        let lastArmBlack = -1;
        for (let i = 0; i < armsBits.length; i++) {
          if (armsBits[i] === 0) lastArmBlack = i;
        }
        armLen = lastArmBlack === -1 ? 0 : lastArmBlack + 1;

        // legs: only count until final *white* bead ⇒ last index where bit === 1
        let lastLegWhite = -1;
        for (let i = 0; i < legsBits.length; i++) {
          if (legsBits[i] === 1) lastLegWhite = i;
        }
        legLen = lastLegWhite === -1 ? 0 : lastLegWhite + 1;
      } catch (e) {
        error = e;
      }

      runners.push({ idx, hooks, armsBits, legsBits, armLen, legLen, error });
    });

    // Determine global rowsAbove / rowsBelow so all columns align
    let rowsAbove = 0;
    let rowsBelow = 0;
    runners.forEach((r) => {
      if (r.error) return;
      if (r.armLen > rowsAbove) rowsAbove = r.armLen+1;
      if (r.legLen > rowsBelow) rowsBelow = r.legLen+1;
    });

    if (rowsAbove === 0) rowsAbove = 2;
    if (rowsBelow === 0) rowsBelow = 2;

    // ---------- TITLE ----------
    const title = document.createElement("div");
    title.className = "quot-abacus-title";
    title.textContent = "Characteristic Quotient Abacus:";
    container.appendChild(title);

    const row = document.createElement("div");
    row.className = "quot-abacus-row";

    // ---------- SECOND PASS: pad + draw ----------
    runners.forEach((r) => {
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

      let above = r.armLen > 0 ? r.armsBits.slice(0, r.armLen) : [];
      let below = r.legLen > 0 ? r.legsBits.slice(0, r.legLen) : [];

      // pad to common height: above with white (1), below with black (0)
      while (above.length < rowsAbove) above.push(1);
      while (below.length < rowsBelow) below.push(0);

      // ABOVE: top → fence; 0 = black bead, 1 = white bead
      above
        .slice()
        .reverse()
        .forEach((bit) => {
          const bead = document.createElement("div");
          bead.className = "qab-bead";
          if (bit === 0) bead.classList.add("qab-bead-one");
          column.appendChild(bead);
        });

      // Fence
      const fence = document.createElement("div");
      fence.className = "qab-fence";
      column.appendChild(fence);

      // BELOW: fence → bottom; 0 = black bead, 1 = white bead
      below.forEach((bit) => {
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

  // expose globally so quotient.js can call it
  window.renderCharacteristicQuotientAbacus =
    renderCharacteristicQuotientAbacus;
})();
