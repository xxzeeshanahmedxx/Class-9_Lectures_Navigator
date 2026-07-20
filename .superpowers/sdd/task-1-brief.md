### Task 1: Scaffold Astro + Tailwind 4 Project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "class-9-lectures-navigator",
  "type": "module",
  "version": "2.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "deploy": "astro build && wrangler pages deploy dist --project-name 9lectures"
  },
  "dependencies": {
    "@fontsource/inter": "^5.2.5",
    "@fontsource/jetbrains-mono": "^5.2.5",
    "astro": "^7.0.0"
  },
  "devDependencies": {
    "@astrojs/cloudflare": "^13.0.0",
    "@tailwindcss/vite": "^4.3.0",
    "tailwindcss": "^4.3.0",
    "typescript": "^5.7.0",
    "wrangler": "^4.107.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://9lectures.pages.dev',
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@data/*": ["src/data/*"]
    }
  }
}
```

- [ ] **Step 4: Create `src/styles/global.css`**

```css
@import "tailwindcss";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/jetbrains-mono/400.css";
```

- [ ] **Step 5: Install dependencies**

Run: `npm install` in project root
Expected: All deps installed, no errors

- [ ] **Step 6: Verify Astro builds empty site**

Run: `npx astro build`
Expected: Build succeeds, `dist/` created

- [ ] **Step 7: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json src/styles/global.css package-lock.json
git rm -r node_modules
git commit -m "wip: scaffold Astro + Tailwind 4"
```

---

