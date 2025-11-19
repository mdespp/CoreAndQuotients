// forbinusFence.js
// Compute Frobenius coordinates (legs | arms) from the recovered partition
// and display 𝓕 = ( ... | ... ) in a cute card.

(function () {
  // partition = [λ1, λ2, ...] in English notation
  function frobeniusFromPartition(partition) {
    if (!partition || partition.length === 0) {
      return { legs: [], arms: [] };
    }

    const lam = partition.slice();

    // Number of diagonal cells d = max i such that λ_i >= i
    let d = 0;
    for (let i = 0; i < lam.length; i++) {
      const rowLen = lam[i];
      const diagIndex = i + 1; // i is 0-based, diag index is 1-based
      if (rowLen >= diagIndex) {
        d = diagIndex;
      } else {
        break;
      }
    }

    if (d === 0) {
      return { legs: [], arms: [] };
    }

    const legs = [];
    const arms = [];

    // For i = 1..d:
    // arm_i = λ_i - i
    // leg_i = #{ j > i : λ_j >= i }
    for (let i = 1; i <= d; i++) {
      const rowLen = lam[i - 1];

      const arm = rowLen - i;

      let leg = 0;
      for (let j = i + 1; j <= lam.length; j++) {
        if (lam[j - 1] >= i) {
          leg++;
        } else {
          break;
        }
      }

      arms.push(arm);
      legs.push(leg);
    }

    // Your Python uses (legs | arms)
    return { legs, arms };
  }

  function renderForbinusFence(partition) {
    const container = document.getElementById("forbinus-fence");
    if (!container) return;

    container.innerHTML = "";

    if (!partition || partition.length === 0) {
      // Empty partition → show nothing for now
      return;
    }

    const { legs, arms } = frobeniusFromPartition(partition);

    const card = document.createElement("div");
    card.className = "forb-card";

    const title = document.createElement("div");
    title.className = "forb-title";
    title.textContent = "Frobenius fence:";
    card.appendChild(title);

    const body = document.createElement("div");
    body.className = "forb-body";

    if (legs.length === 0) {
      body.textContent = "𝓕 = ∅";
    } else {
      // 𝓕 = ( legs | arms ), with your convention (legs | arms)
      const legsStr = legs.join(", ");
      const armsStr = arms.reverse().join(", ");
      body.textContent = `𝓕 = (${legsStr} | ${armsStr})`;
    }

    card.appendChild(body);
    container.appendChild(card);
  }

  // expose globally so quotient.js can call it
  window.renderForbinusFence = renderForbinusFence;
})();
