import type { RowObject } from './rows';
import type { ChangedRow } from './compare';

function escapeCsvCell(value: string) {
  const mustQuote = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return mustQuote ? `"${escaped}"` : escaped;
}

export function rowsToCsv(headers: string[], rows: RowObject[]) {
  const lines: string[] = [];

  lines.push(headers.map(escapeCsvCell).join(','));

  for (const row of rows) {
    const line = headers
      .map((h) => escapeCsvCell(String(row[h] ?? '').trim()))
      .join(',');
    lines.push(line);
  }

  return lines.join('\n');
}

export function changedRowsToCsv(changedRows: ChangedRow[]) {
  // simple format:
  // key,column,before,after
  const headers = ['key', 'column', 'before', 'after'];

  const lines: string[] = [];
  lines.push(headers.map(escapeCsvCell).join(','));

  for (const cr of changedRows) {
    for (const d of cr.diffs) {
      lines.push(
        [
          escapeCsvCell(cr.key),
          escapeCsvCell(d.column),
          escapeCsvCell(d.before),
          escapeCsvCell(d.after),
        ].join(','),
      );
    }
  }

  return lines.join('\n');
}
