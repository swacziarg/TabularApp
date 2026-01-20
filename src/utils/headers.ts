export function generateFallbackHeaders(colCount: number) {
    return Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
  }
  
  function looksNumeric(value: string) {
    if (!value.trim()) return false;
    return !Number.isNaN(Number(value));
  }
  
  function scoreHeaderRow(row: string[]) {
    // simple heuristic:
    // headers are usually mostly non-numeric + unique-ish + not empty
    let score = 0;
  
    const cleaned = row.map((c) => c.trim()).filter(Boolean);
    const unique = new Set(cleaned);
  
    // reward non-empty values
    score += cleaned.length * 2;
  
    // reward uniqueness
    score += unique.size;
  
    // penalize numeric-heavy rows
    const numericCount = row.filter((c) => looksNumeric(c)).length;
    score -= numericCount * 2;
  
    return score;
  }
  
  export function autoDetectHasHeader(rows: string[][]) {
    if (rows.length < 2) return false;
  
    const first = rows[0];
    const second = rows[1];
  
    // if first row scores higher than second row, likely headers
    return scoreHeaderRow(first) > scoreHeaderRow(second);
  }
  
  export function getHeadersAndDataRows(rows: string[][], firstRowIsHeader: boolean) {
    if (rows.length === 0) {
      return { headers: [], dataRows: [] as string[][] };
    }
  
    const colCount = rows[0].length;
  
    if (!firstRowIsHeader) {
      return {
        headers: generateFallbackHeaders(colCount),
        dataRows: rows,
      };
    }
  
    const rawHeaders = rows[0].map((h, i) => (h.trim() ? h.trim() : `Column ${i + 1}`));
  
    return {
      headers: rawHeaders,
      dataRows: rows.slice(1),
    };
  }
  