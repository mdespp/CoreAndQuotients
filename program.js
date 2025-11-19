// program.js
// Self-contained JS translation of your Python Program(core, hooks, m)

// ---------- diagonal_legs_arms ----------

function diagonalLegsArmsProg(partition) {
  // partition: array of row lengths, e.g. [5,3,3,1]
  if (!partition || partition.length === 0) {
    return [[], []];
  }
  if (partition.length === 1 && partition[0] === 1) {
    return [[0], [0]];
  }

  const legs = [];
  const arms = [];

  for (let i = 0; i < partition.length; i++) {
    const row_len = partition[i];
    const diagIndex = i + 1; // 1-based
    if (row_len < diagIndex) break; // no more diagonal cells

    // arm at (i,i)
    const arm = row_len - diagIndex;

    // leg at (i,i)
    let leg = 0;
    for (let k = i + 1; k < partition.length; k++) {
      if (partition[k] >= diagIndex) {
        leg += 1;
      } else {
        break;
      }
    }

    arms.push(arm);
    legs.push(leg);
  }

  // sort as requested
  const legs_sorted = legs.slice().sort((a, b) => b - a); // desc
  const arms_sorted = arms.slice().sort((a, b) => a - b); // asc
  return [legs_sorted, arms_sorted];
}

// ---------- legs_arms_bitarrays ----------

function legsArmsBitarraysProg(partition, m) {
  const [legs, arms] = diagonalLegsArmsProg(partition);
  const max_num = 24;

  const size = m * (max_num + 1);
  const legs_bits = new Array(size).fill(0);
  const arms_bits = new Array(size).fill(1);

  for (const L of legs) {
    if (0 <= L && L < size) legs_bits[L] = 1;
  }
  for (const A of arms) {
    if (0 <= A && A < size) arms_bits[A] = 0;
  }
  return [legs_bits, arms_bits];
}

// ---------- getCaracteristicVector ----------

function getCaracteristicVectorProg(partition, m) {
  const [legs_bits, arms_bits] = legsArmsBitarraysProg(partition, m);
  const vector = new Array(m).fill(0);

  // legs: go through reversed bits
  let i = legs_bits.length;
  for (const bit of legs_bits.slice().reverse()) {
    i -= 1;
    if (bit === 1) {
      const idx = m - 1 - (i % m);
      const value = -(Math.floor(i / m) + 1);
      vector[idx] = value;
    }
  }

  // arms: forward
  i = -1;
  for (const bit of arms_bits) {
    i += 1;
    if (bit === 0) {
      const idx = i % m;
      const value = Math.floor(i / m) + 1;
      vector[idx] = value;
    }
  }

  const s = vector.reduce((a, b) => a + b, 0);
  if (s !== 0) {
    throw new Error(
      `Characteristic vector must sum to 0, but got sum = ${s}. Vector = ${vector}`
    );
  }
  return vector;
}

// ---------- partition_from_hooks ----------

function partition_from_hooksProg(hooks) {
  const d = hooks.length;
  const partition = [];
  for (let i = 0; i < d; i++) {
    const h = hooks[i];
    const lam_i = h - (d - (i + 1)); // λ_i = h_i - (d - i)
    if (lam_i <= 0) {
      throw new Error(
        `Invalid hook sequence: λ_${i + 1} = ${lam_i} must be > 0.`
      );
    }
    partition.push(lam_i);
  }
  return partition;
}

// ---------- normalize_quotient_bits ----------

function normalize_quotient_bitsProg(quotient_bits) {
  let max_leg_len = 0;
  let max_arm_len = 0;

  quotient_bits.forEach(([legs, arms]) => {
    if (legs.length > max_leg_len) max_leg_len = legs.length;
    if (arms.length > max_arm_len) max_arm_len = arms.length;
  });

  return quotient_bits.map(([legs, arms]) => {
    const L = legs.slice();
    const A = arms.slice();
    if (L.length < max_leg_len) {
      L.push(...Array(max_leg_len - L.length).fill(0));
    }
    if (A.length < max_arm_len) {
      A.push(...Array(max_arm_len - A.length).fill(1));
    }
    return [L, A];
  });
}

// ---------- merge + forbinus ----------

function merge_legs_interleaved_from_backProg(legs_lists) {
  const n = legs_lists[0].length;
  const result = [];
  const reversed_lists = legs_lists.slice().reverse();

  for (let i = 0; i < n; i++) {
    for (const lst of reversed_lists) {
      result.push(lst[i]);
    }
  }
  return result;
}

function merge_arms_interleaved_from_frontProg(arms_lists) {
  const n = arms_lists[0].length;
  const result = [];
  for (let i = 0; i < n; i++) {
    for (const lst of arms_lists) {
      result.push(lst[i]);
    }
  }
  return result;
}

function merge_quotient_bitsProg(quotient) {
  const legs_lists = quotient.map(pair => pair[0]);
  const arms_lists = quotient.map(pair => pair[1]);
  const merged_legs = merge_legs_interleaved_from_backProg(legs_lists);
  const merged_arms = merge_arms_interleaved_from_frontProg(arms_lists);
  return [merged_legs, merged_arms];
}

function forbinusProg(quotient) {
  const [legBits, armBits] = quotient;
  const newlegs = [];
  const newarms = [];

  legBits.forEach((bit, idx) => {
    if (bit === 1) newlegs.push(idx);
  });
  armBits.forEach((bit, idx) => {
    if (bit === 0) newarms.push(idx);
  });

  newlegs.reverse();
  newarms.reverse();
  return [newlegs, newarms];
}

// ---------- Frobenius → partition ----------

function partition_from_frobenius_standardProg(alpha, beta) {
  if (alpha.length !== beta.length) {
    throw new Error("alpha and beta must have the same length");
  }

  const r = alpha.length;
  if (r === 0) return [];

  let max_row = 0;
  for (let i = 1; i <= r; i++) {
    const v = i + beta[i - 1];
    if (v > max_row) max_row = v;
  }

  const lam = [];
  for (let j = 1; j <= max_row; j++) {
    if (j <= r) {
      lam.push(alpha[j - 1] + j);
    } else {
      let count = 0;
      for (let i = 1; i <= r; i++) {
        if (beta[i - 1] >= j - i) count++;
      }
      lam.push(count);
    }
  }

  while (lam.length > 0 && lam[lam.length - 1] === 0) {
    lam.pop();
  }
  return lam;
}

function partition_from_forbiusProg(legs, arms) {
  return partition_from_frobenius_standardProg(arms, legs);
}

// ---------- addCharacter ----------

function addCharacterProg(bits, number) {
  let legs = bits[0].slice();
  let arms = bits[1].slice();

  if (number === 0) {
    return [legs, arms];
  } else if (number === 1) {
    const first = legs[0];
    legs = legs.slice(1).concat([0]);
    arms = [first].concat(arms.slice(0, -1));
    return [legs, arms];
  } else {
    const first = arms[0];
    arms = arms.slice(1).concat([1]);
    legs = [first].concat(legs.slice(0, -1));
    return [legs, arms];
  }
}

// ---------- Program(core, hooks, m) ----------

function ProgramCoreQuotient(core, hooksList, m) {
  // core: array, e.g. [2,2]
  // hooksList: array of arrays, e.g. [[2,1],[1],[],[1],[2]]
  // m: integer

  const characters = getCaracteristicVectorProg(core, m);

  let Quotient = hooksList.map(hooks => {
    const part = partition_from_hooksProg(hooks);
    return legsArmsBitarraysProg(part, m);
  });

  Quotient = normalize_quotient_bitsProg(Quotient);
  Quotient = Quotient.map((bits, i) => addCharacterProg(bits, characters[i]));

  const mergedBits = merge_quotient_bitsProg(Quotient);
  const frob = forbinusProg(mergedBits);

  const partition = partition_from_forbiusProg(frob[0], frob[1]);
  return partition;
}

// expose globally for quotient.js
window.ProgramCoreQuotient = ProgramCoreQuotient;
