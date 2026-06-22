"use client";

import { useEffect, useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$&";

export default function TextScramble({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const [output, setOutput] = useState(" ".repeat(text.length));
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const framesPerChar = 3;
    const totalFrames = text.length * framesPerChar + 8;
    let frame = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const timerId = setTimeout(() => {
      intervalId = setInterval(() => {
        const resolved = Math.floor(frame / framesPerChar);
        let result = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") {
            result += " ";
          } else if (i < resolved) {
            result += text[i];
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setOutput(result);
        frame++;
        if (frame >= totalFrames) {
          setOutput(text);
          clearInterval(intervalId);
        }
      }, 35);
    }, delay);

    return () => {
      clearTimeout(timerId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, delay]);

  return <span className={className}>{output}</span>;
}
