# 9Lectures — Full UI Redesign

**Date:** 2026-07-15
**Design System:** Vercel (dark-mode adaptation)
**Status:** Approved

---

## 1. Architecture

Single-page app (no framework change). Adds:
- `localStorage`-based progress tracking and continue-watching
- `service-worker.js` for offline app shell + data caching
- No backend changes — all data remains in static JSON files

---

## 2. Color System (Vercel Dark Adaptation)

| Token | Value | RGB | Use |
|---|---|---|---|
| `--canvas` | `#11182d` | 17 24 45 | Card surfaces, elevated panels |
| `--canvas-soft` | `#070a1a` | 7 10 26 | Page background |
| `--canvas-soft-2` | `#0d1225` | 13 18 37 | Inset regions, search inputs |
| `--ink` | `#f2f6ff` | 242 246 255 | Primary text (headings, body) |
| `--body` | `#a7b4cc` | 167 180 204 | Secondary text |
| `--mute` | `#6b7a99` | 107 122 153 | Lowest priority, placeholders |
| `--hairline` | `#1e2a4a` | 30 42 74 | 1px card borders, dividers |
| `--hairline-strong` | `#2a3a66` | 42 58 102 | Stronger borders on hover |
| `--accent` | `#8cb4ff` | 140 180 255 | Links, hover indicators |
| `--accent-soft` | `rgba(140,180,255,0.12)` | — | Accent background glows |
| `--primary` | `#f2f6ff` | 242 246 255 | Pill CTA text |
| `--success` | `#4ade80` | 74 222 128 | Completion indicators |
| `--gradient-1` | `#007cf0` | — | Mesh gradient stop (develop) |
| `--gradient-2` | `#7928ca` | — | Mesh gradient stop (preview) |
| `--gradient-3` | `#ff0080` | — | Mesh gradient stop (ship) |
| `--gradient-4` | `#f9cb28` | — | Mesh gradient stop (amber) |

---

## 3. Typography

- **Primary face:** Inter (400, 500, 600) — loaded from Google Fonts with preconnect
- **Mono face:** JetBrains Mono (400 at 12px) — durations, progress labels, section eyebrows
- **Display headings:** weight 600, negative letter-spacing, sentence-case

| Level | Size | Weight | Letter-spacing | Use |
|---|---|---|---|---|
| `display-xl` | 32px | 600 | -1.28px | Page heading ("CLASS 9 LECTURES") |
| `display-lg` | 24px | 600 | -0.96px | Subject title on home cards |
| `display-md` | 20px | 600 | -0.6px | Chapter/video titles |
| `body-lg` | 16px | 400 | 0 | Chapter descriptions |
| `body-md` | 14px | 400 | -0.28px | Secondary info |
| `body-sm` | 12px | 400 | 0 | Captions, footnotes |
| `caption-mono` | 12px | 400 | 0 | Technical labels (durations, progress) |

---

## 4. Component Library

### 4.1 Home Card
- Canvas surface, 1px hairline border, `rounded: 12px` (lg)
- Stacked shadow: `0 1px 2px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.12)`
- Icon container: 56×56px, `rounded: 14px`, gradient fill from subject accent
- Title in `display-lg` (24px, 600, -0.96px)
- Hover: `translateY(-3px)`, border shifts to accent@60%, subtle glow `0 0 30px -8px var(--accent)`
- Grid: 2-col mobile, 3-col desktop (≥900px)

### 4.2 Continue Watching Card
- Compact horizontal card in a scrollable row
- Thumbnail (56×56px `rounded: 8px`) + title + progress bar + "Continue" pill
- Background: `canvas` with accent-left-border indicator
- `rounded: 10px`

### 4.3 Chapter / Section Row
- Full-width card, `rounded: 8px` (md), canvas surface, hairline border
- Title in `display-md` (20px, 600), body text below
- Arrow indicator on right side
- Hover: `translateY(-1px)`, border to hairline-strong

### 4.4 Video Card (template-card)
- Canvas surface, `rounded: 10px`, padding `14px`
- Thumbnail: 16:9 aspect, `rounded: 8px` (sm), overflow hidden
- Thumbnail hover: `scale(1.04)` with brightness bump
- Title: `display-md` (20px, 600), letter-spacing -0.6px
- Duration badge: bottom-right of thumbnail, `caption-mono`, dark bg, `rounded: 4px`
- Grid: 2-col mobile, 3-col desktop

### 4.5 Progress Bar
- 3px height, `rounded: 4px`
- Background: hairline surface
- Fill: gradient (subject accent), `transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1)`
- Label: "3/12 watched" in `body-sm`

### 4.6 Video Player Overlay
- Fullscreen overlay, dark bg `rgba(0,0,0,0.9)` with `backdrop-filter: blur(4px)`
- Player container: `rounded: 16px` (xl), `max-width: 900px`
- Close button: circular, 36px, dark bg, top-right
- Transition: `opacity 0.3s`

---

## 5. Data Flow

### 5.1 Continue Watching
- On video play/pause/close, save to `localStorage['cw']`:
  ```json
  [{ subjectId, subjectTitle, chapterTitle, videoId, videoTitle, thumbnail, duration, timestamp }]
  ```
- Max 10 entries, newest first, deduplicated by videoId
- `timestamp` updated on each play progress (saved every 30s)

### 5.2 Per-Chapter Progress
- `localStorage['progress']`:
  ```json
  { "math/ch1": { "videoIds": ["abc", "def"], "total": 12 } }
  ```
- Video count derived from JSON data, viewed count from watched IDs

### 5.3 Offline
- `service-worker.js` on `install`: cache all app files (index.html, app.js, styles.css, data/*.json)
- On `fetch`: serve from cache, fall back to network, cache new responses
- Video playback: detect online/offline, show "Requires internet" overlay for YouTube iframes when offline

---

## 6. Animations & Effects

| Element | Transition | Timing |
|---|---|---|
| Page transitions | `opacity + translateY(8px)` | 0.25s, `cubic-bezier(0.16, 1, 0.3, 1)` |
| Home cards hover | `translateY(-3px)`, border, glow | 0.2s |
| Subject grid stagger | `translateY(12px) → 0`, per-item delay 50ms | 0.3s each |
| Chapter rows hover | `translateY(-1px)` | 0.15s |
| Thumbnail hover | `scale(1.04)`, brightness | 0.2s |
| Progress bar fill | `width` | 0.8s, `cubic-bezier(0.16, 1, 0.3, 1)` |
| Back button press | `rotate(90deg)` over 0.3s | 0.3s |
| Player overlay | `opacity` + `backdrop-filter` | 0.3s |
| Background mesh | Infinite drift, 20s cycle | 20s ease-in-out infinite |

---

## 7. Responsive Breakpoints

| Name | Width | Changes |
|---|---|---|
| Mobile | < 640px | 1-col videos, 2-col home grid, smaller padding/radius, 18px heading |
| Tablet | 640–899px | Same as mobile but 2-col videos |
| Desktop | ≥ 900px | 3-col home grid, 3-col videos, larger padding, 32px page heading |

---

## 8. File Changes

| File | Change |
|---|---|
| `styles.css` | Full rewrite — Vercel color tokens, new component classes, animations |
| `app.js` | Add `localStorage` functions (continue-watching, progress), stagger animation on home, page transition wrapper |
| `index.html` | Preconnect Google Fonts (Inter + JetBrains Mono), service-worker registration script |
| `service-worker.js` | NEW — cache app shell + data JSONs on install, serve from cache |
| `DESIGN.md` | Copied to project root (already done) |

---

## 9. Not In Scope (for this iteration)

- Quizzes/practice tests
- User accounts/cloud sync
- Downloading actual video files
- Search across subjects
- Bookmarks/favorites
- Audio-only mode
