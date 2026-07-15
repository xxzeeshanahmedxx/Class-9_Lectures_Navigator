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

