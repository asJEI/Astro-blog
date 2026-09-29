import { motionConfig } from "./motion-config";

type Kind = 0 | 1;

type Particle = {
  x: number;
  y: number;
  size: number;
  fall: number;
  sway: number;
  alpha: number;
  phase: number;
  period: number;
  spin: number;
  angle: number;
  kind: Kind;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const makeCanvas = () => {
  const sprite = document.createElement("canvas");
  sprite.width = 96;
  sprite.height = 96;
  return sprite;
};

const makeMote = (rgb: string) => {
  const sprite = makeCanvas();
  const context = sprite.getContext("2d");
  if (!context) return sprite;
  const glow = context.createRadialGradient(48, 48, 0, 48, 48, 46);
  glow.addColorStop(0, `rgba(${rgb}, 1)`);
  glow.addColorStop(0.22, `rgba(${rgb}, 0.85)`);
  glow.addColorStop(0.5, `rgba(${rgb}, 0.18)`);
  glow.addColorStop(1, `rgba(${rgb}, 0)`);
  context.fillStyle = glow;
  context.fillRect(0, 0, 96, 96);
  return sprite;
};

const pickKind = (): Kind => (Math.random() < motionConfig.particle.mix.flake ? 1 : 0);

/**
 * Mounts the hero dust field and the desktop background drift.
 * Returns a teardown that cancels the frame loop and every listener.
 */
export const mountHeroAtmosphere = (hero: HTMLElement) => {
  const canvas = hero.querySelector<HTMLCanvasElement>("[data-hero-canvas]");
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return () => {};

  const { particle, parallax } = motionConfig;
  const fineQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const wideQuery = window.matchMedia("(min-width: 721px)");
  const coarseQuery = window.matchMedia("(pointer: coarse)");
  const parallaxNodes = Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-parallax]"));

  let destroyed = false;
  let running = false;
  let raf = 0;
  let width = 0;
  let height = 0;
  let last = 0;
  let elapsed = 0;
  let wind = 0;
  let pointerTarget = 0;
  let pointerActive = false;
  let heroVisible = true;
  let sprites = [] as HTMLCanvasElement[];
  const particles: Particle[] = [];

  const isDark = () => document.documentElement.classList.contains("dark");
  const colors = () => (isDark() ? motionConfig.palette.dark : motionConfig.palette.light);
  const compact = () => !wideQuery.matches || coarseQuery.matches;
  const allowParallax = () =>
    parallax.enabled && fineQuery.matches && wideQuery.matches && !coarseQuery.matches;

  const buildSprites = () => {
    const swatch = colors();
    sprites = [makeMote(swatch.ice)];
  };

  const desiredCount = () => {
    const band = compact() ? particle.mobile : particle.desktop;
    if (!particle.enabled || width < 8 || height < 8) return 0;
    return clamp(Math.round((width * height) / band.areaDivisor), band.min, band.max);
  };

  const createParticle = (): Particle => {
    const kind = pickKind();
    const band = kind === 1 ? particle.size.flake : particle.size.mote;
    const ink = kind === 1 ? particle.alpha.flake : particle.alpha.mote;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: rand(band.min, band.max),
      fall: rand(particle.fall.min, particle.fall.max) * (kind === 1 ? 0.84 : 1),
      sway: rand(particle.sway.min, particle.sway.max),
      alpha: rand(ink.min, ink.max),
      phase: Math.random() * Math.PI * 2,
      period: rand(particle.period.min, particle.period.max),
      spin: rand(0.15, 0.4) * (Math.random() < 0.5 ? -1 : 1),
      angle: Math.random() * Math.PI * 2,
      kind,
    };
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    const nextWidth = rect.width;
    const nextHeight = rect.height;
    if (nextWidth < 2 || nextHeight < 2) return;

    const previousWidth = width;
    const previousHeight = height;
    width = nextWidth;
    height = nextHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, compact() ? particle.dpr.mobile : particle.dpr.desktop);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (previousWidth > 0 && previousHeight > 0) {
      const scaleX = width / previousWidth;
      const scaleY = height / previousHeight;
      for (const mote of particles) {
        mote.x *= scaleX;
        mote.y *= scaleY;
      }
    }

    const count = desiredCount();
    while (particles.length < count) particles.push(createParticle());
    while (particles.length > count) particles.pop();
  };

  const regionFade = (mote: Particle) => {
    let fade = 1;
    const across = width > 0 ? mote.x / width : 0;
    const down = height > 0 ? mote.y / height : 0;
    const title = particle.title;
    if (across > title.x0 && across < title.x1 && down > title.y0 && down < title.y1) {
      fade *= title.floor;
    }
    if (down > particle.bottomFadeStart) {
      const span = 1 - particle.bottomFadeStart || 1;
      fade *= 1 - clamp((down - particle.bottomFadeStart) / span, 0, 1);
    }
    const edge = particle.edge;
    if (mote.x < edge) fade *= mote.x / edge;
    else if (mote.x > width - edge) fade *= (width - mote.x) / edge;
    if (mote.y < edge) fade *= Math.max(0, mote.y / edge);
    return Math.max(0, fade);
  };

  const draw = (dt: number) => {
    const desiredWind = (pointerActive && fineQuery.matches ? pointerTarget : 0) * particle.mouseWind;
    wind += (desiredWind - wind) * (1 - Math.exp(-particle.mouseLerp * dt));
    elapsed += dt;

    for (const mote of particles) {
      mote.y += mote.fall * dt;
      mote.x += (Math.sin(elapsed * (Math.PI * 2) / mote.period + mote.phase) * mote.sway + wind) * dt;
      mote.angle += mote.spin * dt;
      if (mote.y > height + 28) {
        mote.y = -28;
        mote.x = Math.random() * width;
      } else if (mote.y < -28) {
        mote.y = height + 28;
      }
      if (mote.x > width + 28) mote.x = -28;
      else if (mote.x < -28) mote.x = width + 28;
    }

    context.clearRect(0, 0, width, height);
    for (const mote of particles) {
      const pulse = 0.86 + 0.14 * Math.sin(elapsed / mote.period + mote.phase);
      const alpha = mote.alpha * pulse * regionFade(mote);
      if (alpha < 0.04) continue;
      const sprite = mote.kind === 0 ? sprites[0] : null;
      if (mote.kind === 0) {
        if (!sprite) continue;
        context.globalAlpha = alpha;
        context.drawImage(sprite, mote.x - mote.size / 2, mote.y - mote.size / 2, mote.size, mote.size);
        continue;
      }

      context.save();
      context.translate(mote.x, mote.y);
      context.rotate(mote.angle);
      context.globalAlpha = alpha;
      if (mote.kind === 1) {
        const rgb = colors().snow;
        context.strokeStyle = `rgba(${rgb}, 0.95)`;
        context.fillStyle = `rgba(${rgb}, 0.95)`;
        context.lineWidth = Math.max(1.05, mote.size * 0.075);
        context.lineCap = "round";
        const arm = mote.size * 0.46;
        for (let branch = 0; branch < 6; branch += 1) {
          context.rotate(Math.PI / 3);
          context.beginPath();
          context.moveTo(0, 0);
          context.lineTo(0, -arm);
          context.moveTo(0, -arm * 0.55);
          context.lineTo(-arm * 0.28, -arm * 0.78);
          context.moveTo(0, -arm * 0.55);
          context.lineTo(arm * 0.28, -arm * 0.78);
          context.stroke();
        }
        context.beginPath();
        context.arc(0, 0, Math.max(0.8, mote.size * 0.08), 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    }
    context.globalAlpha = 1;
  };

  const applyParallax = () => {
    if (!allowParallax()) {
      for (const node of parallaxNodes) node.style.translate = "";
      return;
    }
    const shift = clamp(window.scrollY * parallax.rate, 0, parallax.max);
    const value = `0 ${shift.toFixed(2)}px`;
    for (const node of parallaxNodes) node.style.translate = value;
  };

  const frame = (now: number) => {
    if (destroyed || !running) return;
    const dt = Math.min(particle.maxDelta, last ? (now - last) / 1000 : 0);
    last = now;
    if (document.documentElement.dataset.motionActive === "still") {
      stopLoop();
      return;
    }
    draw(dt);
    applyParallax();
    raf = requestAnimationFrame(frame);
  };

  const stopLoop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const startLoop = () => {
    if (destroyed || running || document.documentElement.dataset.motionActive === "still") return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  };

  const syncLoop = () => {
    const allow = heroVisible && !document.hidden && document.documentElement.dataset.motionActive !== "still";
    if (allow) startLoop();
    else stopLoop();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!fineQuery.matches || width <= 0) return;
    const rect = hero.getBoundingClientRect();
    pointerTarget = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    pointerActive = true;
  };

  const onPointerLeave = () => {
    pointerActive = false;
  };

  const onVisibility = () => syncLoop();

  const intersection = new IntersectionObserver(([entry]) => {
    heroVisible = entry?.isIntersecting ?? false;
    syncLoop();
  });

  const resizeObserver = new ResizeObserver(() => {
    resize();
  });

  const themeObserver = new MutationObserver(() => {
    buildSprites();
  });

  buildSprites();
  resize();
  intersection.observe(hero);
  resizeObserver.observe(hero);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  hero.addEventListener("pointermove", onPointerMove);
  hero.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);
  hero.dataset.atmosphere = "live";
  syncLoop();

  return () => {
    if (destroyed) return;
    destroyed = true;
    stopLoop();
    intersection.disconnect();
    resizeObserver.disconnect();
    themeObserver.disconnect();
    hero.removeEventListener("pointermove", onPointerMove);
    hero.removeEventListener("pointerleave", onPointerLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    for (const node of parallaxNodes) node.style.translate = "";
    delete hero.dataset.atmosphere;
    context.clearRect(0, 0, width, height);
  };
};
