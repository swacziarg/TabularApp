export type RowObject = {
    __rowIndex: number; // original index within dataRows (0-based)
    __key?: string;
    [column: string]: string | number | undefined;
  };
  
  export type BuildRowsResult = {
    rows: RowObject[];
  };
  
  export function buildRowObjects(headers: string[], dataRows: string[][]): BuildRowsResult {
    const rows: RowObject[] = dataRows.map((row, rowIdx) => {
      const obj: RowObject = { __rowIndex: rowIdx };
  
      headers.forEach((header, colIdx) => {
        obj[header] = row[colIdx] ?? '';
      });
  
      return obj;
    });
  
    return { rows };
  }
  