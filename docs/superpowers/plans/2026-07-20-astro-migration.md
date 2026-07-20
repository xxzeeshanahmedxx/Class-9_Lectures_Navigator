# Class 9 Lectures Navigator — Astro + Tailwind 4 Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate vanilla JS SPA to Astro 7 + Tailwind 4 with pre-rendered pages, View Transitions, per-subject theming, and YouTube player overlay.

**Architecture:** Static Astro site with `getStaticPaths()` reading JSON data at build time. 4 page templates (Home, Subject chapters, Chapter sections/videos, Section videos). Client island for YouTube player. Cloudflare Pages deploy.

**Tech Stack:** Astro 7, Tailwind CSS 4, @fontsource/inter + @fontsource/jetbrains-mono, @astrojs/cloudflare adapter

## Global Constraints

- Keep `data/*.json` unchanged (move to `src/data/`)
- Keep `thumbs/*.webp`, `assets/*.webp`, `icon-*.png` in `public/`
- Every page pre-rendered — no client-side routing
- View Transitions `morph` swap for SPA feel
- Per-subject color tokens passed as props from `getStaticPaths()`
- Self-host Inter + JetBrains Mono via @fontsource
- All CSS via Tailwind 4 utility classes (no hand-written CSS files)
- Service worker caching same as current

---

## File Structure

```
project root/
├── package.json                  — new
├── astro.config.mjs              — new
├── tsconfig.json                 — new
├── src/
│   ├── data/                     — moved from root data/
│   │   ├── subjects.json
│   │   ├── math.json
│   │   ├── physics.json
│   │   ├── chemistry.json
│   │   ├── urdu.json
│   │   └── computer.json
│   ├── layouts/
│   │   └── Layout.astro          — new: head, view transitions, header with back btn
│   ├── components/
│   │   ├── ThemeStyles.astro     — new: per-subject CSS custom properties
│   │   ├── SubjectCard.astro     — new: home page card
│   │   ├── ChapterRow.astro      — new: chapter list row
│   │   ├── SectionRow.astro      — new: section list row
│   │   ├── VideoCard.astro       — new: video thumbnail card
│   │   └── PlayerOverlay.js      — new: client island for YT player + swipe + fullscreen
│   ├── pages/
│   │   ├── index.astro           — new: home with 5 subject cards
│   │   └── [subject]/
│   │       ├── index.astro       — new: chapter list for subject
│   │       └── [chapter]/
│   │           ├── index.astro   — new: sections (exercises) OR videos (chapters)
│   │           └── [section]/index.astro — new: video grid (math only)
│   └── styles/
│       └── global.css            — new: @fontsource imports + Tailwind base
├── public/
│   ├── manifest.json             — copy from current
│   ├── sw.js                     — copy from current
│   ├── thumbs/                   — keep
│   ├── assets/                   — keep
│   └── icon-*.png               — keep
├── data/                         — moved to src/data/, delete after
├── index.html                    — delete
├── app.js                        — delete
├── styles.css                    — delete
├── _headers                      — delete
├── _redirects                    — delete
├── DESIGN.md                     — keep (reference)
├── README.md                     — keep
├── scripts/                      — keep
├── docs/                         — keep
├── node_modules/                 — delete + reinstall
├── package.json / package-lock.json — replace
```

---

### Task 1: Scaffold Astro + Tailwind 4 Project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "class-9-lectures-navigator",
  "type": "module",
  "version": "2.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "deploy": "astro build && wrangler pages deploy dist --project-name 9lectures"
  },
  "dependencies": {
    "@fontsource/inter": "^5.2.5",
    "@fontsource/jetbrains-mono": "^5.2.5",
    "astro": "^7.0.0"
  },
  "devDependencies": {
    "@astrojs/cloudflare": "^13.0.0",
    "@tailwindcss/vite": "^4.3.0",
    "tailwindcss": "^4.3.0",
    "typescript": "^5.7.0",
    "wrangler": "^4.107.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://9lectures.pages.dev',
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@data/*": ["src/data/*"]
    }
  }
}
```

- [ ] **Step 4: Create `src/styles/global.css`**

```css
@import "tailwindcss";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/jetbrains-mono/400.css";
```

- [ ] **Step 5: Install dependencies**

Run: `npm install` in project root
Expected: All deps installed, no errors

- [ ] **Step 6: Verify Astro builds empty site**

Run: `npx astro build`
Expected: Build succeeds, `dist/` created

- [ ] **Step 7: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json src/styles/global.css package-lock.json
git rm -r node_modules
git commit -m "wip: scaffold Astro + Tailwind 4"
```

---

### Task 2: Move Data Files to src/data/

**Files:**
- Move: `data/*.json` → `src/data/*.json`

- [ ] **Step 1: Create `src/data/` directory and move files**

```bash
mkdir src/data
git mv data/subjects.json src/data/subjects.json
git mv data/math.json src/data/math.json
git mv data/physics.json src/data/physics.json
git mv data/chemistry.json src/data/chemistry.json
git mv data/urdu.json src/data/urdu.json
git mv data/computer.json src/data/computer.json
```

- [ ] **Step 2: Delete empty data/ directory**

```bash
rmdir data 2>$null
```

- [ ] **Step 3: Commit**

```bash
git add src/data/
git commit -m "wip: move data JSON to src/data/"
```

---

### Task 3: Create Layout.astro + ThemeStyles Component

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `src/components/ThemeStyles.astro`

**Interfaces:**
- Consumes: subject color tokens from subject JSON files
- Produces: `<Layout>` component used by all pages

- [ ] **Step 1: Create `src/components/ThemeStyles.astro`**

```astro
---
export interface Props {
  colors: {
    accent: string;
    accent2: string;
    bg: string;
    bg2: string;
    bg3: string;
    card: string;
    card2: string;
    line: string;
    soft: string;
  } | null;
}

const { colors } = Astro.props;
---

{colors && (
  <style>
    :root {
      --accent: {colors.accent};
      --accent2: {colors.accent2};
      --bg: {colors.bg};
      --bg2: {colors.bg2};
      --bg3: {colors.bg3};
      --card: {colors.card};
      --card2: {colors.card2};
      --line: {colors.line};
      --soft: {colors.soft};
    }
  </style>
)}
```

- [ ] **Step 2: Create `src/layouts/Layout.astro`**

```astro
---
import { ViewTransitions } from 'astro:transitions';
import '../styles/global.css';
import ThemeStyles from '../components/ThemeStyles.astro';

export interface Props {
  title: string;
  subtitle?: string;
  colors?: {
    accent: string; accent2: string; bg: string; bg2: string; bg3: string;
    card: string; card2: string; line: string; soft: string;
  } | null;
  backUrl?: string;
}

const { title, subtitle, colors, backUrl } = Astro.props;
---

<!doctype html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <ViewTransitions />
    <title>{title}</title>
    <meta name="description" content="Study lectures for 9th grade students across Pakistan — Mathematics, Physics, Chemistry, Computer, Urdu." />
    <meta name="theme-color" content={colors?.bg || '#070a1a'} />
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'><polygon points='5,3 19,12 5,21'/></svg>" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <ThemeStyles colors={colors} />
  </head>
  <body class="min-h-screen flex flex-col" style="background-color: var(--bg, #070a1a); color: #f2f6ff;">
    <header class="sticky top-0 z-40 backdrop-blur-md" style="background: color-mix(in srgb, var(--bg, #070a1a) 80%, transparent); border-bottom: 1px solid var(--line, #1e2a4a);">
      <div class="flex items-center gap-3 px-4 h-12 max-w-4xl mx-auto">
        {backUrl && (
          <a href={backUrl} class="flex items-center justify-center w-8 h-8 rounded-lg text-lg font-mono hover:opacity-70 transition-opacity" style="color: var(--accent, #8cb4ff);" data-astro-transition-persist>&lsaquo;</a>
        )}
        <div class="min-w-0">
          <h1 class="text-sm font-semibold truncate">{title}</h1>
          {subtitle && <p class="text-xs truncate opacity-60">{subtitle}</p>}
        </div>
      </div>
    </header>
    <main class="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
      <slot />
    </main>
    <footer class="text-center text-xs py-4 opacity-40 px-4">
      Made by Zeeshan Ahmed (17) for 9th grade students across Pakistan
    </footer>
  </body>
</html>
```

- [ ] **Step 3: Verify build**

Run: `npx astro build`
Expected: Build succeeds (no pages yet, just Layout)

- [ ] **Step 4: Commit**

```bash
git add src/layouts/ src/components/ThemeStyles.astro
git commit -m "wip: create Layout + ThemeStyles"
```

---

### Task 4: Create UI Components

**Files:**
- Create: `src/components/SubjectCard.astro`
- Create: `src/components/ChapterRow.astro`
- Create: `src/components/SectionRow.astro`
- Create: `src/components/VideoCard.astro`

- [ ] **Step 1: Create `src/components/SubjectCard.astro`**

```astro
---
export interface Props {
  id: string;
  title: string;
  emoji: string;
  accent: string;
}

const { id, title, emoji, accent } = Astro.props;
---

<a
  href={`/${id}/`}
  class="group relative rounded-2xl overflow-hidden border aspect-[4/3] flex flex-col justify-end p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
  style="border-color: color-mix(in srgb, {accent} 20%, transparent); background: linear-gradient(135deg, color-mix(in srgb, {accent} 8%, transparent), transparent);"
>
  <img src={`/assets/${id}.webp`} alt={title} class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" loading="lazy" />
  <div class="relative z-10">
    <span class="text-2xl font-bold font-mono" style="color: {accent};">{emoji}</span>
    <h2 class="text-lg font-semibold mt-1">{title}</h2>
  </div>
</a>
```

- [ ] **Step 2: Create `src/components/ChapterRow.astro`**

```astro
---
export interface Props {
  number: number;
  title: string;
  count: number;
  countLabel: string;
  href: string;
}

const { number, title, count, countLabel, href } = Astro.props;
---

<a
  href={href}
  class="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 hover:opacity-80"
  style="border-bottom: 1px solid var(--line, #1e2a4a);"
>
  <span class="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-mono font-bold flex-shrink-0" style="background: var(--soft, #1a2544); color: var(--accent, #8cb4ff);">
    {number}
  </span>
  <div class="min-w-0 flex-1">
    <div class="text-sm font-medium truncate">{title}</div>
    <span class="text-xs opacity-50">{count} {countLabel}</span>
  </div>
  <span class="text-lg opacity-30 font-mono flex-shrink-0" style="color: var(--accent, #8cb4ff);">&rarr;</span>
</a>
```

- [ ] **Step 3: Create `src/components/SectionRow.astro`**

```astro
---
export interface Props {
  number: number;
  title: string;
  videoCount: number;
  href: string;
}

const { number, title, videoCount, href } = Astro.props;
---

<a
  href={href}
  class="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 hover:opacity-80"
  style="border-bottom: 1px solid var(--line, #1e2a4a);"
>
  <span class="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-mono font-bold flex-shrink-0" style="background: var(--soft, #1a2544); color: var(--accent, #8cb4ff);">
    {number}
  </span>
  <div class="min-w-0 flex-1">
    <div class="text-sm font-medium truncate">{title}</div>
    <span class="text-xs opacity-50">{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
  </div>
  <span class="text-lg opacity-30 font-mono flex-shrink-0" style="color: var(--accent, #8cb4ff);">&rarr;</span>
</a>
```

- [ ] **Step 4: Create `src/components/VideoCard.astro`**

```astro
---
export interface Props {
  videoId: string;
  title: string;
  subtitle?: string;
  duration?: string;
  thumb: string;
}

const { videoId, title, subtitle, duration, thumb } = Astro.props;
---

<div class="group">
  <button
    data-video-id={videoId}
    class="video-trigger relative w-full aspect-video rounded-xl overflow-hidden border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus-visible:ring-2"
    style="border-color: var(--line, #1e2a4a);"
    aria-label={`Play ${title}`}
  >
    <img src={thumb} alt={title} class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    {duration && (
      <span class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
        {duration}
      </span>
    )}
    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
      <span class="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#000"><polygon points="5,3 19,12 5,21"/></svg>
      </span>
    </div>
  </button>
  <h3 class="text-sm font-medium mt-2 line-clamp-2">{title}</h3>
  {subtitle && <p class="text-xs mt-0.5 opacity-50 line-clamp-1">{subtitle}</p>}
</div>
```

- [ ] **Step 5: Verify build**

Run: `npx astro build`
Expected: Build succeeds (components exist, no pages yet)

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "wip: create SubjectCard, ChapterRow, SectionRow, VideoCard"
```

---

### Task 5: Create Home Page

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import SubjectCard from '../components/SubjectCard.astro';
import subjects from '../data/subjects.json';
---

<Layout title="Class 9 · Punjab Curriculum">
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" slot="default">
    {subjects.map((s) => (
      <SubjectCard id={s.id} title={s.title} emoji={s.emoji} accent={s.accent} />
    ))}
  </div>
</Layout>
```

- [ ] **Step 2: Build and verify**

Run: `npx astro build`
Expected: `dist/index.html` generated with 5 subject cards linking to `/math/`, `/physics/`, etc.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "wip: create home page"
```

---

### Task 6: Create Subject Page (Chapter List)

**Files:**
- Create: `src/pages/[subject]/index.astro`

- [ ] **Step 1: Create `src/pages/[subject]/index.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import ChapterRow from '../../components/ChapterRow.astro';
import subjects from '../../data/subjects.json';

export async function getStaticPaths() {
  return subjects.map((s) => ({
    params: { subject: s.id },
    props: { subject: s },
  }));
}

const { subject } = Astro.props;
const data = await import(`../../data/${subject.data}`).then((m) => m.default);
const chapters = data.chapters || [];
const isExercises = data.kind === 'exercises';
---

<Layout title={subject.title} subtitle="Select a chapter" colors={subject} backUrl="/">
  <div class="flex flex-col">
    {chapters.map((ch, i) => {
      const num = ch.number || ch.chapterNumber || i + 1;
      const chTitle = ch.title || 'Chapter ' + num;
      if (isExercises) {
        const sc = (ch.sections || []).length;
        return (
          <ChapterRow
            number={num}
            title={chTitle}
            count={sc}
            countLabel={sc === 1 ? 'section' : 'sections'}
            href={`/${subject.id}/${ch.id}/`}
          />
        );
      } else {
        const vc = ch.videos ? ch.videos.length : 0;
        return (
          <ChapterRow
            number={num}
            title={chTitle}
            count={vc}
            countLabel={vc === 1 ? 'video' : 'videos'}
            href={`/${subject.id}/${ch.id}/`}
          />
        );
      }
    })}
  </div>
</Layout>
```

- [ ] **Step 2: Build and verify**

Run: `npx astro build`
Expected: `/math/index.html`, `/physics/index.html` etc. generated with chapter lists

- [ ] **Step 3: Commit**

```bash
git add src/pages/[subject]/index.astro
git commit -m "wip: create subject chapter list page"
```

---

### Task 7: Create Chapter Page (Sections or Videos)

**Files:**
- Create: `src/pages/[subject]/[chapter]/index.astro`

- [ ] **Step 1: Create `src/pages/[subject]/[chapter]/index.astro`**

```astro
---
import Layout from '../../../layouts/Layout.astro';
import SectionRow from '../../../components/SectionRow.astro';
import VideoCard from '../../../components/VideoCard.astro';
import subjects from '../../../data/subjects.json';

export async function getStaticPaths() {
  const paths = [];
  for (const s of subjects) {
    const data = await import(`../../../data/${s.data}`).then((m) => m.default);
    const chapters = data.chapters || [];
    for (const ch of chapters) {
      paths.push({
        params: { subject: s.id, chapter: ch.id },
        props: { subject: s, chapter: ch, dataKind: data.kind },
      });
    }
  }
  return paths;
}

const { subject, chapter, dataKind } = Astro.props;
const isExercises = dataKind === 'exercises';
const num = chapter.number || chapter.chapterNumber || '';
const chTitle = chapter.title || '';
const displayTitle = num ? `Chapter ${num}` : chTitle;
---

<Layout
  title={displayTitle}
  subtitle={chTitle}
  colors={subject}
  backUrl={`/${subject.id}/`}
>
  {isExercises ? (
    <div class="flex flex-col">
      {(chapter.sections || []).map((sec, i) => (
        <SectionRow
          number={i + 1}
          title={sec.title}
          videoCount={(sec.videos || []).length}
          href={`/${subject.id}/${chapter.id}/${sec.id}/`}
        />
      ))}
    </div>
  ) : (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {(chapter.videos || []).map((v) => (
        <VideoCard
          videoId={v.videoId}
          title={v.title}
          subtitle={v.subtitle}
          duration={v.duration}
          thumb={v.thumb}
        />
      ))}
    </div>
  )}
</Layout>
```

- [ ] **Step 2: Build and verify**

Run: `npx astro build`
Expected: `/math/ch1/index.html`, `/physics/ch1/index.html` etc. generated. Math renders section rows, physics renders video grid.

- [ ] **Step 3: Commit**

```bash
git add src/pages/[subject]/[chapter]/index.astro
git commit -m "wip: create chapter page (sections or videos)"
```

---

### Task 8: Create Section Page (Video Grid — Math Only)

**Files:**
- Create: `src/pages/[subject]/[chapter]/[section]/index.astro`

- [ ] **Step 1: Create `src/pages/[subject]/[chapter]/[section]/index.astro`**

```astro
---
import Layout from '../../../../layouts/Layout.astro';
import VideoCard from '../../../../components/VideoCard.astro';
import subjects from '../../../../data/subjects.json';
import mathData from '../../../../data/math.json';

export async function getStaticPaths() {
  const paths = [];
  for (const ch of mathData.chapters || []) {
    for (const sec of ch.sections || []) {
      paths.push({
        params: { subject: 'math', chapter: ch.id, section: sec.id },
        props: { chapter: ch, section: sec },
      });
    }
  }
  return paths;
}

const { chapter, section } = Astro.props;
const mathSubject = subjects.find((s) => s.id === 'math');
const videos = section.videos || [];
---

<Layout
  title={section.title}
  subtitle={`${chapter.title} · ${videos.length} videos`}
  colors={mathSubject}
  backUrl={`/math/${chapter.id}/`}
>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {videos.map((v) => (
      <VideoCard
        videoId={v.videoId}
        title={v.title}
        subtitle={v.subtitle}
        duration={v.duration}
        thumb={v.thumb}
      />
    ))}
  </div>
</Layout>
```

- [ ] **Step 2: Build and verify**

Run: `npx astro build`
Expected: `/math/ch1/ex1.1/index.html` etc. generated with video grids. Only math has section pages.

- [ ] **Step 3: Commit**

```bash
git add src/pages/[subject]/[chapter]/[section]/index.astro
git commit -m "wip: create section video page (math only)"
```

---

### Task 9: Create YouTube Player Overlay (Client Island)

**Files:**
- Create: `src/components/PlayerOverlay.js`

- [ ] **Step 1: Create `src/components/PlayerOverlay.js`**

```js
export default class PlayerOverlay {
  constructor() {
    this.overlay = null;
    this.container = null;
    this.iframe = null;
    this.cleanup = null;
    this.setup();
  }

  setup() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 bg-black/90 flex items-end sm:items-center justify-center transition-all duration-300 opacity-0 pointer-events-none';
    overlay.innerHTML = `
      <div class="player-wrap w-full sm:max-w-3xl sm:rounded-2xl overflow-hidden bg-black translate-y-8 transition-transform duration-300">
        <div class="flex justify-end p-2">
          <button class="player-close w-8 h-8 flex items-center justify-center text-white/60 hover:text-white text-lg" aria-label="Close player">✕</button>
        </div>
        <div class="player-container relative aspect-video"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.container = overlay.querySelector('.player-container');
    const wrap = overlay.querySelector('.player-wrap');

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    overlay.querySelector('.player-close').addEventListener('click', () => this.close());

    // Swipe down to dismiss
    let startY = 0, currentY = 0, dragging = false;
    const ts = (e) => { startY = e.touches[0].clientY; currentY = startY; dragging = true; wrap.style.transition = 'none'; };
    const tm = (e) => {
      if (!dragging) return;
      currentY = e.touches[0].clientY;
      const d = currentY - startY;
      if (d > 0) {
        wrap.style.transform = 'translateY(' + d + 'px)';
        overlay.style.background = 'rgba(0,0,0,' + Math.max(0, 0.9 - d / window.innerHeight * 0.9) + ')';
      }
    };
    const te = () => {
      if (!dragging) return;
      dragging = false;
      const d = currentY - startY;
      wrap.style.transition = '';
      wrap.style.transform = '';
      overlay.style.background = '';
      if (d > window.innerHeight * 0.3) this.close();
    };
    overlay.addEventListener('touchstart', ts, { passive: true });
    overlay.addEventListener('touchmove', tm, { passive: true });
    overlay.addEventListener('touchend', te);
    this.cleanup = () => {
      overlay.removeEventListener('touchstart', ts);
      overlay.removeEventListener('touchmove', tm);
      overlay.removeEventListener('touchend', te);
      this.cleanup = null;
    };

    // Fullscreen orientation lock
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement && screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      } else if (!document.fullscreenElement && screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    });
  }

  open(videoId) {
    this.container.innerHTML = `<iframe class="absolute inset-0 w-full h-full" src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1" frameborder="0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    this.overlay.classList.remove('opacity-0', 'pointer-events-none');
    this.overlay.querySelector('.player-wrap').classList.remove('translate-y-8');
  }

  close() {
    if (this.cleanup) this.cleanup();
    const wrap = this.overlay.querySelector('.player-wrap');
    wrap.classList.add('translate-y-8');
    this.overlay.classList.add('opacity-0');
    this.overlay.classList.add('pointer-events-none');
    setTimeout(() => { this.container.innerHTML = ''; }, 300);
  }
}
```

- [ ] **Step 2: Add player initialization script to Layout.astro**

Append before closing `</body>` in `src/layouts/Layout.astro`:

```astro
<script>
  import PlayerOverlay from '../components/PlayerOverlay.js';

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.video-trigger');
    if (btn) {
      const videoId = btn.dataset.videoId;
      if (videoId) {
        e.preventDefault();
        const player = new PlayerOverlay();
        player.open(videoId);
      }
    }
  });
</script>
```

- [ ] **Step 3: Build and verify**

Run: `npx astro build`
Expected: Build succeeds. PlayerOverlay script included in final HTML.

- [ ] **Step 4: Commit**

```bash
git add src/components/PlayerOverlay.js src/layouts/Layout.astro
git commit -m "wip: create YouTube player overlay with swipe + fullscreen"
```

---

### Task 10: Add PWA (Manifest + Service Worker)

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`

- [ ] **Step 1: Create `public/manifest.json`**

```json
{
  "name": "Class 9 · Punjab Curriculum",
  "short_name": "Class 9",
  "description": "Study lectures for 9th grade students across Pakistan",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#070a1a",
  "theme_color": "#070a1a",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Create `public/sw.js`**

Same as current service-worker.js but with updated cache name and asset paths:

```js
const CACHE = '9lectures-v3';
const ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        if (event.request.destination === 'document') return caches.match('/');
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
```

- [ ] **Step 3: Add SW registration to Layout.astro**

Add before `</head>` in `src/layouts/Layout.astro`:

```astro
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
</script>
```

- [ ] **Step 4: Build and verify**

Run: `npx astro build`
Expected: `public/manifest.json` and `public/sw.js` copied to `dist/`

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/sw.js src/layouts/Layout.astro
git commit -m "wip: add PWA manifest + service worker"
```

---

### Task 11: Clean Up Old Files + Configure Deploy

**Files:**
- Delete: `app.js`, `index.html`, `styles.css`, `_headers`, `_redirects`, old `service-worker.js`, old `manifest.json`
- Delete: old `package.json`/`package-lock.json` (already replaced in Task 1)

- [ ] **Step 1: Delete old files**

```bash
git rm app.js index.html styles.css _headers _redirects service-worker.js manifest.json
```

- [ ] **Step 2: Build full site and verify**

Run: `npx astro build`
Expected: Build succeeds. Check `dist/` contains all pages.

Run: `ls dist/`
Expected: `index.html`, `math/index.html`, `physics/index.html`, `chemistry/index.html`, `urdu/index.html`, `computer/index.html`, `math/ch1/index.html`, etc.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: migrate to Astro 7 + Tailwind 4"
git push origin master
```

---

### Task 12: Verify Production Build

- [ ] **Step 1: Preview production build locally**

Run: `npx astro preview`
Expected: Site serves locally. Click through home → subject → chapter → video. Verify back button works.

- [ ] **Step 2: Check page count**

Run: Search build output for all generated HTML files

```bash
Get-ChildItem -Path dist -Recurse -Filter "*.html" | Measure-Object | Select-Object -ExpandProperty Count
```

Expected: Should match current route count (1 home + 5 subjects + N chapters + M sections)
