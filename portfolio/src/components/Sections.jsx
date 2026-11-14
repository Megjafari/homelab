import { useState } from "react";
import { ABOUT, BLOG, EMAIL, GITHUB, HOMELAB, LINKEDIN, POSTS, PROJECTS, REPO, SKILLS } from "../data.js";
import CvMenu from "./CvMenu.jsx";
import Rows from "./Rows.jsx";
import TextReveal from "./TextReveal.jsx";
import { CheckIcon, CopyIcon } from "./Icons.jsx";

const Chapter = ({ id, n, title, children }) => (
  <section className="chapter" id={id}>
    <div className="chapter-label">
      <div className="n">{n}</div>
      <h2>{title}</h2>
    </div>
    {children}
  </section>
);

export const Projects = () => (
  <Chapter id="work" n="01" title="Things I've built">
    <Rows items={PROJECTS} />
  </Chapter>
);

export const Homelab = () => (
  <Chapter id="homelab" n="02" title="The homelab">
    <div>
      <TextReveal text={HOMELAB.statement} />
      <ol className="flow rv" style={{ "--i": 1 }}>
        {HOMELAB.flow.map((s) => (
          <li key={s.title}>
            <b>{s.title}</b>
            <span>{s.text}</span>
          </li>
        ))}
      </ol>
      <dl className="stats rv" style={{ "--i": 2 }}>
        {HOMELAB.stats.map((s) => (
          <div key={s.label}>
            <dt>{s.value}</dt>
            <dd>{s.label}</dd>
          </div>
        ))}
      </dl>
      <div className="hl-links rv" style={{ "--i": 3 }}>
        <a className="btn" href={REPO} target="_blank" rel="noopener noreferrer">Open the repository <span className="arrow">→</span></a>
        <a className="btn ghost" href={POSTS[0].demo} target="_blank" rel="noopener noreferrer">What broke along the way <span className="arrow">→</span></a>
      </div>
      <ul className="chips rv big" style={{ "--i": 4 }}>
        {HOMELAB.tags.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  </Chapter>
);

export const Blog = () => (
  <Chapter id="journal" n="03" title="Blog">
    <div>
      <Rows items={POSTS} alwaysOpen id="posts" />
      <a className="all-posts rv" href={BLOG} target="_blank" rel="noopener noreferrer">Open the blog <span className="arrow">→</span></a>
    </div>
  </Chapter>
);

export const About = () => (
  <Chapter id="about" n="04" title="About">
    <div className="about-wrap">
      <figure className="about-photo rv">
        <img src="/images/profile.jpg" alt="Portrait of Meghdad Jafari" width="520" height="650" />
      </figure>
      <div className="about-text">
        <TextReveal text={ABOUT.statement} />
        <p className="about-small rv">{ABOUT.small}</p>
        <dl className="facts rv" style={{ "--i": 1 }}>
          {ABOUT.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </Chapter>
);

export const Skills = () => (
  <Chapter id="skills" n="05" title="Skills">
    <div className="skill-cols rv">
      {SKILLS.map((g) => (
        <div key={g.group}>
          <h4>{g.group}</h4>
          <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      ))}
    </div>
  </Chapter>
);

export function Footer() {
  const [copied, setCopied] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    setTimeout(() => setCopied(""), 1600);
  };

  return (
    <footer className="foot" id="contact">
      <h2 className="rv">Let's talk.</h2>
      <div className="foot-mail rv" style={{ "--i": 1 }}>
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <button className={`copy${copied === "ok" ? " ok" : ""}`} type="button" onClick={copy} aria-label="Copy email address">
          <span className="t">{copied === "ok" ? "Copied" : copied === "fail" ? "Press ⌘C" : "Copy"}</span>
          <CopyIcon />
          <CheckIcon />
        </button>
      </div>
      <p className="foot-status rv" style={{ "--i": 2 }}>Internship from 1 Feb 2027 · Gothenburg &amp; remote</p>
      <ul className="foot-links rv" style={{ "--i": 3 }}>
        <li><a href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub <span className="arrow">↗︎</span></a></li>
        <li><a href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn <span className="arrow">↗︎</span></a></li>
        <li><CvMenu /></li>
      </ul>
      <div className="foot-end">
        <span>© 2026 Meghdad Jafari</span>
        <a href={REPO} target="_blank" rel="noopener noreferrer">Source on GitHub</a>
      </div>
    </footer>
  );
}
