"use client";

import { useEffect, useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const rings = [
  { skills: ["Python", "SQL", "R", "PySpark"], radius: 115, duration: 26 },
  { skills: ["XGBoost", "Scikit-Learn", "MLflow", "Airflow", "A/B Testing", "Causal Inference"], radius: 200, duration: 42 },
  { skills: ["AWS", "Azure", "Snowflake", "Tableau", "Power BI", "Databricks", "BigQuery", "Plotly"], radius: 285, duration: 60 },
];

const ringColors = [
  { border: "rgba(226,232,240,0.10)", glow: "rgba(226,232,240,0.20)", dot: "#e2e8f0", text: "#e2e8f0" },
  { border: "rgba(148,163,184,0.08)", glow: "rgba(148,163,184,0.15)", dot: "#94a3b8", text: "#cbd5e1" },
  { border: "rgba(100,116,139,0.06)", glow: "rgba(100,116,139,0.12)", dot: "#64748b", text: "#94a3b8" },
];

const allSkills = rings.flatMap((r) => r.skills);

function EnergyPulse() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let count = 0;

    const pulse = () => {
      const ring = document.createElement("div");
      ring.style.cssText = `
        position:absolute;top:50%;left:50%;width:80px;height:80px;
        border-radius:50%;pointer-events:none;
        border:1px solid rgba(148,163,184,0.25);
        animation:energy-pulse 3s ease-out forwards;
      `;
      el.appendChild(ring);
      setTimeout(() => ring.remove(), 3100);
      count++;
    };

    const interval = setInterval(pulse, 2000);
    pulse();
    return () => clearInterval(interval);
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0" />;
}

export default function Skills() {
  return (
    <section id="skills" className="py-28 sm:py-36 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="floating-shape top-[10%] left-[5%] w-36 h-36 border border-slate-500/30 rounded-full animate-float" />
      <div className="floating-shape bottom-[12%] right-[7%] w-20 h-20 border border-slate-600/30 animate-float-delayed" />

      <div className="relative max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Tech Stack</h2>
        </ScrollReveal>

        <ScrollReveal className="hidden md:flex justify-center">
          <div className="orbit-container relative" style={{ width: 640, height: 640 }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-slate-400/[0.04] blur-[80px] pointer-events-none" />

            <EnergyPulse />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-slate-300 flex items-center justify-center shadow-2xl z-10 animate-pulse-glow">
              <span className="text-slate-900 text-[10px] font-bold text-center leading-tight tracking-widest uppercase">
                Data<br />Science
              </span>
            </div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]">
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1="320" y1="320"
                    x2={320 + Math.cos(a) * 310}
                    y2={320 + Math.sin(a) * 310}
                    stroke="#94a3b8" strokeWidth="1"
                  />
                );
              })}
            </svg>

            {rings.map((ring, ri) => {
              const rc = ringColors[ri];
              return (
                <div
                  key={ri}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: ring.radius * 2,
                    height: ring.radius * 2,
                    marginLeft: -ring.radius,
                    marginTop: -ring.radius,
                  }}
                >
                  <div className="absolute inset-0 rounded-full blur-[2px] pointer-events-none" style={{ border: `1px solid ${rc.glow}` }} />
                  <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${rc.border}` }} />

                  <div
                    className="orbit-ring absolute inset-0"
                    style={{
                      animation: `spin ${ring.duration}s linear infinite`,
                      animationDirection: ri % 2 === 0 ? "normal" : "reverse",
                    }}
                  >
                    {ring.skills.map((skill, si) => {
                      const angle = (si / ring.skills.length) * 2 * Math.PI - Math.PI / 2;
                      const x = Math.cos(angle) * ring.radius;
                      const y = Math.sin(angle) * ring.radius;
                      return (
                        <div
                          key={skill}
                          className="orbit-item absolute"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: "translate(-50%, -50%)",
                            animation: `counter-spin ${ring.duration}s linear infinite`,
                            animationDirection: ri % 2 === 0 ? "normal" : "reverse",
                          }}
                        >
                          <span
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap backdrop-blur-md cursor-default transition-all duration-300 hover:scale-110"
                            style={{
                              background: "rgba(8,8,26,0.9)",
                              border: `1px solid ${rc.border}`,
                              color: rc.text,
                              boxShadow: `0 0 20px ${rc.glow}, 0 4px 12px rgba(0,0,0,0.4)`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: rc.dot, boxShadow: `0 0 8px ${rc.dot}` }}
                            />
                            {skill}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        <div className="md:hidden flex flex-wrap justify-center gap-3">
          {allSkills.map((skill) => (
            <span key={skill} className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-slate-300 text-sm font-medium backdrop-blur-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
