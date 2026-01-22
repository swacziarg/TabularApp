## ✅ Easy Checklist — Vite + React + TypeScript + GitHub Pages (MVP, Atomic Commits)

### **Day 1 — Repo + UI skeleton (deployable ASAP)**

**Goal:** Get a live empty app on GitHub Pages early.

- [X] **Commit 1:** `chore: init vite react ts app`
  - [X] Create repo
  - [X] Run `npm create vite@latest` (React + TS)
  - [X] Verify `npm run dev`
  - ✅ Deliverable: local app running

- [X] **Commit 2:** `chore: add eslint + prettier`
  - [X] Add ESLint + Prettier
  - [X] Add scripts: `lint`, `format`
  - ✅ Deliverable: consistent formatting + basic lint rules

- [X] **Commit 3:** `chore: add github pages deploy workflow`
  - [X] Add GitHub Actions workflow for Pages deploy
  - [X] Set Vite `base` path config
  - ✅ Deliverable: app deploys on GitHub Pages

- [X] **Commit 4:** `feat: add basic app layout + header`
  - [X] Add layout shell
    - [X] Header: “Table Compare MVP”
    - [X] Main container
    - [X] Footer (optional version/build info)
  - ✅ Deliverable: nice-looking empty app deployed

---

### **Day 2 — Paste input + basic parsing into grid**

**Goal:** Paste text → parse rows/cols → show preview.

- [X] **Commit 5:** `feat: add two paste boxes for table A and B`
  - [X] Two textareas: Table A + Table B
  - [X] Buttons: Parse + Clear
  - ✅ Deliverable: paste content stored in state

- [X] **Commit 6:** `feat: add raw text preview + character/row counters`
  - [X] Show character count
  - [X] Show line count
  - ✅ Deliverable: paste debug confidence

- [X] **Commit 7:** `feat: implement delimiter detection (tab/csv/pipe/semicolon/space)`
  - [X] Implement `detectDelimiter(text)`
  - [X] Try: `\t`, `,`, `;`, `|`, multi-space
  - [X] Choose best delimiter via scoring
  - ✅ Deliverable: delimiter auto-chosen

- [X] **Commit 8:** `feat: parse pasted text into 2D table data`
  - [X] Implement `parseTextToGrid(text)`
  - [X] Output: `rows: string[][]`
  - [X] Ensure consistent column count
  - ✅ Deliverable: paste → structured grid

- [X] **Commit 9:** `feat: render parsed table previews for A and B`
  - [X] Render basic `<table>`
  - [X] Limit preview to ~30 rows
  - ✅ Deliverable: parsed preview works

---

### **Day 3 — Headers + normalization**

**Goal:** User controls headers + cleaner data.

- [X] **Commit 10:** `feat: add header toggle and auto header detection`
  - [X] Checkbox: “First row is header”
  - [X] Auto-detect default after parsing
  - [X] If header off → generate `Column 1..N`
  - ✅ Deliverable: column names available

- [X] **Commit 11:** `feat: normalize cell values (trim, collapse whitespace)`
  - [X] Trim each cell
  - [X] Collapse whitespace
  - [X] Normalize empty values
  - [X] Add toggle: “Case-insensitive compare”
  - ✅ Deliverable: stable normalized dataset

- [X] **Commit 12:** `feat: add column selector dropdowns for key column`
  - [X] Dropdown: Key column for A
  - [X] Dropdown: Key column for B
  - [X] Default B = same name if possible
  - [X] Validate selection exists
  - ✅ Deliverable: user can pick match key

---

### **Day 4 — Comparison engine (core MVP)**

**Goal:** Detect missing + changed rows.

- [X] **Commit 13:** `feat: build row objects from parsed grid + headers`
  - [X] Convert grid into `RowObject[]`
  - [X] Track original row index
  - ✅ Deliverable: structured data ready

- [X] **Commit 14:** `feat: implement compare by key (missing A/B)`
  - [X] Build maps: `key → row`
  - [X] Compute:
    - [X] Missing in B
    - [X] Missing in A
  - ✅ Deliverable: missing rows computed

- [X] **Commit 15:** `feat: implement changed rows detection (per-cell diff)`
  - [X] For shared keys:
    - [X] Detect cell changes
    - [X] Track changed columns
    - [X] Store before/after values
  - ✅ Deliverable: changed rows computed

- [X] **Commit 16:** `feat: show comparison summary counts + results tabs`
  - [X] Summary cards:
    - [X] Total A / Total B
    - [X] Missing in A / Missing in B
    - [X] Changed rows
  - [X] Tabs:
    - [X] Missing in B
    - [X] Missing in A
    - [X] Changed
  - ✅ Deliverable: full compare workflow works

---

### **Day 5 — Results polish + exporting**

**Goal:** Make output usable + shareable.

- [X] **Commit 17:** `feat: highlight changed cells in results table`
  - [X] Changed tab view: side-by-side or unified
  - [X] Highlight changed cells
  - [X] Add diff indicator per row
  - ✅ Deliverable: easy-to-spot diffs

- [ ] **Commit 18:** `feat: add copy-to-clipboard for results`
  - [ ] Buttons:
    - [ ] Copy missing rows CSV
    - [ ] Copy changed rows CSV
  - ✅ Deliverable: quick copying

- [ ] **Commit 19:** `feat: add download csv export for each result set`
  - [ ] Download files:
    - [ ] `missing_in_a.csv`
    - [ ] `missing_in_b.csv`
    - [ ] `changed.csv`
  - ✅ Deliverable: exportable results

---

### **Day 6 — Edge cases + quality**

**Goal:** Handle real messy pastes.

- [ ] **Commit 20:** `fix: handle ragged rows (pad/merge extras) + warnings`
  - [ ] Row too short → pad missing cells
  - [ ] Row too long → merge extras OR warning
  - [ ] Show non-blocking warning banner
  - ✅ Deliverable: doesn’t break on messy input

- [ ] **Commit 21:** `feat: add duplicate key detection + duplicate report`
  - [ ] Detect duplicate keys in A and B
  - [ ] Show:
    - [ ] Duplicate counts
    - [ ] Sample keys
  - [ ] Decide: block compare OR warn and continue
  - ✅ Deliverable: avoids misleading results

- [ ] **Commit 22:** `feat: save paste inputs + settings to localStorage`
  - [ ] Save Table A + B text
  - [ ] Save selected key columns + toggles
  - ✅ Deliverable: refresh won’t wipe work

---

### **Day 7 — MVP finishing + release**

**Goal:** Ship clean version + docs.

- [ ] **Commit 23:** `docs: add usage instructions + examples to README`
  - [ ] Supported formats
  - [ ] How to compare
  - [ ] How to run locally
  - [ ] How to deploy
  - ✅ Deliverable: easy onboarding

- [ ] **Commit 24:** `chore: add version tag + mvp release notes`
  - [ ] Tag `v0.1.0`
  - [ ] Optional GitHub Release notes
  - ✅ Deliverable: MVP milestone shipped

---

## ✅ Final MVP Definition (Done = Shippable)

Your deployed GitHub Pages app will:

- [ ] Accept pasted tables (TSV / CSV / pipe / semicolon / spaces)
- [ ] Parse into clean tables
- [ ] Compare by key column
- [ ] Show:
  - [ ] Missing rows
  - [ ] Extra rows
  - [ ] Changed rows (highlighted)
- [ ] Export via copy + CSV download
- [ ] Fully client-side (no backend)
- [ ] Live on GitHub Pages
