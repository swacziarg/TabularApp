import { autoDetectHasHeader, getHeadersAndDataRows } from './utils/headers';
import { detectDelimiter } from './utils/delimiters';
import { parseTextToGrid, type ParsedGrid } from './utils/parse';
import { TablePreview } from './components/TablePreview';
import { useMemo, useState } from 'react';
import './App.css';

function getLineCount(text: string) {
  if (!text.trim()) return 0;
  return text.split(/\r?\n/).length;
}

function getPreview(text: string, maxLines = 10) {
  if (!text.trim()) return '';
  return text.split(/\r?\n/).slice(0, maxLines).join('\n');
}

export default function App() {
  const [tableAText, setTableAText] = useState('');
  const [tableBText, setTableBText] = useState('');

  const [parsedA, setParsedA] = useState<ParsedGrid | null>(null);
  const [parsedB, setParsedB] = useState<ParsedGrid | null>(null);

  const [aFirstRowHeader, setAFirstRowHeader] = useState(false);
  const [bFirstRowHeader, setBFirstRowHeader] = useState(false);

  const aHeaderInfo = useMemo(() => {
    if (!parsedA) return null;
    return getHeadersAndDataRows(parsedA.rows, aFirstRowHeader);
  }, [parsedA, aFirstRowHeader]);

  const bHeaderInfo = useMemo(() => {
    if (!parsedB) return null;
    return getHeadersAndDataRows(parsedB.rows, bFirstRowHeader);
  }, [parsedB, bFirstRowHeader]);

  const aChars = tableAText.length;
  const bChars = tableBText.length;

  const aLines = useMemo(() => getLineCount(tableAText), [tableAText]);
  const bLines = useMemo(() => getLineCount(tableBText), [tableBText]);

  const aPreview = useMemo(() => getPreview(tableAText, 10), [tableAText]);
  const bPreview = useMemo(() => getPreview(tableBText, 10), [tableBText]);

  const detectedA = useMemo(() => detectDelimiter(tableAText), [tableAText]);
  const detectedB = useMemo(() => detectDelimiter(tableBText), [tableBText]);

  const handleParse = () => {
    const a = parseTextToGrid(tableAText);
    const b = parseTextToGrid(tableBText);

    setParsedA(a);
    setParsedB(b);

    setAFirstRowHeader(autoDetectHasHeader(a.rows));
    setBFirstRowHeader(autoDetectHasHeader(b.rows));
  };

  const handleClear = () => {
    setTableAText('');
    setTableBText('');
    setParsedA(null);
    setParsedB(null);
  };

  return (
    <div className="appShell">
      <header className="appHeader">
        <h1 className="appTitle">Table Compare MVP</h1>
        <p className="appSubtitle">Paste two tables, compare by key, export results.</p>
      </header>

      <main className="appMain">
        <div className="grid2">
          <section className="card">
            <div className="cardTopRow">
              <h2 className="cardTitle">Table A</h2>
              <div className="metaPills">
                <span className="pill">
                  Delim: {detectedA.label} ({detectedA.columnsEstimate} cols)
                </span>
                <span className="pill">{aChars.toLocaleString()} chars</span>
                <span className="pill">{aLines.toLocaleString()} lines</span>
              </div>
            </div>

            <textarea
              className="textarea"
              placeholder="Paste Table A here (TSV / CSV / pipe / etc.)"
              value={tableAText}
              onChange={(e) => setTableAText(e.target.value)}
            />

            <label className="checkboxRow">
              <input
                type="checkbox"
                checked={aFirstRowHeader}
                onChange={(e) => setAFirstRowHeader(e.target.checked)}
              />
              First row is header
            </label>


            <div className="rawPreview">
              <div className="rawPreviewHeader">Raw preview (first 10 lines)</div>
              <pre className="rawPreviewBody">{aPreview || '—'}</pre>
            </div>

            <div className="parseMeta">
              <strong>Parsed:</strong>{' '}
              {parsedA ? (
                <>
                  {parsedA.rowCount} rows × {parsedA.colCount} cols ({parsedA.delimiterLabel})
                </>
              ) : (
                '—'
              )}
            </div>

            {parsedA?.rows?.length && aHeaderInfo ? (
              <div className="previewSection">
                <div className="previewHeader">Parsed Preview</div>
                <TablePreview headers={aHeaderInfo.headers} rows={aHeaderInfo.dataRows} />
              </div>
            ) : null}
          </section>

          <section className="card">
            <div className="cardTopRow">
              <h2 className="cardTitle">Table B</h2>
              <div className="metaPills">
                <span className="pill">
                  Delim: {detectedB.label} ({detectedB.columnsEstimate} cols)
                </span>
                <span className="pill">{bChars.toLocaleString()} chars</span>
                <span className="pill">{bLines.toLocaleString()} lines</span>
              </div>
            </div>

            <textarea
              className="textarea"
              placeholder="Paste Table B here (TSV / CSV / pipe / etc.)"
              value={tableBText}
              onChange={(e) => setTableBText(e.target.value)}
            />

            <label className="checkboxRow">
              <input
                type="checkbox"
                checked={bFirstRowHeader}
                onChange={(e) => setBFirstRowHeader(e.target.checked)}
              />
              First row is header
            </label>

            <div className="rawPreview">
              <div className="rawPreviewHeader">Raw preview (first 10 lines)</div>
              <pre className="rawPreviewBody">{bPreview || '—'}</pre>
            </div>

            <div className="parseMeta">
              <strong>Parsed:</strong>{' '}
              {parsedB ? (
                <>
                  {parsedB.rowCount} rows × {parsedB.colCount} cols ({parsedB.delimiterLabel})
                </>
              ) : (
                '—'
              )}
            </div>

            {parsedB?.rows?.length && bHeaderInfo ? (
              <div className="previewSection">
                <div className="previewHeader">Parsed Preview</div>
                <TablePreview headers={bHeaderInfo.headers} rows={bHeaderInfo.dataRows} />
              </div>
            ) : null}
          </section>
        </div>

        <div className="actionsRow">
          <button className="btnPrimary" onClick={handleParse}>
            Parse
          </button>
          <button className="btnSecondary" onClick={handleClear}>
            Clear
          </button>
        </div>
      </main>

      <footer className="appFooter">
        <span>TabularApp • MVP</span>
      </footer>
    </div>
  );
}
