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

