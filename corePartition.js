// corePartition.js
// Draw the Young diagram of the core partition with:
//  - black beads on the RIGHT edge of outer cells (outside boxes)
//  - white beads on the BOTTOM edge of outer cells (outside boxes)
//  - a red diagonal across diagonal cells

// how many diagonal cells does λ have?
function diagonalLength(partition) {
  let d = 0;
  for (let i = 0; i < partition.length; i++) {
    if (partition[i] > i) {
      d += 1;
    } else {
      break;
    }
  }
  return d;
}

function renderCorePartition(partition) {
  const container = document.getElementById("core-partition");
  if (!container) return;

  container.innerHTML = "";

  if (!partition || partition.length === 0) {
    return; // nothing yet
  }

  const rows   = partition.length;
  const maxRow = Math.max(...partition);

  const card = document.createElement("div");
  card.className = "core-partition-card";

  const wrapper = document.createElement("div");
  wrapper.className = "core-partition-wrapper";

  const grid = document.createElement("div");
  grid.className = "core-partition-grid";

  // -------------------------
  // 1) Draw the Ferrers boxes
  // -------------------------
  for (let i = 0; i < rows; i++) {
    const rowLen = partition[i];
    const rowDiv = document.createElement("div");
    rowDiv.className = "core-partition-row";

    for (let j = 0; j < rowLen; j++) {
      const cell = document.createElement("div");
      cell.className = "core-partition-cell";

      // border logic: right + bottom for all cells
      cell.classList.add("right");
      cell.classList.add("bottom");

      // top border for first row
      if (i === 0) cell.classList.add("top");
      // left border for first column
      if (j === 0) cell.classList.add("left");

      rowDiv.appendChild(cell);
    }

    grid.appendChild(rowDiv);
  }

  wrapper.appendChild(grid);
  card.appendChild(wrapper);
  container.appendChild(card);

  // -------------------------
  // 2) Measure real cell size
  // -------------------------
  const gridRect    = grid.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();

  const offsetX = gridRect.left - wrapperRect.left;
  const offsetY = gridRect.top  - wrapperRect.top;

  const gridW = gridRect.width;
  const gridH = gridRect.height;

  const cellW = gridW / maxRow;
  const cellH = gridH / rows;
  const step  = Math.min(cellW, cellH);

  const svgNS = "http://www.w3.org/2000/svg";

  // helper to create an overlay SVG pinned over the grid
  function makeOverlaySvg(extraX = 0, extraY = 0) {
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width",  gridW + extraX);
    svg.setAttribute("height", gridH + extraY);
    svg.classList.add("core-partition-overlay");
    svg.style.left = offsetX + "px";
    svg.style.top  = offsetY + "px";
    return svg;
  }

  // -------------------------
  // 3) Beads overlay (RIGHT + BOTTOM only)
  // -------------------------
  const rightOffset  = step * 0.15; // distance OUTSIDE right edge
  const bottomOffset = step * 0.2; // distance OUTSIDE bottom edge

  const beadsSvg = makeOverlaySvg(rightOffset * 2, bottomOffset * 2);

  const blackRadius = step * 0.15;
  const whiteRadius = step * 0.15;

  function addCircle(svg, cx, cy, r, color, strokeColor) {
    const c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", String(cx));
    c.setAttribute("cy", String(cy));
    c.setAttribute("r",  String(r));
    c.setAttribute("fill", color);
    if (strokeColor) {
      c.setAttribute("stroke", strokeColor);
      c.setAttribute("stroke-width", "1");
    }
    svg.appendChild(c);
  }

  // Loop through each cell (i,j) that exists in the partition
  for (let i = 0; i < rows; i++) {
    const rowLen = partition[i];
    for (let j = 0; j < rowLen; j++) {

      const isRightEdge = (j === rowLen - 1);

      // bottom edge if:
      //  - this is the last row, OR
      //  - the row below is too short to have a cell in column j
      const isBottomEdge =
        (i === rows - 1) || (partition[i + 1] <= j);

      const cellLeft   = j * cellW;
      const cellTop    = i * cellH;
      const cellCenterX = cellLeft + cellW / 2;
      const cellCenterY = cellTop + cellH / 2;

      // black bead: right edge of outer cell (outside box)
      if (isRightEdge) {
        const cx = cellLeft + cellW + rightOffset;
        const cy = cellCenterY;
        addCircle(beadsSvg, cx, cy, blackRadius, "#000");
      }

      // white bead: bottom edge of outer cell (outside box)
      if (isBottomEdge) {
        const cx = cellCenterX;
        const cy = cellTop + cellH + bottomOffset;
        addCircle(beadsSvg, cx, cy, whiteRadius, "#fff", "#000");
      }
    }
  }

  wrapper.appendChild(beadsSvg);

  // -------------------------
  // 4) Red diagonal overlay (inside boxes)
  // -------------------------
  const diagLen = diagonalLength(partition);
  if (diagLen > 0) {
    const diagSvg = makeOverlaySvg();
    const size = diagLen * step;

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", String(size));
    line.setAttribute("y2", String(size));
    line.setAttribute("stroke", "red");
    line.setAttribute("stroke-width", "3");

    diagSvg.appendChild(line);
    wrapper.appendChild(diagSvg);
  }
}

// expose to core.js
window.renderCorePartition = renderCorePartition;
