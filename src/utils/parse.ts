import { detectDelimiter } from './delimiters';

export type ParsedGrid = {
    rows: string[][];
    rowCount: number;
    colCount: number;
    delimiterLabel: string;
    warnings: string[];
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
        warnings: [],
      };
    }
  
    const detected = detectDelimiter(text);
  
    const rawRows = lines.map((line) =>
      splitLine(line, detected.delimiter).map((cell) => normalizeCell(cell)),
    );
  
    // Use the MOST COMMON column count as the "expected" shape
    const counts = rawRows.map((r) => r.length);
    const countFreq = new Map<number, number>();
    for (const c of counts) countFreq.set(c, (countFreq.get(c) ?? 0) + 1);
  
    const expectedColCount =
      [...countFreq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? rawRows[0].length;
  
    let paddedShortRows = 0;
    let mergedLongRows = 0;
  
    const rows = rawRows.map((row) => {
      // too short → pad
      if (row.length < expectedColCount) {
        paddedShortRows++;
        return [...row, ...Array(expectedColCount - row.length).fill('')];
      }
  
      // too long → merge extras into last cell
      if (row.length > expectedColCount) {
        mergedLongRows++;
        const head = row.slice(0, expectedColCount - 1);
        const tail = row.slice(expectedColCount - 1).join(' ');
        return [...head, tail];
      }
  
      return row;
    });
  
    const warnings: string[] = [];
  
    if (paddedShortRows > 0) {
      warnings.push(`Padded ${paddedShortRows} short row(s) with empty cells.`);
    }
  
    if (mergedLongRows > 0) {
      warnings.push(`Merged ${mergedLongRows} long row(s) into the last column.`);
    }
  
    return {
      rows,
      rowCount: rows.length,
      colCount: expectedColCount,
      delimiterLabel: detected.label,
      warnings,
    };
  }
  
