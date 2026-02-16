"use client";

import { useEffect, useRef, useState } from "react";
import SynapseBackground from "./SynapseBackground";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SIM = 256;
const NUM_NODES = 40;
const MAX_CONNS = 200;
const CONN_DIST = 0.18;
const ACTIV_RADIUS = 0.12;

/* ------------------------------------------------------------------ */
/*  WGSL Compute Shader — synapse grid rendering                       */
/* ------------------------------------------------------------------ */

const computeShaderCode = /* wgsl */ `

struct Uniforms {
  width:     f32,
  height:    f32,
  time:      f32,
  numNodes:  f32,
  numConns:  f32,
  connDist:  f32,
  pad1:      f32,
  pad2:      f32,
};

@group(0) @binding(0) var<uniform>            u:       Uniforms;
@group(0) @binding(1) var<storage, read>      nodes:   array<vec4f>;
@group(0) @binding(2) var<storage, read>      conns:   array<vec4u>;
@group(0) @binding(3) var<storage, read>      gridIn:  array<vec4f>;
@group(0) @binding(4) var<storage, read_write> gridOut: array<vec4f>;

const CYAN   = vec3f(0.0, 0.898, 1.0);
const PURPLE = vec3f(0.706, 0.29, 1.0);

fn nodeColor(h: f32) -> vec3f { return mix(CYAN, PURPLE, h); }

fn distToSeg(p: vec2f, a: vec2f, b: vec2f) -> f32 {
  let ab = b - a;
  let len2 = dot(ab, ab);
  if (len2 < 0.001) { return length(p - a); }
  let t = clamp(dot(p - a, ab) / len2, 0.0, 1.0);
  return length(p - (a + ab * t));
}

fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q += dot(q, q + 45.32);
  return fract(q.x * q.y);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) g: vec3u) {
  let w = u32(u.width);
  let h = u32(u.height);
  if (g.x >= w || g.y >= h) { return; }

  let idx = g.y * w + g.x;
  let pos = vec2f(f32(g.x), f32(g.y));
  let res = vec2f(u.width, u.height);

  /* temporal decay of previous frame */
  let prev = gridIn[idx] * 0.88;

  var color = vec3f(0.0);
  var alpha = 0.0;
  let nn = i32(u.numNodes);
  let nc = i32(u.numConns);

  /* ---- connections ---- */
  for (var c = 0; c < nc; c++) {
    let pair = conns[c];          /* .x = indexA, .y = indexB */
    let nA = nodes[pair.x];
    let nB = nodes[pair.y];
    let pA = nA.xy * res;
    let pB = nB.xy * res;

    /* early skip */
    if (min(length(pos - pA), length(pos - pB)) > length(pA - pB) + 10.0) {
      continue;
    }

    let d = distToSeg(pos, pA, pB);
    let lw = 1.5;
    if (d < lw * 6.0) {
      let nDist  = length(nA.xy - nB.xy);
      let cStr   = max(1.0 - nDist / u.connDist, 0.0);
      let avgAct = (nA.z + nB.z) * 0.5;
      let glow   = exp(-d * d / (lw * lw * 2.0));
      let bright = cStr * (0.1 + avgAct * 0.9);
      let hue    = (nA.w + nB.w) * 0.5;

      /* travelling pulse */
      let seg  = pB - pA;
      let tAl  = clamp(dot(pos - pA, seg) / max(dot(seg, seg), 0.001), 0.0, 1.0);
      let pulse = sin(tAl * 12.566 - u.time * 4.0 + hash21(nA.xy) * 6.283) * 0.5 + 0.5;
      let pStr  = avgAct * pulse * 0.3;

      color += nodeColor(hue) * glow * (bright + pStr);
      alpha += glow * (bright + pStr) * 0.4;
    }
  }

  /* ---- nodes ---- */
  for (var i = 0; i < nn; i++) {
    let n  = nodes[i];
    let nP = n.xy * res;
    let d  = length(pos - nP);

    let bR   = 4.0 + n.z * 6.0;
    let core = exp(-d * d / (bR * bR));

    let hR   = bR * 7.0;
    let halo = exp(-d * d / (hR * hR)) * 0.25;

    let col    = nodeColor(n.w);
    let bright = 0.2 + n.z * 2.2;
    let pulse  = sin(u.time * 1.5 + n.w * 6.283 + f32(i) * 0.5) * 0.1 + 1.0;

    color += col * (core + halo) * bright * pulse;
    alpha += (core * 0.6 + halo * 0.1) * bright;
  }

  let fresh  = vec4f(color, alpha);
  let result = max(fresh, prev);
  gridOut[idx] = clamp(result, vec4f(0.0), vec4f(3.0));
}
`;

/* ------------------------------------------------------------------ */
/*  WGSL Render Shader — post-process + fullscreen quad                */
/* ------------------------------------------------------------------ */

const renderShaderCode = /* wgsl */ `

struct RenderUniforms {
  width:  f32,
  height: f32,
  time:   f32,
  pad:    f32,
};

struct VertexOutput {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
};

@group(0) @binding(0) var<uniform>       ru:   RenderUniforms;
@group(0) @binding(1) var<storage, read> grid: array<vec4f>;

fn texel(x: i32, y: i32) -> vec4f {
  return grid[u32(clamp(y, 0, i32(ru.height) - 1)) * u32(ru.width)
            + u32(clamp(x, 0, i32(ru.width) - 1))];
}

fn sampleBilinear(uv: vec2f) -> vec4f {
  let p  = uv * vec2f(ru.width, ru.height) - 0.5;
  let ix = i32(floor(p.x));
  let iy = i32(floor(p.y));
  let fx = fract(p.x);
  let fy = fract(p.y);
  return mix(mix(texel(ix, iy),     texel(ix + 1, iy),     fx),
             mix(texel(ix, iy + 1), texel(ix + 1, iy + 1), fx), fy);
}

fn hashGrain(p: vec2f) -> f32 {
  var q = fract(p * vec2f(443.897, 441.423));
  q += dot(q, q + 19.19);
  return fract(q.x * q.y);
}

@vertex
fn vert(@builtin(vertex_index) vi: u32) -> VertexOutput {
  var positions = array<vec2f, 4>(
    vec2f(-1.0, -1.0),
    vec2f( 1.0, -1.0),
    vec2f(-1.0,  1.0),
    vec2f( 1.0,  1.0),
  );
  var out: VertexOutput;
  out.pos = vec4f(positions[vi], 0.0, 1.0);
  out.uv  = positions[vi] * 0.5 + 0.5;
  out.uv.y = 1.0 - out.uv.y;
  return out;
}

@fragment
fn frag(in: VertexOutput) -> @location(0) vec4f {
  let uv = in.uv;
  let tx = 1.0 / ru.width;
  let ty = 1.0 / ru.height;

  /* 1. Bilinear sample with 3x3 soft blur */
  var c = sampleBilinear(uv).rgb * 0.36;
  c += sampleBilinear(uv + vec2f( tx, 0.0)).rgb * 0.11;
  c += sampleBilinear(uv + vec2f(-tx, 0.0)).rgb * 0.11;
  c += sampleBilinear(uv + vec2f(0.0,  ty)).rgb * 0.11;
  c += sampleBilinear(uv + vec2f(0.0, -ty)).rgb * 0.11;
  c += sampleBilinear(uv + vec2f( tx,  ty)).rgb * 0.05;
  c += sampleBilinear(uv + vec2f( tx, -ty)).rgb * 0.05;
  c += sampleBilinear(uv + vec2f(-tx, -ty)).rgb * 0.05;
  c += sampleBilinear(uv + vec2f(-tx,  ty)).rgb * 0.05;

  /* 2. Gentle S-curve contrast */
  c = c * 1.2;
  c = c * c * (3.0 - 2.0 * c);

  /* 3. Chromatic aberration */
  let ca = 1.2 / ru.width;
  c.r += sampleBilinear(uv + vec2f(ca, 0.0)).r * 0.12;
  c.b += sampleBilinear(uv - vec2f(ca, 0.0)).b * 0.12;

  /* 4. Film grain */
  let grain = (hashGrain(uv * 1000.0 + ru.time * 100.0) - 0.5) * 0.04;
  c += grain;

  /* 5. Vignette */
  let d   = length(uv - 0.5);
  let vig = smoothstep(0.85, 0.15, d);

  /* 6. Alpha from luminance */
  let lum = max(c.r, max(c.g, c.b));
  return vec4f(c * vig, lum * 0.4);
}
`;

/* ------------------------------------------------------------------ */
/*  JS helpers                                                         */
/* ------------------------------------------------------------------ */

interface SNode {
  x: number; y: number;
  vx: number; vy: number;
  activation: number;
  hue: number;
  phase: number;
}

function smoothNoise(x: number, y: number, t: number, phase: number): number {
  return (
    Math.sin(x * 8.3 + t * 0.7 + phase) * 0.4 +
    Math.sin(y * 6.7 + t * 0.5 + phase * 1.3) * 0.35 +
    Math.sin((x + y) * 5.1 + t * 0.3 + phase * 0.7) * 0.25
  );
}

/* ------------------------------------------------------------------ */
/*  React component                                                    */
/* ------------------------------------------------------------------ */

export default function SynapseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.gpu) {
      setFallback(true);
      return;
    }

    let dead = false;
    let animId = 0;

    /* ---- pointer state ---- */
    const m = { x: 0.5, y: 0.5 };
    const onMove = (e: MouseEvent) => {
      m.x = e.clientX / window.innerWidth;
      m.y = e.clientY / window.innerHeight;
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        m.x = e.touches[0].clientX / window.innerWidth;
        m.y = e.touches[0].clientY / window.innerHeight;
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch);

    /* ---- initialise nodes ---- */
    const nodes: SNode[] = Array.from({ length: NUM_NODES }, () => ({
      x: 0.1 + Math.random() * 0.8,
      y: 0.1 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.001,
      vy: (Math.random() - 0.5) * 0.001,
      activation: 0,
      hue: Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));

    (async () => {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter || dead) { setFallback(true); return; }
      const dev = await adapter.requestDevice();
      if (dead) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        canvas.width = Math.floor(window.innerWidth * 0.5);
        canvas.height = Math.floor(window.innerHeight * 0.5);
      };
      resize();
      window.addEventListener("resize", resize);

      const ctx = canvas.getContext("webgpu");
      if (!ctx) { setFallback(true); return; }

      const fmt = navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({ device: dev, format: fmt, alphaMode: "premultiplied" });

      /* ---- Buffers ---- */
      const N = SIM * SIM;

      const ub = dev.createBuffer({
        size: 32,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const nodeBuf = dev.createBuffer({
        size: NUM_NODES * 16,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      const connBuf = dev.createBuffer({
        size: MAX_CONNS * 16,          /* vec4u per connection */
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      const gb = [0, 1].map(() =>
        dev.createBuffer({ size: N * 16, usage: GPUBufferUsage.STORAGE }),
      );
      const rb = dev.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      /* ---- Compute pipeline ---- */
      const cp = dev.createComputePipeline({
        layout: "auto",
        compute: {
          module: dev.createShaderModule({ code: computeShaderCode }),
          entryPoint: "main",
        },
      });
      const cbg = [0, 1].map((s) =>
        dev.createBindGroup({
          layout: cp.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: ub } },
            { binding: 1, resource: { buffer: nodeBuf } },
            { binding: 2, resource: { buffer: connBuf } },
            { binding: 3, resource: { buffer: gb[s] } },
            { binding: 4, resource: { buffer: gb[1 - s] } },
          ],
        }),
      );

      /* ---- Render pipeline ---- */
      const rmod = dev.createShaderModule({ code: renderShaderCode });
      const rp = dev.createRenderPipeline({
        layout: "auto",
        vertex: { module: rmod, entryPoint: "vert" },
        fragment: {
          module: rmod,
          entryPoint: "frag",
          targets: [{
            format: fmt,
            blend: {
              color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha", operation: "add" },
              alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" },
            },
          }],
        },
        primitive: { topology: "triangle-strip" },
      });
      const rbg = [0, 1].map((s) =>
        dev.createBindGroup({
          layout: rp.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: rb } },
            { binding: 1, resource: { buffer: gb[1 - s] } },
          ],
        }),
      );

      /* ---- Reusable typed arrays ---- */
      const nodeData = new Float32Array(NUM_NODES * 4);
      const connData = new Uint32Array(MAX_CONNS * 4);

      /* ---- Animation loop ---- */
      let fr = 0;
      const t0 = performance.now();

      const loop = () => {
        if (dead) return;
        animId = requestAnimationFrame(loop);

        const t = (performance.now() - t0) / 1000;
        const s = fr % 2;

        /* ---- Node simulation (JS) ---- */
        for (let i = 0; i < NUM_NODES; i++) {
          const n = nodes[i];

          const angle = smoothNoise(n.x, n.y, t, n.phase) * Math.PI;
          n.vx += Math.cos(angle) * 0.00015;
          n.vy += Math.sin(angle) * 0.00015;

          /* centering force — pulls nodes toward center */
          n.vx += (0.5 - n.x) * 0.0006;
          n.vy += (0.5 - n.y) * 0.0006;

          /* node-to-node repulsion — prevents clustering */
          for (let j = 0; j < NUM_NODES; j++) {
            if (i === j) continue;
            const rx = n.x - nodes[j].x;
            const ry = n.y - nodes[j].y;
            const rd = rx * rx + ry * ry;
            if (rd < 0.02 && rd > 0.0001) {
              const rf = 0.000015 / rd;
              n.vx += rx * rf;
              n.vy += ry * rf;
            }
          }

          n.vx *= 0.992;
          n.vy *= 0.992;
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0.08) n.vx += 0.001;
          if (n.x > 0.92) n.vx -= 0.001;
          if (n.y < 0.08) n.vy += 0.001;
          if (n.y > 0.92) n.vy -= 0.001;

          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < ACTIV_RADIUS) {
            n.activation = Math.max(n.activation, (1 - dist / ACTIV_RADIUS) * 0.9);
          }

          n.activation *= 0.965;
        }

        /* ---- Signal propagation ---- */
        for (let i = 0; i < NUM_NODES; i++) {
          for (let j = i + 1; j < NUM_NODES; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONN_DIST) {
              const f = (1 - dist / CONN_DIST) * 0.2;
              if (nodes[i].activation > nodes[j].activation + 0.02) {
                nodes[j].activation += (nodes[i].activation - nodes[j].activation) * f;
              } else if (nodes[j].activation > nodes[i].activation + 0.02) {
                nodes[i].activation += (nodes[j].activation - nodes[i].activation) * f;
              }
            }
          }
        }

        /* ---- Pack node data ---- */
        for (let i = 0; i < NUM_NODES; i++) {
          nodeData[i * 4]     = nodes[i].x;
          nodeData[i * 4 + 1] = nodes[i].y;
          nodeData[i * 4 + 2] = nodes[i].activation;
          nodeData[i * 4 + 3] = nodes[i].hue;
        }

        /* ---- Build connection list ---- */
        let numConns = 0;
        for (let i = 0; i < NUM_NODES && numConns < MAX_CONNS; i++) {
          for (let j = i + 1; j < NUM_NODES && numConns < MAX_CONNS; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            if (dx * dx + dy * dy < CONN_DIST * CONN_DIST) {
              connData[numConns * 4]     = i;
              connData[numConns * 4 + 1] = j;
              connData[numConns * 4 + 2] = 0;
              connData[numConns * 4 + 3] = 0;
              numConns++;
            }
          }
        }

        /* ---- Upload to GPU ---- */
        dev.queue.writeBuffer(ub, 0, new Float32Array([
          SIM, SIM, t, NUM_NODES,
          numConns, CONN_DIST, 0, 0,
        ]));
        dev.queue.writeBuffer(nodeBuf, 0, nodeData);
        dev.queue.writeBuffer(connBuf, 0, connData);
        dev.queue.writeBuffer(rb, 0, new Float32Array([SIM, SIM, t, 0]));

        /* ---- GPU passes ---- */
        const enc = dev.createCommandEncoder();

        const cpass = enc.beginComputePass();
        cpass.setPipeline(cp);
        cpass.setBindGroup(0, cbg[s]);
        cpass.dispatchWorkgroups(SIM / 8, SIM / 8);
        cpass.end();

        const rpass = enc.beginRenderPass({
          colorAttachments: [{
            view: ctx.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: "clear" as GPULoadOp,
            storeOp: "store" as GPUStoreOp,
          }],
        });
        rpass.setPipeline(rp);
        rpass.setBindGroup(0, rbg[1 - s]);
        rpass.draw(4);
        rpass.end();

        dev.queue.submit([enc.finish()]);
        fr++;
      };

      animId = requestAnimationFrame(loop);

      return () => {
        dead = true;
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", resize);
      };
    })().then((cleanup) => {
      if (cleanup) cleanupRef.current = cleanup;
    });

    const cleanupRef = { current: null as (() => void) | null };

    return () => {
      dead = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  if (fallback) return <SynapseBackground />;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ width: "100vw", height: "100vh", zIndex: 1 }}
    />
  );
}
