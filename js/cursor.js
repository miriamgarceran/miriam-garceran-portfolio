/* cursor.js — rock-on hand + water-ripple over content */
(() => {
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;

  /* ─────────────────────────────────────────────
     1.  CUSTOM CURSOR
  ───────────────────────────────────────────── */
  if (!isCoarse) {
    const CURSOR_H = 52;
    const CURSOR_W = 37;
    const LERP = 0.18;
    const HOT_X = Math.round(CURSOR_W * 0.33);
    const HOT_Y = Math.round(CURSOR_H * 0.02);
    const HOVER_SCALE = 1.2;
    const HOVER_ROTATE = -8;

    const el = document.createElement("div");
    el.className = "cursor-rock";
    el.setAttribute("aria-hidden", "true");

    const waves = document.createElement("div");
    waves.className = "cursor-waves";
    waves.innerHTML = "<span></span><span></span><span></span>";

    const img = document.createElement("img");
    img.src = "assets/cursor/hand-cursor.png";
    img.alt = "";
    img.draggable = false;
    el.append(waves, img);
    document.body.appendChild(el);

    let targetX = -999;
    let targetY = -999;
    let currentX = -999;
    let currentY = -999;
    let curScale = 1;
    let curRot = 0;
    let hovering = false;
    let visible = false;

    const lerp = (a, b, t) => a + (b - a) * t;

    function tick() {
      currentX = lerp(currentX, targetX, LERP);
      currentY = lerp(currentY, targetY, LERP);
      curScale = lerp(curScale, hovering ? HOVER_SCALE : 1, 0.2);
      curRot = lerp(curRot, hovering ? HOVER_ROTATE : 0, 0.2);
      el.style.transform =
        `translate3d(${currentX - HOT_X}px, ${currentY - HOT_Y}px, 0) ` +
        `scale(${curScale.toFixed(4)}) ` +
        `rotate(${curRot.toFixed(3)}deg)`;
      requestAnimationFrame(tick);
    }

    window.addEventListener(
      "mousemove",
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!visible) {
          currentX = targetX;
          currentY = targetY;
          el.style.opacity = "1";
          visible = true;
        }
      },
      { passive: true }
    );

    const HOVER_SEL =
      "a, button, .work-toggle, .lang button, .coverflow__card, .page-link, [role='button'], label, select, summary, input, textarea";

    document.addEventListener(
      "mouseover",
      (e) => {
        if (e.target.closest(HOVER_SEL)) hovering = true;
      },
      { passive: true }
    );
    document.addEventListener(
      "mouseout",
      (e) => {
        if (e.target.closest(HOVER_SEL)) hovering = false;
      },
      { passive: true }
    );
    document.addEventListener(
      "mouseleave",
      () => {
        el.style.opacity = "0";
        visible = false;
      },
      { passive: true }
    );
    document.addEventListener(
      "mouseenter",
      () => {
        el.style.opacity = "1";
        visible = true;
      },
      { passive: true }
    );

    tick();
  }

  /* ─────────────────────────────────────────────
     2.  WATER RIPPLE ON CONTENT
  ───────────────────────────────────────────── */
  if (isCoarse) return;

  const BRUSH = 95;
  let mouseX = -999;
  let mouseY = -999;
  let wraps = [];
  let directs = [];
  let turb = null;
  let disp = null;
  let waveT = 0;

  function unwrapStale() {
    document.querySelectorAll(".ripple-wrap").forEach((wrap) => {
      if (!document.body.contains(wrap)) return;
      const base = wrap.querySelector(".ripple-base");
      if (!base) {
        wrap.remove();
        return;
      }
      wrap.parentNode.insertBefore(base, wrap);
      base.classList.remove("ripple-base", "ripple-base--unpos", "ripple-base--media");
      wrap.remove();
    });
    document.querySelectorAll(".ripple-direct").forEach((el) => {
      el.classList.remove("ripple-direct", "is-active");
      el.style.removeProperty("--lx");
      el.style.removeProperty("--ly");
      el.style.removeProperty("--brush");
    });
    /* Videos must never keep a leftover water filter — it covers the frame and
       toggling it on mouse leave interrupts native playback. */
    document.querySelectorAll("video").forEach((video) => {
      video.classList.remove("ripple-direct", "is-active");
      video.style.removeProperty("filter");
      video.style.removeProperty("--lx");
      video.style.removeProperty("--ly");
      video.style.removeProperty("--brush");
    });
  }

  function enhance(el) {
    if (!el || el.closest(".ripple-wrap") || el.classList.contains("ripple-layer")) return;
    if (el.closest(".cursor-rock")) return;

    const tag = el.tagName;
    /* Videos stay unfiltered: the SVG displacement covers the whole frame,
       and turning it off when the cursor leaves interrupts playback. */
    if (tag === "VIDEO") return;

    const wrap = document.createElement("span");
    wrap.className = "ripple-wrap";
    const computed = getComputedStyle(el);
    if (tag === "IMG" || el.classList.contains("work-media__pdf")) {
      wrap.classList.add("ripple-wrap--media");
    }
    if (computed.position === "absolute" || computed.position === "fixed") {
      wrap.classList.add("ripple-wrap--abs");
      wrap.style.position = computed.position;
      wrap.style.left = computed.left;
      wrap.style.right = computed.right === "auto" ? "" : computed.right;
      wrap.style.top = computed.top === "auto" ? "" : computed.top;
      wrap.style.bottom = computed.bottom === "auto" ? "" : computed.bottom;
      wrap.style.width = computed.width;
      wrap.style.zIndex = computed.zIndex === "auto" ? "" : computed.zIndex;
      el.classList.add("ripple-base--unpos");
    }
    el.parentNode.insertBefore(wrap, el);
    el.classList.add("ripple-base");
    let layer;
    if (tag === "A" || tag === "BUTTON") {
      layer = document.createElement("span");
      layer.innerHTML = el.innerHTML;
      layer.className = el.className;
    } else {
      layer = el.cloneNode(true);
      layer.className = el.className;
    }
    layer.classList.add("ripple-layer");
    layer.classList.remove("ripple-base", "ripple-base--unpos");
    layer.removeAttribute("id");
    layer.removeAttribute("href");
    layer.setAttribute("aria-hidden", "true");
    layer.tabIndex = -1;
    layer.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    layer.querySelectorAll("a, button").forEach((node) => {
      node.removeAttribute("href");
      node.tabIndex = -1;
    });
    if (tag === "IMG") {
      layer.style.objectFit = computed.objectFit;
      layer.style.objectPosition = computed.objectPosition;
    }
    wrap.append(el, layer);
  }

  function collectTargets() {
    unwrapStale();
    const selectors = [
      ".hero h1",
      ".hero-sub",
      ".hero-meta",
      ".about-title",
      ".section-head h2",
      ".section-head p",
      ".contact h2",
      ".work-toggle h3",
      ".work-toggle small",
      ".work-panel p",
      ".work-panel .role",
      ".case__lead",
      ".case__meta span",
      ".case__meta strong",
      ".case__copy p",
      ".case__next",
      ".about-body p",
      ".about-body h3",
      ".contact-links a",
      ".page-link",
      ".wordmark",
      ".site-footer span",
      ".hero-photo img",
      ".about-hero img",
      ".work-media img",
      ".work-media__pdf span",
      ".work-media__item figcaption",
      ".coverflow__visual img",
      ".coverflow__fallback",
      ".coverflow__caption strong",
      ".coverflow__caption small",
    ];
    document.querySelectorAll(selectors.join(",")).forEach(enhance);
    wraps = [...document.querySelectorAll(".ripple-wrap")];
    directs = [...document.querySelectorAll(".ripple-direct")];
    turb = document.getElementById("water-turb");
    disp = document.getElementById("water-disp");
  }

  function hit(el) {
    const rect = el.getBoundingClientRect();
    const near =
      mouseX >= rect.left - BRUSH &&
      mouseX <= rect.right + BRUSH &&
      mouseY >= rect.top - BRUSH &&
      mouseY <= rect.bottom + BRUSH;
    return { rect, near };
  }

  function updateRipples() {
    wraps.forEach((wrap) => {
      const { rect, near } = hit(wrap);
      if (!near) {
        wrap.classList.remove("is-active");
        return;
      }
      wrap.style.setProperty("--lx", `${mouseX - rect.left}px`);
      wrap.style.setProperty("--ly", `${mouseY - rect.top}px`);
      wrap.style.setProperty("--brush", `${BRUSH}px`);
      wrap.classList.add("is-active");
    });
    directs.forEach((el) => {
      const { rect, near } = hit(el);
      if (!near) {
        el.classList.remove("is-active");
        return;
      }
      el.style.setProperty("--lx", `${mouseX - rect.left}px`);
      el.style.setProperty("--ly", `${mouseY - rect.top}px`);
      el.style.setProperty("--brush", `${BRUSH}px`);
      el.classList.add("is-active");
    });
  }

  function animateWater() {
    waveT += 0.016;
    if (turb) {
      const fx = (0.007 + Math.sin(waveT) * 0.003).toFixed(4);
      const fy = (0.016 + Math.cos(waveT * 0.73) * 0.006).toFixed(4);
      turb.setAttribute("baseFrequency", `${fx} ${fy}`);
    }
    if (disp) {
      disp.setAttribute("scale", String(48 + Math.sin(waveT * 1.15) * 16));
    }
    requestAnimationFrame(animateWater);
  }

  window.refreshSprayTargets = collectTargets;
  window.refreshRippleTargets = collectTargets;

  window.addEventListener(
    "mousemove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      updateRipples();
    },
    { passive: true }
  );
  window.addEventListener("scroll", updateRipples, { passive: true });
  window.addEventListener("resize", collectTargets);

  collectTargets();
  animateWater();
})();
