import { useEffect, useMemo, useRef } from "react";
import { clamp, reduced } from "../lib/index.js";

// Words light up one after the other as the paragraph scrolls through the screen.
export default function TextReveal({ text, className = "" }) {
  const ref = useRef(null);
  const words = useMemo(() => text.trim().split(/\s+/), [text]);

  useEffect(() => {
    const el = ref.current;
    const spans = [...el.querySelectorAll(".rw")];
    if (reduced) {
      spans.forEach((s) => (s.style.opacity = "1"));
      return undefined;
    }
    const n = spans.length;
    const DIM = 0.36;
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh * 0.85 - r.top) / (vh * 0.45 + r.height * 0.8), 0, 1);
      spans.forEach((sp, i) => {
        const k = clamp(p * (n + 1) - i, 0, 1);
        sp.style.opacity = (DIM + (1 - DIM) * k).toFixed(3);
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [words]);

  return (
    <p ref={ref} className={`reveal-text ${className}`}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="rw">{w}</span>{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
