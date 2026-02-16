"use client";

import { useEffect, useRef, useState } from "react";
import FluidBackground from "./FluidBackground";

/* ------------------------------------------------------------------ */
/*  WGSL Compute Shader — fluid simulation                            */
/* ------------------------------------------------------------------ */

const computeShaderCode = /* wgsl */ `

struct Uniforms {
  width: f32,
  height: f32,
  time: f32,
  dt: f32,
  mouseX: f32,
  mouseY: f32,
  mouseDX: f32,
  mouseDY: f32,
};

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read>       velIn:  array<vec2f>;
@group(0) @binding(2) var<storage, read_write> velOut: array<vec2f>;
@group(0) @binding(3) var<storage, read>       dyeIn:  array<vec4f>;
@group(0) @binding(4) var<storage, read_write> dyeOut: array<vec4f>;

fn id(x: i32, y: i32) -> u32 {
  return u32(clamp(y, 0, i32(u.height) - 1)) * u32(u.width) + u32(clamp(x, 0, i32(u.width) - 1));
}
fn sv(q: vec2f) -> vec2f { return velIn[id(i32(q.x), i32(q.y))]; }
fn sd(q: vec2f) -> vec4f { return dyeIn[id(i32(q.x), i32(q.y))]; }

/* ---- noise helpers ---- */

fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q += dot(q, q + 45.32);
  return fract(q.x * q.y);
}

fn hash22(p: vec2f) -> vec2f {
  let n = vec2f(dot(p, vec2f(127.1, 311.7)), dot(p, vec2f(269.5, 183.3)));
  return fract(sin(n) * 43758.5453) * 2.0 - 1.0;
}

fn noise2(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let sm = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, sm.x), mix(c, d, sm.x), sm.y);
}

fn fbm(p: vec2f, t: f32) -> f32 {
  var v = 0.0;
  var a = 0.5;
  var q = p;
  for (var i = 0; i < 4; i++) {
    v += a * noise2(q + t * 0.3);
    q = q * 2.01 + vec2f(1.7, 1.2);
    a *= 0.5;
  }
  return v;
}

fn curl(p: vec2f, t: f32) -> vec2f {
  let e = 0.5;
  let dx = fbm(p + vec2f(e, 0.0), t) - fbm(p - vec2f(e, 0.0), t);
  let dy = fbm(p + vec2f(0.0, e), t) - fbm(p - vec2f(0.0, e), t);
  return vec2f(dy, -dx) / (2.0 * e);
}

fn hsv2rgb(h: f32, s: f32, v: f32) -> vec3f {
  let c = v * s;
  let hp = fract(h) * 6.0;
  let x = c * (1.0 - abs(hp % 2.0 - 1.0));
  let m = v - c;
  var r = vec3f(0.0);
  if (hp < 1.0) { r = vec3f(c, x, 0.0); }
  else if (hp < 2.0) { r = vec3f(x, c, 0.0); }
  else if (hp < 3.0) { r = vec3f(0.0, c, x); }
  else if (hp < 4.0) { r = vec3f(0.0, x, c); }
  else if (hp < 5.0) { r = vec3f(x, 0.0, c); }
  else { r = vec3f(c, 0.0, x); }
  return r + m;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) g: vec3u) {
  let w = u32(u.width);
  let h = u32(u.height);
  if (g.x >= w || g.y >= h) { return; }

  let i = g.y * w + g.x;
  let pos = vec2f(f32(g.x), f32(g.y));
  let res = vec2f(u.width, u.height);

  /* 1. Semi-Lagrangian advection */
  let vel = velIn[i];
  let bp = pos - vel * u.dt * 12.0;
  var nv = sv(bp) * 0.995;
  var nd = sd(bp) * 0.992;

  /* 2. Curl noise turbulence */
  let uv = pos / res;
  let cn = curl(uv * 6.0, u.time * 0.8) * 45.0;
  nv += cn * 0.012;

  /* 3. Noise dye injection */
  let n = fbm(uv * 4.0 + u.time * 0.15, u.time);
  if (n > 0.55) {
    let s = (n - 0.55) * 4.0;
    let hu = 0.5 + fract(u.time * 0.06 + uv.x * 0.3 + uv.y * 0.2) * 0.28;
    nd += vec4f(hsv2rgb(hu, 0.85, 0.8) * s * 0.08, s * 0.02);
  }

  /* 4. Mouse interaction */
  let mp = vec2f(u.mouseX, u.mouseY) * res;
  let md = vec2f(u.mouseDX, u.mouseDY) * res;
  let mD = length(pos - mp);
  let mR = res.x * 0.18;
  if (mD < mR && length(md) > 0.2) {
    let s = exp(-mD * mD / (mR * mR * 0.15));
    nv += md * s * 0.8;
    let hu = 0.5 + fract(u.time * 0.12 + mD / mR * 0.3) * 0.12;
    nd += vec4f(hsv2rgb(hu, 0.9, 1.0) * s * 3.0, s * 1.5);
  }

  /* 5. Twelve orbiting vortices (ghost palette) */
  for (var j = 0u; j < 12u; j++) {
    let a = f32(j) * 0.524 + u.time * (0.15 + f32(j) * 0.035);
    let r = res.x * (0.06 + f32(j) * 0.05);
    let c = res * 0.5 + vec2f(cos(a), sin(a)) * r;
    let d = length(pos - c);
    let sr = res.x * 0.06;
    if (d < sr) {
      let s = exp(-d * d / (sr * sr * 0.2)) * 0.2;
      let fa = a + 1.5708;
      nv += vec2f(cos(fa), sin(fa)) * s * 90.0;
      let hu = 0.5 + fract(f32(j) / 12.0 + u.time * 0.05) * 0.28;
      nd += vec4f(hsv2rgb(hu, 0.9, 1.0) * s * 2.5, s * 0.8);
    }
  }

  /* 6. Three burst emitters */
  for (var k = 0u; k < 3u; k++) {
    let phase = u.time * 0.3 + f32(k) * 2.094;
    let burst = max(sin(phase), 0.0);
    if (burst > 0.7) {
      let bx = res.x * (0.2 + f32(k) * 0.3);
      let by = res.y * (0.3 + sin(u.time + f32(k)) * 0.2);
      let bd = length(pos - vec2f(bx, by));
      let br = res.x * 0.08;
      if (bd < br) {
        let bs = exp(-bd * bd / (br * br * 0.3)) * (burst - 0.7) * 3.0;
        let ba = u.time * 2.0 + f32(k) * 1.047;
        nv += vec2f(cos(ba), sin(ba)) * bs * 60.0;
        let hu = 0.5 + fract(f32(k) / 3.0 + u.time * 0.08) * 0.28;
        nd += vec4f(hsv2rgb(hu, 0.9, 1.0) * bs * 2.0, bs);
      }
    }
  }

  /* 7. Clamp output */
  velOut[i] = nv;
  dyeOut[i] = clamp(nd, vec4f(0.0), vec4f(3.0));
}
`;

/* ------------------------------------------------------------------ */
/*  WGSL Render Shader — post-process + fullscreen quad               */
/* ------------------------------------------------------------------ */

const renderShaderCode = /* wgsl */ `

struct RenderUniforms {
  width: f32,
  height: f32,
  time: f32,
  pad: f32,
};

struct VertexOutput {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
};

@group(0) @binding(0) var<uniform> ru: RenderUniforms;
@group(0) @binding(1) var<storage, read> dyeBuf: array<vec4f>;

fn texel(x: i32, y: i32) -> vec4f {
  return dyeBuf[u32(clamp(y, 0, i32(ru.height) - 1)) * u32(ru.width) + u32(clamp(x, 0, i32(ru.width) - 1))];
}

/* Bilinear interpolation for smooth upscaling from 256x256 grid */
fn sampleBilinear(uv: vec2f) -> vec4f {
  let p = uv * vec2f(ru.width, ru.height) - 0.5;
  let ix = i32(floor(p.x));
  let iy = i32(floor(p.y));
  let fx = fract(p.x);
  let fy = fract(p.y);
  let a = texel(ix, iy);
  let b = texel(ix + 1, iy);
  let c = texel(ix, iy + 1);
  let d = texel(ix + 1, iy + 1);
  return mix(mix(a, b, fx), mix(c, d, fx), fy);
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
  out.uv = positions[vi] * 0.5 + 0.5;
  out.uv.y = 1.0 - out.uv.y;
  return out;
}

@fragment
fn frag(in: VertexOutput) -> @location(0) vec4f {
  let uv = in.uv;

  /* 1. Bilinear sample with 3x3 soft blur */
  let tx = 1.0 / ru.width;
  let ty = 1.0 / ru.height;
  var c = sampleBilinear(uv).rgb * 0.40;
  c += sampleBilinear(uv + vec2f( tx, 0.0)).rgb * 0.10;
  c += sampleBilinear(uv + vec2f(-tx, 0.0)).rgb * 0.10;
  c += sampleBilinear(uv + vec2f(0.0,  ty)).rgb * 0.10;
  c += sampleBilinear(uv + vec2f(0.0, -ty)).rgb * 0.10;
  c += sampleBilinear(uv + vec2f( tx,  ty)).rgb * 0.05;
  c += sampleBilinear(uv + vec2f( tx, -ty)).rgb * 0.05;
  c += sampleBilinear(uv + vec2f(-tx, -ty)).rgb * 0.05;
  c += sampleBilinear(uv + vec2f(-tx,  ty)).rgb * 0.05;

  /* 2. S-curve contrast */
  c = c * 1.3;
  c = c * c * (3.0 - 2.0 * c);

  /* 3. Chromatic aberration (additive, bilinear) */
  let ca = 1.5 / ru.width;
  let cr = sampleBilinear(uv + vec2f(ca, 0.0)).r * 0.15;
  let cb = sampleBilinear(uv - vec2f(ca, 0.0)).b * 0.15;
  c.r += cr;
  c.b += cb;

  /* 4. Film grain */
  let grain = (hashGrain(uv * 1000.0 + ru.time * 100.0) - 0.5) * 0.06;
  c += grain;

  /* 5. Vignette */
  let d = length(uv - 0.5);
  let vig = smoothstep(0.85, 0.1, d);

  /* 6. Alpha from luminance */
  let lum = max(c.r, max(c.g, c.b));
  return vec4f(c * vig, lum * 0.35);
}
`;

/* ------------------------------------------------------------------ */
/*  React component                                                    */
/* ------------------------------------------------------------------ */

const SIM = 256;

export default function FluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.gpu) {
      setFallback(true);
      return;
    }

    let dead = false;
    let animId = 0;

    // Mouse state — accumulate raw deltas, no multiplier
    const m = { x: 0.5, y: 0.5, dx: 0, dy: 0 };
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      m.dx += nx - m.x;
      m.dy += ny - m.y;
      m.x = nx;
      m.y = ny;
    };
    window.addEventListener("mousemove", onMove);

    (async () => {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter || dead) return;
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
      const vb = [0, 1].map(() =>
        dev.createBuffer({ size: N * 8, usage: GPUBufferUsage.STORAGE })
      );
      const db = [0, 1].map(() =>
        dev.createBuffer({ size: N * 16, usage: GPUBufferUsage.STORAGE })
      );
      const ub = dev.createBuffer({
        size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const rb = dev.createBuffer({
        size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      /* ---- Compute pipeline ---- */
      const cp = dev.createComputePipeline({
        layout: "auto",
        compute: { module: dev.createShaderModule({ code: computeShaderCode }), entryPoint: "main" },
      });
      const cbg = [0, 1].map((s) =>
        dev.createBindGroup({
          layout: cp.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: ub } },
            { binding: 1, resource: { buffer: vb[s] } },
            { binding: 2, resource: { buffer: vb[1 - s] } },
            { binding: 3, resource: { buffer: db[s] } },
            { binding: 4, resource: { buffer: db[1 - s] } },
          ],
        })
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
            { binding: 1, resource: { buffer: db[1 - s] } },
          ],
        })
      );

      /* ---- Animation loop ---- */
      let fr = 0;
      const t0 = performance.now();

      const loop = () => {
        if (dead) return;
        animId = requestAnimationFrame(loop);

        const t = (performance.now() - t0) / 1000;
        const s = fr % 2;

        dev.queue.writeBuffer(ub, 0, new Float32Array([
          SIM, SIM, t, 1 / 60,
          m.x, m.y, m.dx, m.dy,
        ]));
        dev.queue.writeBuffer(rb, 0, new Float32Array([SIM, SIM, t, 0]));

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
        m.dx *= 0.82;
        m.dy *= 0.82;
        fr++;
      };

      animId = requestAnimationFrame(loop);

      return () => {
        dead = true;
        cancelAnimationFrame(animId);
        window.removeEventListener("mousemove", onMove);
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
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  if (fallback) return <FluidBackground />;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ width: "100vw", height: "100vh", zIndex: 1 }}
    />
  );
}
