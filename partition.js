// partition.js

/**
 * Displays a partition on the page.
 * Input: array of integers, e.g. [10, 10, 10, 9, 6, 3, 1]
 * (corresponds to the tuple (10,10,10,9,6,3,1))
 */
function displayPartition(partition) {
  const container = document.getElementById("partition-display");
  if (!container) return;

  // Clear previous diagram
  container.innerHTML = "";

  // Add each row
  partition.forEach((rowLen) => {
    const row = document.createElement("div");
    row.className = "partition-row";

    for (let i = 0; i < rowLen; i++) {
      const cell = document.createElement("div");
      cell.className = "partition-cell";
      row.appendChild(cell);
    }

    container.appendChild(row);
  });
}

// Example partition — change this to whatever you want
displayPartition([0,0,0]);

// Compute hook lengths for a partition (JS copy of your Python hook_lengths)
function computeHookLengths(partition) {
  // partition: array of row lengths, e.g. [5,3,3,1]
  const hooks2D = [];
  const nRows = partition.length;

  for (let i = 0; i < nRows; i++) {
    const rowLen = partition[i];
    const rowHooks = [];

    for (let j = 0; j < rowLen; j++) {
      // cells to the right
      const right = rowLen - j - 1;

      // cells below
      let below = 0;
      for (let k = i + 1; k < nRows; k++) {
        if (partition[k] > j) {
          below += 1;
        } else {
          break;
        }
      }

      rowHooks.push(right + below + 1);
    }

    hooks2D.push(rowHooks);
  }

  return hooks2D;
}

// Render partition with hook numbers into #partition-display
function renderPartitionWithHooks(partition) {
  const container = document.getElementById("partition-display");
  if (!container) return;

  // clear
  container.innerHTML = "";

  if (!partition || partition.length === 0) {
    return; // keep blank if nothing
  }

  const hooks2D = computeHookLengths(partition);

  const card = document.createElement("div");
  card.className = "partition-card";

  const grid = document.createElement("div");
  grid.className = "partition-grid";

  hooks2D.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "partition-row";

    row.forEach(h => {
      const cell = document.createElement("div");
      cell.className = "partition-cell partition-cell-hook";
      cell.textContent = h;       // <-- place hook number in the box
      rowDiv.appendChild(cell);
    });

    grid.appendChild(rowDiv);
  });

  card.appendChild(grid);
  container.appendChild(card);
}

// make available globally
window.renderPartitionWithHooks = renderPartitionWithHooks;
