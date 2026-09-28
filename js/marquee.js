/* Infinite full-bleed AV strip under the featured piece.
   Adjust SPEED (px/s) here and --av-strip-h in CSS. */
(() => {
  const SPEED = 42;

  function waitForMedia(root) {
    const media = [...root.querySelectorAll("img, video")];
    return Promise.all(
      media.map(
        (el) =>
          new Promise((resolve) => {
            if (el.tagName === "IMG") {
              if (el.complete && el.naturalWidth) return resolve();
              el.addEventListener("load", resolve, { once: true });
              el.addEventListener("error", resolve, { once: true });
              return;
            }
            if (el.readyState >= 1) return resolve();
            el.addEventListener("loadedmetadata", resolve, { once: true });
            el.addEventListener("error", resolve, { once: true });
          })
      )
    );
  }

  function armVideo(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.controls = false;
    video.play()?.catch(() => {});
  }

  const ICON_MUTED =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/><line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const ICON_SOUND =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function paintMuteButton(btn, audible) {
    btn.classList.toggle("is-muted", !audible);
    btn.setAttribute("aria-pressed", String(audible));
    btn.setAttribute("aria-label", audible ? "Silenciar" : "Activar sonido");
    btn.innerHTML = audible ? ICON_SOUND : ICON_MUTED;
  }

  window.initAvStrip = function initAvStrip(root) {
    const track = root.querySelector(".av-strip__track");
    if (!track) return { destroy() {} };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let setCount = track.childElementCount;
    let setWidth = 0;
    let offset = 0;
    let raf = 0;
    let last = 0;
    let dragging = false;
    let pointerId = null;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let auto = !reduced;
    let destroyed = false;
    let cloned = false;
    let dragDist = 0;
    let lastDragEnd = 0;

    function apply() {
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    /* Exact cycle length = distance from first item to its duplicate.
       Using offsetLeft avoids transform / subpixel rect errors that cause a visible cut. */
    function measureCycle() {
      if (!setCount) return 0;
      const first = track.children[0];
      const twin = track.children[setCount];
      if (!first || !twin) return 0;
      return twin.offsetLeft - first.offsetLeft;
    }

    function normalize() {
      if (setWidth <= 0) return;
      /* Seamless wrap: jump by exactly one cycle so the frame looks identical */
      while (offset <= -setWidth) offset += setWidth;
      while (offset > 0) offset -= setWidth;
    }

    function cloneOneSet() {
      const originals = [...track.children].slice(0, setCount);
      originals.forEach((node) => {
        const clone = node.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("video").forEach(armVideo);
        clone.querySelectorAll(".av-strip__mute").forEach((btn) => {
          btn.tabIndex = -1;
          paintMuteButton(btn, false);
        });
        track.append(clone);
      });
    }

    /* Keep enough copies that the viewport is always full — no empty edge, no rewind */
    function fillTrack() {
      if (!setCount) return;
      const viewport = document.documentElement.clientWidth || window.innerWidth || 0;
      const need = Math.max(viewport * 2 + setWidth, setWidth * 3);
      let guard = 0;
      while (track.scrollWidth < need && guard < 12) {
        cloneOneSet();
        guard += 1;
        void track.offsetWidth;
      }
      cloned = true;
    }

    function remasure() {
      const next = measureCycle();
      if (next > 0) {
        const mid = setWidth > 0 ? offset / setWidth : 0;
        setWidth = next;
        offset = mid * setWidth;
        fillTrack();
        const again = measureCycle();
        if (again > 0) setWidth = again;
        normalize();
      }
      syncBleed();
      apply();
    }

    /* Pin the strip to the real viewport edges, regardless of parent padding/max-width */
    function syncBleed() {
      root.style.left = "0";
      root.style.marginLeft = "0";
      root.style.width = "100%";
      const left = root.getBoundingClientRect().left;
      root.style.marginLeft = `${-left}px`;
      root.style.width = `${document.documentElement.clientWidth}px`;
    }

    async function prepare() {
      await waitForMedia(track);
      if (destroyed) return;

      /* Measure one set, then clone until the strip can loop forever without a gap */
      void track.offsetWidth;
      if (setCount > 0) {
        const first = track.children[0];
        const lastItem = track.children[setCount - 1];
        if (first && lastItem) {
          setWidth =
            lastItem.offsetLeft + lastItem.offsetWidth - first.offsetLeft +
            /* include the gap after the last item (flex gap) */
            (parseFloat(getComputedStyle(track).gap) || 0);
        }
        fillTrack();
      }

      void track.offsetWidth;
      remasure();
      /* Start mid-cycle so both edges of the viewport are covered */
      if (setWidth > 0) offset = -setWidth * 0.5;
      normalize();
      apply();

      track.querySelectorAll("video").forEach(armVideo);
      track.querySelectorAll("img").forEach((img) => {
        img.addEventListener("load", remasure);
      });

      last = performance.now();
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function tick(now) {
      if (destroyed) return;
      const dt = Math.min(0.05, (now - last) / 1000) || 0;
      last = now;

      if (!dragging) {
        if (auto) {
          offset += SPEED * dt;
        } else if (Math.abs(velocity) > 4) {
          offset += velocity * dt;
          velocity *= Math.pow(0.001, dt);
          if (Math.abs(velocity) <= SPEED) {
            velocity = 0;
            if (!reduced) auto = true;
          }
        } else if (!reduced) {
          velocity = 0;
          auto = true;
        }
        normalize();
        apply();
      }

      raf = requestAnimationFrame(tick);
    }

    function onPointerDown(event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (event.target.closest(".av-strip__mute")) return;
      dragging = true;
      auto = false;
      velocity = 0;
      dragDist = 0;
      pointerId = event.pointerId;
      lastX = event.clientX;
      lastT = performance.now();
      root.classList.add("is-dragging");
      try {
        root.setPointerCapture(event.pointerId);
      } catch (_) {
        /* ignore */
      }
      event.preventDefault();
    }

    function onPointerMove(event) {
      if (!dragging || event.pointerId !== pointerId) return;
      const now = performance.now();
      const dx = event.clientX - lastX;
      const dt = Math.max(8, now - lastT) / 1000;
      lastX = event.clientX;
      lastT = now;
      dragDist += Math.abs(dx);
      offset += dx;
      velocity = dx / dt;
      normalize();
      apply();
    }

    function onPointerUp(event) {
      if (!dragging || (pointerId != null && event.pointerId !== pointerId)) return;
      dragging = false;
      pointerId = null;
      if (dragDist > 8) lastDragEnd = performance.now();
      root.classList.remove("is-dragging");
      try {
        root.releasePointerCapture(event.pointerId);
      } catch (_) {
        /* already released */
      }
      if (reduced) {
        velocity = 0;
        auto = false;
      }
    }

    function onResize() {
      remasure();
    }

    const ro = new ResizeObserver(() => remasure());
    ro.observe(track);

    function onMuteClick(event) {
      const btn = event.target.closest(".av-strip__mute");
      if (!btn) return;
      /* Ignore taps that were actually the end of a drag */
      if (performance.now() - lastDragEnd < 350) return;
      event.preventDefault();
      event.stopPropagation();
      const figure = btn.closest(".av-strip__item");
      const video = figure?.querySelector("video");
      if (!video) return;
      if (video.muted) {
        /* Only one strip video audible at a time */
        track.querySelectorAll("video").forEach((other) => {
          other.muted = true;
          const otherBtn = other.closest(".av-strip__item")?.querySelector(".av-strip__mute");
          if (otherBtn) paintMuteButton(otherBtn, false);
        });
        video.muted = false;
        paintMuteButton(btn, true);
        video.play()?.catch(() => {});
      } else {
        video.muted = true;
        paintMuteButton(btn, false);
      }
    }

    root.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("click", onMuteClick);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", onResize);
    root.addEventListener(
      "dragstart",
      (event) => {
        event.preventDefault();
      },
      true
    );

    prepare();

    return {
      destroy() {
        destroyed = true;
        cancelAnimationFrame(raf);
        raf = 0;
        ro.disconnect();
        track.removeEventListener("click", onMuteClick);
        root.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("resize", onResize);
      },
    };
  };
})();
