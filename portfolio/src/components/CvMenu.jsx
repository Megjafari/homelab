import { useEffect, useId, useRef, useState } from "react";
import { CV_FILES } from "../data.js";

// A small dropdown for the CV: a button that opens a list of downloads.
// It closes on a tap outside, on Escape (focus goes back to the button) and after a choice.
export default function CvMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const button = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="cv-menu" ref={root}>
      <button
        ref={button}
        type="button"
        className="cv-button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        CV <span className="arrow" aria-hidden="true">↓</span>
      </button>
      {open && (
        <ul className="cv-list" id={listId}>
          {CV_FILES.map((cv) => (
            <li key={cv.file}>
              <a href={`/${cv.file}`} download={cv.file} onClick={() => setOpen(false)}>
                {cv.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
