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
