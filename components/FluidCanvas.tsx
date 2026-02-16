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

const GRID: u32 = 256u;

fn idx(x: u32, y: u32) -> u32 {
  return clamp(y, 0u, GRID - 1u) * GRID + clamp(x, 0u, GRID - 1u);
}

/* ---- noise helpers ---- */

fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q = q + dot(q, q + 45.32);
  return fract(q.x * q.y);
}

fn hash22(p: vec2f) -> vec2f {
  let k = vec2f(dot(p, vec2f(127.1, 311.7)), dot(p, vec2f(269.5, 183.3)));
  return fract(sin(k) * 43758.5453) * 2.0 - 1.0;
}

fn noise2(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f); // hermite
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn fbm(p: vec2f, t: f32) -> f32 {
  var q = p;
  var amp = 0.5;
  var sum = 0.0;
  for (var i = 0; i < 4; i++) {
    sum += amp * noise2(q + t * 0.3);
    q = q * 2.01;
    amp *= 0.5;
  }
  return sum;
}

fn curl(p: vec2f, t: f32) -> vec2f {
  let e = 0.01;
  let dx = fbm(p + vec2f(e, 0.0), t) - fbm(p - vec2f(e, 0.0), t);
  let dy = fbm(p + vec2f(0.0, e), t) - fbm(p - vec2f(0.0, e), t);
  return vec2f(dy, -dx) / (2.0 * e);
}

fn hsv2rgb(h: f32, s: f32, v: f32) -> vec3f {
  let hh = fract(h) * 6.0;
  let i = u32(hh);
  let ff = hh - f32(i);
  let p = v * (1.0 - s);
  let q = v * (1.0 - s * ff);
  let t2 = v * (1.0 - s * (1.0 - ff));
  switch i {
    case 0u: { return vec3f(v, t2, p); }
    case 1u: { return vec3f(q, v, p); }
    case 2u: { return vec3f(p, v, t2); }
    case 3u: { return vec3f(p, q, v); }
    case 4u: { return vec3f(t2, p, v); }
    default: { return vec3f(v, p, q); }
  }
}

fn sampleVel(pos: vec2f) -> vec2f {
  let gx = pos.x * f32(GRID);
  let gy = pos.y * f32(GRID);
  let ix = u32(clamp(gx, 0.0, f32(GRID) - 1.0));
  let iy = u32(clamp(gy, 0.0, f32(GRID) - 1.0));
  return velIn[idx(ix, iy)];
}

fn sampleDye(pos: vec2f) -> vec4f {
  let gx = pos.x * f32(GRID);
  let gy = pos.y * f32(GRID);
  let ix = u32(clamp(gx, 0.0, f32(GRID) - 1.0));
  let iy = u32(clamp(gy, 0.0, f32(GRID) - 1.0));
  return dyeIn[idx(ix, iy)];
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  if (gid.x >= GRID || gid.y >= GRID) { return; }

  let t = u.time;
  let dt = u.dt;
  let uv = vec2f(f32(gid.x) + 0.5, f32(gid.y) + 0.5) / f32(GRID);
  let id = idx(gid.x, gid.y);

  /* 1. Semi-Lagrangian advection */
  let curVel = velIn[id];
  let backPos = clamp(uv - curVel * dt * 12.0, vec2f(0.0), vec2f(1.0));
  var vel = sampleVel(backPos) * 0.995;
  var dye = sampleDye(backPos) * 0.992;

  /* 2. Curl noise turbulence */
  let curlP = uv * 6.0;
  let curlV = curl(curlP, t);
  vel = vel + curlV * 45.0 * 0.012;

  /* 3. Noise dye injection */
  let dyeNoise = fbm(uv * 4.0 + t * 0.15, t);
  if (dyeNoise > 0.55) {
    let hue = 0.5 + fract(t * 0.03 + uv.x * 0.4 + uv.y * 0.3) * 0.28;
    let col = hsv2rgb(hue, 0.75, 1.0);
    let inj = (dyeNoise - 0.55) * 4.0;
    dye = dye + vec4f(col * inj * 0.25, inj * 0.25);
  }

  /* 4. Mouse interaction */
  let mousePos = vec2f(u.mouseX, u.mouseY);
  let mouseDelta = vec2f(u.mouseDX, u.mouseDY);
  let mouseRadius = 0.18;
  let dm = distance(uv, mousePos);
  if (dm < mouseRadius) {
    let strength = exp(-dm * dm / (mouseRadius * mouseRadius * 0.15));
    let dir = normalize(mouseDelta + vec2f(0.0001, 0.0));
    vel = vel + dir * length(mouseDelta) * strength * 0.8;
    let mhue = 0.5 + fract(t * 0.05) * 0.1; // cyan-ish
    let mcol = hsv2rgb(mhue, 0.75, 1.0);
    dye = dye + vec4f(mcol * strength * 3.0, strength);
  }

  /* 5. Twelve orbiting rainbow vortices */
  for (var j = 0u; j < 12u; j++) {
    let fj = f32(j);
    let angle = fj * 0.524 + t * (0.15 + fj * 0.035);
    let orbit_r = 0.06 + fj * 0.05;
    let center = vec2f(0.5, 0.5) + vec2f(cos(angle), sin(angle)) * orbit_r;
    let vortexR = 0.06;
    let dv = distance(uv, center);
    if (dv < vortexR) {
      let strength = exp(-dv * dv / (vortexR * vortexR * 0.15));
      let toCenter = uv - center;
      let tangent = vec2f(-toCenter.y, toCenter.x);
      vel = vel + tangent * strength * 90.0;
      let vhue = 0.5 + fract(fj / 12.0 + t * 0.05) * 0.28;
      let vcol = hsv2rgb(vhue, 0.75, 1.0);
      dye = dye + vec4f(vcol * strength * 1.5, strength);
    }
  }

  /* 6. Three burst emitters */
  for (var k = 0u; k < 3u; k++) {
    let fk = f32(k);
    let burstVal = sin(t * 0.3 + fk * 2.094);
    if (burstVal > 0.7) {
      let bangle = fk * 2.094 + t * 0.2;
      let bpos = vec2f(0.5, 0.5) + vec2f(cos(bangle), sin(bangle)) * 0.3;
      let br = 0.08;
      let db = distance(uv, bpos);
      if (db < br) {
        let strength = exp(-db * db / (br * br * 0.15));
        let dir = vec2f(cos(t + fk), sin(t + fk));
        vel = vel + dir * strength * 60.0;
        let bhue = 0.5 + fract(fk / 3.0 + t * 0.07) * 0.28;
        let bcol = hsv2rgb(bhue, 0.75, 1.0);
        dye = dye + vec4f(bcol * strength * 2.0, strength);
      }
    }
  }

  /* 7. Clamp output */
  dye = clamp(dye, vec4f(0.0), vec4f(3.0));

  velOut[id] = vel;
  dyeOut[id] = dye;
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

const GRID: u32 = 256u;

fn sampleDye(uv: vec2f) -> vec4f {
  let gx = u32(clamp(uv.x * f32(GRID), 0.0, f32(GRID) - 1.0));
  let gy = u32(clamp(uv.y * f32(GRID), 0.0, f32(GRID) - 1.0));
  return dyeBuf[gy * GRID + gx];
}

fn hashScreen(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q = q + dot(q, q + 45.32);
  return fract(q.x * q.y);
}

@vertex
fn vert(@builtin(vertex_index) vi: u32) -> VertexOutput {
  // triangle-strip fullscreen quad: 4 vertices
  var positions = array<vec2f, 4>(
    vec2f(-1.0, -1.0),
    vec2f( 1.0, -1.0),
    vec2f(-1.0,  1.0),
    vec2f( 1.0,  1.0),
  );
  var uvs = array<vec2f, 4>(
    vec2f(0.0, 1.0),
    vec2f(1.0, 1.0),
    vec2f(0.0, 0.0),
    vec2f(1.0, 0.0),
  );
  var out: VertexOutput;
  out.pos = vec4f(positions[vi], 0.0, 1.0);
  out.uv = uvs[vi];
  return out;
}

@fragment
fn frag(in: VertexOutput) -> @location(0) vec4f {
  let uv = in.uv;
  let texel = 1.0 / f32(GRID);

  /* 1. 3x3 sharpening kernel */
  var c = sampleDye(uv).rgb * 0.40;
  c += sampleDye(uv + vec2f( texel, 0.0)).rgb * 0.10;
  c += sampleDye(uv + vec2f(-texel, 0.0)).rgb * 0.10;
  c += sampleDye(uv + vec2f(0.0,  texel)).rgb * 0.10;
  c += sampleDye(uv + vec2f(0.0, -texel)).rgb * 0.10;
  c += sampleDye(uv + vec2f( texel,  texel)).rgb * 0.05;
  c += sampleDye(uv + vec2f(-texel,  texel)).rgb * 0.05;
  c += sampleDye(uv + vec2f( texel, -texel)).rgb * 0.05;
  c += sampleDye(uv + vec2f(-texel, -texel)).rgb * 0.05;

  /* 2. S-curve contrast */
  c = c * 1.3;
  c = c * c * (3.0 - 2.0 * c);

  /* 3. Chromatic aberration */
  let caOffset = 1.5 / ru.width;
  let caStrength = 0.15;
  let rShift = sampleDye(uv + vec2f(caOffset, 0.0)).r;
  let bShift = sampleDye(uv - vec2f(caOffset, 0.0)).b;
  c.r = mix(c.r, rShift, caStrength);
  c.b = mix(c.b, bShift, caStrength);

  /* 4. Film grain */
  let grain = hashScreen(uv * vec2f(ru.width, ru.height) + ru.time * 100.0);
  c = c + (grain - 0.5) * 0.06;

  /* 5. Vignette */
  let dist = distance(uv, vec2f(0.5));
  let vig = smoothstep(0.85, 0.1, dist);
  c = c * vig;

  /* 6. Alpha */
  let alpha = max(max(c.r, c.g), c.b) * 0.35;
  return vec4f(c * alpha, alpha); // premultiplied alpha
}
`;

/* ------------------------------------------------------------------ */
/*  React component                                                    */
/* ------------------------------------------------------------------ */

const GRID = 256;

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

    // Mouse state
    const mouse = { x: 0.5, y: 0.5, dx: 0, dy: 0 };
    const onMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      mouse.dx += (nx - mouse.x) * 3.0;
      mouse.dy += (ny - mouse.y) * 3.0;
      mouse.x = nx;
      mouse.y = ny;
    };
    window.addEventListener("mousemove", onMouseMove);

    (async () => {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter || dead) return;
      const device = await adapter.requestDevice();
      if (dead) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Canvas size: half resolution
      const resize = () => {
        canvas.width = Math.floor(window.innerWidth * 0.5);
        canvas.height = Math.floor(window.innerHeight * 0.5);
      };
      resize();
      window.addEventListener("resize", resize);

      const ctx = canvas.getContext("webgpu");
      if (!ctx) { setFallback(true); return; }

      const format = navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({ device, format, alphaMode: "premultiplied" });

      /* ---- Buffers ---- */
      const cellCount = GRID * GRID;
      const velBufSize = cellCount * 2 * 4; // vec2f
      const dyeBufSize = cellCount * 4 * 4; // vec4f

      const velBufs = [0, 1].map(() =>
        device.createBuffer({ size: velBufSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST })
      );
      const dyeBufs = [0, 1].map(() =>
        device.createBuffer({ size: dyeBufSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST })
      );

      const uniformBuf = device.createBuffer({
        size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const renderUniformBuf = device.createBuffer({
        size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      /* ---- Compute pipeline ---- */
      const computeModule = device.createShaderModule({ code: computeShaderCode });
      const computePipeline = device.createComputePipeline({
        layout: "auto",
        compute: { module: computeModule, entryPoint: "main" },
      });

      const computeBindGroups = [0, 1].map((i) =>
        device.createBindGroup({
          layout: computePipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: uniformBuf } },
            { binding: 1, resource: { buffer: velBufs[i] } },
            { binding: 2, resource: { buffer: velBufs[1 - i] } },
            { binding: 3, resource: { buffer: dyeBufs[i] } },
            { binding: 4, resource: { buffer: dyeBufs[1 - i] } },
          ],
        })
      );

      /* ---- Render pipeline ---- */
      const renderModule = device.createShaderModule({ code: renderShaderCode });
      const renderPipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: renderModule, entryPoint: "vert" },
        fragment: {
          module: renderModule,
          entryPoint: "frag",
          targets: [{
            format,
            blend: {
              color: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
              alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
            },
          }],
        },
        primitive: { topology: "triangle-strip" },
      });

      const renderBindGroups = [0, 1].map((i) =>
        device.createBindGroup({
          layout: renderPipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: renderUniformBuf } },
            { binding: 1, resource: { buffer: dyeBufs[1 - i] } }, // read output of compute
          ],
        })
      );

      /* ---- Animation loop ---- */
      let frame = 0;
      let prevTime = performance.now();

      const loop = (now: number) => {
        if (dead) return;
        animId = requestAnimationFrame(loop);

        const dt = Math.min((now - prevTime) / 1000, 0.05);
        prevTime = now;
        const t = now / 1000;

        // Decay mouse delta
        mouse.dx *= 0.82;
        mouse.dy *= 0.82;

        const ping = frame % 2;

        // Update uniforms
        const uData = new Float32Array([
          GRID, GRID, t, dt,
          mouse.x, mouse.y, mouse.dx, mouse.dy,
        ]);
        device.queue.writeBuffer(uniformBuf, 0, uData);

        const rData = new Float32Array([canvas.width, canvas.height, t, 0]);
        device.queue.writeBuffer(renderUniformBuf, 0, rData);

        const encoder = device.createCommandEncoder();

        // Compute pass
        const computePass = encoder.beginComputePass();
        computePass.setPipeline(computePipeline);
        computePass.setBindGroup(0, computeBindGroups[ping]);
        computePass.dispatchWorkgroups(GRID / 8, GRID / 8);
        computePass.end();

        // Render pass
        const textureView = ctx.getCurrentTexture().createView();
        const renderPass = encoder.beginRenderPass({
          colorAttachments: [{
            view: textureView,
            loadOp: "clear" as GPULoadOp,
            storeOp: "store" as GPUStoreOp,
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
          }],
        });
        renderPass.setPipeline(renderPipeline);
        renderPass.setBindGroup(0, renderBindGroups[ping]);
        renderPass.draw(4);
        renderPass.end();

        device.queue.submit([encoder.finish()]);
        frame++;
      };

      animId = requestAnimationFrame(loop);

      // Cleanup handler stored for effect teardown
      return () => {
        dead = true;
        cancelAnimationFrame(animId);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", resize);
      };
    })().then((cleanup) => {
      // Store cleanup for when effect re-runs
      if (cleanup) {
        cleanupRef.current = cleanup;
      }
    });

    // For async cleanup
    const cleanupRef = { current: null as (() => void) | null };

    return () => {
      dead = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
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
