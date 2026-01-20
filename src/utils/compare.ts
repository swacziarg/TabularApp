import type { RowObject } from './rows';

export type CompareMissingResult = {
  missingInB: RowObject[];
  missingInA: RowObject[];
};

function normalizeKey(raw: unknown, caseInsensitive: boolean) {
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
