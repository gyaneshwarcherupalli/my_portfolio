"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = -500;
    let y = -500;
    let tx = -500;
    let ty = -500;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const animate = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.transform = `translate(${x - 250}px, ${y - 250}px)`;
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 pointer-events-none z-[9999] w-[500px] h-[500px] rounded-full hidden md:block"
      style={{
        background: "radial-gradient(circle, rgba(148,163,184,0.05) 0%, rgba(100,116,139,0.02) 40%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
