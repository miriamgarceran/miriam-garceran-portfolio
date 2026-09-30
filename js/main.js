const aboutEl = document.getElementById("about-body");
const workEl = document.getElementById("work-list");
const yearEl = document.getElementById("year");

let lang = localStorage.getItem("mg-lang") === "en" ? "en" : "es";
let selectedWorkIndex = 0;
let coverflowApi = null;
let avStripApi = null;

if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value;
  });
}

function syncLangButtons() {
  document.querySelectorAll("[data-lang]").forEach((node) => {
    node.setAttribute("aria-pressed", String(node.dataset.lang === lang));
  });
}

function buildMediaItem(item, copy) {
  const figure = document.createElement("figure");
  figure.className = `work-media__item work-media__item--${item.type}`;
  if (item.featured) figure.classList.add("work-media__item--featured");

  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("controlsList", "nodownload");
    figure.append(video);
  } else if (item.type === "pdf") {
    const link = document.createElement("a");
    link.href = item.src;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.className = "work-media__pdf";

    const img = document.createElement("img");
    img.src = item.cover;
    img.alt = item.label;
    img.loading = "lazy";

    const caption = document.createElement("span");
    caption.textContent = copy.work.identityPdf;

    link.append(img, caption);
    figure.append(link);
  } else {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.label;
    img.loading = "lazy";
    figure.append(img);
  }

  const figcaption = document.createElement("figcaption");
  figcaption.textContent = item.label;
  figure.append(figcaption);
  return figure;
}

function buildMedia(media, copy, { featuredOnly = false, supportingOnly = false } = {}) {
  const items = media.filter((item) => {
    if (featuredOnly) return item.featured;
    if (supportingOnly) return !item.featured;
    return true;
  });

  if (!items.length) return null;

  const gallery = document.createElement("div");
  gallery.className = featuredOnly ? "work-media work-media--featured" : "work-media";
  items.forEach((item) => gallery.append(buildMediaItem(item, copy)));
  return gallery;
}

function renderAbout(copy) {
  if (!aboutEl) return;
  const root = document.createDocumentFragment();
  let section = document.createElement("section");
  section.className = "about-section about-section--intro";
  root.append(section);
  let columns = null;
  let copyCol = null;

  copy.about.forEach((block) => {
    if (block.type === "h3") {
      section = document.createElement("section");
      section.className = "about-section";
      root.append(section);
      const heading = document.createElement("h3");
      heading.textContent = block.text;
      copyCol = document.createElement("div");
      copyCol.className = "about-copy";
      section.append(heading, copyCol);
      return;
    }

    const p = document.createElement("p");
    p.textContent = block.text;
    if (section.classList.contains("about-section--intro")) {
      if (!columns) {
        columns = document.createElement("div");
        columns.className = "about-columns";
        section.append(columns);
      }
      columns.append(p);
      return;
    }
    if (!copyCol.children.length) p.classList.add("about-drop");
    copyCol.append(p);
  });

  const doodles = document.createElement("div");
  doodles.className = "about-doodles";
  doodles.setAttribute("aria-hidden", "true");
  doodles.innerHTML = `
    <svg class="doodle doodle--star1" viewBox="0 0 80 80"><path d="M40 7l5 18 20-2-14 13 8 18-19-9-18 11 6-19L12 26l19 2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/></svg>
    <svg class="doodle doodle--star2" viewBox="0 0 80 80"><path d="M40 10l4 16 17 1-13 11 6 16-14-8-15 9 5-16-12-12 17 1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>
    <svg class="doodle doodle--star3" viewBox="0 0 80 80"><path d="M40 8l6 20 18-4-12 15 7 17-19-10-17 12 5-18L14 28l18 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>
    <svg class="doodle doodle--star4" viewBox="0 0 80 80"><path d="M40 12l3 14 15 2-11 9 4 14-11-7-12 8 4-14-10-10 15 0z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>
    <svg class="doodle doodle--vinyl1" viewBox="0 0 90 90"><circle cx="45" cy="45" r="38" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="45" cy="45" r="28" fill="none" stroke="currentColor" stroke-width="1.1"/><circle cx="45" cy="45" r="18" fill="none" stroke="currentColor" stroke-width="1.1"/><circle cx="45" cy="45" r="5" fill="currentColor"/><path d="M62 16c8 6 12 16 8 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    <svg class="doodle doodle--vinyl2" viewBox="0 0 90 90"><circle cx="45" cy="45" r="36" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="45" cy="45" r="26" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="45" cy="45" r="15" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="45" cy="45" r="4.5" fill="currentColor"/></svg>
    <svg class="doodle doodle--flame1" viewBox="0 0 64 80"><path d="M32 74c-12-2-20-12-18-26 1-8 6-12 5-22 7 6 10 5 11-6 9 8 16 18 14 34-2 10-8 18-12 20z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/><path d="M32 74c-4-6-4-12 0-18 3 6 4 10 0 18z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    <svg class="doodle doodle--flame2" viewBox="0 0 64 80"><path d="M34 72c-10-1-16-10-14-22 2-7 6-11 4-20 6 7 11 6 9-5 8 9 14 16 12 30-2 9-7 16-11 17z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>
  `;

  aboutEl.replaceChildren(root);
  aboutEl.append(doodles);
}

function projectById(copy, id) {
  return copy.projects.find((project) => project.id === id);
}

function buildCasePiece(item, { hero = false } = {}) {
  const figure = document.createElement("figure");
  figure.className = "case__piece";
  if (item.span === "half") figure.classList.add("case__piece--half");

  if (item.type === "video") {
    const video = document.createElement("video");
    /* #t=0.1 forces a visible first frame before play */
    video.src = `${item.src}#t=0.1`;
    video.controls = true;
    video.playsInline = true;
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.preload = "auto";
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("controlsList", "nodownload");
    video.setAttribute("aria-label", item.label || "");
    const tryPlay = () => {
      video.play()?.catch(() => {});
    };
    video.addEventListener("loadeddata", tryPlay, { once: true });
    if (hero) {
      const markOrientation = () => {
        if (item.orientation === "landscape") {
          figure.classList.add("case__piece--hero-landscape");
          figure.classList.remove("case__piece--hero-portrait");
          return;
        }
        if (item.orientation === "portrait" || video.videoHeight > video.videoWidth) {
          figure.classList.add("case__piece--hero-portrait");
        } else {
          figure.classList.remove("case__piece--hero-portrait");
        }
      };
      if (video.readyState >= 1) markOrientation();
      else video.addEventListener("loadedmetadata", markOrientation, { once: true });
    }
    figure.append(video);
  } else {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.label || "";
    img.loading = hero ? "eager" : "lazy";
    if (hero) {
      const markOrientation = () => {
        if (img.naturalHeight > img.naturalWidth) {
          figure.classList.add("case__piece--hero-portrait");
        }
      };
      if (img.complete && img.naturalWidth) markOrientation();
      else img.addEventListener("load", markOrientation, { once: true });
    }
    figure.append(img);
  }

  return figure;
}

function buildAvStripItem(item) {
  const figure = document.createElement("figure");
  figure.className = "av-strip__item";

  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.preload = "metadata";
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-label", item.label || "");
    const mute = document.createElement("button");
    mute.type = "button";
    mute.className = "av-strip__mute is-muted";
    mute.setAttribute("aria-label", "Activar sonido");
    mute.setAttribute("aria-pressed", "false");
    mute.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/><line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    figure.append(video, mute);
  } else {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.label || "";
    img.draggable = false;
    img.loading = "eager";
    figure.append(img);
  }

  return figure;
}

function buildAvStrip(items) {
  const media = (items || []).filter((item) => item.type === "image" || item.type === "video");
  if (!media.length) return null;

  const root = document.createElement("div");
  root.className = "av-strip";
  root.setAttribute("aria-label", "Galería audiovisual");

  const track = document.createElement("div");
  track.className = "av-strip__track";
  media.forEach((item) => track.append(buildAvStripItem(item)));
  root.append(track);
  return root;
}

function splitHeroAndRest(media) {
  const list = (media || []).filter((item) => item.type === "image" || item.type === "video");
  if (!list.length) return { hero: null, rest: [] };

  /* Prefer explicit featured / full-span main piece; else first item */
  let heroIndex = list.findIndex((item) => item.featured);
  if (heroIndex < 0) heroIndex = list.findIndex((item) => item.span === "full");
  if (heroIndex < 0) heroIndex = 0;

  const hero = list[heroIndex];
  const rest = list.filter((_, index) => index !== heroIndex);
  return { hero, rest };
}

function buildCaseStack(media) {
  const stack = document.createElement("div");
  stack.className = "case__stack";

  const { hero, rest } = splitHeroAndRest(media);
  if (hero) {
    const piece = buildCasePiece(hero, { hero: true });
    piece.classList.add("case__piece--full", "case__piece--hero");
    stack.append(piece);
  }

  const strip = buildAvStrip(rest);
  if (strip) stack.append(strip);
  return stack;
}

function projectDiscipline(project) {
  if (Array.isArray(project.discipline) && project.discipline.length) return project.discipline;
  if (project.discipline) return project.discipline;
  if (project.tag) return project.tag;
  if (project.role) {
    return project.role
      .split(/,|·| y /i)
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return "";
}

function instagramHandle(url) {
  try {
    const handle = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
    return handle ? `@${handle}` : "Instagram";
  } catch (_) {
    return "Instagram";
  }
}

function ensureSpanishCaps(text) {
  return String(text).replace(/(^|[.!?…]\s+)([a-záéíóúüñ])/g, (_, lead, letter) => {
    return lead + letter.toUpperCase();
  });
}

function splitEditorialBlock(text) {
  const match = String(text).match(/^([^:\n]{2,48}):\s+([\s\S]+)$/);
  if (!match) return null;
  const title = match[1].trim();
  const body = ensureSpanishCaps(match[2].trim());
  if (!body || /[.!?…]/.test(title)) return null;
  return { title, body };
}

function metricIcon(kind) {
  const icons = {
    plays:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 4V6L7 10H4zm11.5 2a3.5 3.5 0 0 0-1.8-3.06v6.12A3.5 3.5 0 0 0 15.5 12zm0-7.5v2.06A6.5 6.5 0 0 1 20 12a6.5 6.5 0 0 1-4.5 6.19V20.2A8.5 8.5 0 0 0 22 12a8.5 8.5 0 0 0-6.5-8.25z"/></svg>',
    followers:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-2.66-5.33-4-8-4zm8 0c-.29 0-.62.02-.97.05A5.34 5.34 0 0 1 18 17v2h6v-2c0-2.66-5.33-4-8-4z"/></svg>',
    interactions:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 0 1 7.5 3c1.74 0 3.41.81 4.5 2.09A5.48 5.48 0 0 1 16.5 3 5.5 5.5 0 0 1 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"/></svg>',
    reels:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z"/></svg>',
    users:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-2.66-5.33-4-8-4zm8 0c-.29 0-.62.02-.97.05A5.34 5.34 0 0 1 18 17v2h6v-2c0-2.66-5.33-4-8-4z"/></svg>',
    orders:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm10 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2zM7.2 14h9.45a2 2 0 0 0 1.94-1.5L21 5H5.2L4.3 2H1v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 7 16h12v-2H7.4z"/></svg>',
    guests:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-2.66-5.33-4-8-4zm8 0c-.29 0-.62.02-.97.05A5.34 5.34 0 0 1 18 17v2h6v-2c0-2.66-5.33-4-8-4z"/></svg>',
    engagement:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 0 1 7.5 3c1.74 0 3.41.81 4.5 2.09A5.48 5.48 0 0 1 16.5 3 5.5 5.5 0 0 1 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"/></svg>',
    growth:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>',
    campaigns:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11v2h2l5 4V7L5 11H3zm13.5 1a3.5 3.5 0 0 0-1.8-3.06v6.12A3.5 3.5 0 0 0 16.5 12zM14 5.08v2.06A6.5 6.5 0 0 1 18.5 12 6.5 6.5 0 0 1 14 16.86v2.06A8.5 8.5 0 0 0 20.5 12 8.5 8.5 0 0 0 14 5.08z"/></svg>',
  };
  const wrap = document.createElement("span");
  wrap.className = "case__metric-icon";
  wrap.innerHTML = icons[kind] || icons.plays;
  return wrap;
}

function buildProjectMetrics(project) {
  if (!project.metrics?.length) return null;

  const strip = document.createElement("div");
  strip.className = "case__metrics";
  strip.dataset.count = String(Math.min(4, project.metrics.length));

  project.metrics.slice(0, 4).forEach((item) => {
    const cell = document.createElement("div");
    cell.className = "case__metric";

    cell.append(metricIcon(item.icon || "plays"));

    const value = document.createElement("strong");
    value.className = "case__metric-value is-accent";
    value.textContent = item.value;

    const label = document.createElement("span");
    label.className = "case__metric-label";
    label.textContent = item.label;

    cell.append(value, label);
    strip.append(cell);
  });

  return strip;
}

function buildProjectCopy(project) {
  const block = document.createElement("div");
  block.className = "case__copy";

  if (project.role) {
    const role = document.createElement("p");
    role.className = "role";
    role.textContent = project.role;
    block.append(role);
  }

  const cols = document.createElement("div");
  cols.className = "case__cols";

  (project.body || []).forEach((paragraph, index) => {
    const parts = splitEditorialBlock(paragraph);

    if (parts) {
      const section = document.createElement("section");
      section.className = "case__section";
      const heading = document.createElement("h4");
      heading.textContent = parts.title;
      const p = document.createElement("p");
      p.textContent = parts.body;
      section.append(heading, p);
      cols.append(section);
      return;
    }

    const p = document.createElement("p");
    if (index === 0) p.className = "case__intro";
    p.textContent = ensureSpanishCaps(paragraph);
    cols.append(p);
  });

  block.append(cols);
  return block;
}

function renderCase(copy, project, panel, { onNext } = {}) {
  const item = document.createElement("article");
  item.className = "work-item is-open case";
  if (project.id) item.dataset.project = project.id;

  const top = document.createElement("header");
  top.className = "case__top";

  const lead = document.createElement("p");
  lead.className = "case__lead";
  lead.textContent = project.body?.[0] || "";

  const facts = document.createElement("div");
  facts.className = "case__facts";

  const entries = [
    [copy.work.client, project.caseClient || project.client],
    [copy.work.discipline, projectDiscipline(project)],
    [copy.work.year, project.year],
  ];

  entries.forEach(([label, value]) => {
    const lines = (Array.isArray(value) ? value : [value || ""]).filter(Boolean);
    if (!lines.length) return;
    const meta = document.createElement("div");
    meta.className = "case__meta";
    const name = document.createElement("span");
    name.textContent = label;
    const strong = document.createElement("strong");
    lines.forEach((line, index) => {
      if (index) strong.append(document.createElement("br"));
      strong.append(document.createTextNode(line));
    });
    meta.append(name, strong);
    facts.append(meta);
  });

  if (project.instagram) {
    const igMeta = document.createElement("div");
    igMeta.className = "case__meta case__meta--instagram";
    const label = document.createElement("span");
    label.textContent = copy.work.instagram || "Instagram";
    const link = document.createElement("a");
    link.className = "case__instagram";
    link.href = project.instagram;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = instagramHandle(project.instagram);
    igMeta.append(label, link);
    facts.append(igMeta);
  }

  top.append(lead, facts);

  const next = document.createElement("button");
  next.type = "button";
  next.className = "case__next";
  next.textContent = copy.work.next;
  next.addEventListener("click", () => onNext?.());

  item.append(top);
  if (project.media?.length) item.append(buildCaseStack(project.media));
  item.append(buildProjectCopy(project));
  const metrics = buildProjectMetrics(project);
  if (metrics) item.append(metrics);
  item.append(next);
  panel.append(item);

  avStripApi?.destroy();
  avStripApi = null;
  const strip = item.querySelector(".av-strip");
  if (strip && typeof window.initAvStrip === "function") {
    avStripApi = window.initAvStrip(strip);
  }
}

function renderWorkDetail(copy, project, panel, options) {
  panel.replaceChildren();
  if (!project) return;
  renderCase(copy, project, panel, options);
}

function renderWork(copy) {
  if (!workEl) return;

  const cards = WORK_CARDS.map((card) => {
    const project = projectById(copy, card.id);
    return {
      ...card,
      title: project?.client || card.id,
      tag: project?.tag || "",
    };
  });

  coverflowApi?.destroy();

  const stage = document.createElement("div");
  stage.className = "coverflow";
  const detail = document.createElement("div");
  detail.className = "work-detail";
  detail.hidden = true;
  workEl.replaceChildren(stage, detail);

  function openProject(i) {
    selectedWorkIndex = i;
    const project = projectById(copy, cards[i].id);
    renderWorkDetail(copy, project, detail, {
      onNext() {
        const next = (i + 1) % cards.length;
        coverflowApi?.activate(next);
      },
    });
    detail.hidden = false;
    if (typeof window.refreshSprayTargets === "function") {
      window.refreshSprayTargets();
    }
    requestAnimationFrame(() => {
      detail.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  coverflowApi = initCoverflow(stage, cards, {
    index: selectedWorkIndex,
    onChange(i) {
      selectedWorkIndex = i;
    },
    onActivate(i) {
      openProject(i);
    },
  });
}

function render() {
  const copy = COPY[lang];
  document.documentElement.lang = lang;
  syncLangButtons();

  setText('[data-i18n="nav.work"]',    copy.nav.work);
  setText('[data-i18n="nav.about"]',   copy.nav.about);
  setText('[data-i18n="nav.contact"]', copy.nav.contact);
  setText('[data-i18n="hero.sub"]', copy.hero.sub);
  setText('[data-i18n="hero.meta"]', copy.hero.meta);
  setText('[data-i18n="work.title"]', copy.work.title);
  setText('[data-i18n="about.title"]', copy.aboutTitle || "about me");
  setText('[data-i18n="aboutCta"]', copy.aboutCta || "about me →");
  setText('[data-i18n="backToWork"]', copy.backToWork || "Back to Work");

  renderAbout(copy);
  renderWork(copy);

  if (typeof window.refreshSprayTargets === "function") {
    window.refreshSprayTargets();
  }
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    lang = button.dataset.lang;
    localStorage.setItem("mg-lang", lang);
    render();
  });
});

render();
