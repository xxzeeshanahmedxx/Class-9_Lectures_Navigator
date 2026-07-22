# Scraper Memory — Notes & Updates

## Content Strategy
- Notes pages (80) + Updates pages (5) = SEO bait.
- Traffic funnel: search → notes/blog → video lectures → longer sessions.
- **Content NOT in source.** Pages scaffold empty. Scraper fills `content` fields.

## Notes Data File
**`src/data/notes.js`**
- Array of `{ subjectId, subjectTitle, chapterId, chapterTitle, accent, content }`.
- `content: ""` initially. Scraper overwrites with HTML string.
- 80 entries across 7 subjects.

## Scraper Design

### Sources
| Subject | Source |
|---------|--------|
| Math | PCTB class 9 math textbook (Punjab Curriculum & Textbook Board) |
| Physics | PCTB physics textbook |
| Chemistry | PCTB chemistry textbook |
| Biology | PCTB biology textbook |
| Computer | PCTB computer science textbook |
| Urdu | PCTB Urdu textbook (Ghazal/Nazm tashreeh notes) |
| English | PCTB English textbook (paragraph summaries, Q/A) |

### Scraper Script Spec
Write a Node.js script (`scripts/scrape-notes.mjs`) that:
1. Reads `src/data/notes.js`
2. For each `chapterId`: scrapes textbook PDF or open notes site
3. Extracts: summary, key points, formulas (math/phys/chem), definitions, Q&A
4. Converts to clean HTML (paragraphs, lists, tables, bold/italic)
5. Updates `content` field in `notes.js`
6. Uses `cheerio` + `node-fetch` or `puppeteer`

### SEO per Chapter
Each note page should include in `content`:
- `<h2>Key Points</h2>` — bullet list
- `<h2>Important Definitions</h2>` — term: definition
- `<h2>Formulas</h2>` — (math, physics, chemistry)
- `<h2>Short Questions</h2>` — common board exam questions
- Internal links to video lecture: `<a href="/{subjectId}/#{chapterId}">`

### Updates Scraper
- Sources: BISE Punjab official site, PEC results portal
- Scrape date sheets, result announcements, holiday notifications
- Format: `{ date, type, title, description, slug, content }`
- Add to `src/data/updates.js`

## Chapter-URL Map
Math (ch1-ch13): `/notes/math/ch1/` etc
Physics (ch1-ch9): `/notes/physics/ch1/` etc
Chemistry (ch1-ch13): `/notes/chemistry/ch1/` etc
Urdu (ch1-ch19): `/notes/urdu/ch1/` etc
Computer (ch1-ch6): `/notes/computer/ch1/` etc
Biology (ch1-ch11): `/notes/biology/ch1/` etc
English (ch1,ch2,ch3,ch4,ch5,ch6,ch8,ch9,ch11): `/notes/english/ch1/` etc

## Build
After populating content: `npm run build` → ~226 pages.
Each content update needs rebuild + deploy.
