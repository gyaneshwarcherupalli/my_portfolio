"use client";

import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import TextScramble from "@/components/TextScramble";

const COLORS: [number, number, number][] = [
  [226, 232, 240],
  [203, 213, 225],
  [148, 163, 184],
  [100, 116, 139],
  [241, 245, 249],
];

const COLOR_CACHE = COLORS.map((c) => {
  const base = `${c[0]},${c[1]},${c[2]}`;
  return { r: c[0], g: c[1], b: c[2], base };
});

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf: number;
    let time = 0;
    let tiltX = 0.35;
    let tiltY = 0;

    const SPHERE_N = 160;
    let SPHERE_R = Math.min(260, window.innerWidth * 0.2);
    const BG_N = 60;
    const AURORA_N = 5;
    const CONNECT_DIST_SQ = 40 * 40;

    const spherePhi = new Float32Array(SPHERE_N);
    const sphereTheta = new Float32Array(SPHERE_N);
    const sphereOffset = new Float32Array(SPHERE_N);
    const sphereSize = new Float32Array(SPHERE_N);
    const sphereCI = new Uint8Array(SPHERE_N);

    const projX = new Float32Array(SPHERE_N);
    const projY = new Float32Array(SPHERE_N);
    const projS = new Float32Array(SPHERE_N);
    const projD = new Float32Array(SPHERE_N);
    const sortIdx = new Uint16Array(SPHERE_N);

    const bgX = new Float32Array(BG_N);
    const bgY = new Float32Array(BG_N);
    const bgVX = new Float32Array(BG_N);
    const bgVY = new Float32Array(BG_N);
    const bgR = new Float32Array(BG_N);
    const bgCI = new Uint8Array(BG_N);

    let W = 0, H = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      SPHERE_R = Math.min(260, W * 0.2);
    };

    const init = () => {
      resize();
      const golden = Math.PI * (1 + Math.sqrt(5));
      for (let i = 0; i < SPHERE_N; i++) {
        spherePhi[i] = Math.acos(1 - 2 * (i + 0.5) / SPHERE_N);
        sphereTheta[i] = golden * i;
        sphereOffset[i] = (Math.random() - 0.5) * 16;
        sphereSize[i] = Math.random() * 1.2 + 0.6;
        sphereCI[i] = Math.floor(Math.random() * COLORS.length);
      }
      for (let i = 0; i < BG_N; i++) {
        bgX[i] = Math.random() * W;
        bgY[i] = Math.random() * H;
        bgVX[i] = (Math.random() - 0.5) * 0.2;
        bgVY[i] = (Math.random() - 0.5) * 0.2;
        bgR[i] = Math.random() * 1.1 + 0.3;
        bgCI[i] = Math.floor(Math.random() * COLORS.length);
      }
    };

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;

      const targetTiltX = 0.35 + ((mouse.current.y - cy) / H) * 0.25;
      const targetTiltY = ((mouse.current.x - cx) / W) * 0.25;
      tiltX += (targetTiltX - tiltX) * 0.012;
      tiltY += (targetTiltY - tiltY) * 0.012;

      for (let w = 0; w < AURORA_N; w++) {
        ctx.beginPath();
        const t1 = time * 1.2 + w * 0.7;
        const t2 = time * 0.8 - w * 0.4;
        const amp1 = 60 + w * 20;
        const amp2 = 30 + w * 10;
        for (let x = 0; x <= W; x += 6) {
          const y = cy + Math.sin(x * 0.003 + t1) * amp1 + Math.sin(x * 0.007 + t2) * amp2;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const cc = COLOR_CACHE[w % 5];
        ctx.strokeStyle = `rgba(${cc.base},${0.018 - w * 0.003})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      for (let ci = 0; ci < 5; ci++) {
        const cc = COLOR_CACHE[ci];
        ctx.fillStyle = `rgba(${cc.base},0.08)`;
        ctx.beginPath();
        for (let i = 0; i < BG_N; i++) {
          if (bgCI[i] !== ci) continue;
          bgX[i] += bgVX[i];
          bgY[i] += bgVY[i];
          if (bgX[i] < 0) bgX[i] = W;
          else if (bgX[i] > W) bgX[i] = 0;
          if (bgY[i] < 0) bgY[i] = H;
          else if (bgY[i] > H) bgY[i] = 0;
          ctx.moveTo(bgX[i] + bgR[i], bgY[i]);
          ctx.arc(bgX[i], bgY[i], bgR[i], 0, Math.PI * 2);
        }
        ctx.fill();
      }

      const rotY = time * 0.3;
      const cosRY = Math.cos(rotY + tiltY);
      const sinRY = Math.sin(rotY + tiltY);
      const cosRX = Math.cos(tiltX);
      const sinRX = Math.sin(tiltX);
      const fov = 600;
      const invRange = 1 / (2 * SPHERE_R + 40);

      for (let i = 0; i < SPHERE_N; i++) {
        const phi = spherePhi[i];
        const sinP = Math.sin(phi);
        const r = SPHERE_R + sphereOffset[i] + Math.sin(time * 1.5 + phi * 3) * 4;
        const x = r * sinP * Math.cos(sphereTheta[i]);
        const y = r * Math.cos(phi);
        const z = r * sinP * Math.sin(sphereTheta[i]);

        const x1 = x * cosRY - z * sinRY;
        const z1 = x * sinRY + z * cosRY;
        const y1 = y * cosRX - z1 * sinRX;
        const z2 = y * sinRX + z1 * cosRX;

        const scale = fov / (fov + z2);
        projX[i] = cx + x1 * scale;
        projY[i] = cy + y1 * scale;
        projS[i] = sphereSize[i] * scale;
        projD[i] = (z2 + SPHERE_R + 20) * invRange;
        sortIdx[i] = i;
      }

      sortIdx.sort((a, b) => projD[a] - projD[b]);

      for (let ci = 0; ci < 5; ci++) {
        ctx.beginPath();
        let hasLines = false;
        for (let ii = 0; ii < SPHERE_N; ii++) {
          const i = sortIdx[ii];
          if (projD[i] < 0.45 || sphereCI[i] !== ci) continue;
          for (let jj = ii + 1; jj < SPHERE_N; jj++) {
            const j = sortIdx[jj];
            if (projD[j] < 0.45) continue;
            const dx = projX[i] - projX[j];
            const dy = projY[i] - projY[j];
            const distSq = dx * dx + dy * dy;
            if (distSq < CONNECT_DIST_SQ) {
              ctx.moveTo(projX[i], projY[i]);
              ctx.lineTo(projX[j], projY[j]);
              hasLines = true;
            }
          }
        }
        if (hasLines) {
          ctx.strokeStyle = `rgba(148,163,184,0.06)`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }

      for (let ii = 0; ii < SPHERE_N; ii++) {
        const i = sortIdx[ii];
        const d = projD[i];
        const cc = COLOR_CACHE[sphereCI[i]];
        const opacity = 0.04 + d * 0.45;
        const s = projS[i];
        const px = projX[i];
        const py = projY[i];

        if (d > 0.5) {
          ctx.beginPath();
          ctx.arc(px, py, s + 4 + d * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cc.base},${opacity * 0.07})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cc.base},${opacity})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const onMouse = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    init();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="absolute top-[15%] left-[10%] w-[700px] h-[700px] bg-slate-400/[0.04] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-slate-500/[0.03] rounded-full blur-[180px] pointer-events-none" />

      <div className="floating-shape top-[12%] right-[15%] w-28 h-28 border border-slate-400 rounded-full animate-float" />
      <div className="floating-shape bottom-[18%] left-[8%] w-20 h-20 border border-slate-500 animate-float-delayed" />
      <div className="floating-shape top-[55%] right-[8%] w-14 h-14 border border-slate-300 rounded-full animate-float" style={{ animationDelay: "2s" }} />
      <div className="floating-shape top-[25%] left-[20%] w-10 h-10 border border-slate-500 animate-float-delayed" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 text-center px-6 max-w-5xl">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-500/20 bg-slate-500/[0.04] text-slate-400 text-sm mb-12 animate-fadeInUp backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
          Open to opportunities
        </div>

        <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black tracking-tighter mb-2 animate-fadeInUp delay-100 leading-[0.85] glitch-hover">
          <TextScramble text="Gyaneshwar" className="text-slate-100" delay={300} />
        </h1>

        <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-500 mb-16 animate-fadeInUp delay-200">
          Data Scientist
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16 animate-fadeInUp delay-300">
          <a
            href="#projects"
            className="px-10 py-4 rounded-xl bg-slate-200 text-slate-900 font-semibold text-sm hover:bg-white hover:scale-105 transition-all shadow-2xl shadow-slate-400/10"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="px-10 py-4 rounded-xl border border-slate-600/40 bg-white/[0.02] text-slate-300 font-semibold text-sm hover:bg-white/[0.06] hover:border-slate-500/60 hover:scale-105 transition-all backdrop-blur-sm"
          >
            Get In Touch
          </a>
        </div>

      </div>

      <a
        href="#stats"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-600 hover:text-slate-300 transition-colors animate-float"
      >
        <ArrowDown size={18} />
      </a>
    </section>
  );
}
