"use client";

import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Canvas 2D fallback — synapse network visualisation                 */
/*  Used when WebGPU is not available.                                 */
/* ------------------------------------------------------------------ */

const NUM_NODES = 40;
const CONN_RATIO = 0.15; // fraction of max(w,h) for connection threshold

const CYAN: [number, number, number] = [0, 229, 255];
const PURPLE: [number, number, number] = [180, 74, 255];

interface SNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  activation: number;
  hue: number;
  phase: number;
}

function lerpColor(h: number): [number, number, number] {
  return [
    CYAN[0] + (PURPLE[0] - CYAN[0]) * h,
    CYAN[1] + (PURPLE[1] - CYAN[1]) * h,
    CYAN[2] + (PURPLE[2] - CYAN[2]) * h,
  ];
}

export default function SynapseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const sizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    sizeCanvas();

    let animId: number;
    let time = 0;

    const cols = Math.ceil(Math.sqrt(NUM_NODES * 1.6));
    const rows = Math.ceil(NUM_NODES / cols);
    const nodes: SNode[] = Array.from({ length: NUM_NODES }, (_, idx) => ({
      x: width * (0.08 + ((idx % cols) / (cols - 1)) * 0.84 + (Math.random() - 0.5) * 0.06),
      y: height * (0.08 + (Math.floor(idx / cols) / (rows - 1)) * 0.84 + (Math.random() - 0.5) * 0.06),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      activation: 0,
      hue: Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));

    function animate() {
      if (!ctx) return;

      ctx.fillStyle = "rgba(2, 6, 23, 0.12)";
      ctx.fillRect(0, 0, width, height);

      time += 0.008;
      const maxDim = Math.max(width, height);
      const connDist = CONN_RATIO * maxDim;
      const activRadius = 0.12 * maxDim;
      const mouse = mouseRef.current;

      /* ---- update nodes ---- */
      const cx = width * 0.5;
      const cy = height * 0.5;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const nx = n.x / maxDim;
        const ny = n.y / maxDim;
        const angle =
          (Math.sin(nx * 8 + time * 0.7 + n.phase) +
            Math.sin(ny * 6 + time * 0.5) +
            Math.sin((nx + ny) * 5 + time * 0.3)) *
          0.5;
        n.vx += Math.cos(angle) * 0.015;
        n.vy += Math.sin(angle) * 0.015;

        /* soft centering — only when far from center */
        const dcx = n.x - cx;
        const dcy = n.y - cy;
        const cd = Math.sqrt(dcx * dcx + dcy * dcy);
        const maxR = maxDim * 0.3;
        if (cd > maxR) {
          const pull = (cd - maxR) * 0.001;
          n.vx -= (dcx / cd) * pull;
          n.vy -= (dcy / cd) * pull;
        }

        /* node-to-node repulsion */
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const rx = n.x - nodes[j].x;
          const ry = n.y - nodes[j].y;
          const rd = rx * rx + ry * ry;
          const minDist = maxDim * 0.1;
          if (rd < minDist * minDist && rd > 1) {
            const rf = 0.8 / Math.max(rd, 100);
            n.vx += rx * rf;
            n.vy += ry * rf;
          }
        }

        n.vx *= 0.985;
        n.vy *= 0.985;
        n.x += n.vx;
        n.y += n.vy;

        const margin = 60;
        if (n.x < margin) n.vx += 0.05;
        if (n.x > width - margin) n.vx -= 0.05;
        if (n.y < margin) n.vy += 0.05;
        if (n.y > height - margin) n.vy -= 0.05;

        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < activRadius) {
            n.activation = Math.max(
              n.activation,
              (1 - dist / activRadius) * 0.9,
            );
          }
        }
        n.activation *= 0.965;
      }

      /* ---- propagate activation ---- */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connDist) {
            const f = (1 - dist / connDist) * 0.25;
            if (nodes[i].activation > nodes[j].activation + 0.05) {
              nodes[j].activation +=
                (nodes[i].activation - nodes[j].activation) * f;
            } else if (nodes[j].activation > nodes[i].activation + 0.05) {
              nodes[i].activation +=
                (nodes[j].activation - nodes[i].activation) * f;
            }
          }
        }
      }

      /* ---- draw connections ---- */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connDist) {
            const str = 1 - dist / connDist;
            const avgAct = (nodes[i].activation + nodes[j].activation) * 0.5;
            const alpha = str * (0.06 + avgAct * 0.35);
            const [r, g, b] = lerpColor(
              (nodes[i].hue + nodes[j].hue) * 0.5,
            );
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
            ctx.lineWidth = 0.3 + str * avgAct * 2;
            ctx.stroke();
          }
        }
      }

      /* ---- draw nodes ---- */
      for (const n of nodes) {
        const [r, g, b] = lerpColor(n.hue);
        const radius = 3 + n.activation * 5;
        const alpha = 0.25 + n.activation * 0.75;

        const glowR = radius * 8;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        grad.addColorStop(0, `rgba(${r | 0},${g | 0},${b | 0},${alpha * 0.25})`);
        grad.addColorStop(1, `rgba(${r | 0},${g | 0},${b | 0},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    }

    animate();

    const onResize = () => sizeCanvas();
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onMouseLeave = () => {
      mouseRef.current = { ...mouseRef.current, active: false };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          active: true,
        };
      }
    };
    const onTouchEnd = () => {
      mouseRef.current = { ...mouseRef.current, active: false };
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
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
