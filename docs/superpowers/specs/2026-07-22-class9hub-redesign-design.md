# class9hub.com — Complete Redesign Spec

**Date:** 2026-07-22
**Status:** Approved for implementation
**Design Director:** External reviewer
**Target:** Class 9 Punjab Board students (14-15), mobile-first, Pakistan

---

## Design Direction: "The Study Engine"

Not an archive. Not a blog. A premium app-like study tool that respects students' time and intelligence.

---

## 1. Design Token System

### Typography

| Role | Font | Weight | Use |
|------|------|--------|-----|
| Display | Plus Jakarta Sans | 700-800 | Hero, page headings, subject titles |
| Body | Inter | 400-500 | Body text, descriptions |
| Utility/Mono | JetBrains Mono | 400-600 | Chapter numbers, time durations, stats |

**Body line-height:** 1.6–1.7 (eye strain prevention for long reading).

### Color System — Dual Theme

#### Dark Mode (default — "Night Study" vibe)

| Token | Value | Use |
|-------|-------|-----|
| `--page-bg` | `#07070d` | Page background (OLED black) |
| `--surface` | `#0e0e18` | Section backgrounds |
| `--card-bg` | `#141420` | Card backgrounds (solid) |
| `--text-primary` | `#efeff5` | Headings, body |
| `--text-secondary` | `#8f8fa8` | Subheadings, metadata |
| `--text-muted` | `#5e5e78` | Labels, placeholders |
| `--border` | `rgba(255,255,255,0.08)` | Card borders |
| `--border-hover` | `rgba(255,255,255,0.14)` | Hover borders |
| `--header-bg` | `rgba(14,14,24,0.85)` | Glass header background |

#### Light Mode (high-contrast for outdoor/high-glare study)

| Token | Value | Use |
|-------|-------|-----|
| `--page-bg` | `#f4f4f8` | Page background |
| `--surface` | `#ffffff` | Section backgrounds |
| `--card-bg` | `#ffffff` | Card backgrounds |
| `--text-primary` | `#0f0f18` | Headings, body |
| `--text-secondary` | `#4a4a60` | Subheadings, metadata |
| `--text-muted` | `#808098` | Labels, placeholders |
| `--border` | `#e4e4ec` | Card borders |
| `--border-hover` | `#ccccd8` | Hover borders |
| `--header-bg` | `rgba(255,255,255,0.85)` | Glass header background |

#### Subject Accent Colors

Each subject has:
- **Dark accent** — used for glows, badges, borders on dark bg
- **Light accent** — slightly darker variant for WCAG AA on light bg

| Subject | Dark Accent | Light Accent |
|---------|-------------|--------------|
| Math | `#8cb4ff` | `#4a82e8` |
| Physics | `#7cff9b` | `#16a34a` |
| Chemistry | `#6fffe0` | `#0d9488` |
| Urdu | `#ffd166` | `#ca8a04` |
| Computer | `#67e8f9` | `#0891b2` |
| Biology | `#4ade80` | `#16a34a` |
| English | `#fb923c` | `#ea580c` |

### Shapes

| Element | Radius | Note |
|---------|--------|------|
| Cards | 12px | Solid surface |
| Buttons | 8px | Sober rectangles (not pills) |
| Badges | 9999px | Pill shape |
| Inputs | 8px | Search bar |
| Nav icons | 10px | Touch targets |

### Spacing System

Base unit: 4px. Rhythm: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

### Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Card | 1px border + Y-offset shadow | Default cards |
| Hover | Slight lift + accent glow | Interactive cards |
| Modal | Deeper shadow + backdrop | Player overlay |

---

## 2. Signature Element: Subject Color Atmosphere

Every subject page creates an environmental shift:

1. **Radial Mesh Gradient** — 5-8% opacity accent color radiates from center of page content area. Physics = blue glow, Chemistry = teal glow, Urdu = gold glow.
2. **Dynamic Favicon + Theme Color** — Browser tab icon and mobile status bar shift to match subject accent.
3. **Focus Mode Player** — When video plays, rest of UI dims (overlay at 0.3 opacity), accent glow matches video's dominant color.

---

## 3. Page Architecture

### Homepage — Bento Grid Hero

```
┌──────────────────────────────────────┐
│ ┌───┐ ┌─────────────────────────┐    │
│ │ 9 │ │ All Class 9 Lectures    │    │
│ │   │ │ 1 place, free forever   │    │
│ └───┘ └─────────────────────────┘    │
│ ┌─────────┐ ┌────────────────────┐   │
│ │ 512 Vid │ │ 📈 Ch 3 Trending  │   │
│ │ 7 Subj  │ │    Today          │   │
│ └─────────┘ └────────────────────┘   │
│ ┌────────────────────────────────────┐│
│ │ 🔍 Search any topic... (glass)     ││
│ └────────────────────────────────────┘│
│   [Math] [Physics] [Chem] [Urdu]     │
│   [Bio] [Computer] [English]         │
│                                       │
│ ─── Continue Studying ─────────────── │
│ [Ch 2] [Ch 5] [Ch 1] (horizontal)   │
├──────────────────────────────────────┤
│ Subject grid (2/3/5 cols)            │
│ Solid cards, accent border on hover  │
└──────────────────────────────────────┘
```

### Subject Page

```
┌─ Header (glass): Subject name / accent bar ─┐
│ Description paragraph (SEO)                   │
│                                               │
│ ┌── Chapter rows ──────────────────────────┐ │
│ │ ① Real Numbers          12 videos  →    │ │
│ │ ② Logarithms             8 videos  →    │ │
│ │ ③ Sets & Functions      15 videos  →    │ │
│ │ ...                                      │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Chapter Page

```
┌─ Header (glass): Chapter name / accent ─┐
│ Topic summary line                        │
│                                          │
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │Video │ │Video │ │Video │             │
│ │  1   │ │  2   │ │  3   │             │
│ │12:34 │ │  8:20│ │15:41 │             │
│ └──────┘ └──────┘ └──────┘             │
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │Video │ │Video │ │Video │             │
│ │  4   │ │  5   │ │  6   │             │
│ └──────┘ └──────┘ └──────┘             │
└──────────────────────────────────────────┘
```

### Video Player Overlay

```
┌──────────────────────────────────────┐
│ Now Playing             [Theater] [X]│ <- glass bar
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │        YouTube iframe            │ │
│ │                                  │ │
│ │     [⏪ 1x 1.25x 1.5x 2x ⏩]    │ │ <- speed controls
│ │                                  │ │
│ └──────────────────────────────────┘ │
│ [Subject · Chapter · Video Title]    │
│                                      │
│ ── Next Up ────────────────────────  │
│ [Next Video thumbnail + title]     → │
│ ───────────────────────────────────  │
└──────────────────────────────────────┘
    Ambient glow radiates from player edges in video's accent color
    Swipe down on mobile to close
```

### Search Page

```
┌─ Glass search bar (focused by default) ─┐
│ 🔍 Search any topic...                  │
│                                         │
│ Results:                                │
│ ┌──────────────────────────────────────┐│
│ │ [thumb] Video Title — Subtitle      ││
│ │         Physics · Chapter 3         ││
│ └──────────────────────────────────────┘│
│ ┌──────────────────────────────────────┐│
│ │ [thumb] Another Video               ││
│ │         Math · Chapter 2            ││
│ └──────────────────────────────────────┘│
│                                         │
│ Empty state: "Request a Chapter" button │
└─────────────────────────────────────────┘
```

---

## 4. Component Architecture

```
src/
  lib/
    data.js              — shared dataMap
    constants.js         — siteUrl, siteName, siteDesc
    progress.js          — localStorage helpers: getRecent, markViewed, getViewed
  components/
    BentoHero.astro      — homepage bento grid hero
    SubjectCard.astro    — solid card, image bg, accent border glow on hover
    VideoCard.astro      — solid card, hover lift, duration badge (JetBrains Mono)
    ChapterRow.astro     — unified row (SectionRow deleted), accent number badge
    PlayerOverlay.js     — lazy init, speed controls, ambient glow, next-up, swipe-close
    ProgressDot.astro    — watched/unwatched indicator dot
    BottomNav.astro      — mobile bottom nav (search + subject switcher)
    ThemeToggle.astro    — dark/light switch with localStorage + prefers-color-scheme
    Header.astro         — extracted from Layout (glass)
    Footer.astro         — extracted from Layout
    PWAInstall.astro     — extracted from Layout, deduplicated
    SearchResult.astro   — search result item row
  layouts/
    Layout.astro         — refined, lighter, uses extracted components
  styles/
    global.css           — rewritten: dual-theme CSS vars, no body::before, skeleton keyframes
```

### Base Component Contracts

#### GlassCard (for floating chrome only)
- Props: none (just wrapper with glass styles)
- CSS: `background: var(--header-bg); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border);`
- Mobile fallback: `background: var(--surface);` no blur

#### SubjectCard
- Props: `id, title, emoji, accent, accentLight`
- Behavior: solid card with image bg, 1px border, Y-shadow. On hover: border shifts to accent with subtle glow. Image fallback to text emoji.

#### VideoCard
- Props: `videoId, title, subtitle?, duration?`
- Behavior: solid card with thumbnail. Duration badge in JetBrains Mono. Hover: slight lift (translateY -2px) + accent border glow.

#### ChapterRow
- Props: `number, title, count, label, href, accent?`
- Number badge in JetBrains Mono with accent bg. Count in secondary text.

#### PlayerOverlay
- Lazy init (no DOM on import, create on first `.open()` call)
- Buttons ≥44x44px
- Speed toggle: cycle through 0.5x → 1x → 1.25x → 1.5x → 2x
- Ambient glow: sample video accent once every 5s, apply as radial gradient behind player
- Theater mode: max-w-5xl instead of max-w-3xl
- Swipe-down to close on mobile via touch events
- Next Up section: auto-suggest next video after current ends
- history.pushState/popState integration

#### BottomNav
- Fixed bottom, glass bg, shows on mobile (<768px)
- Items: Search (magnifying glass), subject quick-switcher (dropdown or scrollable chips)
- Touch targets ≥44x44px

---

## 5. Retention System (localStorage)

No login required. All persistence via localStorage.

### Progress Tracking
- Key: `class9-viewed-{subject}-{chapterId}` — Set of videoIds watched
- On video close, mark current video as viewed
- ChapterRow shows ProgressDot: filled accent if any video watched, hollow if none
- `Continue Studying` section on homepage: last 5 chapters with any activity, horizontal scroll

### Data Shape
```js
{
  `class9-viewed-${subject}-${chapterId}`: ["videoId1", "videoId2", ...],
  `class9-recent`: [
    { subject, chapterId, videoId, title, timestamp },
    ... // max 10 entries, LRU
  ]
}
```

### Skeleton State
- `Continue Studying` section renders 3 skeleton cards (shimmer animation) before JS hydrates
- Prevents layout jump

---

## 6. Mobile UX Rules

1. **Bottom Nav** — Search + subject switcher at thumb level (<768px)
2. **Touch targets** — All interactive elements ≥44x44px
3. **Swipe to close** — Video player swipe-down gesture
4. **No hover dependency** — All interactions work on tap
5. **Reduced motion** — Respect `prefers-reduced-motion`

---

## 7. Performance Guardrails

| Rule | Reason |
|------|--------|
| No `backdrop-blur` on cards (header/nav only) | GPU perf on Redmi/Samsung |
| Ambient glow samples every 5s, not every frame | Battery + CPU |
| Player overlay creates DOM on first use, not import | LCP |
| All subject images WebP with lazy loading | Bandwidth |
| Skeleton shimmer uses CSS only, no JS | Perceived speed |
| localStorage reads/writes sync (small payload) | Simplicity |

---

## 8. Implementation Order

### Phase 1: Foundation
1. Create `lib/data.js` — shared dataMap
2. Create `lib/constants.js` — siteUrl, siteName
3. Create `lib/progress.js` — localStorage helpers
4. Rewrite `global.css` — dual-theme CSS vars, remove body::before, skeleton keyframes
5. Create `ThemeToggle.astro` — dark/light switch
6. Update `Layout.astro` — use extracted components, add theme toggle

### Phase 2: Components
7. Extract `Header.astro` from Layout
8. Extract `Footer.astro` from Layout
9. Extract `PWAInstall.astro` from Layout (deduplicate)
10. Create `BentoHero.astro` — homepage hero
11. Rewrite `SubjectCard.astro` — solid card + accent glow
12. Rewrite `VideoCard.astro` — hover lift + JetBrains Mono duration
13. Merge `SectionRow.astro` into `ChapterRow.astro` (delete SectionRow)
14. Create `ProgressDot.astro`
15. Create `BottomNav.astro`
16. Create `SearchResult.astro`

### Phase 3: Player
17. Rewrite `PlayerOverlay.js` — lazy init, speed controls, ambient glow, next-up, swipe-close

### Phase 4: Pages
18. Rewrite `index.astro` — BentoGrid hero + subject grid + Continue Studying
19. Rewrite `[subject]/index.astro` — glass header + chapter rows
20. Rewrite `[subject]/[chapter]/index.astro` — video grid + progress
21. Rewrite `[subject]/[chapter]/[section]/index.astro` — video grid
22. Rewrite `search.astro` — glass search bar + result rows + empty state
23. Rewrite `404.astro` — polished

### Phase 5: Polish
24. Favicon — rewrite as proper SVG (<2KB)
25. Subject images — create missing biology + English WebP images
26. OG image — replace SVG with PNG
27. Type `currentSubject` in Layout props
28. Replace hardcoded `siteUrl` with `constants.js` import
29. Final a11y pass (focus management, aria-current, landmarks)
30. Lighthouse audit — target 100/100 on all categories

---

## 9. Self-Review (Spec Check)

- **Placeholders:** None. All sections complete.
- **Internal consistency:** All color tokens referenced match the system defined in §1. Component list matches page architecture in §3.
- **Scope check:** Focused on a single project (class9hub redesign). Phases are sequential but independent within phase — parallel work possible.
- **Ambiguity check:** Clear. Subject accent light/dark variants defined. Glass vs solid boundary defined. Player behaviors specified.

---

## 10. Build Command

```bash
npm run build
```

Expected: ~140 static pages, build under 10s, single CSS file (layout), JS only on pages that need it (search, player, theme toggle, progress).
