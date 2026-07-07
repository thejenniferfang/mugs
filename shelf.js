// Saetter 15: 5 rows x 3 columns. Compartment rects in normalized image
// coordinates (fractions of the 800x1200 product photo), calibrated visually.
const GRID = (() => {
  // Board positions measured in the original 800x1200 packshot. The shelf image
  // was then cropped tight to [OX,OY, CW x CH] of that photo, so we offset the
  // measurements into the cropped canvas and normalize by the cropped size.
  const OX = 213, OY = 258, CW = 371, CH = 688;
  const colsX = [ [235, 337], [347, 449], [460, 561] ];
  const rowsY = [ [282, 404], [412, 535], [542, 665], [672, 795], [803, 936] ];
  const cells = [];
  for (const [top, bottom] of rowsY) {
    for (const [x0, x1] of colsX) {
      cells.push({
        x: (x0 - OX) / CW,
        y: (top - OY) / CH,
        w: (x1 - x0) / CW,
        h: (bottom - top) / CH,
      });
    }
  }
  return cells;
})();

const STORAGE_KEY = "mug-shelf-placement-v1";

const wrap = document.getElementById("shelf-wrap");
const shelfImg = document.getElementById("shelf-img");
const slotsEl = document.getElementById("slots");
const trayEl = document.getElementById("tray");
const DEBUG = new URLSearchParams(location.search).has("debug");

// ---------- placement sound ----------
// A soft ceramic "clink" synthesized with Web Audio (no audio files). Inharmonic
// bright partials for the porcelain ring + a short low body for the wood contact.
const SOUND_KEY = "mug-shelf-sound";
let soundOn = localStorage.getItem(SOUND_KEY) !== "off";
let audioCtx = null;

function clink() {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch { return; }
  const ctx = audioCtx;
  const t = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.value = 0.16;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 5200;
  master.connect(lp).connect(ctx.destination);

  const detune = 1 + (Math.random() - 0.5) * 0.08; // slight per-hit pitch variation

  const partials = [1180, 1680, 2550];
  const rel = [1.0, 0.5, 0.28];
  partials.forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = i === 0 ? "triangle" : "sine";
    o.frequency.value = f * detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5 * rel[i], t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18 + i * 0.02);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.26);
  });

  const body = ctx.createOscillator();
  body.type = "sine";
  body.frequency.value = 190 * detune;
  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0.0001, t);
  bg.gain.exponentialRampToValueAtTime(0.4, t + 0.005);
  bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  body.connect(bg).connect(master);
  body.start(t);
  body.stop(t + 0.12);
}

// placement[slot] = mug index into MUGS, or null
let placement = new Array(15).fill(null);
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (Array.isArray(saved) && saved.length === 15) {
    placement = saved.map((v) => (Number.isInteger(v) && MUGS[v] ? v : null));
  }
} catch {}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(placement));
}

function cutoutSrc(mug) {
  return "cutouts/" + mug.file.replace(/\.\w+$/, ".png");
}

function slotRects() {
  const r = shelfImg.getBoundingClientRect();
  return GRID.map((c) => ({
    left: r.left + c.x * r.width,
    top: r.top + c.y * r.height,
    width: c.w * r.width,
    height: c.h * r.height,
  }));
}

function renderSlots() {
  slotsEl.innerHTML = "";
  const w = shelfImg.clientWidth, h = shelfImg.clientHeight;
  GRID.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "slot" + (DEBUG ? " debug" : "");
    div.dataset.slot = i;
    div.style.left = c.x * w + "px";
    div.style.top = c.y * h + "px";
    div.style.width = c.w * w + "px";
    div.style.height = c.h * h + "px";
    slotsEl.appendChild(div);

    const mugIdx = placement[i];
    if (mugIdx !== null) {
      const mug = MUGS[mugIdx];
      const holder = document.createElement("div");
      holder.className = "placed";
      holder.dataset.slot = i;
      // mug sits on the shelf board: bottom-aligned, slight inset
      const inset = 0.06;
      holder.style.left = (c.x + c.w * inset) * w + "px";
      holder.style.top = (c.y + c.h * 0.08) * h + "px";
      holder.style.width = c.w * (1 - 2 * inset) * w + "px";
      holder.style.height = c.h * 0.9 * h + "px";
      const img = document.createElement("img");
      img.src = cutoutSrc(mug);
      img.alt = mug.brand + " " + mug.name;
      img.draggable = false;
      holder.appendChild(img);
      holder.addEventListener("pointerdown", (e) => startDrag(e, mugIdx, i));
      slotsEl.appendChild(holder);
    }
  });
}

function renderTray() {
  trayEl.innerHTML = "";
  MUGS.forEach((mug, idx) => {
    const div = document.createElement("div");
    div.className = "tray-mug" + (placement.includes(idx) ? " in-use" : "");
    div.title = mug.brand + " " + mug.name;
    const img = document.createElement("img");
    img.src = cutoutSrc(mug);
    img.alt = mug.brand + " " + mug.name;
    img.draggable = false;
    div.appendChild(img);
    div.addEventListener("pointerdown", (e) => startDrag(e, idx, null));
    trayEl.appendChild(div);
  });
}

function render() {
  renderSlots();
  renderTray();
}

// ---------- drag ----------

let drag = null; // { mugIdx, fromSlot, ghost }

function startDrag(e, mugIdx, fromSlot) {
  e.preventDefault();
  const ghost = document.createElement("div");
  ghost.className = "ghost";
  const rects = slotRects();
  const size = fromSlot !== null
    ? { w: rects[fromSlot].width, h: rects[fromSlot].height }
    : { w: 72, h: 72 };
  ghost.style.width = size.w + "px";
  ghost.style.height = size.h + "px";
  const img = document.createElement("img");
  img.src = cutoutSrc(MUGS[mugIdx]);
  ghost.appendChild(img);
  document.body.appendChild(ghost);
  drag = { mugIdx, fromSlot, ghost };
  moveGhost(e);
  window.addEventListener("pointermove", moveGhost);
  window.addEventListener("pointerup", endDrag, { once: true });
}

function hitSlot(e) {
  const rects = slotRects();
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (e.clientX >= r.left && e.clientX <= r.left + r.width &&
        e.clientY >= r.top && e.clientY <= r.top + r.height) return i;
  }
  return null;
}

function moveGhost(e) {
  if (!drag) return;
  drag.ghost.style.left = e.clientX - parseFloat(drag.ghost.style.width) / 2 + "px";
  drag.ghost.style.top = e.clientY - parseFloat(drag.ghost.style.height) * 0.7 + "px";
  const over = hitSlot(e);
  document.querySelectorAll(".slot").forEach((s, i) =>
    s.classList.toggle("drop-target", i === over));
}

function endDrag(e) {
  window.removeEventListener("pointermove", moveGhost);
  if (!drag) return;
  const { mugIdx, fromSlot, ghost } = drag;
  ghost.remove();
  drag = null;
  document.querySelectorAll(".slot").forEach((s) => s.classList.remove("drop-target"));

  const target = hitSlot(e);
  if (target !== null) {
    clink();
    const displaced = placement[target];
    placement[target] = mugIdx;
    if (fromSlot !== null && fromSlot !== target) {
      // swap if the target was occupied, otherwise just vacate the origin
      placement[fromSlot] = displaced !== mugIdx ? displaced : null;
      if (displaced === null) placement[fromSlot] = null;
    }
  } else if (fromSlot !== null) {
    placement[fromSlot] = null; // dropped outside: remove from shelf
  }
  save();
  render();
}

// ---------- export ----------

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function exportPNG() {
  const shelf = await loadImage(shelfImg.src);
  const W = shelf.naturalWidth, H = shelf.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(shelf, 0, 0, W, H);

  for (let i = 0; i < 15; i++) {
    const mugIdx = placement[i];
    if (mugIdx === null) continue;
    const cell = GRID[i];
    const img = await loadImage(cutoutSrc(MUGS[mugIdx]));
    const inset = 0.06;
    const boxX = (cell.x + cell.w * inset) * W;
    const boxY = (cell.y + cell.h * 0.08) * H;
    const boxW = cell.w * (1 - 2 * inset) * W;
    const boxH = cell.h * 0.9 * H;
    const scale = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    // centered horizontally, resting on the compartment floor
    ctx.drawImage(img, boxX + (boxW - dw) / 2, boxY + boxH - dh, dw, dh);
  }

  canvas.toBlob((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-mug-shelf.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, "image/png");
}

document.getElementById("export").addEventListener("click", exportPNG);
document.getElementById("clear").addEventListener("click", () => {
  placement = new Array(15).fill(null);
  save();
  render();
});

const soundBtn = document.getElementById("sound");
function updateSoundLabel() {
  soundBtn.textContent = soundOn ? "Sound: on" : "Sound: off";
}
soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
  updateSoundLabel();
  if (soundOn) clink(); // preview the sound when turning it on
});
updateSoundLabel();

window.addEventListener("resize", renderSlots);

if (shelfImg.complete) render();
else shelfImg.addEventListener("load", render);
