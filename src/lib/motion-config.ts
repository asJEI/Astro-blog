/**
 * 北海 · 风起时
 * 动效参数集中在这里。视觉节奏另见 src/styles/motion.css。
 * 关闭持续氛围时，优先改 particle.enabled / parallax.enabled，不必拆交互反馈。
 */

export const motionConfig = {
  particle: {
    enabled: true,
    desktop: { min: 42, max: 60, areaDivisor: 20000 },
    mobile: { min: 16, max: 26, areaDivisor: 30000 },
    /** Share of snowflakes versus soft light motes. */
    mix: { flake: 0.4, mote: 0.6 },
    size: {
      mote: { min: 4, max: 7 },
      flake: { min: 14, max: 26 },
    },
    alpha: {
      mote: { min: 0.55, max: 0.92 },
      flake: { min: 0.62, max: 0.95 },
    },
    fall: { min: 16, max: 36 },
    sway: { min: 10, max: 22 },
    period: { min: 5, max: 9 },
    /** Seconds. Caps the jump after a tab has been in the background. */
    maxDelta: 0.05,
    dpr: { desktop: 1.75, mobile: 1.25 },
    /** Added wind, CSS px/s. Kept small so a fast swipe cannot scatter the field. */
    mouseWind: 16,
    mouseLerp: 3.2,
    /** Quiet the block behind the title, not the whole sky. */
    title: { x0: 0.05, x1: 0.48, y0: 0.16, y1: 0.8, floor: 0.34 },
    bottomFadeStart: 0.78,
    edge: 20,
  },
  parallax: {
    enabled: true,
    max: 14,
    rate: 0.04,
  },
  palette: {
    light: { snow: "248, 250, 252", ice: "206, 220, 232" },
    dark: { snow: "250, 252, 255", ice: "196, 214, 230" },
  },
} as const;

export type MotionPalette = (typeof motionConfig.palette)["light"];
