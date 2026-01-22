# TabularApp (Table Compare MVP)

A lightweight client-side tool to compare two pasted tables.

✅ Paste Table A + Table B  
✅ Auto-detect delimiter (TSV / CSV / pipe / semicolon / multi-space)  
✅ Select a key column  
✅ See results:
- Missing in A
- Missing in B
- Changed rows (highlighted)

✅ Copy or download results as CSV  
✅ Works fully in the browser (no backend)

---

## Live Demo

This app is deployed on GitHub Pages.

> If you fork/rename the repo, update the Vite `base` path in `vite.config.ts`.

---

## Supported Input Formats

You can paste tables from:

### TSV (tab-separated)

Example:
```txt
id	name	age
1	Alice	30
2	Bob	25
```

### CSV (comma-separated)

```csv
id,name,age
1,Alice,30
2,Bob,25
```

### Pipe (|)

```txt
id|name|age
1|Alice|30
2|Bob|25
```

### Semicolon (;)

```txt
id;name;age
1;Alice;30
2;Bob;25
```

### Multi-space (2+ spaces)

```txt
id  name   age
1   Alice  30
2   Bob    25
```

---

## How to Use

1. Paste Table A into the left box
2. Paste Table B into the right box
3. (Optional) Toggle **First row is header**
4. Choose key columns:
   - Key column (A)
   - Key column (B)
5. Click **Parse**
6. View results:
   - Missing in B
   - Missing in A
   - Changed (before → after)

### Exporting

You can export results via:
- Copy CSV buttons
- Download CSV buttons

---

## Run Locally

```bash
npm install
npm run dev
```

Build production bundle:
```bash
npm run build
npm run preview
```

---

## Deploy to GitHub Pages

This repo uses GitHub Actions to deploy.

### Required Vite config

In `vite.config.ts`, set:

```typescript
export default defineConfig({
  base: '/TabularApp/',
  plugins: [react()],
});
```

The deployed app will be available at:
```
https://<your-username>.github.io/TabularApp/
```

---

## Notes / Limitations

- CSV parsing is basic (does not fully support quoted commas inside values yet)
- Duplicate keys are reported as a warning
- Ragged rows are auto-fixed with warnings