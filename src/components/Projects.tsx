"use client";

import { useRef, useCallback, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const projects = [
  {
    title: "Customer Churn Prediction",
    impact: "12% reduction in monthly churn",
    tags: ["Python", "SageMaker", "MLflow", "Airflow"],
    glowColor: "226,232,240",
    barColor: "#e2e8f0",
    number: "01",
    vizType: "line-down" as const,
  },
  {
    title: "Fraud Detection Engine",
    impact: "16% improvement in fraud capture",
    tags: ["XGBoost", "LightGBM", "Azure ML", "Databricks"],
    glowColor: "148,163,184",
    barColor: "#94a3b8",
    number: "02",
    vizType: "scatter" as const,
  },
  {
    title: "Network Capacity Forecasting",
    impact: "15% better forecast accuracy",
    tags: ["Time Series", "SageMaker", "Athena"],
    glowColor: "203,213,225",
    barColor: "#cbd5e1",
    number: "03",
    vizType: "wave" as const,
  },
  {
    title: "Causal Analytics Platform",
    impact: "Uplift experiments at scale",
    tags: ["Causal Inference", "R", "Tableau", "Power BI"],
    glowColor: "100,116,139",
    barColor: "#64748b",
    number: "04",
    vizType: "bars" as const,
  },
];

function MiniViz({ type, color }: { type: string; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 100;
    let raf: number;
    let t = 0;
    let visible = false;
    const observer = new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) raf = requestAnimationFrame(draw); }, { threshold: 0 });
    observer.observe(canvas);

    const [r, g, b] = color.split(",").map(Number);

    const draw = () => {
      if (!visible) return;
      t += 0.015;
      ctx.clearRect(0, 0, 200, 100);

      if (type === "line-down") {
        ctx.beginPath();
        for (let x = 0; x < 200; x += 3) {
          const y = 20 + (x / 200) * 50 + Math.sin(x * 0.05 + t * 2) * 8 - Math.sin(t + x * 0.02) * 5;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.lineTo(200, 100);
        ctx.lineTo(0, 100);
        ctx.fillStyle = `rgba(${r},${g},${b},0.03)`;
        ctx.fill();
      } else if (type === "scatter") {
        for (let i = 0; i < 30; i++) {
          const seed = i * 7.31;
          const x = (Math.sin(seed) * 0.5 + 0.5) * 180 + 10;
          const y = (Math.cos(seed * 1.3) * 0.5 + 0.5) * 80 + 10;
          const isOutlier = i % 7 === 0;
          const pulse = isOutlier ? 0.35 + Math.sin(t * 3 + i) * 0.15 : 0.15;
          const radius = isOutlier ? 3 + Math.sin(t * 2 + i) : 1.5;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${pulse})`;
          ctx.fill();
        }
      } else if (type === "wave") {
        for (let w = 0; w < 3; w++) {
          ctx.beginPath();
          for (let x = 0; x < 200; x += 3) {
            const y = 50 + Math.sin(x * 0.04 + t * 1.5 + w) * (20 - w * 5) + Math.cos(x * 0.02 + t + w * 2) * 8;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(${r},${g},${b},${0.25 - w * 0.07})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      } else if (type === "bars") {
        for (let i = 0; i < 8; i++) {
          const seed = i * 3.71;
          const h1 = 20 + Math.sin(seed) * 15 + Math.sin(t + i) * 5;
          const h2 = 25 + Math.cos(seed) * 15 + Math.sin(t * 1.3 + i) * 5;
          const x = 15 + i * 24;
          ctx.fillStyle = `rgba(${r},${g},${b},0.18)`;
          ctx.fillRect(x, 100 - h1, 8, h1);
          ctx.fillStyle = `rgba(${r},${g},${b},0.08)`;
          ctx.fillRect(x + 9, 100 - h2, 8, h2);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [type, color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 right-0 pointer-events-none opacity-60"
      style={{ width: 200, height: 100 }}
    />
  );
}

function Card3D({
  project,
  index,
}: {
  project: (typeof projects)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      const el = cardRef.current;
      const spot = spotRef.current;
      if (!el || !spot) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.transform = `perspective(800px) rotateX(${(y - 0.5) * -14}deg) rotateY(${(x - 0.5) * 14}deg) scale(1.03)`;
      spot.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(${project.glowColor},0.12) 0%, transparent 55%)`;
      spot.style.opacity = "1";
    },
    [project.glowColor]
  );

  const handleLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale(1)";
    if (spotRef.current) spotRef.current.style.opacity = "0";
  }, []);

  return (
    <ScrollReveal delay={index * 120}>
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="card-3d relative rounded-2xl overflow-hidden bg-[#08081a] border border-white/[0.05] hover:border-white/[0.12] group"
        style={{ willChange: "transform" }}
      >
        <div ref={spotRef} className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none z-10" />

        <div className="h-[2px] relative overflow-hidden" style={{ background: project.barColor }}>
          <div
            className="absolute inset-0 bg-white/40"
            style={{ animation: "shimmer-bar 2.5s ease-in-out infinite", animationDelay: `${index * 0.4}s` }}
          />
        </div>

        <div className="p-8 sm:p-10 relative min-h-[200px]">
          <span className="absolute -top-3 right-3 text-[8rem] font-black text-slate-400 opacity-[0.03] select-none pointer-events-none leading-none">
            {project.number}
          </span>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-slate-200 transition-colors relative z-10">
            {project.title}
          </h3>
          <p className="text-slate-400 text-sm mb-8 relative z-10">{project.impact}</p>

          <div className="flex flex-wrap gap-2 relative z-10">
            {project.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-500 text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>

          <MiniViz type={project.vizType} color={project.glowColor} />
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: `linear-gradient(to top, rgba(${project.glowColor},0.04) 0%, transparent 100%)` }}
        />
      </div>
    </ScrollReveal>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="py-28 sm:py-36 mesh-gradient relative">
      <div className="floating-shape top-[8%] right-[10%] w-32 h-32 border border-slate-500/40 rounded-full animate-float" />
      <div className="floating-shape bottom-[12%] left-[6%] w-16 h-16 border border-slate-600/40 animate-float-delayed" />

      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Projects</h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {projects.map((p, i) => (
            <Card3D key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
