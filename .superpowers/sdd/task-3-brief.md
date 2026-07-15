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

