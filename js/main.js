const aboutEl = document.getElementById("about-body");
const workEl = document.getElementById("work-list");
const yearEl = document.getElementById("year");

let lang = localStorage.getItem("mg-lang") === "en" ? "en" : "es";
let selectedWorkIndex = 0;
let coverflowApi = null;

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
    if (item.featured) {
      video.setAttribute("poster", "");
    }
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

function buildCasePiece(item) {
  const figure = document.createElement("figure");
  figure.className = "case__piece";
  if (item.span === "half") figure.classList.add("case__piece--half");

  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", item.label || "");
    figure.append(video);
  } else {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.label || "";
    img.loading = "lazy";
    figure.append(img);
  }

  return figure;
}

function buildCaseStack(media) {
  const stack = document.createElement("div");
  stack.className = "case__stack";
  let row = null;

  media.forEach((item) => {
    const piece = buildCasePiece(item);
    if (item.span === "half") {
      if (!row || row.childElementCount >= 2) {
        row = document.createElement("div");
        row.className = "case__row";
        stack.append(row);
      }
      row.append(piece);
      return;
    }
    row = null;
    piece.classList.add("case__piece--full");
    stack.append(piece);
  });

  return stack;
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
    [copy.work.discipline, project.discipline],
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

  top.append(lead, facts);

  const next = document.createElement("button");
  next.type = "button";
  next.className = "case__next";
  next.textContent = copy.work.next;
  next.addEventListener("click", () => onNext?.());

  item.append(top);
  if (project.media?.length) item.append(buildCaseStack(project.media));
  item.append(buildProjectCopy(project));
  item.append(next);
  panel.append(item);
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

  (project.body || []).forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    block.append(p);
  });

  return block;
}

function renderWorkDetail(copy, project, panel, options) {
  panel.replaceChildren();
  if (!project) return;

  if (project.layout === "case") {
    renderCase(copy, project, panel, options);
    return;
  }

  const item = document.createElement("article");
  item.className = "work-item is-open";
  if (project.id) item.dataset.project = project.id;

  const heading = document.createElement("div");
  heading.className = "work-toggle";
  const title = document.createElement("h3");
  title.textContent = project.client;
  const tag = document.createElement("small");
  tag.textContent = project.tag;
  heading.append(title, tag);

  const body = document.createElement("div");
  body.className = "work-panel";

  if (project.media?.length) {
    const featured = buildMedia(project.media, copy, { featuredOnly: true });
    if (featured) body.append(featured);
    const supporting = buildMedia(project.media, copy, { supportingOnly: true });
    if (supporting) body.append(supporting);
  }

  body.append(buildProjectCopy(project));

  if (!project.media?.length) {
    const pending = document.createElement("p");
    pending.className = "pending";
    pending.textContent = copy.work.pending;
    body.append(pending);
  }

  item.append(heading, body);
  panel.append(item);
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

  setText('[data-i18n="nav.work"]', copy.nav.work);
  setText('[data-i18n="hero.sub"]', copy.hero.sub);
  setText('[data-i18n="hero.meta"]', copy.hero.meta);
  setText('[data-i18n="work.title"]', copy.work.title);
  setText('[data-i18n="about.title"]', copy.aboutTitle || "About me");
  setText('[data-i18n="aboutCta"]', copy.aboutCta || "About me");
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
