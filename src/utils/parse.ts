import { detectDelimiter } from './delimiters';

export type ParsedGrid = {
  rows: string[][];
  rowCount: number;
  colCount: number;
  delimiterLabel: string;
};

function splitByMultiSpace(line: string) {
  return line.trim().split(/\s{2,}/g);
}

function splitLine(line: string, delimiter: string) {
  if (delimiter === '  ') {
    return splitByMultiSpace(line);
  }
  return line.split(delimiter);
}

function normalizeCell(value: string) {
    // trim + collapse internal whitespace
    return value.trim().replace(/\s+/g, ' ');
}  

function getNonEmptyLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export function parseTextToGrid(text: string): ParsedGrid {
  const lines = getNonEmptyLines(text);

  if (lines.length === 0) {
    return {
      rows: [],
      rowCount: 0,
      colCount: 0,
      delimiterLabel: '—',
    };
  }

  const detected = detectDelimiter(text);

  const rawRows = lines.map((line) =>
    splitLine(line, detected.delimiter).map((cell) => normalizeCell(cell)),
  );

  // Find max columns, then pad rows to be rectangular
  const colCount = rawRows.reduce((max, row) => Math.max(max, row.length), 0);

  const rows = rawRows.map((row) => {
    if (row.length === colCount) return row;
    return [...row, ...Array(colCount - row.length).fill('')];
  });

  return {
    rows,
    rowCount: rows.length,
    colCount,
    delimiterLabel: detected.label,
  };
}
