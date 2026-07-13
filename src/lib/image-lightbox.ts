const LIGHTBOX_ID = "image-lightbox";
const CONTENT_SELECTOR = ".article-content img";

const getLightbox = () => document.getElementById(LIGHTBOX_ID);

const createLightbox = () => {
  const existing = getLightbox();
  if (existing) {
    return existing;
  }

  const lightbox = document.createElement("div");
  lightbox.id = LIGHTBOX_ID;
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "图片预览");
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <button type="button" class="image-lightbox__close" aria-label="关闭预览">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
      </svg>
    </button>
    <div class="image-lightbox__scroll">
      <img class="image-lightbox__img" alt="" decoding="async" />
    </div>
    <p class="image-lightbox__hint">滚动查看完整图片 · 点击空白处或按 Esc 关闭</p>
  `;

  document.body.appendChild(lightbox);
  return lightbox;
};

let isInitialized = false;

const closeLightbox = () => {
  const lightbox = getLightbox();
  if (!lightbox || lightbox.hidden) {
    return;
  }

  lightbox.hidden = true;
  document.body.classList.remove("image-lightbox-open");

  const image = lightbox.querySelector<HTMLImageElement>(".image-lightbox__img");
  if (image) {
    image.removeAttribute("src");
    image.alt = "";
  }
};

const openLightbox = (source: HTMLImageElement) => {
  const lightbox = createLightbox();
  const image = lightbox.querySelector<HTMLImageElement>(".image-lightbox__img");

  if (!image) {
    return;
  }

  image.src = source.currentSrc || source.src;
  image.alt = source.alt;

  lightbox.hidden = false;
  document.body.classList.add("image-lightbox-open");
  lightbox.querySelector<HTMLButtonElement>(".image-lightbox__close")?.focus();
};

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const image = target.closest<HTMLImageElement>(CONTENT_SELECTOR);
  if (!image || image.closest("a")) {
    return;
  }

  event.preventDefault();
  openLightbox(image);
};

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape") {
    return;
  }

  closeLightbox();
};

const handleLightboxClick = (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (
    target.closest(".image-lightbox__close") ||
    target.classList.contains("image-lightbox") ||
    target.classList.contains("image-lightbox__scroll")
  ) {
    closeLightbox();
  }
};

export const initImageLightbox = () => {
  if (isInitialized) {
    closeLightbox();
    return;
  }

  isInitialized = true;
  createLightbox();

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("click", handleLightboxClick);
  document.addEventListener("astro:page-load", closeLightbox);
};
