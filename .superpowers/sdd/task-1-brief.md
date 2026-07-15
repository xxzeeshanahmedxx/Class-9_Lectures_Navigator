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

