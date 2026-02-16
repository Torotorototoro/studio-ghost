"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityDir: number;
  life: number;
}

export default function GhostParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = document.documentElement.scrollHeight;

    canvas.width = width;
    canvas.height = height;

    const PARTICLE_COUNT = 40;
    const particles: Particle[] = [];

    function createParticle(): Particle {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.3,
        opacityDir: Math.random() * 0.005 + 0.002,
        life: Math.random() * 1000,
      };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.opacity += p.opacityDir;
        p.life--;

        if (p.opacity >= 0.4 || p.opacity <= 0) {
          p.opacityDir *= -1;
        }

        // Reset particle if out of bounds or dead
        if (p.y < -10 || p.life <= 0 || p.x < -10 || p.x > width + 10) {
          particles[i] = createParticle();
          particles[i].y = height + 10;
        }

        // Draw ghost particle with glow
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(255, 255, 255, 0.5)";

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = document.documentElement.scrollHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    // Re-measure height periodically as page loads
    const resizeInterval = setInterval(() => {
      const newHeight = document.documentElement.scrollHeight;
      if (newHeight !== height) {
        height = newHeight;
        canvas.height = height;
      }
    }, 2000);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      clearInterval(resizeInterval);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
