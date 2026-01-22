import { findDuplicateKeys } from './utils/duplicates';
import { downloadTextFile } from './utils/download';
import { ChangedResultsTable } from './components/ChangedResultsTable';
import { copyToClipboard } from './utils/clipboard';
import { changedRowsToCsv, rowsToCsv } from './utils/csv';
import { Tabs } from './components/Tabs';
import { SummaryCards } from './components/SummaryCards';
import { ResultsTable } from './components/ResultsTable';
import { compareChangedByKey, compareMissingByKey } from './utils/compare';
import type { ChangedRow } from './utils/compare';
import { buildRowObjects, type RowObject } from './utils/rows';
import { autoDetectHasHeader, getHeadersAndDataRows } from './utils/headers';
import { KeyColumnSelector } from './components/KeyColumnSelector';
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
  
  const [rowsA, setRowsA] = useState<RowObject[]>([]);
  const [rowsB, setRowsB] = useState<RowObject[]>([]);

  const [aFirstRowHeader, setAFirstRowHeader] = useState(false);
  const [bFirstRowHeader, setBFirstRowHeader] = useState(false);

  const [caseInsensitive, setCaseInsensitive] = useState(true);

  const [keyColumnA, setKeyColumnA] = useState<string>('');
  const [keyColumnB, setKeyColumnB] = useState<string>('');

  const [missingInA, setMissingInA] = useState<RowObject[]>([]);
  const [missingInB, setMissingInB] = useState<RowObject[]>([]);

  const [changedRows, setChangedRows] = useState<ChangedRow[]>([]);

  const [activeTab, setActiveTab] = useState<'missingB' | 'missingA' | 'changed'>('missingB');

  const [copyStatus, setCopyStatus] = useState<string>('');

  const [dupesA, setDupesA] = useState<string[]>([]);
  const [dupesB, setDupesB] = useState<string[]>([]);

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

    const autoHeaderA = autoDetectHasHeader(a.rows);
    const autoHeaderB = autoDetectHasHeader(b.rows);

    setAFirstRowHeader(autoHeaderA);
    setBFirstRowHeader(autoHeaderB);

    const aInfo = getHeadersAndDataRows(a.rows, autoHeaderA);
    const bInfo = getHeadersAndDataRows(b.rows, autoHeaderB);

    const builtA = buildRowObjects(aInfo.headers, aInfo.dataRows);
    const builtB = buildRowObjects(bInfo.headers, bInfo.dataRows);

    setRowsA(builtA.rows);
    setRowsB(builtB.rows);

    const firstAHeader = aInfo.headers[0] ?? '';
    const firstBHeader = bInfo.headers[0] ?? '';

    // Prefer matching name if possible, else fall back to first column
    const defaultA = firstAHeader;
    const defaultB = bInfo.headers.includes(defaultA) ? defaultA : firstBHeader;

    const aDupes = findDuplicateKeys({
      rows: builtA.rows,
      keyColumn: defaultA,
      caseInsensitive,
    });

    const bDupes = findDuplicateKeys({
      rows: builtB.rows,
      keyColumn: defaultB,
      caseInsensitive,
    });

    setDupesA(aDupes.duplicateKeys);
    setDupesB(bDupes.duplicateKeys);

    setKeyColumnA(defaultA);
    setKeyColumnB(defaultB);

    const missing = compareMissingByKey({
      rowsA: builtA.rows,
      rowsB: builtB.rows,
      keyColumnA: defaultA,
      keyColumnB: defaultB,
      caseInsensitive,
    });

    setMissingInA(missing.missingInA);
    setMissingInB(missing.missingInB);

    const changed = compareChangedByKey({
      rowsA: builtA.rows,
      rowsB: builtB.rows,
      keyColumnA: defaultA,
      keyColumnB: defaultB,
      headersA: aInfo.headers,
      headersB: bInfo.headers,
      caseInsensitive,
    });

    setChangedRows(changed.changedRows);
  };

  const handleCopyMissingInB = async () => {
    if (!aHeaderInfo) return;

    const csv = rowsToCsv(aHeaderInfo.headers, missingInB);
    await copyToClipboard(csv);

    setCopyStatus(`Copied Missing in B (${missingInB.length})`);
    setTimeout(() => setCopyStatus(''), 1500);
  };

  const handleCopyMissingInA = async () => {
    if (!bHeaderInfo) return;

    const csv = rowsToCsv(bHeaderInfo.headers, missingInA);
    await copyToClipboard(csv);

    setCopyStatus(`Copied Missing in A (${missingInA.length})`);
    setTimeout(() => setCopyStatus(''), 1500);
  };

  const handleCopyChanged = async () => {
    const csv = changedRowsToCsv(changedRows);
    await copyToClipboard(csv);

    setCopyStatus(`Copied Changed (${changedRows.length})`);
    setTimeout(() => setCopyStatus(''), 1500);
  };

  const handleDownloadMissingInB = () => {
    if (!aHeaderInfo) return;
    const csv = rowsToCsv(aHeaderInfo.headers, missingInB);

    downloadTextFile({
      filename: 'missing_in_b.csv',
      content: csv,
    });
  };

  const handleDownloadMissingInA = () => {
    if (!bHeaderInfo) return;
    const csv = rowsToCsv(bHeaderInfo.headers, missingInA);

    downloadTextFile({
      filename: 'missing_in_a.csv',
      content: csv,
    });
  };

  const handleDownloadChanged = () => {
    const csv = changedRowsToCsv(changedRows);

    downloadTextFile({
      filename: 'changed.csv',
      content: csv,
    });
  };

  const handleClear = () => {
    setTableAText('');
    setTableBText('');
    setParsedA(null);
    setParsedB(null);
    setRowsA([]);
    setRowsB([]);
    setMissingInA([]);
    setMissingInB([]);
    setChangedRows([]);
    setDupesA([]);
    setDupesB([]);
  };

  const sharedHeaders = useMemo(() => {
    const aHeaders = aHeaderInfo?.headers ?? [];
    const bHeaders = bHeaderInfo?.headers ?? [];
    const bSet = new Set(bHeaders);
    return aHeaders.filter((h) => bSet.has(h));
  }, [aHeaderInfo?.headers, bHeaderInfo?.headers]);

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

            {parsedA?.warnings?.length ? (
              <div className="warningBox">
                <strong>Warnings:</strong>
                <ul>
                  {parsedA.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}


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

            {parsedB?.warnings?.length ? (
              <div className="warningBox">
                <strong>Warnings:</strong>
                <ul>
                  {parsedB.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}


            {parsedB?.rows?.length && bHeaderInfo ? (
              <div className="previewSection">
                <div className="previewHeader">Parsed Preview</div>
                <TablePreview headers={bHeaderInfo.headers} rows={bHeaderInfo.dataRows} />
              </div>
            ) : null}
          </section>
        </div>

        <section className="card settingsCard">
          <h2 className="cardTitle">Settings</h2>

          <div className="settingsGrid">
            <KeyColumnSelector
              label="Key column (A)"
              value={keyColumnA}
              onChange={setKeyColumnA}
              options={aHeaderInfo?.headers ?? []}
              disabled={!aHeaderInfo?.headers?.length}
            />

            <KeyColumnSelector
              label="Key column (B)"
              value={keyColumnB}
              onChange={setKeyColumnB}
              options={bHeaderInfo?.headers ?? []}
              disabled={!bHeaderInfo?.headers?.length}
            />
          </div>

          <div className="parseMeta">
            <strong>Row objects:</strong> A={rowsA.length.toLocaleString()} • B=
            {rowsB.length.toLocaleString()}
          </div>

          <div className="parseMeta">
            <strong>Missing:</strong> In A={missingInA.length.toLocaleString()} • In B=
            {missingInB.length.toLocaleString()}
          </div>
          
          <div className="parseMeta">
            <strong>Changed:</strong> {changedRows.length.toLocaleString()} rows
          </div>

          {dupesA.length > 0 || dupesB.length > 0 ? (
            <div className="warningBox">
              <strong>Duplicate keys detected</strong>
              <div className="parseMeta">
                A: {dupesA.length.toLocaleString()} duplicate key(s)
                {dupesA.length ? ` (ex: ${dupesA.slice(0, 5).join(', ')})` : ''}
              </div>
              <div className="parseMeta">
                B: {dupesB.length.toLocaleString()} duplicate key(s)
                {dupesB.length ? ` (ex: ${dupesB.slice(0, 5).join(', ')})` : ''}
              </div>
            </div>
          ) : null}

          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={caseInsensitive}
              onChange={(e) => setCaseInsensitive(e.target.checked)}
            />
            Case-insensitive compare
          </label>
        </section>

        <div className="actionsRow">
          <button className="btnPrimary" onClick={handleParse}>
            Parse
          </button>
          <button className="btnSecondary" onClick={handleClear}>
            Clear
          </button>
        </div>

        {parsedA && parsedB ? (
          <>
            <section className="card resultsCard">
              <h2 className="cardTitle">Summary</h2>

              <SummaryCards
                totalA={rowsA.length}
                totalB={rowsB.length}
                missingInA={missingInA.length}
                missingInB={missingInB.length}
                changed={changedRows.length}
              />
            </section>

            <section className="card resultsCard">
              <h2 className="cardTitle">Results</h2>

              <div className="resultsActionsRow">
                <button className="btnSecondary" onClick={handleCopyMissingInB}>
                  Copy Missing in B CSV
                </button>
                <button className="btnSecondary" onClick={handleCopyMissingInA}>
                  Copy Missing in A CSV
                </button>
                <button className="btnSecondary" onClick={handleCopyChanged}>
                  Copy Changed CSV
                </button>
                <button className="btnSecondary" onClick={handleDownloadMissingInB}>
                  Download Missing in B CSV
                </button>
                <button className="btnSecondary" onClick={handleDownloadMissingInA}>
                  Download Missing in A CSV
                </button>
                <button className="btnSecondary" onClick={handleDownloadChanged}>
                  Download Changed CSV
                </button>
                {copyStatus ? <span className="copyStatus">{copyStatus}</span> : null}
              </div>

              <Tabs
                tabs={[
                  { id: 'missingB', label: `Missing in B (${missingInB.length})` },
                  { id: 'missingA', label: `Missing in A (${missingInA.length})` },
                  { id: 'changed', label: `Changed (${changedRows.length})` },
                ]}
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id as any)}
              />

              <div className="resultsBody">
                {activeTab === 'missingB' && aHeaderInfo ? (
                  <ResultsTable headers={aHeaderInfo.headers} rows={missingInB} />
                ) : null}

                {activeTab === 'missingA' && bHeaderInfo ? (
                  <ResultsTable headers={bHeaderInfo.headers} rows={missingInA} />
                ) : null}

                {activeTab === 'changed' ? (
                  <ChangedResultsTable changedRows={changedRows} headers={sharedHeaders} />
                ) : null}
              </div>
            </section>
          </>
        ) : null}

      </main>

      <footer className="appFooter">
        <span>TabularApp • MVP</span>
      </footer>
    </div>
  );
}
