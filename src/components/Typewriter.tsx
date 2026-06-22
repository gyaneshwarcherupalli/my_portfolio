"use client";

import { useEffect, useState, useRef } from "react";

const ROLES = [
  "Data Scientist",
  "ML Engineer",
  "Analytics Architect",
  "Experimentation Lead",
];

export default function Typewriter({ className = "" }: { className?: string }) {
  const [text, setText] = useState("");
  const state = useRef({ idx: 0, char: 0, deleting: false, pause: false });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const s = state.current;
      const word = ROLES[s.idx];

      if (s.pause) {
        s.pause = false;
        s.deleting = true;
        timer = setTimeout(tick, 1800);
        return;
      }

      if (!s.deleting) {
        s.char++;
        setText(word.slice(0, s.char));
        if (s.char === word.length) {
          s.pause = true;
          timer = setTimeout(tick, 80);
          return;
        }
        timer = setTimeout(tick, 70 + Math.random() * 40);
      } else {
        s.char--;
        setText(word.slice(0, s.char));
        if (s.char === 0) {
          s.deleting = false;
          s.idx = (s.idx + 1) % ROLES.length;
          timer = setTimeout(tick, 400);
          return;
        }
        timer = setTimeout(tick, 30);
      }
    };

    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span className={className}>
      {text}
      <span className="typewriter-cursor text-indigo-400">|</span>
    </span>
  );
}
