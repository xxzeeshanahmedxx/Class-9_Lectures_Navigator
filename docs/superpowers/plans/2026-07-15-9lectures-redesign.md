# 9Lectures Full UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the 9Lectures study app end-to-end with Vercel design language (dark-mode), add continue-watching + progress tracking via localStorage, and offline app shell via Service Worker.

**Architecture:** Single-page app (no framework). All data from static JSON files. Progress/continue-watching persisted in localStorage. Offline via install-time service worker caching app shell + data JSONs.

**Tech Stack:** Vanilla JS, CSS custom properties, Google Fonts (Inter + JetBrains Mono), localStorage API, Service Worker API.

## Global Constraints
- All CSS in `styles.css` (single file, formatted multi-line, NOT minified)
- All JS in `app.js` (single file, keep existing function-based architecture)
- No build step, no npm dependencies, no frameworks
- Google Fonts: Inter (400, 500, 600) + JetBrains Mono (400 at 12px)
- No external icons — use inline SVGs
- Must remain deployable to Cloudflare Pages

---
### Task 1: Foundation — Fonts, Color Tokens, CSS Reset, Background Mesh

**Files:**
- Modify: `index.html` — add font preconnects
- Modify: `styles.css` — full rewrite with design tokens

**Interfaces:**
- Consumes: nothing
- Produces: CSS custom properties used by all subsequent tasks. Font assets loaded.

- [ ] **Step 1: Add font preconnects and Inter + JetBrains Mono to index.html**

Add inside `<head>` before existing styles:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

Remove any old font loading. Wrap Google Fonts import in a conditional that only loads on first visit + stores in cache.

- [ ] **Step 2: Rewrite styles.css with design tokens**

Replace entire `styles.css` content with:

```css
:root {
  /* Vercel Dark color tokens */
  --canvas: #11182d;
  --canvas-soft: #070a1a;
  --canvas-soft-2: #0d1225;
  --ink: #f2f6ff;
  --body: #a7b4cc;
  --mute: #6b7a99;
  --hairline: #1e2a4a;
  --hairline-strong: #2a3a66;
  --accent: #8cb4ff;
  --accent-soft: rgba(140, 180, 255, 0.12);
  --primary: #f2f6ff;
  --success: #4ade80;
  --gradient-1: #007cf0;
  --gradient-2: #7928ca;
  --gradient-3: #ff0080;
  --gradient-4: #f9cb28;

  /* Typography tokens */
  --display: 'Inter', system-ui, -apple-system, sans-serif;
  --body: 'Inter', system-ui, -apple-system, sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 40px;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 100px;

  /* Shadows */
  --shadow-card: 0 1px 2px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.12);
  --shadow-hover: 0 2px 4px rgba(0,0,0,0.25), 0 8px 16px rgba(0,0,0,0.15);
  --shadow-overlay: 0 1px 1px rgba(0,0,0,0.05), 0 8px 16px -4px rgba(0,0,0,0.1), 0 24px 32px -8px rgba(0,0,0,0.15);
}

/* Reset & base */
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
body {
  margin: 0;
  color: var(--ink);
  font-family: var(--body);
  font-weight: 400;
  line-height: 1.45;
  background: var(--canvas-soft);
  min-height: 100vh;
  overflow-x: hidden;
}

/* Mesh gradient background */
body::before {
  content: '';
  position: fixed;
  inset: -50%;
  z-index: -2;
  background:
    radial-gradient(ellipse at 20% 10%, color-mix(in srgb, var(--gradient-1) 12%, transparent) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 15%, color-mix(in srgb, var(--gradient-2) 10%, transparent) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--gradient-3) 8%, transparent) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 80%, color-mix(in srgb, var(--gradient-4) 6%, transparent) 0%, transparent 50%);
  animation: meshDrift 20s ease-in-out infinite alternate;
}
@keyframes meshDrift {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(2%, 1%) scale(1.05); }
  100% { transform: translate(-1%, -1%) scale(1.02); }
}

/* Typography base */
h1, h2, h3 { font-family: var(--display); font-weight: 600; letter-spacing: -0.03em; }
.display-xl { font-size: 32px; font-weight: 600; letter-spacing: -1.28px; line-height: 1.15; }
.display-lg { font-size: 24px; font-weight: 600; letter-spacing: -0.96px; line-height: 1.2; }
.display-md { font-size: 20px; font-weight: 600; letter-spacing: -0.6px; line-height: 1.25; }
.body-lg { font-size: 16px; font-weight: 400; line-height: 1.5; }
.body-md { font-size: 14px; font-weight: 400; letter-spacing: -0.28px; line-height: 1.4; }
.body-sm { font-size: 12px; font-weight: 400; line-height: 1.4; }
.caption-mono { font-size: 12px; font-family: var(--mono); font-weight: 400; line-height: 1.4; }

/* Utility */
button { font-family: inherit; cursor: pointer; }

/* Scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--hairline); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--hairline-strong); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  body::before { animation: none; }
}
```

- [ ] **Step 3: Verify fonts load**

Run app locally. Open DevTools → Network tab → filter "fonts.googleapis.com" — confirm Inter and JetBrains Mono loaded with 200 status.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add Vercel dark design tokens, Inter + JetBrains Mono fonts, mesh gradient bg"
```

---

### Task 2: App Shell — Header, Back Button, Page Transitions

**Files:**
- Modify: `styles.css` — add .app, .top, .titlebar, .back, .heading, .screen, .search styles
- Modify: `app.js` — add transition wrapper, use new CSS classes

**Interfaces:**
- Consumes: CSS tokens from Task 1
- Produces: Working app shell with animated page transitions

- [ ] **Step 1: Add shell CSS to styles.css**

Append after the existing base styles:
```css
.app {
  width: min(980px, 100%);
  margin: auto;
  min-height: 100vh;
  padding: 14px 14px 48px;
}

.top {
  position: sticky;
  top: 0;
  z-index: 5;
  background: linear-gradient(180deg, color-mix(in srgb, var(--canvas) 90%, transparent), transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 10px 0 14px;
  margin-bottom: 8px;
}

.titlebar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  position: relative;
}

.back {
  display: none;
  width: 36px;
  height: 36px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  background: var(--canvas);
  color: var(--body);
  font-size: 18px;
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.2s;
  place-items: center;
  padding: 0;
}
.back.show { display: grid; }
.back:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-50%) rotate(-90deg);
}

.heading {
  text-align: center;
  padding: 0 48px;
}
.heading h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.88px;
  line-height: 1.2;
}
.heading p {
  margin: 4px 0 0;
  color: var(--body);
  font-size: 12px;
  font-family: var(--mono);
  font-weight: 400;
  letter-spacing: 0;
}

.search {
  margin: 12px 4px 0;
  display: none;
}
.search.show { display: block; }
.search input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  padding: 0 14px;
  background: var(--canvas);
  color: var(--ink);
  font: inherit;
  font-size: 14px;
  outline: none;
  text-align: center;
}
.search input::placeholder { color: var(--mute); }
.search input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

/* Page transitions */
.screen {
  padding-top: 12px;
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.screen.exit {
  opacity: 0;
  transform: translateY(8px);
}
.screen.enter {
  opacity: 0;
  transform: translateY(8px);
}
.screen.active {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 2: Update app.js shell rendering**

In `setHeader()` function, ensure it uses the CSS classes above (it already uses `.top`, `.titlebar`, `.back`, `.heading`, `.search` — verify class names match).

Add a transition wrapper in the `render()` or view functions:

```javascript
function transitionTo(renderFn) {
  const screen = document.querySelector('.screen');
  if (!screen) { renderFn(); return; }
  screen.classList.remove('enter', 'active');
  screen.classList.add('exit');
  setTimeout(() => {
    screen.innerHTML = '';
    renderFn();
    screen.classList.remove('exit');
    screen.classList.add('enter');
    requestAnimationFrame(() => {
      screen.classList.remove('enter');
      screen.classList.add('active');
    });
  }, 250);
}
```

Wrap each page render call (home, chapterList, sectionList, videoList) with `transitionTo()`.

For the `.screen` element, ensure it's created as `<main class="screen">` inside `.app`.

- [ ] **Step 3: Verify shell renders**

Open app. Confirm header sticks, back button navigates, search is shown/hidden. Page transitions animate smoothly (fade + slide up).

- [ ] **Step 4: Commit**

```bash
git add styles.css app.js
git commit -m "feat: add app shell with sticky header, back button rotation, page transitions"
```

---

### Task 3: Home Page — Continue Watching Row + Subject Grid

**Files:**
- Modify: `app.js` — rewrite `home()`, add continue-watching rendering
- Modify: `styles.css` — add .home-grid, .home-card, .home-icon, .cw-row, .cw-card, stagger animations

**Interfaces:**
- Consumes: `saveCW()`, `getCW()` (stub — will be implemented in Task 6)
- Produces: Home page with Vercel subject cards and continue-watching row. Stagger entrance animation.

- [ ] **Step 1: Add home page CSS to styles.css**

```css
/* Continue Watching row */
.cw-section { margin-bottom: 24px; }
.cw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
}
.cw-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.48px;
}
.cw-header .caption-mono {
  color: var(--mute);
}
.cw-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding: 4px 4px 8px;
  scrollbar-width: none;
}
.cw-row::-webkit-scrollbar { display: none; }
.cw-card {
  flex: 0 0 220px;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--canvas);
  border: 1px solid var(--hairline);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}
.cw-card:hover {
  transform: translateY(-2px);
  border-color: var(--hairline-strong);
  box-shadow: var(--shadow-hover);
}
.cw-thumb {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background: var(--canvas-soft-2);
  flex-shrink: 0;
}
.cw-info { flex: 1; min-width: 0; }
.cw-info .body-md {
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cw-info .body-sm { color: var(--mute); margin: 0; }
.cw-continue {
  flex-shrink: 0;
  padding: 4px 12px;
  background: var(--ink);
  color: var(--canvas-soft);
  border: none;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s;
}
.cw-continue:hover { opacity: 0.85; }

/* Subject grid */
.home-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 18px;
  background: var(--canvas);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  color: var(--ink);
  cursor: pointer;
  box-shadow: var(--shadow-card);
  opacity: 0;
  transform: translateY(12px);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s, opacity 0.3s, transform 0.3s;
}
.home-card.visible {
  opacity: 1;
  transform: translateY(0);
}
.home-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--accent) 60%, transparent);
  box-shadow: var(--shadow-hover), 0 0 30px -8px var(--accent);
}
.home-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  font-size: 26px;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--card-accent) 30%, transparent);
  transition: box-shadow 0.2s;
}
.home-card:hover .home-icon {
  box-shadow: 0 8px 32px color-mix(in srgb, var(--card-accent) 50%, transparent);
}
.home-title {
  font-family: var(--display);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.88px;
  line-height: 1.15;
}

/* Stagger animation delays — set via JS style */
.home-card:nth-child(1) { transition-delay: 0.05s; }
.home-card:nth-child(2) { transition-delay: 0.1s; }
.home-card:nth-child(3) { transition-delay: 0.15s; }
.home-card:nth-child(4) { transition-delay: 0.2s; }
.home-card:nth-child(5) { transition-delay: 0.25s; }

@media (min-width: 640px) {
  .home-grid { gap: 16px; }
}
@media (min-width: 900px) {
  .home-grid { grid-template-columns: repeat(3, 1fr); }
  .home-card { padding: 32px 22px; }
  .home-title { font-size: 24px; letter-spacing: -0.96px; }
}
```

- [ ] **Step 2: Rewrite home() function in app.js**

```javascript
function home() {
  state = { view: 'home' };
  setTheme({});
  setHeader('CLASS 9 LECTURES', false);

  transitionTo(() => {
    const cwData = getCW();
    let html = '';

    // Continue Watching row
    if (cwData.length > 0) {
      html += `<div class="cw-section">
        <div class="cw-header">
          <h2>Continue Watching</h2>
          <span class="caption-mono">${cwData.length} video${cwData.length > 1 ? 's' : ''}</span>
        </div>
        <div class="cw-row">
          ${cwData.map(v => renderCWCard(v)).join('')}
        </div>
      </div>`;
    }

    // Subject grid
    html += `<div class="home-grid">${subjects.map((s, i) => renderHomeCard(s, i)).join('')}</div>`;
    document.querySelector('.screen').innerHTML = html;

    // Trigger stagger animation
    requestAnimationFrame(() => {
      document.querySelectorAll('.home-card').forEach(card => { card.classList.add('visible'); });
    });
  });
}

function renderCWCard(v) {
  return `<div class="cw-card" onclick="playVideo('${v.subjectId}','${v.chapterId}','${v.sectionId}','${v.videoId}')">
    <img class="cw-thumb" src="https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg" alt="" loading="lazy">
    <div class="cw-info">
      <p class="body-md">${escapeHtml(v.videoTitle)}</p>
      <p class="body-sm">${escapeHtml(v.subjectTitle)} · ${escapeHtml(v.chapterTitle)}</p>
    </div>
    <button class="cw-continue">Continue</button>
  </div>`;
}

function renderHomeCard(s, index) {
  const icon = subjectIcons[s.id] || '';
  return `<button class="home-card" onclick="go('/${s.id}')" style="--card-accent:${s.accent};transition-delay:${0.05 * (index + 1)}s">
    <div class="home-icon" style="background:linear-gradient(135deg,${s.accent},${s.accent2 || s.accent})">${icon}</div>
    <span class="home-title">${escapeHtml(s.title)}</span>
  </button>`;
}
```

Stub `getCW()` at top of app.js:
```javascript
function getCW() { try { return JSON.parse(localStorage.getItem('cw')) || []; } catch { return []; } }
function saveCW(data) { /* Task 6 */ }
function renderCWCard(v) { /* defined above — no-op if cwData empty */ }
```

- [ ] **Step 3: Verify home page renders**

Open app. Confirm subject grid shows with Vercel-styled cards, stagger animation plays on load. If no continue-watching data, no row shows.

- [ ] **Step 4: Commit**

```bash
git add styles.css app.js
git commit -m "feat: redesign home page — Vercel subject cards with stagger, continue-watching row"
```

---

### Task 4: Chapter & Section Pages — Row Components with Progress

**Files:**
- Modify: `app.js` — rewrite `chapterList()` and `sectionList()` with Vercel rows
- Modify: `styles.css` — add .row, .row-progress, .row-icon, .row-arrow styles

**Interfaces:**
- Consumes: `getChapterProgress(chapterId)` from Task 6
- Produces: Chapter list and section list pages with progress bars

- [ ] **Step 1: Add row component CSS**

```css
/* Row component (chapters, sections) */
.row-list { display: flex; flex-direction: column; gap: 10px; }
.row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--canvas);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  color: var(--ink);
  cursor: pointer;
  text-align: left;
  width: 100%;
  position: relative;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
  text-decoration: none;
  font-family: inherit;
}
.row:hover {
  transform: translateY(-1px);
  border-color: var(--hairline-strong);
  box-shadow: var(--shadow-card);
}
.row-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 18px;
  background: var(--canvas-soft-2);
  color: var(--body);
}
.row-body { flex: 1; min-width: 0; }
.row-body b {
  display: block;
  font-family: var(--display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.51px;
  line-height: 1.25;
}
.row-body span {
  display: block;
  font-size: 12px;
  color: var(--body);
  margin-top: 3px;
  font-family: var(--mono);
  letter-spacing: 0;
}
.row-arrow {
  font-size: 20px;
  color: var(--mute);
  flex-shrink: 0;
  transition: transform 0.2s;
}
.row:hover .row-arrow { transform: translateX(2px); }

/* Progress bar */
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.progress-track {
  flex: 1;
  height: 3px;
  background: var(--hairline);
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 4px;
  width: 0%;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.progress-label {
  font-size: 11px;
  font-family: var(--mono);
  color: var(--mute);
  flex-shrink: 0;
  white-space: nowrap;
}
```

- [ ] **Step 2: Rewrite chapterList()**

```javascript
function chapterList(subjectId) {
  state = { view: 'chapterList', subjectId };
  const sub = subjects.find(s => s.id === subjectId);
  if (!sub) return home();
  setTheme(sub);
  setHeader(sub.title, true);

  transitionTo(() => {
    try {
      const data = require(`data/${subjectId}.json`);
      const chapters = data.chapters || data;
      const html = `<div class="row-list">${chapters.map((ch, i) => renderChapterRow(subjectId, ch, i)).join('')}</div>`;
      document.querySelector('.screen').innerHTML = html;

      // Animate progress bars after render
      requestAnimationFrame(() => {
        document.querySelectorAll('.progress-fill').forEach(el => {
          el.style.width = el.dataset.width || '0%';
        });
      });
    } catch {
      document.querySelector('.screen').innerHTML = '<div class="empty">Failed to load chapters.</div>';
    }
  });
}

function renderChapterRow(subjectId, ch, index) {
  const sub = subjects.find(s => s.id === subjectId) || {};
  const num = ch.chapterNumber || ch.number || index + 1;
  const title = ch.title || ch.name || `Chapter ${num}`;
  const sectionCount = ch.sections ? ch.sections.length : (ch.topics ? ch.topics.length : 0);
  const progress = getChapterProgress(subjectId, ch.id || ch.chapterNumber);
  return `<button class="row" onclick="go('/${subjectId}/${ch.id || ch.chapterNumber}')">
    <div class="row-icon">${num}</div>
    <div class="row-body">
      <b>${escapeHtml(title)}</b>
      <span>${sectionCount} section${sectionCount !== 1 ? 's' : ''}</span>
      <div class="progress-wrap">
        <div class="progress-track">
          <div class="progress-fill" data-width="${progress.pct}%" style="background:linear-gradient(90deg,${sub.accent || '#8cb4ff'},${sub.accent2 || sub.accent || '#8cb4ff'});width:0%"></div>
        </div>
        <span class="progress-label">${progress.done}/${progress.total}</span>
      </div>
    </div>
    <span class="row-arrow">→</span>
  </button>`;
}
```

- [ ] **Step 3: Rewrite sectionList() similarly**

Same pattern as `chapterList()` but for sections. Show videos count instead of sections count.

- [ ] **Step 4: Stub progress function**

```javascript
function getChapterProgress(subjectId, chapterId) {
  try {
    const key = `${subjectId}/${chapterId}`;
    const all = JSON.parse(localStorage.getItem('progress')) || {};
    const p = all[key];
    if (!p) return { done: 0, total: 0, pct: '0%' };
    return { done: p.done, total: p.total, pct: Math.round((p.done / p.total) * 100) + '%' };
  } catch { return { done: 0, total: 0, pct: '0%' }; }
}
```

Add to top of app.js.

- [ ] **Step 5: Verify navigation**

Open app. Click a subject → see chapter list with progress bars (bars animate from 0 to their value on load). Click a chapter → see section list.

- [ ] **Step 6: Commit**

```bash
git add styles.css app.js
git commit -m "feat: add Vercel row components for chapters/sections with progress bars"
```

---

### Task 5: Video Grid & Player Overlay — Vercel Template Cards

**Files:**
- Modify: `app.js` — rewrite `videoList()` and `playVideo()` with Vercel styling
- Modify: `styles.css` — add .videos, .video, .thumb, .player-overlay, .player-wrap styles

**Interfaces:**
- Consumes: `saveCW()` from Task 6
- Produces: Video grid with template-card styling, polished player overlay

- [ ] **Step 1: Add video and player CSS**

```css
/* Video grid */
.videos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.video {
  padding: 12px;
  background: var(--canvas);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.video:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent) 56%, transparent);
  box-shadow: var(--shadow-hover);
}
.thumb {
  display: block;
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--canvas-soft-2);
  margin-bottom: 10px;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s, filter 0.2s;
}
.thumb:hover img {
  transform: scale(1.04);
  filter: brightness(1.06);
}
.thumb-duration {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 400;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0;
  line-height: 1.3;
  pointer-events: none;
}
.video h2 {
  font-family: var(--display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.51px;
  line-height: 1.15;
  margin: 0 0 8px;
}
.video .sub {
  font-size: 12px;
  line-height: 1.35;
  color: var(--body);
  font-weight: 400;
  margin: -1px auto 10px;
  max-width: 92%;
  min-height: 16px;
}

/* Player overlay */
.player-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  padding: 16px;
}
.player-overlay.open {
  opacity: 1;
  pointer-events: auto;
}
.player-wrap {
  width: min(900px, 100%);
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-overlay);
}
.player-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.2s;
}
.player-close:hover { background: rgba(0, 0, 0, 0.9); }
.player-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
}
.player-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Empty state */
.empty {
  color: var(--mute);
  padding: 18px;
  border: 1px dashed var(--hairline);
  border-radius: var(--radius-md);
  text-align: center;
  background: var(--canvas);
  font-size: 14px;
}

@media (min-width: 640px) {
  .videos { gap: 16px; }
}
@media (min-width: 900px) {
  .videos { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .video h2 { font-size: 18px; }
}

@media (max-width: 640px) {
  .videos { grid-template-columns: 1fr; gap: 12px; }
  .video { padding: 10px; border-radius: var(--radius-md); }
  .video h2 { font-size: 16px; }
  .player-overlay { padding: 0; }
  .player-wrap { border-radius: 0; width: 100%; }
}
```

- [ ] **Step 2: Rewrite videoList()**

```javascript
function videoList(subjectId, chapterId, sectionId) {
  state = { view: 'videoList', subjectId, chapterId, sectionId };
  const sub = subjects.find(s => s.id === subjectId);
  if (!sub) return home();
  setTheme(sub);
  setHeader(sub.title, true);

  transitionTo(() => {
    try {
      const data = require(`data/${subjectId}.json`);
      const chapters = data.chapters || data;
      const ch = chapters.find(c => c.id === chapterId || c.chapterNumber == chapterId);
      const sec = ch.sections ? ch.sections.find(s => s.id === sectionId || s.number == sectionId) : ch;
      const videos = sec ? (sec.videos || sec.lectures || []) : [];

      let html = `<div class="videos">`;
      if (videos.length === 0) {
        html = `<div class="empty">No videos yet.</div>`;
      } else {
        html += videos.map((v, i) => renderVideoCard(subjectId, chapterId, sectionId, v, i)).join('');
        html += `</div>`;
      }
      document.querySelector('.screen').innerHTML = html;
    } catch {
      document.querySelector('.screen').innerHTML = '<div class="empty">Failed to load videos.</div>';
    }
  });
}

function renderVideoCard(subjectId, chapterId, sectionId, v, i) {
  const title = v.title || v.name || `Lecture ${i + 1}`;
  const videoId = v.videoId || v.id || v.url;
  const duration = v.duration || '';
  const desc = v.description || v.subtitle || '';
  return `<div class="video">
    <button class="thumb" onclick="playVideo('${subjectId}','${chapterId}','${sectionId}','${videoId}')">
      <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${escapeHtml(title)}" loading="lazy">
      ${duration ? `<span class="thumb-duration">${duration}</span>` : ''}
    </button>
    <h2>${escapeHtml(title)}</h2>
    ${desc ? `<span class="sub">${escapeHtml(desc)}</span>` : ''}
  </div>`;
}
```

- [ ] **Step 3: Update playVideo() to match new overlay classes**

Ensure `playVideo()` uses `player-overlay`, `player-wrap`, `player-close`, `player-container` class names. The overlay toggle functions should match the new CSS.

- [ ] **Step 4: Verify video flow**

Navigate to a video list. Confirm grid renders, thumbnails zoom on hover, duration badge shows. Click a video → overlay opens with blur backdrop.

- [ ] **Step 5: Commit**

```bash
git add styles.css app.js
git commit -m "feat: redesign video grid with Vercel template cards, polish player overlay"
```

---

### Task 6: Data Layer — localStorage Progress + Continue Watching

**Files:**
- Modify: `app.js` — add full progress and continue-watching implementations, wire into all views

**Interfaces:**
- Consumes: view functions from Tasks 3-5
- Produces: Working progress tracking and continue-watching across all pages

- [ ] **Step 1: Add complete data functions**

At top of app.js (after state/subjects definitions):

```javascript
/* ── Progress & Continue Watching ── */

function getChapterProgress(subjectId, chapterId) {
  try {
    const key = `${subjectId}/${chapterId}`;
    const all = JSON.parse(localStorage.getItem('9lectures-progress')) || {};
    const p = all[key];
    if (!p || !p.total) return { done: 0, total: 0, pct: '0%' };
    return { done: p.done, total: p.total, pct: Math.round((p.done / p.total) * 100) + '%' };
  } catch { return { done: 0, total: 0, pct: '0%' }; }
}

function markVideoWatched(subjectId, chapterId, videoId) {
  try {
    const key = `${subjectId}/${chapterId}`;
    const all = JSON.parse(localStorage.getItem('9lectures-progress')) || {};
    if (!all[key]) all[key] = { done: 0, total: 0, ids: [] };
    if (!all[key].ids.includes(videoId)) {
      all[key].ids.push(videoId);
      all[key].done = all[key].ids.length;
      // Total must be set externally via setChapterVideoCount
    }
    localStorage.setItem('9lectures-progress', JSON.stringify(all));
  } catch { /* localStorage full or unavailable */ }
}

function setChapterVideoCount(subjectId, chapterId, total) {
  try {
    const key = `${subjectId}/${chapterId}`;
    const all = JSON.parse(localStorage.getItem('9lectures-progress')) || {};
    if (!all[key]) all[key] = { done: 0, total, ids: [] };
    else all[key].total = total;
    localStorage.setItem('9lectures-progress', JSON.stringify(all));
  } catch {}
}

function getCW() {
  try { return JSON.parse(localStorage.getItem('9lectures-cw')) || []; }
  catch { return []; }
}

function saveCW(entry) {
  try {
    let list = getCW();
    list = list.filter(v => v.videoId !== entry.videoId);
    list.unshift({ ...entry, timestamp: Date.now() });
    if (list.length > 10) list = list.slice(0, 10);
    localStorage.setItem('9lectures-cw', JSON.stringify(list));
  } catch {}
}

function clearProgress() {
  localStorage.removeItem('9lectures-progress');
  localStorage.removeItem('9lectures-cw');
}
```

- [ ] **Step 2: Wire into videoList() — set chapter video count**

In `videoList()`, after loading the chapter data, call:

```javascript
const totalVideos = videos.length;
setChapterVideoCount(subjectId, chapterId, totalVideos);
```

- [ ] **Step 3: Wire into playVideo() — save progress + continue watching**

In `playVideo()`, after successfully loading the video (before or after opening overlay):

```javascript
markVideoWatched(subjectId, chapterId, videoId);
const videoTitle = /* get from video data */;
saveCW({
  subjectId, chapterId, sectionId, videoId,
  subjectTitle: subjects.find(s => s.id === subjectId)?.title || '',
  chapterTitle: chapterTitle || '',
  videoTitle: videoTitle,
  thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  duration: videoDuration || ''
});
```

- [ ] **Step 4: Verify data persistence**

Open app. Navigate to Home → Math → Chapter 1 → Section 1 → click a video. The overlay opens. Close it. Navigate back to Home — the Continue Watching row should show the video. Click Chapter 1 again — progress bar should show.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: add localStorage progress tracking and continue-watching"
```

---

### Task 7: Service Worker — Offline App Shell

**Files:**
- Create: `service-worker.js`
- Modify: `index.html` — register service worker

**Interfaces:**
- Produces: Offline-capable app. On first load, caches all app files + data JSONs. On subsequent offline visits, app loads and all data is navigable.

- [ ] **Step 1: Create service-worker.js**

```javascript
const CACHE = '9lectures-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/data/subjects.json',
  '/data/math.json',
  '/data/physics.json',
  '/data/chemistry.json',
  '/data/urdu.json',
  '/data/computer.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline and not in cache — return a fallback
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
```

- [ ] **Step 2: Register service worker in index.html**

Add before closing `</body>` tag:

```html
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .catch(() => {});
}
</script>
```

- [ ] **Step 3: Verify offline works**

Open app in Chrome. DevTools → Application → Service Workers → confirm registered. Go to Network tab, check "Offline". Reload page. App should load fully, navigate subjects → chapters → sections. Video thumbnails may not load (they're from youtube.com, not cached).

- [ ] **Step 4: Commit**

```bash
git add service-worker.js index.html
git commit -m "feat: add service worker for offline app shell + data caching"
```

---

### Task 8: Polish — All Animations, Micro-interactions, Responsive

**Files:**
- Modify: `styles.css` — final animations pass
- Modify: `app.js` — add staggered entrance helpers, back button rotation class

**Interfaces:**
- Consumes: all previous tasks
- Produces: Polished, fully animated app

- [ ] **Step 1: Add animation keyframes to styles.css**

```css
/* Stagger entrance for grid items */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.stagger-item {
  animation: fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Row list stagger */
.row-list .row {
  opacity: 0;
  animation: fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.row-list .row:nth-child(1) { animation-delay: 0.03s; }
.row-list .row:nth-child(2) { animation-delay: 0.06s; }
.row-list .row:nth-child(3) { animation-delay: 0.09s; }
.row-list .row:nth-child(4) { animation-delay: 0.12s; }
/* Continue up to 20 */
```

- [ ] **Step 2: Add stagger-item class to home cards in app.js**

In `renderHomeCard()`, add `stagger-item` class alongside `home-card`.

- [ ] **Step 3: Add back button CSS rotation**

Already handled in Task 2 via `.back:hover { transform: ... rotate(-90deg); }`.

- [ ] **Step 4: Add responsive footer**

```css
.foot {
  margin-top: 32px;
  text-align: center;
  color: var(--mute);
  font-size: 12px;
  font-family: var(--mono);
  padding: 20px 0;
  border-top: 1px solid var(--hairline);
}
```

- [ ] **Step 5: Final responsive polish**

Add at end of styles.css:

```css
@media (max-width: 640px) {
  .app { padding: 8px 8px 28px; }
  .heading h1 { font-size: 18px; letter-spacing: -0.72px; }
  .home-card { padding: 22px 14px; }
  .home-icon { width: 48px; height: 48px; font-size: 22px; border-radius: 12px; }
  .home-title { font-size: 18px; letter-spacing: -0.54px; }
  .row { padding: 12px 14px; border-radius: var(--radius-sm); }
  .row-body b { font-size: 15px; }
  .video { padding: 10px; }
  .video h2 { font-size: 15px; letter-spacing: -0.45px; }
  .cw-card { flex: 0 0 180px; padding: 10px; }
  .cw-thumb { width: 44px; height: 44px; }
}

@media (min-width: 900px) {
  .app { padding: 20px 20px 48px; }
  .top { padding: 14px 0 18px; }
  .heading h1 { font-size: 26px; letter-spacing: -1.04px; }
  .screen { padding-top: 16px; }
}
```

- [ ] **Step 6: Final verification**

Open app. Navigate every page. Confirm: stagger animations on home, row list animations, card hover effects (translate + glow), progress bar animations, thumbnail zoom, page transitions between views, back button rotation, responsive layout at mobile/tablet/desktop widths.

- [ ] **Step 7: Commit**

```bash
git add styles.css app.js
git commit -m "feat: add animation system, stagger entrance, micro-interactions, responsive polish"
```

---

## Spec Coverage Check

| Spec Requirement | Covered By |
|---|---|
| Vercel dark color tokens | Task 1 |
| Inter + JetBrains Mono fonts | Task 1 |
| Mesh gradient background | Task 1 |
| App shell with sticky header | Task 2 |
| Page transitions (fade + slide) | Task 2 |
| Continue Watching row (last 3-5 videos) | Task 3 |
| Subject grid (2-col mobile, 3-col desktop) | Task 3 |
| Vercel-style subject cards with gradient icons | Task 3 |
| Stagger entrance animation | Task 3, Task 8 |
| Chapter/section row components | Task 4 |
| Progress bars (animated) | Task 4 |
| Video grid (template-card style) | Task 5 |
| Duration badge on thumbnails | Task 5 |
| Player overlay with blur backdrop | Task 5 |
| localStorage progress tracking | Task 6 |
| localStorage continue-watching | Task 6 |
| Service worker offline shell | Task 7 |
| Card hover glow + translate | Task 3, Task 8 |
| Thumbnail hover zoom | Task 5 |
| Back button rotate animation | Task 2 |
| Responsive breakpoints | Task 8 |
| Custom scrollbar | Task 1 |
| Reduced motion support | Task 1 |
