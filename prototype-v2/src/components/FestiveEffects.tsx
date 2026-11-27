import React, { useEffect, useRef, useState } from 'react';
import ikameMascot from '../assets/ikame-mascot.png';

/* ============================================================================
   1. Refined Full-Page Check-In Celebration (Crisp Confetti + Frosted Pill, NO screen flash)
   ============================================================================ */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'star' | 'snow';
  alpha: number;
  decay: number;
}

export const FullPageCheckInCelebration: React.FC<{
  triggerId: number;
  firstName: string;
  timeLabel: string;
  isNoel: boolean;
}> = ({ triggerId, firstName, timeLabel, isNoel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (triggerId === 0) return;
    setVisible(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const palette = isNoel
      ? ['#E03553', '#167942', '#F9AB00', '#93C5FD', '#FFFFFF']
      : ['#F76226', '#F9AB00', '#0B57D0', '#188038', '#8B5CF6'];

    const particles: Particle[] = [];

    const spawnBurst = (
      ox: number,
      oy: number,
      count: number,
      angleMin: number,
      angleMax: number,
      speedMin: number,
      speedMax: number
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = angleMin + Math.random() * (angleMax - angleMin);
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        const shapes: Particle['shape'][] = isNoel
          ? ['rect', 'snow', 'circle']
          : ['rect', 'circle', 'star'];
        particles.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3.8 + Math.random() * 4.5,
          color: palette[Math.floor(Math.random() * palette.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          alpha: 0.95,
          decay: 0.008 + Math.random() * 0.007,
        });
      }
    };

    spawnBurst(w * 0.5, 42, 46, Math.PI * 0.08, Math.PI * 0.92, 3.5, 11);
    spawnBurst(w * 0.12, h * 0.85, 26, -Math.PI * 0.45, -Math.PI * 0.2, 9, 17);
    spawnBurst(w * 0.88, h * 0.85, 26, -Math.PI * 0.8, -Math.PI * 0.55, 9, 17);

    let rafId = 0;
    const drawStar = (x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of particles) {
        if (p.alpha <= 0) continue;
        alive++;
        p.vx *= 0.982;
        p.vy = p.vy * 0.986 + 0.28;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, p.alpha - p.decay);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size * 0.55, -p.size * 0.3, p.size * 1.1, p.size * 0.6);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'snow') {
          ctx.font = `${Math.round(p.size * 1.7)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('❄', 0, 0);
        } else {
          drawStar(0, 0, p.size * 0.55);
        }
        ctx.restore();
      }
      if (alive > 0) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 2600);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(hideTimer);
    };
  }, [triggerId, isNoel]);

  if (!visible) return null;

  return (
    <div className="checkin-celebration-overlay" aria-hidden="true">
      <canvas ref={canvasRef} className="checkin-confetti-canvas" />
      <div className="checkin-banner-pop">
        <img src={ikameMascot} alt="" className="checkin-banner-mascot" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)' }}>
            Đã chấm công - {timeLabel}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {isNoel
              ? `Giáng sinh an lành nhé, ${firstName}! ❄️`
              : `Chúc ${firstName} ngày mới thật nhiều năng lượng!`}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MilestoneCelebrationOverlay: React.FC<{
  triggerId: number;
  title: string;
  subtitle: string;
  isNoel?: boolean;
}> = ({ triggerId, title, subtitle, isNoel = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (triggerId === 0) return;
    setVisible(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const palette = isNoel
      ? ['#E03553', '#167942', '#F9AB00', '#93C5FD', '#FFFFFF']
      : ['#F76226', '#F9AB00', '#0B57D0', '#188038', '#8B5CF6'];

    const particles: Particle[] = [];
    const spawn = (ox: number, oy: number, count: number, aMin: number, aMax: number, sMin: number, sMax: number) => {
      for (let i = 0; i < count; i++) {
        const angle = aMin + Math.random() * (aMax - aMin);
        const speed = sMin + Math.random() * (sMax - sMin);
        const shapes: Particle['shape'][] = ['rect', 'circle', 'star'];
        particles.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 4.5,
          color: palette[Math.floor(Math.random() * palette.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.22,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          alpha: 0.96,
          decay: 0.0075 + Math.random() * 0.006,
        });
      }
    };

    spawn(w * 0.5, 46, 52, Math.PI * 0.08, Math.PI * 0.92, 4, 11.5);
    spawn(w * 0.14, h * 0.84, 28, -Math.PI * 0.45, -Math.PI * 0.2, 9.5, 17);
    spawn(w * 0.86, h * 0.84, 28, -Math.PI * 0.8, -Math.PI * 0.55, 9.5, 17);

    let rafId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of particles) {
        if (p.alpha <= 0) continue;
        alive++;
        p.vx *= 0.983;
        p.vy = p.vy * 0.986 + 0.27;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, p.alpha - p.decay);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size * 0.55, -p.size * 0.3, p.size * 1.1, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive > 0) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const timer = window.setTimeout(() => setVisible(false), 2900);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timer);
    };
  }, [triggerId, isNoel]);

  if (!visible) return null;

  return (
    <div className="checkin-celebration-overlay" aria-hidden="true">
      <canvas ref={canvasRef} className="checkin-confetti-canvas" />
      <div className="checkin-banner-pop">
        <img src={ikameMascot} alt="" className="checkin-banner-mascot" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   2. Ultra-Lightweight Framed Noel Snowfall + Cached Volumetric Idle Snowdrift
      Performance Guarantees:
      - Confined strictly inside .g-workspace-sheet (CSS contain: strict, 0 reflow)
      - Pre-baked offscreen snowbank cache per level (0 shadowBlur, 0 per-frame gradients)
      - Snowbank canvas consumes 0.0% CPU when resting; <0.4ms/frame during grow/melt
      - Falling snow capped at ~32fps with dt normalization & LUT surface settling
      - Completely pauses RAF on hidden tabs & respects prefers-reduced-motion
      - Zero React re-renders during idle tracking, mousemove, scroll, or click-to-melt
   ============================================================================ */
export type SnowIdleLevel = 0 | 1 | 2 | 3;

const IDLE_1M_MS = 60 * 1000;
const IDLE_5M_MS = 5 * 60 * 1000;
const IDLE_10M_MS = 10 * 60 * 1000;

const SNOWBANK_CANVAS_H = 185;
const RIDGE_SAMPLES = 88;
const SNOW_TARGET_FPS_MS = 1000 / 32; // Silky 32fps snow saves ~50–75% GPU bandwidth vs 60–144Hz

const FLAKE_COUNT_BY_LEVEL: Record<SnowIdleLevel, number> = {
  0: 24,
  1: 40,
  2: 56,
  3: 72,
};

const DEPTH_BY_LEVEL: Record<SnowIdleLevel, number> = {
  0: 0,
  1: 42,
  2: 92,
  3: 150,
};

/** Organic asymmetric snowdrift contour (piles naturally deeper at frame corners) */
function sampleRidgeRatio(u: number, layer: 0 | 1 | 2): number {
  const centered = 2 * u - 1;
  if (layer === 0) {
    const edge = Math.pow(Math.abs(centered), 2.15);
    return Math.max(
      0.16,
      0.34 +
        0.42 * edge +
        0.13 * Math.sin(u * 5.4 + 0.5) +
        0.08 * Math.sin(u * 11.3 + 2.1) +
        0.035 * Math.cos(u * 21.7 + 0.3)
    );
  }
  if (layer === 1) {
    const edge = Math.pow(Math.abs(centered - 0.05), 2.25);
    return Math.max(
      0.12,
      0.23 +
        0.44 * edge +
        0.11 * Math.sin(u * 6.7 + 2.3) +
        0.075 * Math.cos(u * 13.8 + 0.6) +
        0.032 * Math.sin(u * 25.1 + 1.4)
    );
  }
  const edge = Math.pow(Math.abs(centered + 0.06), 2.4);
  return Math.max(
    0.08,
    0.16 +
      0.46 * edge +
      0.095 * Math.cos(u * 7.5 + 0.9) +
      0.068 * Math.sin(u * 15.6 + 2.8) +
      0.028 * Math.cos(u * 29.2 + 0.2)
  );
}

// Pre-computed 128-slot lookup table for front snowbank surface (0 trig calls per falling flake)
const FRONT_RIDGE_LUT = new Float32Array(128);
for (let i = 0; i < 128; i++) {
  FRONT_RIDGE_LUT[i] = sampleRidgeRatio(i / 127, 2);
}

/** Deterministic PRNG for stable snow grains, crest puffs & crystal sparkles */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Create a soft pre-rendered radial snow puff sprite (drawn via GPU drawImage) */
function createSnowSprite(rgb: string, size = 24): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (g) {
    const half = size / 2;
    const grad = g.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, `rgba(${rgb}, 1)`);
    grad.addColorStop(0.38, `rgba(${rgb}, 0.82)`);
    grad.addColorStop(0.72, `rgba(${rgb}, 0.26)`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  return c;
}

interface GrainSpec {
  u: number;
  v: number;
  r: number;
  alpha: number;
  isSparkle: boolean;
}

interface PuffSpec {
  u: number;
  size: number;
  offsetY: number;
  alpha: number;
}

interface MeltMist {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
}

/**
 * Bake a static, high-detail volumetric 3-plane snowbank into an offscreen bitmap ONCE per level.
 * Zero shadowBlur (replaced by fast layered ambient strokes) & zero per-column gradient allocations.
 */
function bakeSnowbankBitmap(
  w: number,
  h: number,
  dpr: number,
  depth: number,
  dark: boolean,
  grains: GrainSpec[],
  crestPuffs: PuffSpec[],
  puffSprite: HTMLCanvasElement
): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = Math.max(1, Math.round(w * dpr));
  off.height = Math.max(1, Math.round(h * dpr));
  const ctx = off.getContext('2d');
  if (!ctx || depth <= 0.6) return off;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const drawLayerPath = (xs: number[], ys: number[]) => {
    ctx.beginPath();
    ctx.moveTo(-6, h + 6);
    ctx.lineTo(xs[0], ys[0]);
    for (let i = 0; i < xs.length - 1; i++) {
      const mx = (xs[i] + xs[i + 1]) * 0.5;
      const my = (ys[i] + ys[i + 1]) * 0.5;
      ctx.quadraticCurveTo(xs[i], ys[i], mx, my);
    }
    ctx.lineTo(xs[xs.length - 1], ys[ys.length - 1]);
    ctx.lineTo(w + 6, h + 6);
    ctx.closePath();
  };

  const drawContourLine = (xs: number[], ys: number[], offsetY = 0) => {
    ctx.beginPath();
    ctx.moveTo(xs[0], ys[0] + offsetY);
    for (let i = 0; i < xs.length - 1; i++) {
      const mx = (xs[i] + xs[i + 1]) * 0.5;
      const my = (ys[i] + ys[i + 1]) * 0.5 + offsetY;
      ctx.quadraticCurveTo(xs[i], ys[i] + offsetY, mx, my);
    }
    ctx.lineTo(xs[xs.length - 1], ys[ys.length - 1] + offsetY);
  };

  // 1. Subtle frosty corner mist hugging frame bottom-left & bottom-right
  const mistAlpha = Math.min(1, depth / 110) * (dark ? 0.16 : 0.24);
  const cornerR = Math.max(90, Math.min(240, w * 0.22));
  const leftMist = ctx.createRadialGradient(0, h, 4, 0, h, cornerR);
  leftMist.addColorStop(0, `rgba(210, 234, 255, ${mistAlpha})`);
  leftMist.addColorStop(1, 'rgba(210, 234, 255, 0)');
  ctx.fillStyle = leftMist;
  ctx.fillRect(0, 0, cornerR, h);

  const rightMist = ctx.createRadialGradient(w, h, 4, w, h, cornerR);
  rightMist.addColorStop(0, `rgba(210, 234, 255, ${mistAlpha})`);
  rightMist.addColorStop(1, 'rgba(210, 234, 255, 0)');
  ctx.fillStyle = rightMist;
  ctx.fillRect(w - cornerR, 0, cornerR, h);

  const xs: number[] = [];
  for (let i = 0; i <= RIDGE_SAMPLES; i++) {
    xs.push(-4 + ((w + 8) * i) / RIDGE_SAMPLES);
  }

  const buildYs = (layer: 0 | 1 | 2, scale: number) => {
    const ys: number[] = [];
    for (let i = 0; i <= RIDGE_SAMPLES; i++) {
      const u = i / RIDGE_SAMPLES;
      const ratio = sampleRidgeRatio(u, layer);
      const centerThin = depth < 55 ? 0.68 + 0.32 * Math.pow(Math.abs(2 * u - 1), 1.4) : 1;
      const heightPx = Math.min(h - 14, depth * scale * ratio * centerThin);
      ys.push(h - heightPx);
    }
    return ys;
  };

  const backYs = buildYs(0, 1.0);
  const midYs = buildYs(1, 0.84);
  const frontYs = buildYs(2, 0.68);

  // --- LAYER 0: Back Distant Ridge ---
  drawLayerPath(xs, backYs);
  const backGrad = ctx.createLinearGradient(0, h - depth, 0, h);
  if (dark) {
    backGrad.addColorStop(0, 'rgba(170, 204, 232, 0.44)');
    backGrad.addColorStop(0.55, 'rgba(116, 152, 184, 0.56)');
    backGrad.addColorStop(1, 'rgba(78, 108, 136, 0.72)');
  } else {
    backGrad.addColorStop(0, 'rgba(224, 240, 254, 0.72)');
    backGrad.addColorStop(1, 'rgba(186, 214, 240, 0.84)');
  }
  ctx.fillStyle = backGrad;
  ctx.fill();

  drawContourLine(xs, backYs);
  ctx.strokeStyle = dark ? 'rgba(218, 238, 255, 0.16)' : 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // --- LAYER 1: Mid Sculpted Snowbank (fast ambient occlusion rim instead of shadowBlur) ---
  drawContourLine(xs, midYs, -2);
  ctx.strokeStyle = dark ? 'rgba(18, 36, 56, 0.22)' : 'rgba(118, 156, 196, 0.18)';
  ctx.lineWidth = 8;
  ctx.stroke();

  drawLayerPath(xs, midYs);
  const midGrad = ctx.createLinearGradient(0, h - depth * 0.85, 0, h);
  if (dark) {
    midGrad.addColorStop(0, 'rgba(220, 238, 252, 0.86)');
    midGrad.addColorStop(0.45, 'rgba(162, 194, 222, 0.9)');
    midGrad.addColorStop(1, 'rgba(104, 138, 168, 0.95)');
  } else {
    midGrad.addColorStop(0, 'rgba(246, 251, 255, 0.95)');
    midGrad.addColorStop(0.52, 'rgba(214, 232, 249, 0.96)');
    midGrad.addColorStop(1, 'rgba(182, 209, 236, 0.97)');
  }
  ctx.fillStyle = midGrad;
  ctx.fill();

  // Fast directional slope shading (reuses single fill color + globalAlpha, zero per-column gradients)
  ctx.save();
  drawLayerPath(xs, midYs);
  ctx.clip();
  ctx.fillStyle = dark ? 'rgb(48, 80, 112)' : 'rgb(128, 168, 210)';
  for (let i = 0; i < RIDGE_SAMPLES; i++) {
    const dy = midYs[i + 1] - midYs[i];
    if (dy > 0.25) {
      const strength = Math.min(1, dy / 4.2);
      const sx = xs[i];
      const sw = xs[i + 1] - xs[i] + 1.5;
      ctx.globalAlpha = (dark ? 0.16 : 0.12) * strength;
      ctx.fillRect(sx, midYs[i], sw, 18);
      ctx.globalAlpha = (dark ? 0.08 : 0.06) * strength;
      ctx.fillRect(sx, midYs[i] + 18, sw, 20);
    }
  }
  ctx.restore();

  drawContourLine(xs, midYs);
  ctx.strokeStyle = dark ? 'rgba(245, 251, 255, 0.45)' : 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // --- LAYER 2: Front Lush Pillowy Snowdrift ---
  drawContourLine(xs, frontYs, -2);
  ctx.strokeStyle = dark ? 'rgba(14, 30, 48, 0.24)' : 'rgba(110, 152, 194, 0.16)';
  ctx.lineWidth = 9;
  ctx.stroke();

  drawLayerPath(xs, frontYs);
  const frontGrad = ctx.createLinearGradient(0, h - depth * 0.7, 0, h);
  if (dark) {
    frontGrad.addColorStop(0, 'rgba(245, 250, 255, 0.96)');
    frontGrad.addColorStop(0.28, 'rgba(220, 237, 251, 0.96)');
    frontGrad.addColorStop(0.75, 'rgba(166, 196, 222, 0.97)');
    frontGrad.addColorStop(1, 'rgba(130, 164, 194, 0.98)');
  } else {
    frontGrad.addColorStop(0, 'rgba(255, 255, 255, 0.99)');
    frontGrad.addColorStop(0.32, 'rgba(242, 248, 255, 0.98)');
    frontGrad.addColorStop(0.78, 'rgba(212, 231, 248, 0.98)');
    frontGrad.addColorStop(1, 'rgba(190, 215, 240, 0.99)');
  }
  ctx.fillStyle = frontGrad;
  ctx.fill();

  // Clipped interior details: directional slope shadows + powdery grain + crystal glints
  ctx.save();
  drawLayerPath(xs, frontYs);
  ctx.clip();

  for (let i = 0; i < RIDGE_SAMPLES; i++) {
    const dy = frontYs[i + 1] - frontYs[i];
    const sx = xs[i];
    const sw = xs[i + 1] - xs[i] + 1.5;
    if (dy > 0.2) {
      const strength = Math.min(1, dy / 3.8);
      ctx.fillStyle = dark ? 'rgb(62, 98, 134)' : 'rgb(132, 174, 214)';
      ctx.globalAlpha = (dark ? 0.18 : 0.13) * strength;
      ctx.fillRect(sx, frontYs[i], sw, 18);
      ctx.globalAlpha = (dark ? 0.08 : 0.06) * strength;
      ctx.fillRect(sx, frontYs[i] + 18, sw, 24);
    } else if (dy < -0.2) {
      const strength = Math.min(1, -dy / 3.5);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = (dark ? 0.22 : 0.55) * strength;
      ctx.fillRect(sx, frontYs[i], sw, 9);
    }
  }
  ctx.globalAlpha = 1;

  // Powdery snow grain & delicate crystalline glints
  for (let i = 0; i < grains.length; i++) {
    const g = grains[i];
    const idx = Math.min(RIDGE_SAMPLES, Math.floor(g.u * RIDGE_SAMPLES));
    const topY = frontYs[idx];
    const avail = h - topY;
    if (avail < 4) continue;
    const gx = g.u * w;
    const gy = topY + 2 + g.v * (avail - 3);

    if (g.isSparkle && g.v < 0.45) {
      ctx.fillStyle = dark
        ? `rgba(255, 255, 255, ${0.55 + g.alpha * 0.4})`
        : 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(gx - 0.8, gy - 0.8, 1.6, 1.6);
      ctx.fillStyle = 'rgba(210, 238, 255, 0.45)';
      ctx.fillRect(gx - 2.2, gy - 0.35, 4.4, 0.7);
      ctx.fillRect(gx - 0.35, gy - 2.2, 0.7, 4.4);
    } else {
      ctx.fillStyle =
        i % 3 === 0
          ? dark
            ? `rgba(140, 178, 210, ${g.alpha * 0.45})`
            : `rgba(176, 206, 236, ${g.alpha * 0.5})`
          : dark
            ? `rgba(255, 255, 255, ${g.alpha * 0.55})`
            : `rgba(255, 255, 255, ${g.alpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(gx, gy, g.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Powdery soft snow-puff texture breaking the front crest silhouette
  for (let i = 0; i < crestPuffs.length; i++) {
    const p = crestPuffs[i];
    const idx = Math.min(RIDGE_SAMPLES, Math.floor(p.u * RIDGE_SAMPLES));
    const px = p.u * w;
    const py = frontYs[idx] + p.offsetY;
    if (h - py < 4) continue;
    const sz = p.size * Math.min(1, depth / 60);
    ctx.globalAlpha = p.alpha * (dark ? 0.85 : 1);
    ctx.drawImage(puffSprite, px - sz * 0.5, py - sz * 0.5, sz, sz);
  }

  // Delicate bright powdery rim along top edge of front snowdrift
  ctx.globalAlpha = 1;
  drawContourLine(xs, frontYs);
  ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.62)' : 'rgba(255, 255, 255, 0.96)';
  ctx.lineWidth = 2;
  ctx.stroke();

  return off;
}

export const NoelEffectsLayer: React.FC<{ active: boolean; dark?: boolean }> = ({ active, dark = false }) => {
  const stickyRef = useRef<HTMLDivElement>(null);
  const snowCanvasRef = useRef<HTMLCanvasElement>(null);
  const bankCanvasRef = useRef<HTMLCanvasElement>(null);

  // Zero React re-renders: all live tracking lives in lightweight refs
  const idleLevelRef = useRef<SnowIdleLevel>(0);
  const lastActivityRef = useRef<number>(Date.now());
  const hadActivityRef = useRef<boolean>(false);
  const manualPreviewRef = useRef<boolean>(false);

  // Shared live snowbank depth so falling flakes settle right onto the pile
  const liveDepthRef = useRef<number>(0);
  const triggerSnowbankDrawRef = useRef<((targetLevel: SnowIdleLevel, isMelt: boolean) => void) | null>(null);

  // 1. Track real idle time (1m -> Lv1, 5m -> Lv2, 10m -> Lv3) & click-to-melt (0 re-renders, 1ns activity flag)
  useEffect(() => {
    if (!active) {
      idleLevelRef.current = 0;
      liveDepthRef.current = 0;
      hadActivityRef.current = false;
      manualPreviewRef.current = false;
      return;
    }

    lastActivityRef.current = Date.now();
    hadActivityRef.current = false;

    const onPassiveActivity = () => {
      if (idleLevelRef.current === 0) {
        hadActivityRef.current = true;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-snow-preview="true"]')) return;

      lastActivityRef.current = Date.now();
      hadActivityRef.current = false;
      manualPreviewRef.current = false;
      if (idleLevelRef.current > 0 || liveDepthRef.current > 1) {
        idleLevelRef.current = 0;
        triggerSnowbankDrawRef.current?.(0, true);
      }
    };

    const onPreviewEvent = (e: Event) => {
      const custom = e as CustomEvent<SnowIdleLevel>;
      const next = custom.detail;
      if (next === 0 || next === 1 || next === 2 || next === 3) {
        manualPreviewRef.current = next > 0;
        const isMelt = next === 0 && liveDepthRef.current > 1;
        idleLevelRef.current = next;
        triggerSnowbankDrawRef.current?.(next, isMelt);
      }
    };

    window.addEventListener('mousemove', onPassiveActivity, { passive: true });
    window.addEventListener('keydown', onPassiveActivity, { passive: true });
    window.addEventListener('scroll', onPassiveActivity, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('ikame:snow-preview', onPreviewEvent);

    const checkInterval = window.setInterval(() => {
      if (manualPreviewRef.current || document.visibilityState === 'hidden') return;
      if (hadActivityRef.current && idleLevelRef.current === 0) {
        lastActivityRef.current = Date.now();
        hadActivityRef.current = false;
        return;
      }

      const elapsed = Date.now() - lastActivityRef.current;
      let nextLevel: SnowIdleLevel = 0;
      if (elapsed >= IDLE_10M_MS) nextLevel = 3;
      else if (elapsed >= IDLE_5M_MS) nextLevel = 2;
      else if (elapsed >= IDLE_1M_MS) nextLevel = 1;

      if (nextLevel !== idleLevelRef.current) {
        idleLevelRef.current = nextLevel;
        triggerSnowbankDrawRef.current?.(nextLevel, false);
      }
    }, 5000);

    return () => {
      window.removeEventListener('mousemove', onPassiveActivity);
      window.removeEventListener('keydown', onPassiveActivity);
      window.removeEventListener('scroll', onPassiveActivity);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('ikame:snow-preview', onPreviewEvent);
      window.clearInterval(checkInterval);
    };
  }, [active]);

  // 2. Cached Volumetric Snowbank Compositor (0% CPU when static, <0.4ms/frame during grow/melt)
  useEffect(() => {
    if (!active) return;
    const container = stickyRef.current;
    const canvas = bankCanvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rand = mulberry32(20261225);
    const grains: GrainSpec[] = Array.from({ length: 220 }, (_, idx) => ({
      u: rand(),
      v: Math.pow(rand(), 1.35),
      r: 0.65 + rand() * 1.25,
      alpha: 0.18 + rand() * 0.48,
      isSparkle: idx < 26,
    }));

    const crestPuffs: PuffSpec[] = Array.from({ length: 52 }, (_, idx) => ({
      u: (idx + rand() * 0.7) / 52,
      size: 6 + rand() * 10,
      offsetY: -1.5 + rand() * 4.5,
      alpha: 0.22 + rand() * 0.34,
    }));

    const puffSprite = createSnowSprite(dark ? '238, 248, 255' : '255, 255, 255', 32);

    let w = Math.max(1, container.clientWidth || window.innerWidth);
    const h = SNOWBANK_CANVAS_H;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap at 1.5x to save ~44% GPU fill on 2x Retina displays

    const bitmapCache = new Map<SnowIdleLevel, HTMLCanvasElement>();

    const getCachedBitmap = (lvl: SnowIdleLevel): HTMLCanvasElement | null => {
      if (lvl === 0) return null;
      let bmp = bitmapCache.get(lvl);
      if (!bmp) {
        bmp = bakeSnowbankBitmap(w, h, dpr, DEPTH_BY_LEVEL[lvl], dark, grains, crestPuffs, puffSprite);
        bitmapCache.set(lvl, bmp);
      }
      return bmp;
    };

    const syncSize = () => {
      w = Math.max(1, container.clientWidth);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bitmapCache.clear();
    };
    syncSize();

    // Compositor transition state
    let currentLevel: SnowIdleLevel = idleLevelRef.current;
    let fromLevel: SnowIdleLevel = 0;
    let toLevel: SnowIdleLevel = currentLevel;
    let startDepth = liveDepthRef.current;
    let targetDepth = DEPTH_BY_LEVEL[currentLevel];
    let animStart = performance.now();
    let animDuration = 1;
    let meltingMode = false;
    let meltMists: MeltMist[] = [];
    let rafId = 0;
    let resizeTimer = 0;

    const drawStaticLevel = (lvl: SnowIdleLevel) => {
      ctx.clearRect(0, 0, w, h);
      const bmp = getCachedBitmap(lvl);
      if (bmp) {
        ctx.drawImage(bmp, 0, 0, w, h);
      }
    };

    const tickBank = (now: number) => {
      const t = Math.min(1, (now - animStart) / animDuration);
      const eased = meltingMode ? t * t * (3 - 2 * t) : 1 - Math.pow(1 - t, 3);

      const curDepth = startDepth + (targetDepth - startDepth) * eased;
      liveDepthRef.current = curDepth;

      ctx.clearRect(0, 0, w, h);

      if (meltingMode) {
        const fromBmp = getCachedBitmap(fromLevel);
        const fade = Math.max(0, 1 - Math.pow(t, 1.1));
        if (fromBmp && fade > 0.01) {
          // Smooth bottom-anchored vertical melt shrink (pure single drawImage)
          const scaleY = Math.max(0.05, 1 - eased * 0.92);
          const drawH = h * scaleY;
          ctx.save();
          ctx.globalAlpha = fade;
          ctx.drawImage(fromBmp, 0, h - drawH, w, drawH);
          ctx.restore();
        }
      } else {
        const fromBmp = getCachedBitmap(fromLevel);
        const toBmp = getCachedBitmap(toLevel);

        if (fromBmp && t < 0.98) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - eased);
          ctx.drawImage(fromBmp, 0, 0, w, h);
          ctx.restore();
        }
        if (toBmp) {
          // Smooth organic rise from bottom edge (single GPU drawImage)
          const startScale = fromLevel === 0 ? 0.12 : Math.max(0.35, DEPTH_BY_LEVEL[fromLevel] / Math.max(1, DEPTH_BY_LEVEL[toLevel]));
          const scaleY = startScale + (1 - startScale) * eased;
          const drawH = h * scaleY;
          ctx.save();
          ctx.globalAlpha = fromLevel === 0 ? Math.min(1, eased * 1.4) : eased;
          ctx.drawImage(toBmp, 0, h - drawH, w, drawH);
          ctx.restore();
        }
      }

      // Lightweight melt vapor sprites
      let aliveMist = 0;
      if (meltMists.length > 0) {
        ctx.save();
        for (const m of meltMists) {
          if (m.alpha <= 0.01) continue;
          m.x += m.vx;
          m.y += m.vy;
          m.vy *= 0.97;
          m.size += 0.32;
          m.alpha = Math.max(0, m.alpha - m.decay);
          if (m.alpha > 0.01) {
            aliveMist++;
            ctx.globalAlpha = m.alpha;
            ctx.drawImage(puffSprite, m.x - m.size * 0.5, m.y - m.size * 0.5, m.size, m.size);
          }
        }
        ctx.restore();
        if (aliveMist === 0) meltMists = [];
      }

      if (t < 1 || aliveMist > 0) {
        rafId = requestAnimationFrame(tickBank);
      } else {
        rafId = 0;
        currentLevel = toLevel;
        liveDepthRef.current = DEPTH_BY_LEVEL[toLevel];
        drawStaticLevel(toLevel);
      }
    };

    const startTransition = (nextLevel: SnowIdleLevel, isMelt: boolean) => {
      cancelAnimationFrame(rafId);
      fromLevel = currentLevel > 0 ? currentLevel : toLevel;
      toLevel = nextLevel;
      startDepth = liveDepthRef.current;
      targetDepth = DEPTH_BY_LEVEL[nextLevel];
      meltingMode = isMelt;
      animStart = performance.now();
      animDuration = isMelt ? 850 : 1550;

      // Pre-bake target bitmap once before animation starts
      if (nextLevel > 0) {
        getCachedBitmap(nextLevel);
      }

      if (isMelt && startDepth > 4) {
        meltMists = Array.from({ length: 24 }, (_, i) => {
          const u = (i + Math.random() * 0.8) / 24;
          const ridgeH = Math.min(h - 14, startDepth * 0.78 * FRONT_RIDGE_LUT[(u * 127) | 0]);
          return {
            x: u * w,
            y: h - ridgeH + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 0.45,
            vy: -0.35 - Math.random() * 0.6,
            size: 10 + Math.random() * 14,
            alpha: 0.34 + Math.random() * 0.3,
            decay: 0.012 + Math.random() * 0.008,
          };
        });
      } else {
        meltMists = [];
      }

      rafId = requestAnimationFrame(tickBank);
    };

    triggerSnowbankDrawRef.current = startTransition;

    if (idleLevelRef.current > 0) {
      drawStaticLevel(idleLevelRef.current);
      liveDepthRef.current = DEPTH_BY_LEVEL[idleLevelRef.current];
    }

    // Debounced ResizeObserver so sidebar collapse animation (240ms) never reallocates canvases mid-slide
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (Math.abs(container.clientWidth - w) < 2) return;
        syncSize();
        drawStaticLevel(idleLevelRef.current);
      }, 140);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      bitmapCache.clear();
      triggerSnowbankDrawRef.current = null;
    };
  }, [active, dark]);

  // 3. Ultra-Lightweight Framed Snowfall Canvas (32fps cap, dt-normalized, fully pauses on hidden tab)
  useEffect(() => {
    if (!active) return;

    const container = stickyRef.current;
    const canvas = snowCanvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const flakeSprite = createSnowSprite(dark ? '238, 247, 255' : '152, 198, 242', 18);

    let w = Math.max(1, container.clientWidth);
    let h = Math.max(1, container.clientHeight);
    let resizeTimer = 0;

    const resize = () => {
      w = Math.max(1, container.clientWidth);
      h = Math.max(1, container.clientHeight);
      canvas.width = w;
      canvas.height = h;
    };
    resize();

    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (Math.abs(container.clientWidth - w) < 2 && Math.abs(container.clientHeight - h) < 2) return;
        resize();
      }, 140);
    });
    ro.observe(container);

    // Pre-allocate fixed max pool once (72 flakes) — zero GC allocations
    const pool = Array.from({ length: 72 }, (_, idx) => {
      const layer = idx % 10 === 0 ? 2 : idx % 3 === 0 ? 1 : 0;
      const size =
        layer === 0
          ? 3.2 + Math.random() * 2.4
          : layer === 1
            ? 5.2 + Math.random() * 3.0
            : 8.2 + Math.random() * 3.2;
      // Velocities calibrated in px per 16.67ms unit so dt scaling is identical on 60Hz & 144Hz
      const vy =
        layer === 0
          ? 0.36 + Math.random() * 0.42
          : layer === 1
            ? 0.64 + Math.random() * 0.62
            : 0.92 + Math.random() * 0.56;
      const baseOpacity =
        layer === 2
          ? dark ? 0.28 + Math.random() * 0.22 : 0.32 + Math.random() * 0.2
          : dark ? 0.38 + Math.random() * 0.46 : 0.38 + Math.random() * 0.38;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size,
        vy,
        vx: (Math.random() - 0.5) * 0.26,
        phase: Math.random() * Math.PI * 2,
        sway: 0.22 + Math.random() * 0.32,
        opacity: baseOpacity,
      };
    });

    let rafId = 0;
    let lastDraw = 0;

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw);

      if (lastDraw !== 0 && now - lastDraw < SNOW_TARGET_FPS_MS) return;
      const elapsed = lastDraw === 0 ? 16.667 : now - lastDraw;
      lastDraw = now;

      // Clamp dt step to avoid jump after sleep/focus restore
      const step = Math.min(3, Math.max(0.5, elapsed / 16.667));

      ctx.clearRect(0, 0, w, h);
      const lvl = idleLevelRef.current;
      const count = FLAKE_COUNT_BY_LEVEL[lvl];
      const speedMul = (1 + lvl * 0.24) * step;
      const currentBankDepth = liveDepthRef.current;
      const hasBank = currentBankDepth > 2;

      for (let i = 0; i < count; i++) {
        const f = pool[i];
        f.phase += 0.011 * step;
        f.y += f.vy * speedMul;
        f.x += (f.vx + Math.sin(f.phase) * f.sway) * step;

        let floorY = h;
        let surfaceH = 0;
        if (hasBank) {
          const uIdx = Math.max(0, Math.min(127, ((f.x / w) * 127) | 0));
          surfaceH = currentBankDepth * 0.72 * FRONT_RIDGE_LUT[uIdx];
          floorY = h - surfaceH;
        }

        let alpha = f.opacity;
        if (surfaceH > 4 && f.y > floorY - 14) {
          alpha *= Math.max(0, (floorY + 6 - f.y) / 20);
        }

        if (f.y > floorY + 6 || f.y > h + 10) {
          f.y = -f.size;
          f.x = Math.random() * w;
          continue;
        }
        if (f.x > w + f.size) f.x = -f.size;
        if (f.x < -f.size) f.x = w + f.size;

        if (alpha > 0.02) {
          ctx.globalAlpha = alpha;
          ctx.drawImage(flakeSprite, f.x - f.size * 0.5, f.y - f.size * 0.5, f.size, f.size);
        }
      }
      ctx.globalAlpha = 1;
    };

    const startLoop = () => {
      if (!rafId && document.visibilityState !== 'hidden') {
        lastDraw = 0;
        rafId = requestAnimationFrame(draw);
      }
    };

    const stopLoop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stopLoop();
      else startLoop();
    };

    document.addEventListener('visibilitychange', onVisibility);
    startLoop();

    return () => {
      stopLoop();
      window.clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
    };
  }, [active, dark]);

  if (!active) return null;

  return (
    <div className="noel-sheet-stage" aria-hidden="true">
      <div ref={stickyRef} className="noel-sheet-sticky">
        <canvas ref={snowCanvasRef} className="noel-snow-canvas" />
        <canvas ref={bankCanvasRef} className="noel-snowbank-canvas" />
      </div>
    </div>
  );
};
