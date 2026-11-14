# Meghdad Jafari — Portfolio

A single-page portfolio built with React and Vite: a name that zooms into one of its own letters as you scroll, a WebGL light behind it, and the rest of the page in a quiet warm-graphite style.

**Live:** [meghdadjafari.dev](https://meghdadjafari.dev)

This directory lives in the [homelab](https://github.com/Megjafari/homelab) repository, next to the blog. It is deployed to Vercel with the project's Root Directory set to `portfolio`.

---

## Stack

- React 18 and Vite
- Plain CSS, no UI framework
- Inter (variable) from `@fontsource-variable/inter`, SF Pro on Apple devices
- Canvas 2D for the zoom, a small WebGL fragment shader for the hero light
- Deployed on Vercel. The build goes to `build/`, so the Vercel output directory does not need to change.

---

## Run locally

From this directory:

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

---

## Content

All text lives in `src/data.js`: projects, blog posts, the homelab section, the About text and facts, skills, links and email. Edit that file and the sections follow.

The blog posts are listed by hand for now. The blog itself builds from `content/posts` in the repository root.

---

## How the hero works

`src/lib/zoom.js` draws the name on a canvas inside a sticky stage and redraws it larger on every scroll step. It rasterizes the name once, finds the thickest point of a letter with a distance transform, and zooms toward that point until the letter's inscribed circle covers the screen. The screen is then filled with the letter's color, which is also the background of the next scene.

The last frames are drawn from the same raster size the point was measured on. A small layout difference between two font sizes would otherwise be magnified by the zoom and miss the letter.

`src/lib/shader.js` renders the light behind the name at half resolution and pauses it when the hero is off screen. Reduced motion shows a still frame and a plain list of roles instead.

---

## Structure

```
index.html
vite.config.js
public/
  images/                   profile photo, logo
src/
  main.jsx
  App.jsx                   page, nav state, scroll reveal
  data.js                   all content
  styles.css
  lib/
    index.js                shared constants and helpers
    zoom.js                 the zoom effect
    shader.js               hero light
  components/
    Nav.jsx                 top bar and the mobile menu sheet
    Hero.jsx
    Roles.jsx               the flipping word
    Rows.jsx                project and blog rows that open in place
    TextReveal.jsx          words light up as you scroll
    Sections.jsx            projects, homelab, blog, about, skills, footer
    Icons.jsx
```

The CV is a dropdown in the footer (`src/components/CvMenu.jsx`). The files are in `public/`: `Meghdad-Jafari-Resume.pdf` (English) and `Meghdad-Jafari-cv.pdf` (Swedish). The list is `CV_FILES` in `src/data.js`.
