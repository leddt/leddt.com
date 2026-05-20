(function () {
  const PARTICLE_COUNT = 8;
  const INITIAL_VISIBLE = 3;
  const FADE_MS = 4000;
  const VISIBLE_MS = 2500;
  const VISIBLE_OPACITY = 1;
  const particlesEl = document.getElementById("particles");

  function cellKey(x, y) {
    return x + "," + y;
  }

  function getGridCellSize() {
    return (
      parseFloat(
        getComputedStyle(document.body).getPropertyValue("--grid-cell-size")
      ) || 30
    );
  }

  function readItemVar(style, name) {
    return parseFloat(style.getPropertyValue(name)) || 0;
  }

  function getGridBounds() {
    let maxRow = 0;
    let maxCol = 0;
    document
      .querySelectorAll("body > *:not(#particles)")
      .forEach(function (el) {
        const style = getComputedStyle(el);
        maxRow = Math.max(
          maxRow,
          readItemVar(style, "--item-y") + (readItemVar(style, "--item-h") || 1)
        );
        maxCol = Math.max(
          maxCol,
          readItemVar(style, "--item-x") + (readItemVar(style, "--item-w") || 1)
        );
      });
    return { cols: maxCol, rows: maxRow };
  }

  function syncGridSize() {
    const cellSize = getGridCellSize();
    const bounds = getGridBounds();
    const height = bounds.rows * cellSize;
    document.body.style.minHeight = height > 0 ? height + "px" : "";
    particlesEl.style.height = height > 0 ? height + "px" : "";
  }

  function getOccupiedCells() {
    const occupied = new Set();
    document
      .querySelectorAll("body > *:not(#particles)")
      .forEach(function (el) {
        const style = getComputedStyle(el);
        const x = readItemVar(style, "--item-x");
        const y = readItemVar(style, "--item-y");
        const w = readItemVar(style, "--item-w") || 1;
        const h = readItemVar(style, "--item-h") || 1;
        for (let cx = x; cx < x + w; cx++) {
          for (let cy = y; cy < y + h; cy++) {
            occupied.add(cellKey(cx, cy));
          }
        }
      });
    return occupied;
  }

  function getAvailableCells(occupied, reserved) {
    const bounds = getGridBounds();
    const available = [];
    for (let x = 0; x < bounds.cols; x++) {
      for (let y = 0; y < bounds.rows; y++) {
        const key = cellKey(x, y);
        if (!occupied.has(key) && !reserved.has(key)) {
          available.push({ x: x, y: y, key: key });
        }
      }
    }
    return available;
  }

  function pickCell(occupied, reserved, avoidKey) {
    const available = getAvailableCells(occupied, reserved);
    const filtered = avoidKey
      ? available.filter(function (c) {
          return c.key !== avoidKey;
        })
      : available;
    const pool = filtered.length > 0 ? filtered : available;
    if (pool.length === 0) {
      return null;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function placeParticle(el, cell) {
    el.style.setProperty("--item-x", String(cell.x));
    el.style.setProperty("--item-y", String(cell.y));
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function setOpacity(el, value) {
    el.style.transition = "none";
    el.style.opacity = String(value);
    void el.offsetWidth;
    el.style.transition = "";
  }

  async function fadeIn(el) {
    el.style.opacity = "0";
    await wait(50);
    el.style.opacity = String(VISIBLE_OPACITY);
    await wait(FADE_MS);
  }

  async function runParticle(el, reserved, startVisible) {
    let lastKey = null;
    while (true) {
      const occupied = getOccupiedCells();
      const cell = pickCell(occupied, reserved, lastKey);
      if (!cell) {
        await wait(1000);
        continue;
      }
      reserved.add(cell.key);
      lastKey = cell.key;
      placeParticle(el, cell);
      if (startVisible) {
        startVisible = false;
        setOpacity(el, VISIBLE_OPACITY);
        await wait(VISIBLE_MS * (0.3 + Math.random() * 0.7));
      } else {
        await fadeIn(el);
        await wait(VISIBLE_MS);
      }
      el.style.opacity = "0";
      await wait(FADE_MS);
      reserved.delete(cell.key);
    }
  }

  syncGridSize();

  const reserved = new Set();
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const el = document.createElement("div");
    el.className = "particle";
    particlesEl.appendChild(el);
    const visibleOnLoad = i < INITIAL_VISIBLE;
    const delay = visibleOnLoad ? 0 : (i - INITIAL_VISIBLE) * 900;
    setTimeout(function () {
      runParticle(el, reserved, visibleOnLoad);
    }, delay);
  }

  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncGridSize, 200);
  });
})();
