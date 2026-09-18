/* Cover Flow — 3D ring: every card sits on a full 360° circle around one central axis */
function initCoverflow(stage, cards, { index = 0, onChange } = {}) {
  const STEP_DEG = 360 / cards.length;
  /* Stage-width fractions, matching the proportions of the reference site */
  const CARD_FRAC = 0.2;
  const PERSPECTIVE_FRAC = 0.73;
  const DRAG_GAIN = 0.12;
  const WHEEL_GAIN = 0.06;
  const FRICTION = 0.92;
  /* Cursor tilts the whole ring, like looking around the scene */
  const LOOK_MAX = 9;
  const LOOK_LERP = 0.07;
  /* How far past edge-on a card keeps fading before it disappears */
  const FADE_AT = 0.45;
  /* Cards are not all the same shape, so the row never reads as a uniform strip */
  const RATIOS = [16 / 9, 1.63, 1.9, 16 / 9, 1.47, 16 / 9, 1.78];
  const WIDTH_SCALE = [1, 1.17, 1.17, 1, 1.17, 1, 1.1];
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  stage.innerHTML = "";
  stage.classList.add("coverflow");
  stage.tabIndex = 0;
  stage.setAttribute("role", "listbox");
  stage.setAttribute("aria-label", "Proyectos");

  const scene = document.createElement("div");
  scene.className = "coverflow__scene";
  const ring = document.createElement("div");
  ring.className = "coverflow__ring";
  scene.append(ring);
  stage.append(scene);

  const nodes = cards.map((card, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "coverflow__card";
    btn.dataset.id = card.id;
    btn.setAttribute("role", "option");

    const visual = document.createElement("span");
    visual.className = "coverflow__visual";
    if (card.cover) {
      const img = document.createElement("img");
      img.className = "coverflow__cover";
      img.src = card.cover;
      img.alt = "";
      img.draggable = false;
      visual.append(img);
    } else {
      const fallback = document.createElement("span");
      fallback.className = "coverflow__fallback";
      fallback.textContent = card.title;
      visual.append(fallback);
    }

    const caption = document.createElement("span");
    caption.className = "coverflow__caption";
    const title = document.createElement("strong");
    title.textContent = card.title;
    const tag = document.createElement("small");
    tag.textContent = card.tag || "";
    caption.append(title, tag);

    btn.append(visual, caption);
    ring.append(btn);
    return btn;
  });

  /* angle = ring rotation in degrees, unbounded so the ring can spin forever */
  let angle = -index * STEP_DEG;
  let va = 0;
  let radius = 0;
  let dragging = false;
  let dragged = false;
  let raf = 0;
  let lookRaf = 0;
  let settleTimer = 0;
  let selected = Math.max(0, Math.min(cards.length - 1, index));
  const pointer = { id: null, startX: 0, lastX: 0, lastT: 0 };

  let lookX = 0;
  let lookY = 0;
  let targetLookX = 0;
  let targetLookY = 0;

  function measure() {
    const stageW = stage.clientWidth || 1;
    const baseW = stageW * CARD_FRAC;
    /* Radius that spreads n cards of this width evenly around the circle */
    radius = (cards.length * baseW) / (2 * Math.PI);
    scene.style.perspective = `${Math.round(stageW * PERSPECTIVE_FRAC)}px`;
    nodes.forEach((node, i) => {
      const w = Math.round(baseW * WIDTH_SCALE[i % WIDTH_SCALE.length]);
      const h = Math.round(w / RATIOS[i % RATIOS.length]);
      node.style.width = `${w}px`;
      node.style.height = `${h}px`;
      /* Centre the box on the ring axis first, so rotateY pivots about the card's centre */
      node.style.marginLeft = `${-w / 2}px`;
      node.style.marginTop = `${-h / 2}px`;
      node.style.transform =
        `rotateY(${(i * STEP_DEG).toFixed(4)}deg) translateZ(${radius.toFixed(2)}px)`;
    });
  }

  function frontIndex(a = angle) {
    const slot = Math.round(-a / STEP_DEG);
    return ((slot % cards.length) + cards.length) % cards.length;
  }

  function layout() {
    ring.style.transform =
      `rotateX(${lookY.toFixed(3)}deg) rotateY(${(angle + lookX).toFixed(3)}deg)`;
    nodes.forEach((node, i) => {
      const total = ((angle + i * STEP_DEG) * Math.PI) / 180;
      /* face = 1 when the card looks straight at us, -1 when it has its back to us */
      const face = Math.cos(total);
      node.style.zIndex = String(Math.round(50 + 950 * ((face + 1) / 2)));
      /* Fade out once a card turns past edge-on, so its mirrored back never shows */
      node.style.opacity = Math.max(0, Math.min(1, (face + FADE_AT) / FADE_AT)).toFixed(3);
      node.classList.toggle("is-center", i === selected);
      node.setAttribute("aria-selected", String(i === selected));
    });
  }

  function emit(i) {
    const changed = i !== selected;
    selected = i;
    layout();
    if (changed) onChange?.(i);
  }

  function snap() {
    const target = Math.round(angle / STEP_DEG) * STEP_DEG;
    const start = angle;
    const t0 = performance.now();
    const dur = 620;
    cancelAnimationFrame(raf);
    function tick(now) {
      const k = Math.min(1, (now - t0) / dur);
      angle = start + (target - start) * (1 - Math.pow(1 - k, 3));
      layout();
      if (k < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        angle = target;
        emit(frontIndex());
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function coast() {
    cancelAnimationFrame(raf);
    function tick() {
      va *= FRICTION;
      angle += va;
      layout();
      if (Math.abs(va) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        snap();
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function rotateToIndex(i) {
    /* Take the shortest way round, so the ring never spins the long way */
    const current = angle;
    const raw = -i * STEP_DEG;
    const turns = Math.round((current - raw) / 360);
    const target = raw + turns * 360;
    const start = angle;
    const t0 = performance.now();
    const dur = 680;
    cancelAnimationFrame(raf);
    va = 0;
    function tick(now) {
      const k = Math.min(1, (now - t0) / dur);
      angle = start + (target - start) * (1 - Math.pow(1 - k, 3));
      layout();
      if (k < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        angle = target;
        emit(i);
      }
    }
    raf = requestAnimationFrame(tick);
  }

  nodes.forEach((node, i) => {
    node.addEventListener("click", () => {
      if (dragged) return;
      rotateToIndex(i);
    });
  });

  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    dragged = false;
    va = 0;
    cancelAnimationFrame(raf);
    clearTimeout(settleTimer);
    pointer.id = event.pointerId;
    pointer.startX = event.clientX;
    pointer.lastX = event.clientX;
    pointer.lastT = performance.now();
    stage.setPointerCapture?.(event.pointerId);
    stage.classList.add("is-dragging");
  }

  function onPointerMove(event) {
    if (!dragging || event.pointerId !== pointer.id) return;
    const now = performance.now();
    const dx = event.clientX - pointer.lastX;
    const dt = Math.max(8, now - pointer.lastT);
    if (Math.abs(event.clientX - pointer.startX) > 8) dragged = true;
    angle += dx * DRAG_GAIN;
    va = dx * DRAG_GAIN * (16 / dt);
    pointer.lastX = event.clientX;
    pointer.lastT = now;
    layout();
  }

  function onPointerUp(event) {
    if (!dragging || (pointer.id != null && event.pointerId !== pointer.id)) return;
    dragging = false;
    stage.classList.remove("is-dragging");
    if (dragged) coast();
  }

  function onWheel(event) {
    event.preventDefault();
    cancelAnimationFrame(raf);
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    angle -= delta * WHEEL_GAIN;
    va = 0;
    layout();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(snap, 180);
  }

  function onKey(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      rotateToIndex((selected + 1) % cards.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      rotateToIndex((selected - 1 + cards.length) % cards.length);
    }
  }

  function onResize() {
    measure();
    layout();
  }

  function onMouseMove(event) {
    const rect = stage.getBoundingClientRect();
    const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
    targetLookX = Math.max(-1, Math.min(1, nx)) * LOOK_MAX;
    targetLookY = -Math.max(-1, Math.min(1, ny)) * LOOK_MAX;
  }

  function tickLook() {
    const nx = lookX + (targetLookX - lookX) * LOOK_LERP;
    const ny = lookY + (targetLookY - lookY) * LOOK_LERP;
    if (Math.abs(nx - lookX) > 0.002 || Math.abs(ny - lookY) > 0.002) {
      lookX = nx;
      lookY = ny;
      layout();
    }
    lookRaf = requestAnimationFrame(tickLook);
  }

  stage.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  stage.addEventListener("wheel", onWheel, { passive: false });
  stage.addEventListener("keydown", onKey);
  window.addEventListener("resize", onResize);

  if (finePointer) {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    lookRaf = requestAnimationFrame(tickLook);
  }

  measure();
  layout();
  onChange?.(selected);

  return {
    getIndex: () => selected,
    destroy() {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(lookRaf);
      clearTimeout(settleTimer);
      stage.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
    },
  };
}
