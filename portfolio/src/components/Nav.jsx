import { useEffect, useState } from "react";
import { BLOG, EMAIL } from "../data.js";

const LINKS = [
  { href: "#work", label: "Projects" },
  { href: BLOG, label: "Blog ↗︎" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Nav({ state }) {
  const [open, setOpen] = useState(false);

  // The sheet locks the page while it is open.
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    return () => document.documentElement.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const mq = matchMedia("(min-width: 721px)");
    const onChange = (m) => m.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <>
      <header className="nav" data-state={state}>
        <a className="logo" href="#top">
          <span className="hide-s">© </span>Meghdad Jafari
        </a>
        {LINKS.map((l) => (
          <a key={l.href} className={l.hideSmall ? "hide-s" : undefined} href={l.href}>
            {l.label}
          </a>
        ))}
        <button className="menu-btn" type="button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <div className={`menu-sheet${open ? " open" : ""}`} id="menu" inert={!open}>
        <nav aria-label="Menu" onClick={(e) => e.target.closest("a") && setOpen(false)}>
          {LINKS.map((l, i) => (
            <a key={l.href} href={l.href} style={{ "--i": i }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <span>Internship from 1 Feb 2027 · Gothenburg &amp; remote</span>
        </div>
      </div>
    </>
  );
}
