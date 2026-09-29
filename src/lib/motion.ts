const STORAGE_KEY = "beihai-motion";
const HERO_SEEN_KEY = "beihai-hero-seen";

let started = false;
let generation = 0;
let memoryPreference: "on" | "off" | null = null;
let heroSeenMemory = false;
let historyTraverse = false;
let revealCleanup: (() => void) | null = null;
let atmosphereCleanup: (() => void) | null = null;

const readStoredMotion = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "on" || value === "off") return value;
  } catch {
    // Private mode and blocked storage fall back to the in-memory choice.
  }
  return memoryPreference;
};

const writeStoredMotion = (value: "on" | "off") => {
  memoryPreference = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // The attribute on <html> keeps the choice for this visit.
  }
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const motionIsStill = () => prefersReducedMotion() || readStoredMotion() === "off";

export const syncMotionAttributes = () => {
  const reduced = prefersReducedMotion();
  const stored = readStoredMotion();
  const still = reduced || stored === "off";
  const root = document.documentElement;
  root.dataset.motion = stored === "off" ? "off" : "on";
  root.dataset.motionActive = still ? "still" : "on";
  if (reduced) root.dataset.motionSystem = "reduce";
  else delete root.dataset.motionSystem;

  document.querySelectorAll<HTMLButtonElement>("[data-motion-toggle]").forEach((button) => {
    const on = !still;
    button.setAttribute("aria-pressed", on ? "true" : "false");
    button.setAttribute("aria-disabled", reduced ? "true" : "false");
    button.setAttribute(
      "aria-label",
      reduced
        ? "动态效果已遵循系统的减少动态设置"
        : on
          ? "动态：开，点击关闭装饰动效"
          : "动态：关，点击开启装饰动效",
    );
  });
};

const readHeroSeen = () => {
  try {
    return sessionStorage.getItem(HERO_SEEN_KEY) === "1" || heroSeenMemory;
  } catch {
    return heroSeenMemory;
  }
};

const writeHeroSeen = () => {
  heroSeenMemory = true;
  try {
    sessionStorage.setItem(HERO_SEEN_KEY, "1");
  } catch {
    // A refresh may play the full entrance again. The current visit still shortens.
  }
};

const markHeroEntrance = (traverse: boolean) => {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero || hero.dataset.entrance) return;

  if (motionIsStill() || traverse) {
    hero.dataset.entrance = "none";
  } else {
    hero.dataset.entrance = readHeroSeen() ? "short" : "full";
  }
  writeHeroSeen();
};

const showReveal = (node: HTMLElement) => {
  node.classList.remove("is-armed");
  node.classList.add("is-shown");
};

const setupReveal = () => {
  revealCleanup?.();
  revealCleanup = null;
  if (motionIsStill()) {
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
      node.classList.remove("is-armed");
      node.classList.add("is-shown");
    });
    return;
  }

  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (nodes.length === 0) return;

  const pending = nodes.filter((node) => !node.classList.contains("is-shown"));
  if (pending.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const node = entry.target as HTMLElement;
        showReveal(node);
        observer.unobserve(node);
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  for (const node of pending) {
    const rect = node.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < window.innerHeight * 0.92;
    if (inView) {
      showReveal(node);
      continue;
    }
    node.classList.add("is-armed");
    observer.observe(node);
  }

  const onFocus = (event: FocusEvent) => {
    const node = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-reveal]") : null;
    if (!node) return;
    showReveal(node);
    observer.unobserve(node);
  };

  document.addEventListener("focusin", onFocus);
  revealCleanup = () => {
    observer.disconnect();
    document.removeEventListener("focusin", onFocus);
  };
};

const setupAtmosphere = async (token: number) => {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero || motionIsStill()) return;

  const module = await import("./hero-atmosphere");
  if (token !== generation || !hero.isConnected || motionIsStill()) return;

  atmosphereCleanup?.();
  atmosphereCleanup = module.mountHeroAtmosphere(hero);
};

const releaseEffects = () => {
  generation += 1;
  revealCleanup?.();
  revealCleanup = null;
  atmosphereCleanup?.();
  atmosphereCleanup = null;
};

export const initPageMotion = () => {
  const token = ++generation;
  revealCleanup?.();
  revealCleanup = null;
  atmosphereCleanup?.();
  atmosphereCleanup = null;
  syncMotionAttributes();
  setupReveal();
  void setupAtmosphere(token);
};

const onToggle = (event: MouseEvent) => {
  const toggle = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-motion-toggle]") : null;
  if (!toggle || toggle.getAttribute("aria-disabled") === "true") return;
  writeStoredMotion(document.documentElement.dataset.motionActive === "on" ? "off" : "on");
  initPageMotion();
};

export const startMotion = () => {
  if (started) return;
  started = true;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduced.addEventListener("change", () => initPageMotion());
  document.addEventListener("click", onToggle);
  document.addEventListener("astro:before-swap", (event) => {
    const navigationType = (event as Event & { navigationType?: string }).navigationType;
    historyTraverse = navigationType === "traverse";
    releaseEffects();
  });
  document.addEventListener("astro:after-swap", () => {
    const traverse = historyTraverse;
    historyTraverse = false;
    syncMotionAttributes();
    markHeroEntrance(traverse);
  });
  document.addEventListener("astro:page-load", initPageMotion);

  if (document.readyState === "complete") initPageMotion();
};
