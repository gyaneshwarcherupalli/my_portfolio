"use client";

import { useRef, useCallback } from "react";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/Icons";
import ScrollReveal from "@/components/ScrollReveal";

const links = [
  {
    icon: Mail,
    label: "Email",
    href: "mailto:gyaneshwarcherupalli@gmail.com",
    display: "gyaneshwarcherupalli@gmail.com",
    glowColor: "226,232,240",
  },
  {
    icon: LinkedinIcon,
    label: "LinkedIn",
    href: "https://linkedin.com/in/gyaneshwar-cherupalli",
    display: "gyaneshwar-cherupalli",
    glowColor: "203,213,225",
  },
  {
    icon: GithubIcon,
    label: "GitHub",
    href: "https://github.com/gyaneshwarcherupalli",
    display: "gyaneshwarcherupalli",
    glowColor: "148,163,184",
  },
];

function ContactCard({ link, index }: { link: (typeof links)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--glow-x", `${x}%`);
    el.style.setProperty("--glow-y", `${y}%`);
  }, []);

  return (
    <ScrollReveal delay={index * 100}>
      <a
        href={link.href}
        target={link.href.startsWith("http") ? "_blank" : undefined}
        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="block group"
      >
        <div
          ref={ref}
          onMouseMove={handleMove}
          className="relative flex items-center gap-4 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-500 hover:border-white/[0.12]"
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(${link.glowColor},0.08) 0%, transparent 60%)`,
            }}
          />

          <div
            className="relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300 text-slate-900"
            style={{
              background: `rgb(${link.glowColor})`,
              boxShadow: `0 0 25px rgba(${link.glowColor},0.15)`,
            }}
          >
            <link.icon size={20} />
          </div>
          <div className="relative min-w-0">
            <p className="text-white font-semibold text-sm group-hover:text-slate-200 transition-colors">{link.label}</p>
            <p className="text-slate-500 text-xs truncate">{link.display}</p>
          </div>
        </div>
      </a>
    </ScrollReveal>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="py-28 sm:py-36 mesh-gradient relative">
      <div className="floating-shape top-[10%] right-[12%] w-20 h-20 border border-slate-500/30 rounded-full animate-float" />

      <div className="max-w-3xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Let&apos;s Connect</h2>
          <p className="text-slate-500 text-sm">Open to roles, collaboration, or a chat about data.</p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-3 gap-4">
          {links.map((l, i) => (
            <ContactCard key={l.label} link={l} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
