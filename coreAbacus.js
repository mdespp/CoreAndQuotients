// coreAbacus.js

// build_abacus equivalent in JS
function buildAbacus(partition, m) {
  const { legsBits, armsBits } = legsArmsBitarrays(partition, m); // from characteristic.js

  const sizeLegs = legsBits.length;
  const sizeArms = armsBits.length;

  const rowsBelow = (m > 0 && sizeLegs > 0) ? Math.ceil(sizeLegs / m) : 0;
  const rowsAbove = (m > 0 && sizeArms > 0) ? Math.ceil(sizeArms / m) : 0;

  // below: r = 0 bottom, fill right→left
  const below = Array.from({ length: rowsBelow }, () => new Array(m).fill(0));
  let idx = 0;
  for (let r = 0; r < rowsBelow; r++) {          // r = 0 bottom
    for (let c = m - 1; c >= 0; c--) {           // right → left
      if (idx < sizeLegs) {
        below[r][c] = legsBits[idx];
      }
      idx++;
    }
  }

  // above: r = 0 top, fill left→right
  const above = Array.from({ length: rowsAbove }, () => new Array(m).fill(0));
  idx = 0;
  for (let r = 0; r < rowsAbove; r++) {          // r = 0 top
    for (let c = 0; c < m; c++) {                // left → right
      if (idx < sizeArms) {
        above[r][c] = armsBits[idx];
      }
      idx++;
    }
  }

  return { above, below };
}

function updateCoreAbacus(m, corePartition) {
  const container = document.getElementById("core-abacus");
  if (!container) return;

  container.innerHTML = "";

  if (!m || !corePartition || corePartition.length === 0) {
    return; // nothing yet
  }

  let abacus;
  try {
    abacus = buildAbacus(corePartition, m);
  } catch (e) {
    const err = document.createElement("div");
    err.className = "char-error"; // reuse styling
    err.textContent = e.message;
    container.appendChild(err);
    return;
  }

  const { above, below } = abacus;

  const title = document.createElement("div");
  title.className = "abacus-title";
  title.textContent = `${m}-abacus for core:`;
  container.appendChild(title);

  const wrap = document.createElement("div");
  wrap.className = "abacus-wrap";

  // ---------- TOP (2 rows from ABOVE) ----------
  // Prefer row 1 then row 0 if they exist; otherwise just show what we have.
  const topIndices = [];
  if (above.length > 1) {
    topIndices.push(1, 0);
  } else if (above.length === 1) {
    topIndices.push(0);
  }

  topIndices.forEach(r => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "abacus-row abacus-row-above";

    above[r].forEach(bit => {
      const bead = document.createElement("div");
      // HERE: 1 = WHITE, 0 = BLACK
      bead.className =
        "abacus-bead " + (bit === 1 ? "abacus-bead-zero" : "abacus-bead-one");
      rowDiv.appendChild(bead);
    });

    wrap.appendChild(rowDiv);
  });

  // ---------- FENCE ----------
  if (topIndices.length > 0 || below.length > 0) {
    const fence = document.createElement("div");
    fence.className = "abacus-fence-row";
    const mCols = m > 0 ? m : 0;
    for (let i = 0; i < mCols; i++) {
      const seg = document.createElement("div");
      seg.className = "abacus-fence-seg";
      fence.appendChild(seg);
    }
    wrap.appendChild(fence);
  }

  // ---------- BOTTOM (2 rows from BELOW) ----------
  // Take row 0 then row 1 if they exist (nearest to bottom, then next).
  let bottomIndices = [];
  if (below.length > 0) bottomIndices.push(0);
  if (below.length > 1) bottomIndices.push(1);
// below rows: nearest to fence first (so reverse order of array)
for (let r = 0; r < 2; r++) {
  if (!below[r]) break;                 // safety if there are fewer than 2 rows

  const rowDiv = document.createElement("div");
  rowDiv.className = "abacus-row abacus-row-below";

  // 🔥 reverse the row so beads line up correctly left→right
  const rowBits = [...below[r]].reverse();

  rowBits.forEach(bit => {
    const bead = document.createElement("div");
    bead.className =
      "abacus-bead " + (bit === 0 ? "abacus-bead-one" : "abacus-bead-zero");
    rowDiv.appendChild(bead);
  });

  wrap.appendChild(rowDiv);
}


  container.appendChild(wrap);
}

// make available to core.js
window.updateCoreAbacus = updateCoreAbacus;
