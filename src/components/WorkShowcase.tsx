"use client";

import { useEffect, useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const COLORS = {
  bright: [226, 232, 240],
  mid: [203, 213, 225],
  silver: [148, 163, 184],
  steel: [100, 116, 139],
  white: [241, 245, 249],
  amber: [203, 213, 225],
  rose: [148, 163, 184],
};

function CorrelationHeatmap() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 380, H = 380;
    canvas.width = W;
    canvas.height = H;

    const labels = ["Revenue", "Sessions", "Bounce", "Tenure", "Spend", "NPS", "Churn"];
    const n = labels.length;
    const baseCorr: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      baseCorr[i][i] = 1;
      for (let j = i + 1; j < n; j++) {
        const seed = (i * 7 + j * 13) % 20;
        const v = Math.max(-1, Math.min(1, Math.sin(seed) * 0.8 + Math.cos(seed * 1.3) * 0.4));
        baseCorr[i][j] = v;
        baseCorr[j][i] = v;
      }
    }

    let t = 0;
    let raf: number;
    let visible = false;
    const observer = new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) raf = requestAnimationFrame(draw); }, { threshold: 0 });
    observer.observe(canvas);

    const draw = () => {
      if (!visible) return;
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      const ox = 70, oy = 50;
      const cellW = (W - ox - 20) / n;
      const cellH = (H - oy - 30) / n;

      ctx.font = "9px Inter, system-ui";
      ctx.textAlign = "right";
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = "rgba(148,163,184,0.4)";
        ctx.fillText(labels[i], ox - 6, oy + i * cellH + cellH / 2 + 3);
      }

      ctx.textAlign = "center";
      for (let j = 0; j < n; j++) {
        ctx.save();
        ctx.translate(ox + j * cellW + cellW / 2, oy - 6);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = "rgba(148,163,184,0.4)";
        ctx.fillText(labels[j], 0, 0);
        ctx.restore();
      }

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const x = ox + j * cellW;
          const y = oy + i * cellH;
          const corr = baseCorr[i][j] + Math.sin(t + i * 0.7 + j * 0.5) * 0.03;
          const absCorr = Math.abs(corr);

          let r: number, g: number, b: number;
          if (corr >= 0) {
            r = 148 + (226 - 148) * absCorr;
            g = 163 + (232 - 163) * absCorr;
            b = 184 + (240 - 184) * absCorr;
          } else {
            r = 100 + (148 - 100) * (1 - absCorr);
            g = 116 + (163 - 116) * (1 - absCorr);
            b = 139 + (184 - 139) * (1 - absCorr);
          }

          const intensity = 0.06 + absCorr * 0.18;
          ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${intensity})`;
          ctx.beginPath();
          ctx.roundRect(x + 1, y + 1, cellW - 2, cellH - 2, 3);
          ctx.fill();

          if (absCorr > 0.4 || i === j) {
            ctx.font = "bold 9px Inter, system-ui";
            ctx.textAlign = "center";
            ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${0.4 + absCorr * 0.4})`;
            ctx.fillText(corr.toFixed(2), x + cellW / 2, y + cellH / 2 + 3);
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  return <canvas ref={ref} className="w-full h-auto" style={{ maxWidth: 380 }} />;
}

function EDAScatter() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 380, H = 340;
    canvas.width = W;
    canvas.height = H;

    const points: { x: number; y: number; cluster: number }[] = [];
    const centers = [
      { cx: 0.25, cy: 0.7, color: COLORS.bright },
      { cx: 0.55, cy: 0.4, color: COLORS.mid },
      { cx: 0.8, cy: 0.2, color: COLORS.steel },
    ];

    for (const c of centers) {
      for (let i = 0; i < 35; i++) {
        points.push({
          x: c.cx + (Math.random() - 0.5) * 0.22,
          y: c.cy + (Math.random() - 0.5) * 0.25,
          cluster: centers.indexOf(c),
        });
      }
    }
    for (let i = 0; i < 6; i++) {
      points.push({ x: Math.random(), y: Math.random(), cluster: -1 });
    }

    let t = 0;
    let raf: number;
    let visible = false;
    const observer = new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) raf = requestAnimationFrame(draw); }, { threshold: 0 });
    observer.observe(canvas);

    const draw = () => {
      if (!visible) return;
      t += 0.01;
      ctx.clearRect(0, 0, W, H);

      const ox = 45, oy = 20;
      const plotW = W - 65, plotH = H - 55;

      const px = (v: number) => ox + v * plotW;
      const py = (v: number) => oy + (1 - v) * plotH;

      for (let i = 0; i <= 4; i++) {
        const v = i / 4;
        ctx.strokeStyle = "rgba(255,255,255,0.025)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px(v), py(0));
        ctx.lineTo(px(v), py(1));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px(0), py(v));
        ctx.lineTo(px(1), py(v));
        ctx.stroke();
      }

      ctx.font = "9px Inter, system-ui";
      ctx.fillStyle = "rgba(148,163,184,0.35)";
      ctx.textAlign = "center";
      ctx.fillText("Monthly Spend ($)", W / 2, H - 5);
      ctx.save();
      ctx.translate(10, H / 2 - 10);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Engagement Score", 0, 0);
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(px(0.05), py(0.82));
      ctx.lineTo(px(0.95), py(0.12));
      ctx.strokeStyle = "rgba(148,163,184,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "9px Inter, system-ui";
      ctx.fillStyle = "rgba(148,163,184,0.4)";
      ctx.textAlign = "right";
      ctx.fillText("R² = 0.73", W - 20, oy + 15);

      for (const p of points) {
        const jx = Math.sin(t * 1.5 + p.x * 10) * 0.004;
        const jy = Math.cos(t * 1.2 + p.y * 8) * 0.004;

        const isOutlier = p.cluster === -1;
        const c = isOutlier ? COLORS.rose : centers[p.cluster].color;
        const r = isOutlier ? 3.5 + Math.sin(t * 3 + p.x * 5) * 1 : 2.5;
        const opacity = isOutlier ? 0.5 + Math.sin(t * 2 + p.x) * 0.2 : 0.45;

        // Soft glow circle instead of shadowBlur
        if (!isOutlier) {
          ctx.beginPath();
          ctx.arc(px(p.x + jx), py(p.y + jy), r + 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.08)`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px(p.x + jx), py(p.y + jy), r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${opacity})`;
        ctx.fill();

        if (isOutlier) {
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},0.25)`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(px(p.x + jx), py(p.y + jy), 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      const ly = H - 22;
      ctx.textAlign = "left";
      ctx.font = "8px Inter, system-ui";
      [
        { label: "High Value", c: COLORS.steel },
        { label: "Growth", c: COLORS.mid },
        { label: "At Risk", c: COLORS.bright },
        { label: "Outlier", c: COLORS.rose },
      ].forEach((item, i) => {
        const lx = ox + i * 75;
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${item.c[0]},${item.c[1]},${item.c[2]},0.6)`;
        ctx.fill();
        ctx.fillStyle = "rgba(148,163,184,0.35)";
        ctx.fillText(item.label, lx + 7, ly + 3);
      });

      raf = requestAnimationFrame(draw);
    };

    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  return <canvas ref={ref} className="w-full h-auto" style={{ maxWidth: 380 }} />;
}

function KPIDashboard() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 520, H = 280;
    canvas.width = W;
    canvas.height = H;

    const kpis = [
      { label: "Retention Rate", value: 87.3, delta: 4.2, unit: "%", color: COLORS.mid, sparkBase: 78 },
      { label: "Avg. Revenue", value: 142, delta: 12.8, unit: "$", color: COLORS.bright, sparkBase: 110 },
      { label: "Churn Risk", value: 6.1, delta: -2.3, unit: "%", color: COLORS.white, sparkBase: 9 },
      { label: "NPS Score", value: 72, delta: 8.0, unit: "", color: COLORS.steel, sparkBase: 58 },
    ];

    const sparklines: number[][] = kpis.map((k) => {
      const arr: number[] = [];
      let v = k.sparkBase;
      for (let i = 0; i < 24; i++) {
        v += (Math.random() - 0.4) * 3 + (k.delta > 0 ? 0.3 : -0.2);
        arr.push(v);
      }
      return arr;
    });

    let t = 0;
    let raf: number;
    let visible = false;
    const observer = new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) raf = requestAnimationFrame(draw); }, { threshold: 0 });
    observer.observe(canvas);

    const draw = () => {
      if (!visible) return;
      t += 0.015;
      ctx.clearRect(0, 0, W, H);

      const cardW = (W - 30) / 4;
      const cardH = H - 20;

      kpis.forEach((kpi, i) => {
        const x = 6 + i * (cardW + 6);
        const y = 10;
        const c = kpi.color;

        ctx.fillStyle = "rgba(255,255,255,0.015)";
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 10);
        ctx.fill();

        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},0.08)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 10);
        ctx.stroke();

        ctx.font = "8px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(148,163,184,0.4)";
        ctx.fillText(kpi.label, x + cardW / 2, y + 28);

        const noise = Math.sin(t * 1.5 + i * 2) * 0.3;
        const displayVal = kpi.unit === "$"
          ? `$${(kpi.value + noise).toFixed(0)}`
          : `${(kpi.value + noise).toFixed(1)}${kpi.unit}`;

        ctx.font = "bold 22px Inter, system-ui";
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.85)`;
        ctx.fillText(displayVal, x + cardW / 2, y + 62);

        const isUp = kpi.delta > 0;
        ctx.font = "bold 10px Inter, system-ui";
        ctx.fillStyle = isUp
          ? `rgba(${COLORS.mid[0]},${COLORS.mid[1]},${COLORS.mid[2]},0.6)`
          : `rgba(${COLORS.rose[0]},${COLORS.rose[1]},${COLORS.rose[2]},0.6)`;
        const arrow = isUp ? "↑" : "↓";
        ctx.fillText(`${arrow} ${Math.abs(kpi.delta).toFixed(1)}%`, x + cardW / 2, y + 82);

        const spark = sparklines[i];
        const sparkY = y + 105;
        const sparkH = cardH - 130;
        const sparkMin = Math.min(...spark);
        const sparkMax = Math.max(...spark);

        ctx.beginPath();
        ctx.moveTo(x + 8, sparkY + sparkH);
        spark.forEach((v, si) => {
          const sx = x + 8 + (si / (spark.length - 1)) * (cardW - 16);
          const sy = sparkY + sparkH - ((v - sparkMin) / (sparkMax - sparkMin + 1)) * sparkH;
          ctx.lineTo(sx, sy);
        });
        ctx.lineTo(x + cardW - 8, sparkY + sparkH);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.04)`;
        ctx.fill();

        ctx.beginPath();
        spark.forEach((v, si) => {
          const sx = x + 8 + (si / (spark.length - 1)) * (cardW - 16);
          const sy = sparkY + sparkH - ((v - sparkMin) / (sparkMax - sparkMin + 1)) * sparkH;
          si === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        });
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},0.4)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        const lastX = x + cardW - 8;
        const lastY = sparkY + sparkH - ((spark[spark.length - 1] - sparkMin) / (sparkMax - sparkMin + 1)) * sparkH;
        // Glow circle instead of shadowBlur
        ctx.beginPath();
        ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.15)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.7)`;
        ctx.fill();

        ctx.font = "7px Inter, system-ui";
        ctx.fillStyle = "rgba(148,163,184,0.2)";
        ctx.fillText("24 months", x + cardW / 2, sparkY + sparkH + 14);
      });

      raf = requestAnimationFrame(draw);
    };

    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  return <canvas ref={ref} className="w-full h-auto" style={{ maxWidth: 520 }} />;
}

function DataPipeline() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 520, H = 200;
    canvas.width = W;
    canvas.height = H;

    const stages = [
      { label: "Extract", icon: "SQL", color: COLORS.white },
      { label: "Clean", icon: "ETL", color: COLORS.bright },
      { label: "Analyze", icon: "EDA", color: COLORS.steel },
      { label: "Model", icon: "ML", color: COLORS.rose },
      { label: "Report", icon: "BI", color: COLORS.mid },
    ];

    const stageX = stages.map((_, i) => 50 + (i / (stages.length - 1)) * (W - 100));
    const midY = H / 2;

    interface Packet { progress: number; speed: number }
    const packets: Packet[] = [];

    let t = 0;
    let raf: number;
    let visible = false;
    const observer = new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) raf = requestAnimationFrame(draw); }, { threshold: 0 });
    observer.observe(canvas);

    const draw = () => {
      if (!visible) return;
      t += 0.015;
      ctx.clearRect(0, 0, W, H);

      if (Math.random() < 0.03) {
        packets.push({ progress: 0, speed: 0.003 + Math.random() * 0.004 });
      }

      for (let i = 0; i < stages.length - 1; i++) {
        const x1 = stageX[i] + 22, x2 = stageX[i + 1] - 22;
        ctx.strokeStyle = "rgba(226,232,240,0.08)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, midY);
        ctx.lineTo(x2, midY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2 - 6, midY - 4);
        ctx.lineTo(x2, midY);
        ctx.lineTo(x2 - 6, midY + 4);
        ctx.strokeStyle = "rgba(226,232,240,0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;
        const total = p.progress * (stages.length - 1);
        const seg = Math.floor(total);
        const segP = total - seg;
        if (seg >= stages.length - 1) { packets.splice(i, 1); continue; }
        const x = stageX[seg] + (stageX[seg + 1] - stageX[seg]) * segP;
        const c = stages[seg].color;
        // Glow circle instead of shadowBlur
        ctx.beginPath();
        ctx.arc(x, midY, 7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.15)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, midY, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.7)`;
        ctx.fill();
      }

      for (let i = 0; i < stages.length; i++) {
        const s = stages[i];
        const x = stageX[i];
        const pulse = (Math.sin(t * 1.5 + i * 1.2) + 1) / 2;
        // Outer glow ring instead of shadowBlur
        ctx.beginPath();
        ctx.arc(x, midY, 28 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},0.04)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, midY, 20 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},0.08)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${0.25 + pulse * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = "bold 10px Inter, system-ui";
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},0.8)`;
        ctx.fillText(s.icon, x, midY + 4);
        ctx.font = "9px Inter, system-ui";
        ctx.fillStyle = "rgba(148,163,184,0.4)";
        ctx.fillText(s.label, x, midY + 38);
      }

      ctx.font = "9px Inter, system-ui";
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(203,213,225,0.5)";
      ctx.fillText(`${Math.round(1200 + Math.sin(t) * 100)} rows/sec`, W - 20, 20);

      raf = requestAnimationFrame(draw);
    };

    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  return <canvas ref={ref} className="w-full h-auto" style={{ maxWidth: 520 }} />;
}

function ABTestViz() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 460, H = 280;
    canvas.width = W;
    canvas.height = H;

    let t = 0;
    let raf: number;
    let visible = false;
    const observer = new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) raf = requestAnimationFrame(draw); }, { threshold: 0 });
    observer.observe(canvas);

    const gaussian = (x: number, mean: number, std: number) =>
      Math.exp(-0.5 * Math.pow((x - mean) / std, 2)) / (std * Math.sqrt(2 * Math.PI));

    const draw = () => {
      if (!visible) return;
      t += 0.008;
      ctx.clearRect(0, 0, W, H);

      const ox = 50, oy = 30, plotW = W - 80, plotH = H - 80;
      const px = (v: number) => ox + ((v - 6) / 16) * plotW;
      const controlMean = 12.3 + Math.sin(t * 0.5) * 0.1;
      const testMean = 14.8 + Math.sin(t * 0.7) * 0.1;
      const maxD = gaussian(controlMean, controlMean, 1.8) * 1.1;
      const py = (d: number) => oy + plotH - (d / maxD) * plotH;

      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ox, oy + plotH);
      ctx.lineTo(ox + plotW, oy + plotH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px(6), oy + plotH);
      for (let x = 6; x <= 22; x += 0.2) ctx.lineTo(px(x), py(gaussian(x, controlMean, 1.8)));
      ctx.lineTo(px(22), oy + plotH);
      ctx.fillStyle = "rgba(226,232,240,0.06)";
      ctx.fill();
      ctx.beginPath();
      for (let x = 6; x <= 22; x += 0.2) { const y = py(gaussian(x, controlMean, 1.8)); x === 6 ? ctx.moveTo(px(x), y) : ctx.lineTo(px(x), y); }
      ctx.strokeStyle = "rgba(226,232,240,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px(6), oy + plotH);
      for (let x = 6; x <= 22; x += 0.2) ctx.lineTo(px(x), py(gaussian(x, testMean, 1.6)));
      ctx.lineTo(px(22), oy + plotH);
      ctx.fillStyle = "rgba(203,213,225,0.06)";
      ctx.fill();
      ctx.beginPath();
      for (let x = 6; x <= 22; x += 0.2) { const y = py(gaussian(x, testMean, 1.6)); x === 6 ? ctx.moveTo(px(x), y) : ctx.lineTo(px(x), y); }
      ctx.strokeStyle = "rgba(203,213,225,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "rgba(226,232,240,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px(controlMean), oy);
      ctx.lineTo(px(controlMean), oy + plotH);
      ctx.stroke();
      ctx.strokeStyle = "rgba(203,213,225,0.3)";
      ctx.beginPath();
      ctx.moveTo(px(testMean), oy);
      ctx.lineTo(px(testMean), oy + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      const arrowY = oy + 20;
      ctx.strokeStyle = "rgba(148,163,184,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px(controlMean), arrowY);
      ctx.lineTo(px(testMean), arrowY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px(testMean) - 6, arrowY - 4);
      ctx.lineTo(px(testMean), arrowY);
      ctx.lineTo(px(testMean) - 6, arrowY + 4);
      ctx.stroke();

      ctx.font = "bold 10px Inter, system-ui";
      ctx.fillStyle = "rgba(148,163,184,0.7)";
      ctx.textAlign = "center";
      ctx.fillText(`+${((testMean - controlMean) / controlMean * 100).toFixed(1)}% uplift`, (px(controlMean) + px(testMean)) / 2, arrowY - 8);

      ctx.font = "9px Inter, system-ui";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(148,163,184,0.35)";
      ctx.fillText("Conversion Rate (%)", W / 2, H - 8);

      const ly = H - 28;
      ctx.fillStyle = "rgba(226,232,240,0.6)";
      ctx.beginPath(); ctx.arc(ox + 10, ly, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(148,163,184,0.4)";
      ctx.textAlign = "left";
      ctx.fillText("Control", ox + 20, ly + 3);
      ctx.fillStyle = "rgba(203,213,225,0.6)";
      ctx.beginPath(); ctx.arc(ox + 90, ly, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(148,163,184,0.4)";
      ctx.fillText("Variant", ox + 100, ly + 3);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(203,213,225,0.5)";
      ctx.fillText("p < 0.001 • 95% CI", W - 30, ly + 3);

      raf = requestAnimationFrame(draw);
    };

    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  return <canvas ref={ref} className="w-full h-auto" style={{ maxWidth: 460 }} />;
}

function TimeSeriesForecast() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 520, H = 260;
    canvas.width = W;
    canvas.height = H;

    const N = 80;
    const actual: number[] = [];
    let val = 50;
    for (let i = 0; i < N; i++) {
      val += Math.sin(i * 0.2) * 3 + Math.sin(i * 0.05) * 10 + (Math.random() - 0.5) * 4;
      val = Math.max(10, Math.min(90, val));
      actual.push(val);
    }
    const splitIdx = 55;

    let t = 0;
    let raf: number;
    let visible = false;
    const observer = new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) raf = requestAnimationFrame(draw); }, { threshold: 0 });
    observer.observe(canvas);

    const draw = () => {
      if (!visible) return;
      t += 0.01;
      ctx.clearRect(0, 0, W, H);

      const ox = 40, oy = 20, plotW = W - 60, plotH = H - 60;
      const px = (i: number) => ox + (i / N) * plotW;
      const py = (v: number) => oy + plotH - ((v - 5) / 90) * plotH;

      for (let i = 0; i <= 4; i++) {
        ctx.strokeStyle = "rgba(255,255,255,0.02)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox, oy + (i / 4) * plotH);
        ctx.lineTo(ox + plotW, oy + (i / 4) * plotH);
        ctx.stroke();
      }

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(148,163,184,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px(splitIdx), oy);
      ctx.lineTo(px(splitIdx), oy + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "8px Inter, system-ui";
      ctx.fillStyle = "rgba(148,163,184,0.35)";
      ctx.textAlign = "center";
      ctx.fillText("Forecast →", px(splitIdx) + 30, oy - 5);
      ctx.fillText("← Historical", px(splitIdx) - 30, oy - 5);

      const drawLen = Math.min(N - splitIdx, Math.floor(((t * 0.5) % 3) * (N - splitIdx) / 2));
      if (drawLen > 0) {
        ctx.beginPath();
        for (let i = splitIdx; i < splitIdx + drawLen; i++) { ctx.lineTo(px(i), py(actual[i] + (i - splitIdx) * 0.8 + 3)); }
        for (let i = splitIdx + drawLen - 1; i >= splitIdx; i--) { ctx.lineTo(px(i), py(actual[i] - (i - splitIdx) * 0.8 - 3)); }
        ctx.fillStyle = "rgba(148,163,184,0.05)";
        ctx.fill();
      }

      ctx.beginPath();
      for (let i = 0; i <= splitIdx; i++) { i === 0 ? ctx.moveTo(px(i), py(actual[i])) : ctx.lineTo(px(i), py(actual[i])); }
      ctx.strokeStyle = "rgba(100,116,139,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (drawLen > 0) {
        ctx.beginPath();
        for (let i = splitIdx; i < splitIdx + drawLen; i++) {
          const j = Math.sin(t * 2 + i * 0.5) * 1.5;
          i === splitIdx ? ctx.moveTo(px(i), py(actual[i])) : ctx.lineTo(px(i), py(actual[i] + j));
        }
        ctx.strokeStyle = "rgba(148,163,184,0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.font = "9px Inter, system-ui";
      ctx.fillStyle = "rgba(203,213,225,0.5)";
      ctx.textAlign = "right";
      ctx.fillText(`MAPE: ${(4.2 + Math.sin(t) * 0.3).toFixed(1)}%`, W - 20, H - 12);
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(100,116,139,0.5)";
      ctx.fillText("Actual", ox + 5, H - 12);
      ctx.fillStyle = "rgba(148,163,184,0.5)";
      ctx.fillText("Forecast", ox + 55, H - 12);

      raf = requestAnimationFrame(draw);
    };

    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, []);

  return <canvas ref={ref} className="w-full h-auto" style={{ maxWidth: 520 }} />;
}

const showcaseItems = [
  {
    title: "KPI Dashboard",
    subtitle: "Real-time business metrics tracking with trend analysis",
    barColor: "#e2e8f0",
    glowColor: "226,232,240",
    Viz: KPIDashboard,
    wide: true,
  },
  {
    title: "Feature Correlation",
    subtitle: "Heatmap — identifying multicollinearity & key drivers",
    barColor: "#94a3b8",
    glowColor: "148,163,184",
    Viz: CorrelationHeatmap,
    wide: false,
  },
  {
    title: "Customer Segmentation",
    subtitle: "EDA scatter — cluster analysis with outlier detection",
    barColor: "#cbd5e1",
    glowColor: "203,213,225",
    Viz: EDAScatter,
    wide: false,
  },
  {
    title: "Data Pipeline",
    subtitle: "End-to-end: SQL extraction to BI reporting",
    barColor: "#e2e8f0",
    glowColor: "226,232,240",
    Viz: DataPipeline,
    wide: true,
  },
  {
    title: "A/B Test Analysis",
    subtitle: "Statistical hypothesis testing — causal uplift measurement",
    barColor: "#cbd5e1",
    glowColor: "203,213,225",
    Viz: ABTestViz,
    wide: true,
  },
  {
    title: "Demand Forecasting",
    subtitle: "Time series prediction with confidence intervals",
    barColor: "#94a3b8",
    glowColor: "148,163,184",
    Viz: TimeSeriesForecast,
    wide: true,
  },
];

export default function WorkShowcase() {
  return (
    <section id="showcase" className="py-28 sm:py-36 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="floating-shape top-[5%] right-[8%] w-32 h-32 border border-slate-500/30 rounded-full animate-float" />
      <div className="floating-shape bottom-[10%] left-[5%] w-20 h-20 border border-slate-400/30 animate-float-delayed" />

      <div className="relative max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Data in Action</h2>
          <p className="text-slate-500 text-sm mt-3">From raw data to business decisions — live visualizations</p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {showcaseItems.map((item, i) => (
            <ScrollReveal
              key={item.title}
              delay={i * 100}
              className={item.wide ? "md:col-span-2" : ""}
            >
              <div className="relative rounded-2xl border border-white/[0.05] bg-[#08081a] overflow-hidden group hover:border-white/[0.12] transition-all duration-500">
                <div className="h-[2px] relative overflow-hidden" style={{ background: item.barColor }}>
                  <div
                    className="absolute inset-0 bg-white/40"
                    style={{ animation: "shimmer-bar 2.5s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}
                  />
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-white font-bold text-lg group-hover:text-slate-200 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">{item.subtitle}</p>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full mt-2 animate-pulse"
                      style={{ background: `rgb(${item.glowColor})`, boxShadow: `0 0 8px rgba(${item.glowColor},0.5)` }}
                    />
                  </div>

                  <div className="flex justify-center">
                    <item.Viz />
                  </div>
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: `linear-gradient(to top, rgba(${item.glowColor},0.05) 0%, transparent 100%)` }}
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
