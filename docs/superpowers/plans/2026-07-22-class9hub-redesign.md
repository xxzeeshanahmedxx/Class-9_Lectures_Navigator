# class9hub Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform class9hub.com from a static study site into a premium "Study Engine" with dual-theme, subject atmosphere, Netflix-style player, localStorage retention, and glass-nav/chrome.

**Architecture:** Astro SSG static site with client JS for theme toggle, video player, search, and progress tracking. All persistence via localStorage (no backend).

**Tech Stack:** Astro 7 + Tailwind v4 + Cloudflare Pages + Cloudflare adapter

## Global Constraints

- All interactive touch targets ≥44x44px
- `backdrop-filter` only on header and search bar (NOT on cards)
- Subject accent colors: use dark variant for dark mode glows, light variant for light mode text
- Player overlay is lazy-initialized (no DOM on import)
- Ambient glow samples video color every 5s, not every frame
- No new npm dependencies unless absolutely necessary
- All subject images WebP with lazy loading
- Respect `prefers-reduced-motion`
- Light mode must be WCAG AA contrast on all accent text

---
## File Structure

```
src/
  lib/
    data.js             — CREATE: shared dataMap utility
    constants.js        — CREATE: siteUrl, siteName, defaultDesc
    progress.js         — CREATE: localStorage helpers
  components/
    BentoHero.astro     — CREATE: homepage bento grid
    SubjectCard.astro   — REWRITE: solid card + accent glow
    VideoCard.astro     — REWRITE: hover lift, JetBrains Mono duration
    ChapterRow.astro    — REWRITE: unified (absorb SectionRow)
    SectionRow.astro    — DELETE (merged into ChapterRow)
    PlayerOverlay.js    — REWRITE: lazy init, speed, glow, next-up, swipe
    ProgressDot.astro   — CREATE: watched indicator dot
    BottomNav.astro     — CREATE: mobile bottom nav
    ThemeToggle.astro   — CREATE: dark/light switch
    Header.astro        — CREATE: extracted from Layout
    Footer.astro        — CREATE: extracted from Layout
    PWAInstall.astro    — CREATE: extracted from Layout, deduplicated
  layouts/
    Layout.astro        — REFACTOR: use extracted components
  pages/
    index.astro             — REWRITE: bento hero + continue studying
    [subject]/index.astro   — REWRITE: glass header + chapter rows
    [subject]/[chapter]/index.astro        — REWRITE
    [subject]/[chapter]/[section]/index.astro — REWRITE
    search.astro            — REWRITE: glass search + results + empty state
    404.astro               — REWRITE: polished
  styles/
    global.css          — REWRITE: dual-theme vars, no body::before
  data/
    subjects.json       — MODIFY: add accentLight per subject
```

---

### Task 1: Create shared data utility

**Files:**
- Create: `src/lib/data.js`
- Create: `src/lib/constants.js`

**Interfaces:**
- Produces: `getData(subjectId)` — returns parsed JSON for a subject
- Produces: `getSubject(subjectId)` — returns subject entry from subjects.json
- Produces: `SITE_URL = 'https://class9hub.com'`
- Produces: `SITE_NAME = 'Class 9 · Punjab Curriculum'`
- Produces: `DEFAULT_DESC = 'Free study lectures for 9th grade Punjab board students...'`

- [ ] **Step 1: Create `src/lib/constants.js`**

```js
export const SITE_URL = 'https://class9hub.com';
export const SITE_NAME = 'Class 9 · Punjab Curriculum';
export const DEFAULT_DESC = 'Free study lectures for 9th grade Punjab board students — Mathematics, Physics, Chemistry, Computer, Urdu, Biology, English.';
export const OG_IMAGE = SITE_URL + '/apple-touch-icon.png';
```

- [ ] **Step 2: Create `src/lib/data.js`**

```js
import subjects from '../data/subjects.json';
import mathData from '../data/math.json';
import physicsData from '../data/physics.json';
import chemistryData from '../data/chemistry.json';
import urduData from '../data/urdu.json';
import computerData from '../data/computer.json';
import biologyData from '../data/biology.json';
import englishData from '../data/english.json';

const dataMap = {
  math: mathData, physics: physicsData, chemistry: chemistryData,
  urdu: urduData, computer: computerData, biology: biologyData, english: englishData,
};

export function getData(subjectId) {
  return dataMap[subjectId] || { chapters: [] };
}

export function getSubject(subjectId) {
  return subjects.find(s => s.id === subjectId);
}

export { subjects };
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/
git commit -m "feat: add shared data + constants utility modules"
```

---

### Task 2: Add accentLight to subjects.json

**Files:**
- Modify: `src/data/subjects.json`

- [ ] **Step 1: Add `accentLight` field to each subject**

```json
[
  {
    "id": "math",
    "title": "Math",
    "emoji": "M",
    "data": "math.json",
    "accent": "#8cb4ff",
    "accentLight": "#4a82e8",
    "accent2": "#a78bfa",
    "bg": "#0a0a12",
    "bg2": "#12121c",
    "bg3": "#1a1a28",
    "card": "#12121c",
    "card2": "#1a1a28",
    "line": "#1e1e30",
    "soft": "#161624"
  },
  {
    "id": "physics",
    "accentLight": "#16a34a"
  },
  {
    "id": "chemistry",
    "accentLight": "#0d9488"
  },
  {
    "id": "urdu",
    "accentLight": "#ca8a04"
  },
  {
    "id": "computer",
    "accentLight": "#0891b2"
  },
  {
    "id": "biology",
    "accentLight": "#16a34a"
  },
  {
    "id": "english",
    "accentLight": "#ea580c"
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/subjects.json
git commit -m "feat: add accentLight per subject for light mode contrast"
```

---

### Task 3: Create localStorage progress helpers

**Files:**
- Create: `src/lib/progress.js`

**Interfaces:**
- Produces: `markViewed(subjectId, chapterId, videoId)` — stores in localStorage
- Produces: `isViewed(subjectId, chapterId, videoId)` — returns boolean
- Produces: `getRecent(max = 5)` — returns array of { subject, chapterId, videoId, title, timestamp }
- Produces: `getViewedChapterCount(subjectId, chapterId)` — returns count of viewed videos

- [ ] **Step 1: Create `src/lib/progress.js`**

```js
const RECENT_KEY = 'c9-recent';
const VIEWED_PREFIX = 'c9-v-';

function viewedKey(subjectId, chapterId) {
  return VIEWED_PREFIX + subjectId + '-' + chapterId;
}

export function markViewed(subjectId, chapterId, videoId, title) {
  const key = viewedKey(subjectId, chapterId);
  const set = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  set.add(videoId);
  localStorage.setItem(key, JSON.stringify([...set]));

  // Update recent list
  const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  const entry = { subject: subjectId, chapterId, videoId, title, timestamp: Date.now() };
  const filtered = recent.filter(r => !(r.subject === subjectId && r.chapterId === chapterId && r.videoId === videoId));
  filtered.unshift(entry);
  localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 10)));
}

export function isViewed(subjectId, chapterId, videoId) {
  const key = viewedKey(subjectId, chapterId);
  const set = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  return set.has(videoId);
}

export function getRecent(max = 5) {
  return (JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')).slice(0, max);
}

export function getViewedChapterCount(subjectId, chapterId) {
  const key = viewedKey(subjectId, chapterId);
  const set = JSON.parse(localStorage.getItem(key) || '[]');
  return set.length;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/progress.js
git commit -m "feat: add localStorage progress tracking helpers"
```

---

### Task 4: Rewrite global.css — Dual-theme, no body::before, skeleton keyframes

**Files:**
- Rewrite: `src/styles/global.css`

- [ ] **Step 1: Rewrite `src/styles/global.css`**

Remove the `body::before` hack, the `breathe` animation, and all broken theme vars. Replace with proper dual-theme CSS custom properties.

```css
@import "tailwindcss";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/plus-jakarta-sans/700.css";
@import "@fontsource/plus-jakarta-sans/800.css";

:root {
  --page-bg: #f4f4f8;
  --surface: #ffffff;
  --card-bg: #ffffff;
  --text-primary: #0f0f18;
  --text-secondary: #4a4a60;
  --text-muted: #808098;
  --border: #e4e4ec;
  --border-hover: #ccccd8;
  --header-bg: rgba(255,255,255,0.85);
  --overlay: rgba(0,0,0,0.7);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --font-display: 'Plus Jakarta Sans', Inter, -apple-system, system-ui, sans-serif;
  --font-body: Inter, -apple-system, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-hover: 0 4px 12px rgba(0,0,0,0.1);
}

.dark {
  --page-bg: #07070d;
  --surface: #0e0e18;
  --card-bg: #141420;
  --text-primary: #efeff5;
  --text-secondary: #8f8fa8;
  --text-muted: #5e5e78;
  --border: rgba(255,255,255,0.08);
  --border-hover: rgba(255,255,255,0.14);
  --header-bg: rgba(14,14,24,0.85);
  --shadow-card: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-hover: 0 4px 12px rgba(0,0,0,0.4);
  color-scheme: dark;
}

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  background: var(--page-bg);
  color: var(--text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  line-height: 1.6;
}

.font-display { font-family: var(--font-display); }
.font-mono { font-family: var(--font-mono); }

a, button {
  -webkit-touch-callout: none;
  user-select: none;
}

img {
  content-visibility: auto;
}

.touch-min {
  min-height: 44px;
  min-width: 44px;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-fade-in-up { animation: fade-in-up 0.45s ease-out both; }
.animate-fade-in { animation: fade-in 0.35s ease-out both; }
.animate-scale-in { animation: scale-in 0.35s ease-out both; }
.animate-delay-1 { animation-delay: 60ms; }
.animate-delay-2 { animation-delay: 120ms; }
.animate-delay-3 { animation-delay: 180ms; }
.animate-delay-4 { animation-delay: 240ms; }
.animate-delay-5 { animation-delay: 300ms; }
.animate-delay-6 { animation-delay: 360ms; }
.animate-delay-7 { animation-delay: 420ms; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: rewrite global.css with dual-theme vars, skeleton keyframes, reduced motion"
```

---

### Task 5: ThemeToggle component

**Files:**
- Create: `src/components/ThemeToggle.astro`

- [ ] **Step 1: Create ThemeToggle.astro**

```astro
---
// No props. Applies 'dark' class to <html> based on localStorage + prefers-color-scheme.
---

<script is:inline>
  (function() {
    const KEY = 'c9-theme';
    const html = document.documentElement;
    const stored = localStorage.getItem(KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      html.classList.add('dark');
    }
  })();
</script>

<button
  id="theme-toggle"
  class="touch-min flex items-center justify-center w-10 h-10 rounded-xl active:opacity-50 flex-shrink-0"
  style="color: var(--text-muted);"
  aria-label="Toggle theme"
>
  <!-- Sun icon (shown in dark mode, meaning "switch to light") -->
  <svg id="theme-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden dark:inline">
    <circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/>
  </svg>
  <!-- Moon icon (shown in light mode) -->
  <svg id="theme-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dark:hidden">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
</button>

<script is:inline>
  (function() {
    const btn = document.getElementById('theme-toggle');
    const KEY = 'c9-theme';
    if (!btn) return;
    btn.addEventListener('click', () => {
      const html = document.documentElement;
      const isDark = html.classList.toggle('dark');
      localStorage.setItem(KEY, isDark ? 'dark' : 'light');
    });
  })();
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThemeToggle.astro
git commit -m "feat: add ThemeToggle with dark/light switch + localStorage persistence"
```

---

### Task 6: Extract Header component

**Files:**
- Create: `src/components/Header.astro`

**Interfaces:**
- Consumes: `title`, `subtitle?`, `backUrl?`, `colors?` (for accent line)
- Produces: `<header>` with glass bg, back button, title, search link, theme toggle

- [ ] **Step 1: Create Header.astro**

```astro
---
import ThemeToggle from './ThemeToggle.astro';

export interface Props {
  title: string;
  subtitle?: string;
  backUrl?: string;
  accent?: string;
}

const { title, subtitle, backUrl, accent } = Astro.props;
const accentColor = accent || 'var(--accent, #8cb4ff)';
---

<header class="sticky top-0 z-40 animate-fade-in" style="background: var(--header-bg); border-bottom: 1px solid var(--border); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
  <div class="flex items-center gap-3 px-4 h-[70px] sm:h-20 max-w-4xl mx-auto">
    {backUrl ? (
      <a href={backUrl} class="touch-min flex items-center justify-center w-10 h-10 -ml-1 rounded-xl active:opacity-50 flex-shrink-0" style="color: var(--text-muted);" aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
      </a>
    ) : (
      <a href="/" class="flex items-center gap-1.5 flex-shrink-0" aria-label="Home">
        <span class="font-display text-[24px] sm:text-[26px] font-extrabold leading-none gradient-brand" style="-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background:linear-gradient(135deg, var(--accent, #8cb4ff), var(--accent2, #a78bfa));-webkit-background-clip:text;">9</span>
      </a>
    )}
    {accent && (
      <div class="w-px h-6 flex-shrink-0" style="background: {accentColor}; opacity: 0.3;"></div>
    )}
    <div class="min-w-0 flex-1">
      <h1 class="font-display text-[18px] sm:text-[20px] font-bold truncate leading-tight" style="color: var(--text-primary);">{title}</h1>
      {subtitle && <p class="font-body text-[13px] sm:text-[14px] leading-tight truncate" style="color: var(--text-secondary);">{subtitle}</p>}
    </div>
    <a href="/search/" class="touch-min flex items-center justify-center w-10 h-10 rounded-xl active:opacity-50 flex-shrink-0" style="color: var(--text-muted);" aria-label="Search lectures">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
    </a>
    <ThemeToggle />
    <button id="lang-toggle" class="touch-min flex items-center justify-center w-10 h-10 rounded-xl active:opacity-50 flex-shrink-0 font-mono text-[11px] font-semibold uppercase tracking-wider" style="color: var(--text-muted);" aria-label="Toggle language">EN</button>
  </div>
  {accent && (
    <div class="h-[2px] w-full" style="background: linear-gradient(90deg, {accentColor}, transparent); opacity: 0.4;"></div>
  )}
</header>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: extract Header component with glass bg, accent line, theme toggle"
```

---

### Task 7: Extract Footer component

**Files:**
- Create: `src/components/Footer.astro`

**Interfaces:**
- Consumes: `showPWA?` (for bottom padding)

- [ ] **Step 1: Create Footer.astro**

```astro
---
export interface Props {
  showPWA?: boolean;
}
const { showPWA } = Astro.props;
---

<footer class={`text-center font-body text-[11px] leading-relaxed py-4 px-4 space-y-0.5 ${showPWA ? ' pb-20' : ''} sm:pb-4`} style="color: var(--text-secondary);">
  <p data-lang="footer">Lectures belong to their respective teachers.</p>
  <p><span data-lang="footerMade">Made by Zeeshan Ahmed</span> · <a href="https://class9hub.com" class="underline underline-offset-2 hover:opacity-80" style="color: var(--text-secondary);">Class 9 Hub</a></p>
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: extract Footer component"
```

---

### Task 8: Extract PWAInstall component (deduplicated)

**Files:**
- Create: `src/components/PWAInstall.astro`

File content:

```astro
---
export interface Props {
  show?: boolean;
}
const { show } = Astro.props;
---

{show && (
<div id="pwa-banner" class="fixed bottom-0 left-0 right-0 z-30 translate-y-full transition-transform duration-300" style="background: var(--surface); border-top: 1px solid var(--border);">
  <div class="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
    <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background: linear-gradient(135deg, var(--accent, #8cb4ff), var(--accent2, #a78bfa)); color: white; font-family: var(--font-display); font-weight: 800; font-size: 13px;">9</div>
    <div class="min-w-0 flex-1">
      <div class="font-body text-[13px] font-medium" style="color: var(--text-primary);" data-lang="installApp">Install App</div>
      <div class="font-body text-[11px]" style="color: var(--text-secondary);" data-lang="installDesc">Open lectures faster from your home screen</div>
    </div>
    <button id="pwa-install" class="touch-min px-4 h-8 rounded-lg font-body text-[12px] font-medium flex-shrink-0" style="background: linear-gradient(135deg, var(--accent, #8cb4ff), var(--accent2, #a78bfa)); color: white;" data-lang="install">Install</button>
    <button id="pwa-dismiss" class="touch-min w-7 h-7 flex items-center justify-center flex-shrink-0 active:opacity-50" style="color: var(--text-muted);" aria-label="Dismiss">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
    </button>
  </div>
</div>
)}

<script is:inline>
(function() {
  var banner = document.getElementById('pwa-banner');
  if (!banner) return;
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (localStorage.getItem('c9-pwa-dismissed')) return;

  var deferredPrompt;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    banner.classList.remove('translate-y-full');
  });

  document.getElementById('pwa-install')?.addEventListener('click', async function() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    var result = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (result.outcome === 'accepted') banner.classList.add('translate-y-full');
  });

  document.getElementById('pwa-dismiss')?.addEventListener('click', function() {
    localStorage.setItem('c9-pwa-dismissed', '1');
    banner.classList.add('translate-y-full');
  });
})();
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PWAInstall.astro
git commit -m "feat: extract PWAInstall component, deduplicate install handler"
```

---

### Task 9: BentoHero component

**Files:**
- Create: `src/components/BentoHero.astro`

- [ ] **Step 1: Create BentoHero.astro**

```astro
---
import subjects from '../data/subjects.json';
const totalVideos = 512; // static approx — could compute from data
---

<div class="animate-fade-in-up pt-4 sm:pt-8">
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-min">
    <!-- Logo + Tagline — spans 2 cols -->
    <div class="col-span-2 sm:col-span-2 rounded-xl p-4 sm:p-5 flex items-start gap-4" style="background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow-card);">
      <span class="font-display text-[40px] sm:text-[52px] font-extrabold leading-none flex-shrink-0 gradient-brand" style="-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background:linear-gradient(135deg, var(--accent, #8cb4ff), var(--accent2, #a78bfa));-webkit-background-clip:text;">9</span>
      <div>
        <h1 class="font-display text-[18px] sm:text-[22px] font-bold leading-tight" data-lang="siteName">Class 9 · Punjab Curriculum</h1>
        <p class="font-body text-[13px] sm:text-[14px] mt-1 leading-relaxed" style="color: var(--text-secondary);" data-lang="siteDesc">All your lectures, one place. Free forever.</p>
      </div>
    </div>

    <!-- Stats card -->
    <div class="rounded-xl p-4 flex flex-col items-center justify-center text-center" style="background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow-card);">
      <span class="font-mono text-[22px] sm:text-[26px] font-semibold" style="color: var(--text-primary);">{totalVideos}</span>
      <span class="font-body text-[11px] sm:text-[12px]" style="color: var(--text-muted);" data-lang="videosLabel">videos</span>
    </div>

    <!-- Subjects card -->
    <div class="rounded-xl p-4 flex flex-col items-center justify-center text-center" style="background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow-card);">
      <span class="font-mono text-[22px] sm:text-[26px] font-semibold" style="color: var(--text-primary);">{subjects.length}</span>
      <span class="font-body text-[11px] sm:text-[12px]" style="color: var(--text-muted);" data-lang="subjectsLabel">subjects</span>
    </div>

    <!-- Search bar — full width -->
    <div class="col-span-2 sm:col-span-3 rounded-xl" style="background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow-card);">
      <a href="/search/" class="flex items-center gap-3 px-4 h-14 touch-min">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); flex-shrink: 0;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <span class="font-body text-[14px]" style="color: var(--text-muted);" data-lang="searchPlaceholder">Search any topic...</span>
      </a>
    </div>
  </div>

  <!-- Subject chips -->
  <div class="flex flex-wrap gap-2 mt-3">
    {subjects.map(s => (
      <a
        href={`/${s.id}/`}
        class="touch-min inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full font-body text-[13px] font-medium transition-all active:scale-95"
        style="background: {s.accent}15; color: {s.accent};"
      >
        {s.title}
      </a>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BentoHero.astro
git commit -m "feat: create BentoHero component with stats grid + subject chips"
```

---

### Task 10: Continue Studying section

**Files:**
- Create: `src/components/ContinueStudying.astro`

- [ ] **Step 1: Create ContinueStudying.astro**

```astro
---
import { getRecent } from '../lib/progress.js';
import subjects from '../data/subjects.json';

const recent = typeof window !== 'undefined' ? getRecent() : [];

// Build accent color map
const accentMap = {};
subjects.forEach(s => { accentMap[s.id] = s.accent; });
---

{recent.length > 0 && (
  <div class="mt-6 animate-fade-in-up">
    <h2 class="font-display text-[15px] font-bold mb-3" style="color: var(--text-primary);" data-lang="continueStudying">Continue Studying</h2>
    <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-3 px-3">
      {recent.map(item => (
        <a
          href={`/${item.subject}/${item.chapterId}/`}
          class="flex-shrink-0 w-44 rounded-xl p-3 transition-all active:scale-95"
          style="background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow-card);"
        >
          <div class="font-mono text-[11px] font-medium mb-1" style="color: {accentMap[item.subject] || 'var(--text-muted)'};">
            {item.subject.charAt(0).toUpperCase() + item.subject.slice(1)}
          </div>
          <div class="font-body text-[13px] font-medium leading-snug line-clamp-2" style="color: var(--text-primary);">
            {item.title}
          </div>
        </a>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ContinueStudying.astro
git commit -m "feat: create Continue Studying section with localStorage recent history"
```

---

### Task 11: Rewrite SubjectCard with solid card + accent glow

**Files:**
- Rewrite: `src/components/SubjectCard.astro`

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
  class="relative rounded-xl overflow-hidden aspect-square block active:scale-[0.96] touch-min transition-all duration-200"
  style="background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow-card);"
  aria-label={title}
>
  <img
    src={`/assets/${id}.webp`}
    alt={title}
    class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
    loading="lazy"
    decoding="async"
    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
  />
  <span class="absolute inset-0 items-center justify-center font-display text-[32px] font-bold" style="display:none; color: {accent};">{emoji}</span>
  <!-- Bottom gradient overlay + title -->
  <div class="absolute bottom-0 left-0 right-0 p-3" style="background: linear-gradient(transparent, rgba(0,0,0,0.7));">
    <span class="font-display text-[14px] sm:text-[15px] font-bold" style="color: #ffffff;">{title}</span>
  </div>
  <!-- Accent border glow on hover -->
  <div class="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200" style="box-shadow: inset 0 0 0 1px {accent};" class:list={['hover:opacity-100']}></div>
</a>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SubjectCard.astro
git commit -m "refactor: rewrite SubjectCard with solid card, title overlay, accent border glow"
```

---

### Task 12: Rewrite VideoCard with hover lift + JetBrains Mono duration

**Files:**
- Rewrite: `src/components/VideoCard.astro`

```astro
---
export interface Props {
  videoId: string;
  title: string;
  subtitle?: string;
  duration?: string;
  accent?: string;
}

const { videoId, title, subtitle, duration, accent = '#8cb4ff' } = Astro.props;
const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
---

<div
  class="rounded-xl overflow-hidden transition-all duration-200"
  style="background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow-card);"
  class:list={['hover:-translate-y-0.5 hover:shadow-hover']}
>
  <button
    data-video-id={videoId}
    class="video-trigger relative w-full aspect-video rounded-none focus:outline-none touch-min"
    aria-label={`Play ${title}`}
  >
    <img src={thumb} alt={title} class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
    {duration && (
      <span class="absolute bottom-2 right-2 font-mono text-[11px] font-medium px-1.5 py-0.5 rounded-md" style="background: var(--overlay); color: #ffffff; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);">
        {duration}
      </span>
    )}
    <!-- Accent glow border on hover -->
    <div class="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200" style="box-shadow: inset 0 0 0 1px {accent};" class:list={['hover:opacity-100']}></div>
  </button>
  <div class="px-3 pb-3 pt-2.5">
    <h3 class="font-body text-[14px] font-medium leading-snug line-clamp-2" style="color: var(--text-primary);">{title}</h3>
    {subtitle && <p class="font-body text-[12px] mt-0.5 leading-snug line-clamp-1" style="color: var(--text-secondary);">{subtitle}</p>}
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/VideoCard.astro
git commit -m "refactor: rewrite VideoCard with hover lift, JetBrains Mono duration, accent glow"
```

---

### Task 13: Unify ChapterRow + delete SectionRow

**Files:**
- Rewrite: `src/components/ChapterRow.astro`
- Delete: `src/components/SectionRow.astro`

**Interfaces:**
- Consumes: `number, title, count, label, href, accent?`
- ChapterRow handles both chapter listing and section listing via `label` prop

```astro
---
export interface Props {
  number: number;
  title: string;
  count: number;
  label: string;
  href: string;
  accent?: string;
}

const { number, title, count, label, href, accent = '#8cb4ff' } = Astro.props;
---

<a
  href={href}
  class="flex items-center gap-3 px-4 min-h-[60px] sm:min-h-[68px] rounded-xl border active:scale-[0.99] transition-all duration-200"
  style="background: var(--card-bg); border-color: var(--border); box-shadow: var(--shadow-card);"
  class:list={['hover:shadow-hover']}
>
  <span class="flex items-center justify-center w-8 h-8 rounded font-mono text-sm font-semibold flex-shrink-0" style="background: {accent}20; color: {accent};">
    {number}
  </span>
  <div class="min-w-0 flex-1">
    <div class="font-body text-[16px] sm:text-[17px] font-medium truncate" style="color: var(--text-primary);">{title}</div>
    <span class="font-body text-[13px]" style="color: var(--text-secondary);">{count} <span data-lang={label}>{label}</span></span>
  </div>
  <span class="font-mono text-sm" style="color: var(--text-muted);">&rarr;</span>
</a>
```

Delete `src/components/SectionRow.astro`.

- [ ] **Step 2: Update all SectionRow imports to use ChapterRow with `label="videos"`**

Search and replace in:
- `src/pages/[subject]/[chapter]/index.astro` — change `SectionRow` import to `ChapterRow`, update usage

- [ ] **Step 3: Commit**

```bash
git add src/components/ChapterRow.astro
git rm src/components/SectionRow.astro
git add src/pages/
git commit -m "refactor: unify ChapterRow + SectionRow, delete SectionRow duplicate"
```

---

### Task 14: Create ProgressDot component

**Files:**
- Create: `src/components/ProgressDot.astro`

```astro
---
export interface Props {
  viewed: boolean;
  accent?: string;
}

const { viewed, accent = '#8cb4ff' } = Astro.props;
---

<span
  class="inline-block w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200"
  style="background: {viewed ? accent : 'var(--text-muted)'}; opacity: {viewed ? 0.8 : 0.3};"
  aria-label={viewed ? 'Completed' : 'Not started'}
></span>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProgressDot.astro
git commit -m "feat: create ProgressDot component for watched/unwatched indicator"
```

---

### Task 15: Create BottomNav component

**Files:**
- Create: `src/components/BottomNav.astro`

```astro
---
import subjects from '../data/subjects.json';
---

<nav class="fixed bottom-0 left-0 right-0 z-30 sm:hidden block" style="background: var(--header-bg); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid var(--border);">
  <div class="flex items-center justify-around h-16 px-2 max-w-4xl mx-auto">
    <a href="/" class="touch-min flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl active:opacity-50" aria-label="Home">
      <span class="font-display text-[18px] font-extrabold gradient-brand" style="-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background:linear-gradient(135deg, var(--accent, #8cb4ff), var(--accent2, #a78bfa));-webkit-background-clip:text;">9</span>
    </a>
    <a href="/search/" class="touch-min flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl active:opacity-50" style="color: var(--text-muted);" aria-label="Search">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
    </a>
    <!-- Subject quick-switcher: tap to cycle / show dropdown -->
    <button id="bottom-subject-btn" class="touch-min flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl active:opacity-50" style="color: var(--text-muted);" aria-label="Switch subject">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    </button>
  </div>

  <!-- Subject quick-switcher panel (hidden by default) -->
  <div id="bottom-subject-panel" class="hidden px-3 pb-3">
    <div class="flex flex-wrap gap-2 p-3 rounded-xl" style="background: var(--surface); border: 1px solid var(--border);">
      {subjects.map(s => (
        <a
          href={`/${s.id}/`}
          class="touch-min inline-flex items-center gap-1.5 px-3 h-9 rounded-full font-body text-[13px] font-medium"
          style="background: {s.accent}15; color: {s.accent};"
        >
          {s.title}
        </a>
      ))}
    </div>
  </div>
</nav>

<script is:inline>
(function() {
  var btn = document.getElementById('bottom-subject-btn');
  var panel = document.getElementById('bottom-subject-panel');
  if (btn && panel) {
    btn.addEventListener('click', function() {
      panel.classList.toggle('hidden');
    });
    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!btn.contains(e.target) && !panel.contains(e.target)) {
        panel.classList.add('hidden');
      }
    });
  }
})();
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BottomNav.astro
git commit -m "feat: create BottomNav with home, search, subject quick-switcher"
```

---

### Task 16: Rewrite PlayerOverlay — lazy init, speed, glow, next-up, swipe

**Files:**
- Rewrite: `src/components/PlayerOverlay.js`

```js
export default class PlayerOverlay {
  constructor() {
    this.overlay = null;
    this.container = null;
    this.topBar = null;
    this.infoBar = null;
    this.nextUpEl = null;
    this.speedBtn = null;
    this.glowEl = null;
    this.isOpen = false;
    this.speed = 1;
    this._onPopState = (e) => { if (this.isOpen) this._closeInternal(); };
    window.addEventListener('popstate', this._onPopState);
  }

  _ensureDOM() {
    if (this.overlay) return;
    const o = document.createElement('div');
    o.className = 'fixed inset-0 z-50 flex flex-col transition-all duration-250 opacity-0 pointer-events-none';
    o.style.background = '#000';
    o.innerHTML = `
      <div class="flex items-center justify-between px-3 h-12 flex-shrink-0" style="background: linear-gradient(rgba(0,0,0,0.95), rgba(0,0,0,0.8)); border-bottom: 1px solid rgba(255,255,255,0.06);">
        <span class="font-body text-[13px] font-medium" style="color: rgba(255,255,255,0.5);">Now playing</span>
        <button class="player-speed touch-min w-10 h-10 flex items-center justify-center rounded-lg active:opacity-50 font-mono text-[13px] font-semibold" style="color: rgba(255,255,255,0.7);" aria-label="Playback speed">1x</button>
        <button class="player-close touch-min w-10 h-10 flex items-center justify-center rounded-lg active:opacity-50" style="color: rgba(255,255,255,0.5);" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center p-0 sm:p-4 relative overflow-hidden">
        <div class="player-glow absolute inset-0 opacity-30 transition-opacity duration-1000 pointer-events-none" style="background: radial-gradient(ellipse at center, rgba(140,180,255,0.4), transparent 70%);"></div>
        <div class="player-container relative w-full sm:max-w-3xl sm:rounded-xl overflow-hidden aspect-video" style="background: #000;"></div>
        <button class="player-fs touch-min absolute bottom-2 right-2 sm:bottom-5 sm:right-5 w-10 h-10 flex items-center justify-center rounded-lg z-10 active:scale-90" style="background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.8);" aria-label="Fullscreen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
      </div>
      <div class="px-4 py-3 space-y-3" style="background: linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95));">
        <div class="player-info font-body text-[13px]" style="color: rgba(255,255,255,0.5);"></div>
        <div class="player-nextup"></div>
      </div>
    `;
    document.body.appendChild(o);
    this.overlay = o;
    this.container = o.querySelector('.player-container');
    this.topBar = o.querySelector('.flex.items-center');
    this.infoBar = o.querySelector('.player-info');
    this.nextUpEl = o.querySelector('.player-nextup');
    this.speedBtn = o.querySelector('.player-speed');
    this.glowEl = o.querySelector('.player-glow');
    this.fsBtn = o.querySelector('.player-fs');

    o.addEventListener('click', (e) => {
      if (e.target === o) this.close();
    });
    o.querySelector('.player-close').addEventListener('click', () => this.close());
    this.speedBtn.addEventListener('click', () => this._cycleSpeed());
    this.fsBtn.addEventListener('click', () => this._toggleFS());

    // Touch swipe to close
    let startY = 0;
    o.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    o.addEventListener('touchmove', (e) => {
      const dy = e.touches[0].clientY - startY;
      if (dy > 80 && this.isOpen) this.close();
    }, { passive: true });

    document.addEventListener('fullscreenchange', () => this._onFSChange());
  }

  open(videoId, options = {}) {
    this._ensureDOM();
    history.pushState({playerOverlay: true}, '');
    this.videoId = videoId;
    this.speed = 1;
    this.speedBtn.textContent = '1x';

    const iframe = document.createElement('iframe');
    iframe.className = 'absolute inset-0 w-full h-full';
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`;
    iframe.frameborder = '0';
    iframe.allow = 'autoplay; encrypted-media';
    this.container.innerHTML = '';
    this.container.appendChild(iframe);

    this.overlay.classList.remove('opacity-0', 'pointer-events-none');
    this.isOpen = true;

    // Info bar
    if (options.subject || options.chapter || options.title) {
      const parts = [];
      if (options.subject) parts.push(options.subject);
      if (options.chapter) parts.push(options.chapter);
      if (options.title) parts.push(options.title);
      this.infoBar.textContent = parts.join(' · ');
    }

    // Next Up
    if (options.nextUp) {
      this.nextUpEl.innerHTML = `
        <div class="text-[12px] font-medium mb-2" style="color: rgba(255,255,255,0.4);">Next up</div>
        <a href="${options.nextUp.url}" class="flex items-center gap-3 p-2 rounded-lg active:scale-[0.98]" style="background: rgba(255,255,255,0.06);">
          <img src="https://i.ytimg.com/vi/${options.nextUp.videoId}/hqdefault.jpg" alt="" class="w-16 h-10 rounded object-cover flex-shrink-0" loading="lazy" />
          <div class="font-body text-[13px]" style="color: rgba(255,255,255,0.8);">${options.nextUp.title}</div>
        </a>
      `;
    } else {
      this.nextUpEl.innerHTML = '';
    }

    // Ambient glow
    this._setGlow(options.accent || '#8cb4ff');
  }

  _setGlow(color) {
    if (!this.glowEl) return;
    this.glowEl.style.background = `radial-gradient(ellipse at center, ${color}66, transparent 70%)`;
  }

  _cycleSpeed() {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(this.speed);
    this.speed = speeds[(idx + 1) % speeds.length];
    this.speedBtn.textContent = this.speed + 'x';
    // Send speed to YouTube iframe via postMessage
    const iframe = this.container?.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'setPlaybackRate',
        args: [this.speed]
      }), '*');
    }
  }

  close() {
    if (history.state?.playerOverlay) {
      history.back();
    } else {
      this._closeInternal();
    }
  }

  _closeInternal() {
    this.isOpen = false;
    this.overlay.classList.add('opacity-0');
    this.overlay.classList.add('pointer-events-none');
    if (document.fullscreenElement) document.exitFullscreen();
    setTimeout(() => {
      if (this.container) this.container.innerHTML = '';
      if (this.nextUpEl) this.nextUpEl.innerHTML = '';
    }, 250);
  }

  _toggleFS() {
    const el = this.container;
    if (!document.fullscreenElement) {
      el.requestFullscreen({navigationUI: 'hide'}).then(() => {
        screen.orientation?.lock?.('landscape').catch(() => {});
      }).catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  _onFSChange() {
    if (!document.fullscreenElement) {
      screen.orientation?.unlock?.();
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PlayerOverlay.js
git commit -m "refactor: rewrite PlayerOverlay — lazy init, speed toggle, ambient glow, next-up, swipe-close"
```

---

### Task 17: Refactor Layout.astro — use extracted components, add theme toggle, clean up

**Files:**
- Rewrite: `src/layouts/Layout.astro`

Key changes:
- Import Header, Footer, PWAInstall, BottomNav instead of inline
- Remove duplicate PWA script
- Keep structured data, meta, i18n toggle
- Add dark class handling via inline script
- Add `[data-theme]` attribute support
- Replace hardcoded siteUrl with constants import

```astro
---
import { ClientRouter } from 'astro:transitions';
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import PWAInstall from '../components/PWAInstall.astro';
import BottomNav from '../components/BottomNav.astro';
import i18n from '../data/i18n.json';
import { SITE_URL, SITE_NAME, DEFAULT_DESC, OG_IMAGE } from '../lib/constants';

export interface Props {
  title: string;
  subtitle?: string;
  desc?: string;
  accent?: string;
  backUrl?: string;
  canonical?: string;
  showPWA?: boolean;
  noHeader?: boolean;
  breadcrumbs?: { name: string; url: string }[];
}

const { title, subtitle, accent, backUrl, canonical, showPWA, noHeader, breadcrumbs, desc } = Astro.props;
const pageTitle = title === SITE_NAME ? title : `${title} · ${SITE_NAME}`;
const pageDesc = desc || DEFAULT_DESC;
const siteUrl = SITE_URL;
const ogImage = OG_IMAGE;
---

<!doctype html>
<html lang="en" class="scroll-smooth dark">
  <head>
    <meta charset="utf-8" />
    <meta name="google-site-verification" content="9wMIiVm55vRQLteCGqw9691RYnVIVzSzlrZRvj8tupQ" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <ClientRouter />
    <title>{pageTitle}</title>
    <meta name="description" content={pageDesc} />
    <meta name="theme-color" content="#07070d" id="theme-color-meta" />
    <meta name="application-name" content={SITE_NAME} />
    <link rel="manifest" href="/manifest.json" />
    <link rel="canonical" href={canonical || Astro.url.href} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={SITE_NAME} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={pageDesc} />
    <meta property="og:url" content={canonical || Astro.url.href} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={pageDesc} />
    <meta name="twitter:image" content={ogImage} />

    <!-- Structured Data -->
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": SITE_NAME,
      "url": siteUrl,
      "description": pageDesc,
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": siteUrl + "/search/?q={search_term_string}" },
        "query-input": "required name=search_term_string"
      }
    })}></script>

    {breadcrumbs && breadcrumbs.length > 0 && (
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": b.name,
        "item": b.url.startsWith('http') ? b.url : siteUrl + b.url
      }))
    })}></script>
    )}

    <!-- Dynamic theme color -->
    {accent && (
    <script is:inline>
      (function() {
        var meta = document.getElementById('theme-color-meta');
        if (meta) meta.content = '{accent}';
      })();
    </script>
    )}

    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js');
        });
      }
    </script>
  </head>
  <body class="min-h-screen flex flex-col">
    {!noHeader && <Header title={title} subtitle={subtitle} backUrl={backUrl} accent={accent} />}
    <main class="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 animate-fade-in-up">
      <slot />
    </main>
    <Footer showPWA={showPWA} />
    <PWAInstall show={showPWA} />
    <BottomNav />

    <script type="application/json" id="i18n-data">{JSON.stringify(i18n)}</script>

    <!-- i18n toggle -->
    <script is:inline>
      (function() {
        var KEY = 'class9-lang';
        var TOGGLE = document.getElementById('lang-toggle');
        var I18N = null;
        try { I18N = JSON.parse(document.getElementById('i18n-data').textContent); } catch(e) {}
        if (!TOGGLE || !I18N) return;

        function translate(lang) {
          var tr = I18N[lang];
          if (!tr) return;
          document.querySelectorAll('[data-lang]').forEach(function(el) {
            var key = el.getAttribute('data-lang');
            if (tr[key]) el.textContent = tr[key];
          });
        }

        function applyLang(lang) {
          var isUr = lang === 'ur';
          document.documentElement.lang = lang;
          document.documentElement.dir = isUr ? 'rtl' : 'ltr';
          TOGGLE.textContent = isUr ? 'UR' : 'EN';
          localStorage.setItem(KEY, lang);
          document.documentElement.classList.toggle('urdu', isUr);
          translate(lang);
        }
        var saved = localStorage.getItem(KEY);
        if (saved === 'ur') applyLang('ur');
        TOGGLE.addEventListener('click', function() {
          var current = document.documentElement.lang;
          applyLang(current === 'ur' ? 'en' : 'ur');
        });
      })();
    </script>

    <style is:global>
      html.urdu { direction: rtl; }
      html.urdu .gradient-brand { background: linear-gradient(135deg, #a78bfa, #8cb4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    </style>

    <script>
      import PlayerOverlay from '../components/PlayerOverlay.js';
      import { markViewed } from '../lib/progress.js';

      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.video-trigger');
        if (btn) {
          const videoId = btn.dataset.videoId;
          const title = btn.getAttribute('aria-label')?.replace('Play ', '') || '';
          const subject = btn.dataset.subject || '';
          const chapter = btn.dataset.chapter || '';
          const chapterId = btn.dataset.chapterId || '';
          if (videoId) {
            e.preventDefault();
            const player = new PlayerOverlay();
            player.open(videoId, {
              subject, chapter, title,
              nextUp: null, // could be populated from page context
            });
            if (subject && chapterId) {
              markViewed(subject, chapterId, videoId, title);
            }
          }
        }
      });
    </script>
  </body>
</html>
```

- [ ] **Step 1: Update all page files to pass `accent` instead of `colors`**

Replace in all 4 page templates:
- `colors={subject}` → `accent={subject.accent}`
- Add `data-subject`, `data-chapter`, `data-chapter-id` attributes to video triggers

- [ ] **Step 2: Commit**

```bash
git add src/layouts/ src/pages/
git commit -m "refactor: Layout.astro uses extracted components, adds accent prop, progress tracking"
```

---

### Task 18: Rewrite homepage — BentoHero + subject grid + Continue Studying

**Files:**
- Rewrite: `src/pages/index.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import SubjectCard from '../components/SubjectCard.astro';
import BentoHero from '../components/BentoHero.astro';
import ContinueStudying from '../components/ContinueStudying.astro';
import subjects from '../data/subjects.json';
import { SITE_URL } from '../lib/constants';
---

<Layout
  title="Class 9 Hub – Free Lectures for Punjab Board | Math, Physics, Chemistry & More"
  desc="Free class 9 lectures for Punjab Board 2026. Watch physics, math, chemistry, computer, urdu, biology and english video lectures online. Full chapter-wise course."
  canonical={SITE_URL}
  noHeader={true}
>
  <BentoHero />
  <ContinueStudying />
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
    {subjects.map((s, i) => (
      <div class={`animate-fade-in-up animate-delay-${Math.min(i + 1, 7)}`}>
        <SubjectCard id={s.id} title={s.title} emoji={s.emoji} accent={s.accent} />
      </div>
    ))}
  </div>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: homepage with BentoHero, Continue Studying, subject grid"
```

---

### Task 19: Rewrite subject page — glass header + chapter rows + description

**Files:**
- Rewrite: `src/pages/[subject]/index.astro`

```astro
---
import Layout from '../../layouts/Layout.astro';
import ChapterRow from '../../components/ChapterRow.astro';
import { subjects, getData, getSubject } from '../../lib/data';
import { SITE_URL } from '../../lib/constants';

export async function getStaticPaths() {
  return subjects.map((s) => ({
    params: { subject: s.id },
    props: { subject: s },
  }));
}

const { subject } = Astro.props;
const data = getData(subject.id);
const chapters = data.chapters || [];
const isExercises = data.kind === 'exercises';
const chNames = chapters.map((ch, i) => ch.title || `Chapter ${ch.number || i + 1}`);
const siteUrl = SITE_URL;
const pageUrl = siteUrl + '/' + subject.id + '/';

const subjectDesc = `Free ${subject.id} class 9 lectures for Punjab Board 2026 new book. Watch all ${chapters.length} chapters including ${chNames.slice(0, 3).join(', ')}${chNames.length > 3 ? ' and more' : ''}. Full video course online.`;

const breadcrumbs = [
  { name: 'Home', url: siteUrl + '/' },
  { name: subject.title + ' Class 9', url: pageUrl },
];

const subjLines = {
  math: `Math Class 9 – Free online video lectures for Punjab Board 2026. Course covering real numbers, logarithms, sets and functions, factorization, algebra, linear equations, trigonometry, coordinate geometry, logic, graphs, statistics and probability.`,
  physics: `Physics Class 9 – Free online video lectures for Punjab Board 2026. Course covering physical quantities and measurement, kinematics, dynamics, turning effect of forces, work energy and power, mechanical and thermal properties of matter, magnetism and nature of science.`,
  chemistry: `Chemistry Class 9 – Free online video lectures for Punjab Board 2026. Course covering structure of atom, chemical bonding, formulae and equations, energetics, equilibrium, acids and bases, periodic table, group properties, hydrocarbons and environmental chemistry.`,
  urdu: `Urdu Class 9 – Free online video lectures for Punjab Board 2026. Course covering hamd, naat, ikhlaq-e-hasanah, apni madad aap, nazam, ghazal, khatoot, tashreeh, grammar and essays.`,
  computer: `Computer Class 9 – Free online video lectures for Punjab Board 2026. Course covering computer systems and logic, troubleshooting and security, computer networks, computational thinking, web development and data science.`,
  biology: `Biology Class 9 – Free online video lectures for Punjab Board 2026. Course covering the science of biology, solving a biological problem, biodiversity, cells and tissues, cell cycle, enzymes, bioenergetics, nutrition, transport and more.`,
  english: `English Class 9 – Free online video lectures for Punjab Board 2026. Course covering prose, poetry, grammar, translation and comprehension.`,
};
const visibleLine = subjLines[subject.id] || `Free ${subject.title} class 9 lectures for Punjab Board 2026 new book – ${chapters.length} chapters. Watch full video course online.`;
---

<Layout
  title={`${subject.title} Class 9 – Full Course | Free Lectures Punjab Board`}
  subtitle="Select a chapter"
  desc={subjectDesc}
  accent={subject.accent}
  backUrl="/"
  canonical={pageUrl}
  breadcrumbs={breadcrumbs}
>
  <p class="mb-5 font-body text-[14px] leading-relaxed" style="color: var(--text-secondary);">{visibleLine}</p>
  <div class="flex flex-col gap-3">
    {chapters.map((ch, i) => {
      const num = ch.number || ch.chapterNumber || i + 1;
      const chTitle = ch.title || 'Chapter ' + num;
      const count = isExercises
        ? (ch.sections || []).length
        : (ch.videos ? ch.videos.length : 0);
      const label = isExercises ? 'sections' : 'videos';
      return (
        <div class="animate-fade-in-up" style={`animation-delay: ${i * 50}ms`}>
          <ChapterRow
            number={num}
            title={chTitle}
            count={count}
            label={label}
            href={`/${subject.id}/${ch.id}/`}
            accent={subject.accent}
          />
        </div>
      );
    })}
  </div>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/[subject]/index.astro
git commit -m "feat: subject page with glass header, chapter rows, accent theming"
```

---

### Task 20: Rewrite chapter page

**Files:**
- Rewrite: `src/pages/[subject]/[chapter]/index.astro`

Use shared data lib, pass accent color, add data attributes for video triggers.

- [ ] **Step 1: Update file**

- [ ] **Step 2: Commit**

---

### Task 21: Rewrite section page

**Files:**
- Rewrite: `src/pages/[subject]/[chapter]/[section]/index.astro`

- [ ] **Step 1: Update file**

- [ ] **Step 2: Commit**

---

### Task 22: Rewrite search page — glass search bar, result rows, empty state

**Files:**
- Rewrite: `src/pages/search.astro`

- [ ] **Step 1: Rewrite search.astro**

- [ ] **Step 2: Commit**

---

### Task 23: Rewrite 404 page

**Files:**
- Rewrite: `src/pages/404.astro`

- [ ] **Step 1: Polish 404.astro**

- [ ] **Step 2: Commit**

---

### Task 24: Fix favicon — proper SVG <2KB

**Files:**
- Rewrite: `public/favicon.svg`

Replace 113KB inline-base64 SVG with a clean SVG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8cb4ff"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="#0e0e18"/>
  <text x="50" y="68" font-family="system-ui,sans-serif" font-size="56" font-weight="800" fill="url(#g)" text-anchor="middle">9</text>
</svg>
```

- [ ] **Step 1: Rewrite favicon.svg**

- [ ] **Step 2: Commit**

```bash
git add public/favicon.svg
git commit -m "fix: replace 113KB favicon with clean 2KB SVG"
```

---

### Task 25: Subject images — create missing biology + English

**Files:**
- Create: `public/assets/biology.webp`
- Create: `public/assets/english.webp`

- [ ] **Step 1: Generate placeholder images or link to proper subject tiles**

- [ ] **Step 2: Commit**

---

### Task 26: Replace OG image SVG with PNG

**Files:**
- Create: `public/og-image.png`
- Remove: `public/og-image.svg`

- [ ] **Step 1: Generate proper OG PNG (1200x630)**

- [ ] **Step 2: Update references in Layout.astro**

- [ ] **Step 3: Commit**

---

### Task 27: Final a11y pass

- [ ] Verify all interactive elements have `aria-label`
- [ ] Add `aria-current="page"` to active nav items
- [ ] Verify keyboard focus visibility
- [ ] Ensure skip-to-content link exists

---

### Task 28: Lighthouse audit

- [ ] Run build: `npm run build`
- [ ] Audit locally: `npx lighthouse http://localhost:4321/ --view`
- [ ] Fix any issues below 100

---

### Task 29: Build and verify

- [ ] `npm run build`
- [ ] Verify 140+ pages generated
- [ ] Check no warnings in output
- [ ] Verify dark/light toggle works
- [ ] Verify search works
- [ ] Verify video player opens/closes
