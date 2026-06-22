"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Journey", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#06060e]/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#hero" className="text-lg font-bold text-slate-200 tracking-tight">
          GC
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-slate-500 hover:text-white transition-colors font-medium"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex px-4 py-2 rounded-lg border border-slate-500/30 text-slate-300 text-sm font-medium hover:bg-slate-500/10 transition-all"
        >
          Resume
        </a>

        <button
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-[#06060e]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <ul className="flex flex-col gap-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-slate-300 hover:text-white text-sm font-medium"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="text-slate-300 text-sm font-medium">
                Resume
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
