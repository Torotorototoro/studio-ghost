"use client";

import { useEffect, useRef } from "react";

/**
 * Flow Field Particle System
 * Inspired by OJPP's Living Canvas — Perlin-like noise field driving
 * hundreds of particles with trails, mouse interaction, and color palettes.
 */

// Simple multi-octave noise (no external deps)
function noise2D(x: number, y: number): number {
  // Combination of sine waves at different frequencies to approximate noise
  const n =
    Math.sin(x * 1.2 + y * 0.9) * 0.5 +
    Math.sin(x * 0.7 - y * 1.3) * 0.3 +
    Math.sin(x * 2.1 + y * 1.7) * 0.15 +
    Math.cos(x * 0.5 + y * 2.2) * 0.25 +
    Math.sin(x * 3.1 - y * 0.4) * 0.1;
  return n;
}

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
    const HUES = [185, 195, 270, 280, 190, 260, 200, 175];

    const PARTICLE_COUNT = Math.min(500, Math.floor((width * height) / 3000));
    const particles: Particle[] = [];

    function createParticle(randomY = true): Particle {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -5,
        speed: 0.5 + Math.random() * 1.8,
        life: 0,
        maxLife: 150 + Math.random() * 400,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
      };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle();
      p.life = Math.floor(Math.random() * p.maxLife); // stagger
      particles.push(p);
    }

    // Trail effect: semi-transparent background fade
    function fadeTrails() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(2, 6, 23, 0.04)";
      ctx.fillRect(0, 0, width, height);
    }

    function getFlowAngle(x: number, y: number): number {
      const scale = 0.003;
      const n = noise2D(x * scale + time * 0.4, y * scale + time * 0.3);
      return n * Math.PI * 2;
    }

    function animate() {
      if (!ctx) return;

      fadeTrails();
      time += 0.008;

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (
          p.life > p.maxLife ||
          p.x < -20 ||
          p.x > width + 20 ||
          p.y < -20 ||
          p.y > height + 20
        ) {
          particles[i] = createParticle(true);
          continue;
        }

        // Flow field
        let angle = getFlowAngle(p.x, p.y);

        // Mouse curl influence
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 200;
          if (dist < radius) {
            const influence = 1 - dist / radius;
            const curlAngle = Math.atan2(dy, dx) + Math.PI / 2;
            angle += (curlAngle - angle) * influence * 0.6;
          }
        }

        p.x += Math.cos(angle) * p.speed;
        p.y += Math.sin(angle) * p.speed;

        // Fade in/out based on life
        const lifeRatio = p.life / p.maxLife;
        let alpha: number;
        if (lifeRatio < 0.1) {
          alpha = lifeRatio / 0.1;
        } else if (lifeRatio > 0.8) {
          alpha = (1 - lifeRatio) / 0.2;
        } else {
          alpha = 1;
        }
        alpha *= 0.6;

        const sat = 80 + Math.sin(p.life * 0.02) * 15;
        const light = 55 + Math.sin(p.life * 0.03) * 10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${sat}%, ${light}%, ${alpha})`;
        ctx.fill();
      }

      // Draw a few bright nodes
      if (Math.random() < 0.02) {
        const bx = Math.random() * width;
        const by = Math.random() * height;
        const hue = HUES[Math.floor(Math.random() * HUES.length)];
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, 40);
        grad.addColorStop(0, `hsla(${hue}, 90%, 70%, 0.08)`);
        grad.addColorStop(1, `hsla(${hue}, 90%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(bx, by, 40, 0, Math.PI * 2);
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
