import type { RowObject } from '../utils/rows';

type ResultsTableProps = {
  headers: string[];
  rows: RowObject[];
  maxRows?: number;
};

export function ResultsTable({ headers, rows, maxRows = 50 }: ResultsTableProps) {
  if (rows.length === 0) {
    return <div className="emptyState">No results ✅</div>;
  }

  const previewRows = rows.slice(0, maxRows);

  return (
    <div className="tablePreviewWrap">
      <table className="tablePreview">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {previewRows.map((row, idx) => (
            <tr key={idx}>
              {headers.map((h) => {
                const val = String(row[h] ?? '').trim();
                return (
                  <td key={h} title={val}>
                    {val || <span className="mutedCell">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length > maxRows ? (
        <div className="tablePreviewNote">Showing first {maxRows} rows…</div>
      ) : null}
    </div>
  );
}
