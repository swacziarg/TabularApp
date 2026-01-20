## ✅ Easy Checklist — Vite + React + TypeScript + GitHub Pages (MVP, Atomic Commits)

### **Day 1 — Repo + UI skeleton (deployable ASAP)**

**Goal:** Get a live empty app on GitHub Pages early.

- [ ] **Commit 1:** `chore: init vite react ts app`
  - [ ] Create repo
  - [ ] Run `npm create vite@latest` (React + TS)
  - [ ] Verify `npm run dev`
  - ✅ Deliverable: local app running

- [ ] **Commit 2:** `chore: add eslint + prettier`
  - [ ] Add ESLint + Prettier
  - [ ] Add scripts: `lint`, `format`
  - ✅ Deliverable: consistent formatting + basic lint rules

- [ ] **Commit 3:** `chore: add github pages deploy workflow`
  - [ ] Add GitHub Actions workflow for Pages deploy
  - [ ] Set Vite `base` path config
  - ✅ Deliverable: app deploys on GitHub Pages

- [ ] **Commit 4:** `feat: add basic app layout + header`
  - [ ] Add layout shell
    - [ ] Header: “Table Compare MVP”
    - [ ] Main container
    - [ ] Footer (optional version/build info)
  - ✅ Deliverable: nice-looking empty app deployed

---

### **Day 2 — Paste input + basic parsing into grid**

**Goal:** Paste text → parse rows/cols → show preview.

- [ ] **Commit 5:** `feat: add two paste boxes for table A and B`
  - [ ] Two textareas: Table A + Table B
  - [ ] Buttons: Parse + Clear
  - ✅ Deliverable: paste content stored in state

- [ ] **Commit 6:** `feat: add raw text preview + character/row counters`
  - [ ] Show character count
  - [ ] Show line count
  - ✅ Deliverable: paste debug confidence

- [ ] **Commit 7:** `feat: implement delimiter detection (tab/csv/pipe/semicolon/space)`
  - [ ] Implement `detectDelimiter(text)`
  - [ ] Try: `\t`, `,`, `;`, `|`, multi-space
  - [ ] Choose best delimiter via scoring
  - ✅ Deliverable: delimiter auto-chosen

- [ ] **Commit 8:** `feat: parse pasted text into 2D table data`
  - [ ] Implement `parseTextToGrid(text)`
  - [ ] Output: `rows: string[][]`
  - [ ] Ensure consistent column count
  - ✅ Deliverable: paste → structured grid

- [ ] **Commit 9:** `feat: render parsed table previews for A and B`
  - [ ] Render basic `<table>`
  - [ ] Limit preview to ~30 rows
  - ✅ Deliverable: parsed preview works

---

### **Day 3 — Headers + normalization**

**Goal:** User controls headers + cleaner data.

- [ ] **Commit 10:** `feat: add header toggle and auto header detection`
  - [ ] Checkbox: “First row is header”
  - [ ] Auto-detect default after parsing
  - [ ] If header off → generate `Column 1..N`
  - ✅ Deliverable: column names available

- [ ] **Commit 11:** `feat: normalize cell values (trim, collapse whitespace)`
  - [ ] Trim each cell
  - [ ] Collapse whitespace
  - [ ] Normalize empty values
  - [ ] Add toggle: “Case-insensitive compare”
  - ✅ Deliverable: stable normalized dataset

- [ ] **Commit 12:** `feat: add column selector dropdowns for key column`
  - [ ] Dropdown: Key column for A
  - [ ] Dropdown: Key column for B
  - [ ] Default B = same name if possible
  - [ ] Validate selection exists
  - ✅ Deliverable: user can pick match key

---

### **Day 4 — Comparison engine (core MVP)**

**Goal:** Detect missing + changed rows.

- [ ] **Commit 13:** `feat: build row objects from parsed grid + headers`
  - [ ] Convert grid into `RowObject[]`
  - [ ] Track original row index
  - ✅ Deliverable: structured data ready

- [ ] **Commit 14:** `feat: implement compare by key (missing A/B)`
  - [ ] Build maps: `key → row`
  - [ ] Compute:
    - [ ] Missing in B
    - [ ] Missing in A
  - ✅ Deliverable: missing rows computed

- [ ] **Commit 15:** `feat: implement changed rows detection (per-cell diff)`
  - [ ] For shared keys:
    - [ ] Detect cell changes
    - [ ] Track changed columns
    - [ ] Store before/after values
  - ✅ Deliverable: changed rows computed

- [ ] **Commit 16:** `feat: show comparison summary counts + results tabs`
  - [ ] Summary cards:
    - [ ] Total A / Total B
    - [ ] Missing in A / Missing in B
    - [ ] Changed rows
  - [ ] Tabs:
    - [ ] Missing in B
    - [ ] Missing in A
    - [ ] Changed
  - ✅ Deliverable: full compare workflow works

---

### **Day 5 — Results polish + exporting**

**Goal:** Make output usable + shareable.

- [ ] **Commit 17:** `feat: highlight changed cells in results table`
  - [ ] Changed tab view: side-by-side or unified
  - [ ] Highlight changed cells
  - [ ] Add diff indicator per row
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
