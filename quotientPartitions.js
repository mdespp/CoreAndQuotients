// quotientPartitions.js
// Render a small Young diagram for each quotient (given as hooks),
// with a red diagonal and beads similar to the core picture.
//
//  - black beads on the RIGHT edge of outer cells (outside boxes)
//  - white beads on the BOTTOM edge of outer cells (outside boxes)
//  - nothing drawn (just "∅") when the quotient is empty.

(function() {
  // Turn a hooks sequence [h1,h2,...,hd] into a partition [λ1,...,λd]
  // λ_i = h_i - (d - i), must all be > 0
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

  // number of diagonal cells of a partition
  function diagonalLength(partition) {
    let d = 0;
    for (let i = 0; i < partition.length; i++) {
      if (partition[i] > i) d++;
      else break;
    }
    return d;
  }

  // Add diagonal + beads on top of a small grid
  function addDiagonalAndBeads(wrapper, grid, partition) {
    if (!partition || partition.length === 0) return;

    const rows   = partition.length;
    const maxRow = Math.max(...partition);

    const gridRect    = grid.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const offsetX = gridRect.left - wrapperRect.left;
    const offsetY = gridRect.top  - wrapperRect.top;

    const gridW = gridRect.width;
    const gridH = gridRect.height;

    if (gridW === 0 || gridH === 0) return; // safety

    const cellW = gridW / maxRow;
    const cellH = gridH / rows;
    const step  = Math.min(cellW, cellH);

    const svgNS = "http://www.w3.org/2000/svg";

    function makeOverlaySvg(extraX = 0, extraY = 0, cls = "qp-overlay") {
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width",  gridW + extraX);
      svg.setAttribute("height", gridH + extraY);
      svg.classList.add(cls);
      svg.style.left = offsetX + "px";
      svg.style.top  = offsetY + "px";
      return svg;
    }

    // --------- beads (right + bottom edges only) ----------
    const rightOffset  = step * 0.15;
    const bottomOffset = step * 0.20;
    const beadsSvg = makeOverlaySvg(rightOffset * 2, bottomOffset * 2, "qp-overlay");

    const blackRadius = step * 0.12;
    const whiteRadius = step * 0.12;

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

    for (let i = 0; i < rows; i++) {
      const rowLen = partition[i];
      for (let j = 0; j < rowLen; j++) {
        const isRightEdge = (j === rowLen - 1);
        const isBottomEdge =
          (i === rows - 1) || (partition[i + 1] <= j);

        const cellLeft    = j * cellW;
        const cellTop     = i * cellH;
        const cellCenterX = cellLeft + cellW / 2;
        const cellCenterY = cellTop  + cellH / 2;

        // black bead: right edge, outside
        if (isRightEdge) {
          const cx = cellLeft + cellW + rightOffset;
          const cy = cellCenterY;
          addCircle(beadsSvg, cx, cy, blackRadius, "#000");
        }

        // white bead: bottom edge, outside
        if (isBottomEdge) {
          const cx = cellCenterX;
          const cy = cellTop + cellH + bottomOffset;
          addCircle(beadsSvg, cx, cy, whiteRadius, "#fff", "#000");
        }
      }
    }

    wrapper.appendChild(beadsSvg);

    // --------- red diagonal ----------
    const diagLen = diagonalLength(partition);
    if (diagLen > 0) {
      const diagSvg = makeOverlaySvg(0, 0, "qp-diagonal");
      const size = diagLen * step;

      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", "0");
      line.setAttribute("y1", "0");
      line.setAttribute("x2", String(size));
      line.setAttribute("y2", String(size));
      line.setAttribute("stroke", "red");
      line.setAttribute("stroke-width", "2");

      diagSvg.appendChild(line);
      wrapper.appendChild(diagSvg);
    }
  }

  // Draw a single small partition diagram into a given container.
  // Returns { wrapper, grid } so we can add overlays later.
  function drawSmallPartition(container, partition) {
    if (!partition || partition.length === 0) {
      const span = document.createElement("div");
      span.className = "qp-empty";
      span.textContent = "∅";
      container.appendChild(span);
      return { wrapper: null, grid: null };
    }

    const rows = partition.length;
    const wrapper = document.createElement("div");
    wrapper.className = "qp-wrapper";

    const grid = document.createElement("div");
    grid.className = "qp-grid";

    for (let i = 0; i < rows; i++) {
      const rowLen = partition[i];
      const rowDiv = document.createElement("div");
      rowDiv.className = "qp-row";

      for (let j = 0; j < rowLen; j++) {
        const cell = document.createElement("div");
        cell.className = "qp-cell";

        // border scheme: right + bottom always
        cell.classList.add("right");
        cell.classList.add("bottom");

        // top border on first row
        if (i === 0) cell.classList.add("top");
        // left border on first column
        if (j === 0) cell.classList.add("left");

        rowDiv.appendChild(cell);
      }

      grid.appendChild(rowDiv);
    }

    wrapper.appendChild(grid);
    container.appendChild(wrapper);

    return { wrapper, grid };
  }

  // Main exported function: hooksList is an array of hook arrays
  function renderQuotientPartitions(hooksList) {
    const container = document.getElementById("quotient-partitions");
    if (!container) return;

    container.innerHTML = "";

    if (!hooksList || hooksList.length === 0) {
      return;
    }

    hooksList.forEach((hooks, idx) => {
      const card = document.createElement("div");
      card.className = "qp-card";

      const title = document.createElement("div");
      title.className = "qp-title";
      title.textContent = `Quotient ${idx + 1}`;
      card.appendChild(title);

      let part = null;
      let wrapper = null;
      let grid = null;

      try {
        if (!hooks || hooks.length === 0) {
          // empty quotient: just ∅, no diagram, no beads/diagonal
          drawSmallPartition(card, []);
        } else {
          part = partitionFromHooksLocal(hooks);
          const res = drawSmallPartition(card, part);
          wrapper = res.wrapper;
          grid = res.grid;
        }
      } catch (e) {
        const err = document.createElement("div");
        err.className = "qp-empty";
        err.textContent = "Error: " + e.message;
        card.appendChild(err);
      }

      // Append card to the main container *before* measuring
      container.appendChild(card);

      // Now that the card is in the DOM, we can overlay diagonal + beads
      if (part && wrapper && grid) {
        addDiagonalAndBeads(wrapper, grid, part);
      }
    });
  }

  // expose globally for quotient.js
  window.renderQuotientPartitions = renderQuotientPartitions;
})();
