export type DetectedDelimiter = {
    delimiter: string;
    label: string;
    score: number;
    columnsEstimate: number;
  };
  
  type Candidate = {
    delimiter: string;
    label: string;
    split: (line: string) => string[];
  };
  
  function splitByMultiSpace(line: string) {
    // split on 2+ spaces, but allow single spaces inside values
    return line.trim().split(/\s{2,}/g);
  }
  
  const candidates: Candidate[] = [
    {
      delimiter: '\t',
      label: 'Tab (TSV)',
      split: (line) => line.split('\t'),
    },
    {
      delimiter: ',',
      label: 'Comma (CSV)',
      split: (line) => line.split(','),
    },
    {
      delimiter: ';',
      label: 'Semicolon',
      split: (line) => line.split(';'),
    },
    {
      delimiter: '|',
      label: 'Pipe',
      split: (line) => line.split('|'),
    },
    {
      delimiter: '  ',
      label: 'Multi-space',
      split: splitByMultiSpace,
    },
  ];
  
  function getNonEmptyLines(text: string) {
    return text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }
  
  function scoreCandidate(lines: string[], candidate: Candidate): DetectedDelimiter {
    const sampleLines = lines.slice(0, 30);
  
    const columnCounts = sampleLines.map((line) => candidate.split(line).length);
  
    const avgCols = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
  
    // Must produce more than 1 column
    if (avgCols < 2) {
      return {
        delimiter: candidate.delimiter,
        label: candidate.label,
        score: 0,
        columnsEstimate: Math.round(avgCols),
      };
    }
  
    // How consistent are the column counts?
    const countsMap = new Map<number, number>();
    for (const c of columnCounts) {
      countsMap.set(c, (countsMap.get(c) ?? 0) + 1);
    }
  
    const mostCommonCount = [...countsMap.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const mostCommonFrequency = countsMap.get(mostCommonCount) ?? 0;
    const consistency = mostCommonFrequency / columnCounts.length; // 0..1
  
    // delimiter occurrence check (helps avoid weird scoring)
    const delimiterAppears =
      candidate.delimiter === '  '
        ? sampleLines.some((l) => /\s{2,}/.test(l))
        : sampleLines.some((l) => l.includes(candidate.delimiter));
  
    const appearBoost = delimiterAppears ? 1 : 0;
  
    // Score weighting:
    // - consistency is most important
    // - prefer more columns (but not too dominant)
    // - prefer delimiters that appear
    const score = consistency * 100 + Math.min(mostCommonCount, 12) * 4 + appearBoost * 10;
  
    return {
      delimiter: candidate.delimiter,
      label: candidate.label,
      score,
      columnsEstimate: mostCommonCount,
    };
  }
  
  export function detectDelimiter(text: string): DetectedDelimiter {
    const lines = getNonEmptyLines(text);
  
    // Empty or 1-line input: default to tab, score 0
    if (lines.length < 2) {
      return {
        delimiter: '\t',
        label: 'Tab (TSV)',
        score: 0,
        columnsEstimate: 1,
      };
    }
  
    const scored = candidates.map((c) => scoreCandidate(lines, c));
    scored.sort((a, b) => b.score - a.score);
  
    return scored[0];
  }
  