"use client";

import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

function StatRing({
  target,
  suffix,
  label,
  sub,
  percent,
  color,
  index,
}: {
  target: number;
  suffix: string;
  label: string;
  sub: string;
  percent: number;
  color: string;
  index: number;
}) {
  const circleRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const [value, setValue] = useState(0);
  const triggered = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          if (circleRef.current) {
            circleRef.current.style.strokeDashoffset = String(circumference * (1 - percent / 100));
          }
          if (glowRef.current) {
            glowRef.current.style.strokeDashoffset = String(circumference * (1 - percent / 100));
          }
          const duration = 2400;
          const start = performance.now();
          const step = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            setValue(Math.round(eased * target * 100) / 100);
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, percent, circumference]);

  const display = Number.isInteger(target) ? Math.round(value) : value.toFixed(2);

  return (
    <ScrollReveal delay={index * 150}>
      <div ref={containerRef} className="flex flex-col items-center group">
        <div className="relative w-40 h-40 sm:w-44 sm:h-44 mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
            <circle
              ref={glowRef}
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              opacity="0.1"
              style={{ transition: "stroke-dashoffset 2.4s cubic-bezier(0.16,1,0.3,1)", filter: "blur(4px)" }}
            />
            <circle
              ref={circleRef}
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              style={{ transition: "stroke-dashoffset 2.4s cubic-bezier(0.16,1,0.3,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {display}{suffix}
            </span>
          </div>
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{ boxShadow: `0 0 60px ${color}22, 0 0 120px ${color}11` }}
          />
        </div>
        <div className="text-white font-semibold text-sm tracking-wide">{label}</div>
        <div className="text-slate-500 text-xs mt-0.5">{sub}</div>
      </div>
    </ScrollReveal>
  );
}

const stats = [
  { target: 5, suffix: "+", label: "Years", sub: "Experience", percent: 85, color: "#e2e8f0" },
  { target: 3, suffix: "", label: "Industries", sub: "Telecom · Fintech · Mobility", percent: 75, color: "#cbd5e1" },
  { target: 3.76, suffix: "", label: "GPA", sub: "MS Data Science", percent: 94, color: "#94a3b8" },
  { target: 20, suffix: "%", label: "Accuracy Lift", sub: "Best Improvement", percent: 70, color: "#64748b" },
];

export default function About() {
  return (
    <section id="stats" className="py-32 sm:py-40 mesh-gradient relative overflow-hidden">
      <div className="floating-shape top-[10%] left-[10%] w-24 h-24 border border-slate-500/40 rounded-full animate-float" />
      <div className="floating-shape bottom-[8%] right-[12%] w-16 h-16 border border-slate-600/40 animate-float-delayed" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-slate-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-14">
          {stats.map((s, i) => (
            <StatRing key={s.label} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
