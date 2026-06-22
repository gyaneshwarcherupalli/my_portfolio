"use client";

import { useEffect, useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const timeline = [
  {
    title: "Data Scientist",
    org: "T-Mobile",
    period: "Jan 2025 – Present",
    stack: ["Python", "SageMaker", "MLflow", "Airflow"],
    color: "#e2e8f0",
    type: "work" as const,
  },
  {
    title: "Data Scientist",
    org: "Global Payments",
    period: "Jun 2023 – Dec 2024",
    stack: ["XGBoost", "Azure ML", "Databricks"],
    color: "#cbd5e1",
    type: "work" as const,
  },
  {
    title: "Junior Data Scientist",
    org: "Ola",
    period: "May 2020 – Dec 2022",
    stack: ["Python", "SQL", "Scikit-Learn"],
    color: "#94a3b8",
    type: "work" as const,
  },
  {
    title: "MS in Data Science",
    org: "Pace University",
    period: "Jan 2023 – Dec 2024",
    stack: ["GPA 3.76"],
    color: "#64748b",
    type: "education" as const,
  },
];

export default function Experience() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const handler = () => {
      const rect = parent.getBoundingClientRect();
      const visible = Math.max(
        0,
        Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight * 0.5))
      );
      el.style.height = `${visible * 100}%`;
    };

    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <section id="experience" className="py-28 sm:py-36 relative">
      <div className="floating-shape bottom-[10%] left-[5%] w-24 h-24 border border-slate-500/30 rounded-full animate-float" />

      <div className="max-w-3xl mx-auto px-6">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Journey</h2>
        </ScrollReveal>

        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/[0.04]" />
          <div className="absolute left-[19px] top-0 w-px h-full overflow-hidden">
            <div
              ref={lineRef}
              className="w-full bg-slate-400"
              style={{ height: "0%", transition: "height 0.4s ease-out" }}
            />
          </div>

          <div className="space-y-12">
            {timeline.map((item, i) => (
              <ScrollReveal key={item.org} delay={i * 120}>
                <div className="relative flex gap-6 group">
                  <div className="relative shrink-0 z-10">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-shadow duration-500 group-hover:shadow-xl"
                      style={{
                        background: item.color,
                        boxShadow: `0 0 20px ${item.color}33`,
                      }}
                    >
                      <span className="text-slate-900 text-xs font-bold">
                        {item.type === "education" ? "MS" : String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        border: `1px solid ${item.color}`,
                        animation: "pulse-glow 2s ease-in-out infinite",
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <h3 className="text-white font-bold text-lg group-hover:text-slate-200 transition-colors">{item.org}</h3>
                      <span className="text-slate-500 text-xs font-medium shrink-0">{item.period}</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{item.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.stack.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-slate-500 text-xs font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
