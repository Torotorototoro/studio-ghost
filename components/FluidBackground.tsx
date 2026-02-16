"use client";

import { useEffect, useRef } from "react";

/**
 * #6 — Flow Field Particle System with Proper Perlin Noise
 * Classic permutation-table Perlin noise for organic flow.
 * 500+ particles with trails, mouse curl interaction, DPR scaling.
 */

// ===== Perlin Noise Implementation (no external deps) =====
const PERM = new Uint8Array(512);
const GRAD = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

// Initialize permutation table
(function initPerlin() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Fisher-Yates shuffle with fixed seed
  let seed = 42;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
})();

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function dot2(g: number[], x: number, y: number): number {
  return g[0] * x + g[1] * y;
}

function perlin2(x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const aa = PERM[PERM[xi] + yi];
  const ab = PERM[PERM[xi] + yi + 1];
  const ba = PERM[PERM[xi + 1] + yi];
  const bb = PERM[PERM[xi + 1] + yi + 1];

  const g00 = GRAD[aa & 7];
  const g10 = GRAD[ba & 7];
  const g01 = GRAD[ab & 7];
  const g11 = GRAD[bb & 7];

  const n00 = dot2(g00, xf, yf);
  const n10 = dot2(g10, xf - 1, yf);
  const n01 = dot2(g01, xf, yf - 1);
  const n11 = dot2(g11, xf - 1, yf - 1);

  return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v);
}

// Multi-octave fractal noise
function fbm(x: number, y: number, octaves = 3): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxVal = 0;

  for (let i = 0; i < octaves; i++) {
    value += perlin2(x * frequency, y * frequency) * amplitude;
    maxVal += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxVal;
}

// ===== Particle System =====

interface Particle {
  x: number;
  y: number;
  speed: number;
  life: number;
  maxLife: number;
  hue: number;
}

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    let animationId: number;
    let time = 0;

    // Ghost palette — cyan and purple hues
    const HUES = [180, 185, 190, 195, 200, 260, 270, 280];

    const PARTICLE_COUNT = Math.min(600, Math.floor((width * height) / 2500));
    const particles: Particle[] = [];

    function createParticle(): Particle {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.4 + Math.random() * 1.6,
        life: 0,
        maxLife: 100 + Math.random() * 500,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
      };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle();
      p.life = Math.floor(Math.random() * p.maxLife);
      particles.push(p);
    }

    // Trail fade: 4% opacity per frame (like OJPP)
    function fadeTrails() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(2, 6, 23, 0.04)";
      ctx.fillRect(0, 0, width, height);
    }

    function getFlowAngle(px: number, py: number): number {
      const scale = 0.002;
      const n = fbm(px * scale + time * 0.3, py * scale + time * 0.2, 3);
      return n * Math.PI * 2.5;
    }

    function animate() {
      if (!ctx) return;

      fadeTrails();
      time += 0.006;

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (
          p.life > p.maxLife ||
          p.x < -30 || p.x > width + 30 ||
          p.y < -30 || p.y > height + 30
        ) {
          particles[i] = createParticle();
          continue;
        }

        let angle = getFlowAngle(p.x, p.y);

        // Mouse curl influence
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const radius = 200;
          if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq);
            const influence = 1 - dist / radius;
            const curlAngle = Math.atan2(dy, dx) + Math.PI / 2;
            angle += (curlAngle - angle) * influence * 0.6;
            // Also add a slight push force
            p.x += dx * influence * 0.02;
            p.y += dy * influence * 0.02;
          }
        }

        p.x += Math.cos(angle) * p.speed;
        p.y += Math.sin(angle) * p.speed;

        // Life-based alpha fade in/out
        const lifeRatio = p.life / p.maxLife;
        let alpha: number;
        if (lifeRatio < 0.08) {
          alpha = lifeRatio / 0.08;
        } else if (lifeRatio > 0.85) {
          alpha = (1 - lifeRatio) / 0.15;
        } else {
          alpha = 1;
        }
        alpha *= 0.55;

        const sat = 75 + Math.sin(p.life * 0.02) * 20;
        const light = 55 + Math.sin(p.life * 0.03) * 15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${sat}%, ${light}%, ${alpha})`;
        ctx.fill();
      }

      // Occasional bright intersection nodes
      if (Math.random() < 0.015) {
        const bx = Math.random() * width;
        const by = Math.random() * height;
        const hue = HUES[Math.floor(Math.random() * HUES.length)];
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, 50);
        grad.addColorStop(0, `hsla(${hue}, 90%, 70%, 0.06)`);
        grad.addColorStop(1, `hsla(${hue}, 90%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(bx, by, 50, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { ...mouseRef.current, active: false };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
