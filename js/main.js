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
  aboutEl.replaceChildren(
    ...copy.about.map((block) => {
      const el = document.createElement(block.type);
      el.textContent = block.text;
      return el;
    })
  );
}

function projectById(copy, id) {
  return copy.projects.find((project) => project.id === id);
}

function renderWorkDetail(copy, project, panel) {
  panel.replaceChildren();
  if (!project) return;

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

  const role = document.createElement("p");
  role.className = "role";
  role.textContent = project.role;
  body.append(role);

  if (project.media?.length) {
    const featured = buildMedia(project.media, copy, { featuredOnly: true });
    if (featured) body.append(featured);
  }

  project.body.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    body.append(p);
  });

  if (project.media?.length) {
    const supporting = buildMedia(project.media, copy, { supportingOnly: true });
    if (supporting) body.append(supporting);
  } else {
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
  workEl.replaceChildren(stage);

  coverflowApi = initCoverflow(stage, cards, {
    index: selectedWorkIndex,
    onChange(i) {
      selectedWorkIndex = i;
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
