(function () {
  const CELL = 30;
  const PARTICLE_COUNT = 8;
  const INITIAL_VISIBLE = 3;
  const FADE_MS = 4000;
  const VISIBLE_MS = 2500;
  const VISIBLE_OPACITY = 0.45;
  const particlesEl = document.getElementById("particles");

  function cellKey(x, y) {
    return x + "," + y;
  }

  function getOccupiedCells() {
    const occupied = new Set();
    document
      .querySelectorAll("body > *:not(#particles)")
      .forEach(function (el) {
        const style = getComputedStyle(el);
        const left = parseFloat(style.left) || 0;
        const top = parseFloat(style.top) || 0;
        const width = parseFloat(style.width) || 0;
        const height = parseFloat(style.height) || 0;
        const x0 = Math.floor(left / CELL);
        const y0 = Math.floor(top / CELL);
        const x1 = Math.ceil((left + width) / CELL);
        const y1 = Math.ceil((top + height) / CELL);
        for (let x = x0; x < x1; x++) {
          for (let y = y0; y < y1; y++) {
            occupied.add(cellKey(x, y));
          }
        }
      });
    return occupied;
  }

  function getAvailableCells(occupied, reserved) {
    const cols = Math.ceil(window.innerWidth / CELL);
    const rows = Math.ceil(window.innerHeight / CELL);
    const available = [];
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
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
    el.style.left = cell.x * CELL + "px";
    el.style.top = cell.y * CELL + "px";
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
        setOpacity(el, VISIBLE_OPACITY * (0.55 + Math.random() * 0.45));
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
    resizeTimer = setTimeout(function () {
      getOccupiedCells();
    }, 200);
  });
})();
