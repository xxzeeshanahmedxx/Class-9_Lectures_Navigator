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

