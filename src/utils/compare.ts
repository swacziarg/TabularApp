import type { RowObject } from './rows';

export type CompareMissingResult = {
  missingInB: RowObject[];
  missingInA: RowObject[];
};

export type CellDiff = {
  column: string;
  before: string;
  after: string;
};

export type ChangedRow = {
  key: string;
  rowA: RowObject;
  rowB: RowObject;
  diffs: CellDiff[];
};

export type CompareChangedResult = {
  changedRows: ChangedRow[];
};

function normalizeKey(raw: unknown, caseInsensitive: boolean) {
  const str = String(raw ?? '').trim();
  return caseInsensitive ? str.toLowerCase() : str;
}

function normalizeValue(raw: unknown, caseInsensitive: boolean) {
  const str = String(raw ?? '').trim();
  return caseInsensitive ? str.toLowerCase() : str;
}

export function compareMissingByKey(params: {
  rowsA: RowObject[];
  rowsB: RowObject[];
  keyColumnA: string;
  keyColumnB: string;
  caseInsensitive: boolean;
}): CompareMissingResult {
  const { rowsA, rowsB, keyColumnA, keyColumnB, caseInsensitive } = params;

  const mapA = new Map<string, RowObject>();
  const mapB = new Map<string, RowObject>();

  for (const row of rowsA) {
    const key = normalizeKey(row[keyColumnA], caseInsensitive);
    if (!key) continue;
    mapA.set(key, row);
  }

  for (const row of rowsB) {
    const key = normalizeKey(row[keyColumnB], caseInsensitive);
    if (!key) continue;
    mapB.set(key, row);
  }

  const missingInB: RowObject[] = [];
  const missingInA: RowObject[] = [];

  for (const [key, row] of mapA.entries()) {
    if (!mapB.has(key)) missingInB.push(row);
  }

  for (const [key, row] of mapB.entries()) {
    if (!mapA.has(key)) missingInA.push(row);
  }

  return { missingInB, missingInA };
}

export function compareChangedByKey(params: {
  rowsA: RowObject[];
  rowsB: RowObject[];
  keyColumnA: string;
  keyColumnB: string;
  headersA: string[];
  headersB: string[];
  caseInsensitive: boolean;
}): CompareChangedResult {
  const { rowsA, rowsB, keyColumnA, keyColumnB, headersA, headersB, caseInsensitive } = params;

  const mapA = new Map<string, RowObject>();
  const mapB = new Map<string, RowObject>();

  for (const row of rowsA) {
    const key = normalizeKey(row[keyColumnA], caseInsensitive);
    if (!key) continue;
    mapA.set(key, row);
  }

  for (const row of rowsB) {
    const key = normalizeKey(row[keyColumnB], caseInsensitive);
    if (!key) continue;
    mapB.set(key, row);
  }

  // Compare shared keys only
  const sharedKeys: string[] = [];
  for (const key of mapA.keys()) {
    if (mapB.has(key)) sharedKeys.push(key);
  }

  // Compare columns that exist in BOTH tables (intersection)
  const columnSetB = new Set(headersB);
  const sharedColumns = headersA.filter((h) => columnSetB.has(h));

  // Avoid comparing the “__” helper fields
  const columnsToCompare = sharedColumns.filter((c) => !c.startsWith('__'));

  const changedRows: ChangedRow[] = [];

  for (const key of sharedKeys) {
    const rowA = mapA.get(key)!;
    const rowB = mapB.get(key)!;

    const diffs: CellDiff[] = [];

    for (const col of columnsToCompare) {
      const beforeRaw = rowA[col];
      const afterRaw = rowB[col];

      const before = String(beforeRaw ?? '').trim();
      const after = String(afterRaw ?? '').trim();

      const normBefore = normalizeValue(before, caseInsensitive);
      const normAfter = normalizeValue(after, caseInsensitive);

      if (normBefore !== normAfter) {
        diffs.push({ column: col, before, after });
      }
    }

    if (diffs.length > 0) {
      changedRows.push({ key, rowA, rowB, diffs });
    }
  }

  return { changedRows };
}
