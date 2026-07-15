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

