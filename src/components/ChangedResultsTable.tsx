import type { ChangedRow } from '../utils/compare';

type ChangedResultsTableProps = {
  changedRows: ChangedRow[];
  headers: string[];
  maxRows?: number;
};

export function ChangedResultsTable({
  changedRows,
  headers,
  maxRows = 50,
}: ChangedResultsTableProps) {
  if (changedRows.length === 0) {
    return <div className="emptyState">No changed rows ✅</div>;
  }

  const previewRows = changedRows.slice(0, maxRows);

  return (
    <div className="tablePreviewWrap">
      <table className="tablePreview">
        <thead>
          <tr>
            <th>Key</th>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {previewRows.map((cr) => {
            const diffMap = new Map(cr.diffs.map((d) => [d.column, d]));

            return (
              <tr key={cr.key}>
                <td className="keyCell">{cr.key}</td>

                {headers.map((h) => {
                  const diff = diffMap.get(h);

                  if (!diff) {
                    const val = String(cr.rowB[h] ?? '').trim();
                    return (
                      <td key={h} title={val}>
                        {val || <span className="mutedCell">—</span>}
                      </td>
                    );
                  }

                  return (
                    <td key={h} className="diffCell">
                      <div className="diffBefore">{diff.before || '—'}</div>
                      <div className="diffArrow">→</div>
                      <div className="diffAfter">{diff.after || '—'}</div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {changedRows.length > maxRows ? (
        <div className="tablePreviewNote">Showing first {maxRows} rows…</div>
      ) : null}
    </div>
  );
}
