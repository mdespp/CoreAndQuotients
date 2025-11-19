// characteristic.js
// ------------------------------------------------------------
//  JS TRANSLATION OF YOUR PYTHON CHARACTERISTIC VECTOR LOGIC
//  Requires legsArmsBitarrays(partition, m) from your code.
// ------------------------------------------------------------

// partition = array of ints, m = integer
window.getCaracteristicVector = function(partition, m) {
  if (typeof window.legsArmsBitarrays !== "function") {
    throw new Error("legsArmsBitarrays not found.");
  }

  // Convert partition to tuple-like
  const part = partition.slice();

  // legsBits = 0/1 array size m*(max_num+1)
  // armsBits = same
  const bits = window.legsArmsBitarrays(part, m);

  const legs_bits = bits.legsBits;
  const arms_bits = bits.armsBits;

  const vector = new Array(m).fill(0);

  // ---------------------------
  // PYTHON:
  // i = len(legs_bits)
  // for bit in reversed(legs_bits):
  //     i -= 1
  //     if bit == 1:
  //         vector[m-1-i%m] = -(floor(i/m)+1)
  // ---------------------------
  let i = legs_bits.length;
  for (let k = legs_bits.length - 1; k >= 0; k--) {
    i -= 1;
    if (legs_bits[k] === 1) {
      const index = m - 1 - (i % m);
      vector[index] = - (Math.floor(i / m) + 1);
    }
  }

  // ---------------------------
  // PYTHON:
  // i = -1
  // for bit in arms_bits:
  //     i += 1
  //     if bit == 0:
  //         vector[i%m] = (floor(i/m)+1)
  // ---------------------------
  i = -1;
  for (let k = 0; k < arms_bits.length; k++) {
    i += 1;
    if (arms_bits[k] === 0) {
      const index = i % m;
      vector[index] = Math.floor(i / m) + 1;
    }
  }

  // Check sum = 0
  const s = vector.reduce((a,b) => a+b, 0);
  if (s !== 0) {
    throw new Error(
      `Characteristic vector must sum to 0, but got ${s}. Vector = ${vector}`
    );
  }

  return vector;
};

// ---- Helpers ported from your Python code ----

// diagonal_legs_arms(partition)
function diagonalLegsArms(partition) {
  const legs = [];
  const arms = [];

  for (let idx = 0; idx < partition.length; idx++) {
    const i = idx + 1;
    const rowLen = partition[idx];

    if (rowLen < i) break; // no more diagonal cells

    const arm = rowLen - i;

    let leg = 0;
    for (let k = i; k < partition.length; k++) {
      if (partition[k] >= i) leg++;
    }

    arms.push(arm);
    legs.push(leg);
  }

  const legsSorted = legs.slice().sort((a, b) => b - a);
  const armsSorted = arms.slice().sort((a, b) => a - b);

  return { legs: legsSorted, arms: armsSorted };
}

// legs_arms_bitarrays(partition, m)
function legsArmsBitarrays(partition, m) {
  const { legs, arms } = diagonalLegsArms(partition);
  const maxNum = 24;
  const size = m * (maxNum + 1);

  const legsBits = new Array(size).fill(0);
  const armsBits = new Array(size).fill(1);

  legs.forEach(L => {
    if (L >= 0 && L < size) legsBits[L] = 1;
  });

  arms.forEach(A => {
    if (A >= 0 && A < size) armsBits[A] = 0;
  });

  return { legsBits, armsBits };
}

// getCaracteristicVector(partition, m)
function getCharacteristicVectorJS(partition, m) {
  const { legsBits, armsBits } = legsArmsBitarrays(partition, m);
  const vector = new Array(m).fill(0);

  // legs part: reversed traversal
  let i = legsBits.length;
  for (let idx = legsBits.length - 1; idx >= 0; idx--) {
    i -= 1;
    if (legsBits[idx] === 1) {
      const pos = m - 1 - (i % m);
      const val = -(Math.floor(i / m) + 1);
      vector[pos] = val;
    }
  }

  // arms part: forward traversal
  i = -1;
  for (let idx = 0; idx < armsBits.length; idx++) {
    i += 1;
    if (armsBits[idx] === 0) {
      const pos = i % m;
      const val = Math.floor(i / m) + 1;
      vector[pos] = val;
    }
  }

  const sum = vector.reduce((a, b) => a + b, 0);
  if (sum !== 0) {
    throw new Error(
      `Characteristic vector must sum to 0, but got sum = ${sum}.\n` +
      `Vector = [${vector.join(', ')}]`
    );
  }

  return vector;
}

// ---- UI: display characteristic vector ----

function updateCharacteristicDisplay(m, corePartition) {
  const container = document.getElementById("characteristic-display");
  if (!container) return;

  container.innerHTML = "";

  if (!m || !corePartition || corePartition.length === 0) {
    // nothing to show
    return;
  }

  let vector;
  try {
    vector = getCharacteristicVectorJS(corePartition, m);
  } catch (e) {
    const err = document.createElement("div");
    err.className = "char-error";
    err.textContent = e.message;
    container.appendChild(err);
    return;
  }

  const title = document.createElement("div");
  title.className = "char-title";
  title.textContent = `Characteristic vector for core (m = ${m}):`;
  container.appendChild(title);

  const row = document.createElement("div");
  row.className = "char-vector-row";

  vector.forEach(v => {
    const cell = document.createElement("div");
    cell.className = "char-cell";
    if (v > 0) cell.classList.add("char-pos");
    if (v < 0) cell.classList.add("char-neg");
    cell.textContent = v.toString();
    row.appendChild(cell);
  });

  container.appendChild(row);
}

// expose globally so core.js can call it
window.updateCharacteristicDisplay = updateCharacteristicDisplay;
