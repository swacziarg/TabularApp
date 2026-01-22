import type { RowObject } from './rows';

export type DuplicateReport = {
  duplicateCount: number;
  duplicateKeys: string[];
};

function normalizeKey(raw: unknown, caseInsensitive: boolean) {
  const str = String(raw ?? '').trim();
  return caseInsensitive ? str.toLowerCase() : str;
}

export function findDuplicateKeys(params: {
  rows: RowObject[];
  keyColumn: string;
  caseInsensitive: boolean;
}): DuplicateReport {
  const { rows, keyColumn, caseInsensitive } = params;

  const seen = new Set<string>();
  const dupes = new Set<string>();

  for (const row of rows) {
    const key = normalizeKey(row[keyColumn], caseInsensitive);
    if (!key) continue;

    if (seen.has(key)) {
      dupes.add(key);
    } else {
      seen.add(key);
    }
  }

  const duplicateKeys = Array.from(dupes).sort();

  return {
    duplicateCount: duplicateKeys.length,
    duplicateKeys,
  };
}
