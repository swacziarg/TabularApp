type TablePreviewProps = {
    rows: string[][];
    maxRows?: number;
  };
  
  export function TablePreview({ rows, maxRows = 30 }: TablePreviewProps) {
    if (rows.length === 0) return null;
  
    const previewRows = rows.slice(0, maxRows);
  
    return (
      <div className="tablePreviewWrap">
        <table className="tablePreview">
          <tbody>
            {previewRows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} title={cell}>
                    {cell || <span className="mutedCell">—</span>}
                  </td>
                ))}
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
  