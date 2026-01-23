import { useEffect, useMemo, useState } from 'react';
import './App.css';

import { ChangedResultsTable } from './components/ChangedResultsTable';
import { KeyColumnSelector } from './components/KeyColumnSelector';
import { ResultsTable } from './components/ResultsTable';
import { SummaryCards } from './components/SummaryCards';
import { TablePreview } from './components/TablePreview';
import { Tabs } from './components/Tabs';

import { copyToClipboard } from './utils/clipboard';
import { compareChangedByKey, compareMissingByKey, type ChangedRow } from './utils/compare';
import { detectDelimiter } from './utils/delimiters';
import { findDuplicateKeys } from './utils/duplicates';
import { downloadTextFile } from './utils/download';
import { autoDetectHasHeader, getHeadersAndDataRows } from './utils/headers';
import { parseTextToGrid, type ParsedGrid } from './utils/parse';
import { buildRowObjects, type RowObject } from './utils/rows';
import { changedRowsToCsv, rowsToCsv } from './utils/csv';
import { loadFromStorage, saveToStorage } from './utils/storage';

function getLineCount(text: string) {
  if (!text.trim()) return 0;
  return text.split(/\r?\n/).length;
}

function getPreview(text: string, maxLines = 10) {
  if (!text.trim()) return '';
  return text.split(/\r?\n/).slice(0, maxLines).join('\n');
}

export default function App() {
  const [tableAText, setTableAText] = useState(() => loadFromStorage('tableAText', ''));
  const [tableBText, setTableBText] = useState(() => loadFromStorage('tableBText', ''));

  const [parsedA, setParsedA] = useState<ParsedGrid | null>(null);
  const [parsedB, setParsedB] = useState<ParsedGrid | null>(null);

  const [rowsA, setRowsA] = useState<RowObject[]>([]);
  const [rowsB, setRowsB] = useState<RowObject[]>([]);

  const [aFirstRowHeader, setAFirstRowHeader] = useState(() =>
    loadFromStorage('aFirstRowHeader', false),
  );
  const [bFirstRowHeader, setBFirstRowHeader] = useState(() =>
    loadFromStorage('bFirstRowHeader', false),
  );

  const [caseInsensitive, setCaseInsensitive] = useState(() =>
    loadFromStorage('caseInsensitive', true),
  );

  const [keyColumnA, setKeyColumnA] = useState<string>(() => loadFromStorage('keyColumnA', ''));
  const [keyColumnB, setKeyColumnB] = useState<string>(() => loadFromStorage('keyColumnB', ''));

  const [missingInA, setMissingInA] = useState<RowObject[]>([]);
  const [missingInB, setMissingInB] = useState<RowObject[]>([]);

  const [changedRows, setChangedRows] = useState<ChangedRow[]>([]);

  const [activeTab, setActiveTab] = useState<'missingB' | 'missingA' | 'changed'>('missingB');

  const [copyStatus, setCopyStatus] = useState<string>('');

  const [dupesA, setDupesA] = useState<string[]>([]);
  const [dupesB, setDupesB] = useState<string[]>([]);

  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>('');

  // ✅ Display toggles (persisted)
  const [showRawPreview, setShowRawPreview] = useState(() =>
    loadFromStorage('showRawPreview', false),
  );
  const [showParsedPreview, setShowParsedPreview] = useState(() =>
    loadFromStorage('showParsedPreview', false),
  );
  const [showSettings, setShowSettings] = useState(() => loadFromStorage('showSettings', true));
  const [showResults, setShowResults] = useState(() => loadFromStorage('showResults', true));
  const [showAiSummary, setShowAiSummary] = useState(() => loadFromStorage('showAiSummary', false));

  useEffect(() => {
    saveToStorage('tableAText', tableAText);
  }, [tableAText]);

  useEffect(() => {
    saveToStorage('tableBText', tableBText);
  }, [tableBText]);

  useEffect(() => {
    saveToStorage('aFirstRowHeader', aFirstRowHeader);
  }, [aFirstRowHeader]);

  useEffect(() => {
    saveToStorage('bFirstRowHeader', bFirstRowHeader);
  }, [bFirstRowHeader]);

  useEffect(() => {
    saveToStorage('caseInsensitive', caseInsensitive);
  }, [caseInsensitive]);

  useEffect(() => {
    saveToStorage('keyColumnA', keyColumnA);
  }, [keyColumnA]);

  useEffect(() => {
    saveToStorage('keyColumnB', keyColumnB);
  }, [keyColumnB]);

  // ✅ persist display toggles
  useEffect(() => {
    saveToStorage('showRawPreview', showRawPreview);
  }, [showRawPreview]);

  useEffect(() => {
    saveToStorage('showParsedPreview', showParsedPreview);
  }, [showParsedPreview]);

  useEffect(() => {
    saveToStorage('showSettings', showSettings);
  }, [showSettings]);

  useEffect(() => {
    saveToStorage('showResults', showResults);
  }, [showResults]);

  useEffect(() => {
    saveToStorage('showAiSummary', showAiSummary);
  }, [showAiSummary]);

  // ✅ escape hatch: ESC resets layout
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRawPreview(false);
        setShowParsedPreview(false);
        setShowSettings(true);
        setShowResults(true);
        setShowAiSummary(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

  const sharedHeaders = useMemo(() => {
    const aHeaders = aHeaderInfo?.headers ?? [];
    const bHeaders = bHeaderInfo?.headers ?? [];
    const bSet = new Set(bHeaders);
    return aHeaders.filter((h) => bSet.has(h));
  }, [aHeaderInfo?.headers, bHeaderInfo?.headers]);

  const handleParse = () => {
    const a = parseTextToGrid(tableAText);
    const b = parseTextToGrid(tableBText);

    setParsedA(a);
    setParsedB(b);

    const headerA = parsedA ? aFirstRowHeader : autoDetectHasHeader(a.rows);
    const headerB = parsedB ? bFirstRowHeader : autoDetectHasHeader(b.rows);
    
    if (!parsedA) setAFirstRowHeader(headerA);
    if (!parsedB) setBFirstRowHeader(headerB);
    
    const aInfo = getHeadersAndDataRows(a.rows, headerA);
    const bInfo = getHeadersAndDataRows(b.rows, headerB);    

    const builtA = buildRowObjects(aInfo.headers, aInfo.dataRows);
    const builtB = buildRowObjects(bInfo.headers, bInfo.dataRows);

    setRowsA(builtA.rows);
    setRowsB(builtB.rows);

    const firstAHeader = aInfo.headers[0] ?? '';
    const firstBHeader = bInfo.headers[0] ?? '';

    const defaultA = firstAHeader;
    const defaultB = bInfo.headers.includes(defaultA) ? defaultA : firstBHeader;

    const nextKeyA = keyColumnA || defaultA;
    const nextKeyB = keyColumnB || defaultB;
    
    if (!keyColumnA) setKeyColumnA(nextKeyA);
    if (!keyColumnB) setKeyColumnB(nextKeyB);    

    if (!aInfo.headers.includes(nextKeyA)) setKeyColumnA(defaultA);
    if (!bInfo.headers.includes(nextKeyB)) setKeyColumnB(defaultB);
    
    const aDupes = findDuplicateKeys({
      rows: builtA.rows,
      keyColumn: nextKeyA,
      caseInsensitive,
    });

    const bDupes = findDuplicateKeys({
      rows: builtB.rows,
      keyColumn: nextKeyB,
      caseInsensitive,
    });

    setDupesA(aDupes.duplicateKeys);
    setDupesB(bDupes.duplicateKeys);

    const missing = compareMissingByKey({
      rowsA: builtA.rows,
      rowsB: builtB.rows,
      keyColumnA: nextKeyA,
      keyColumnB: nextKeyB,
      caseInsensitive,
    });

    setMissingInA(missing.missingInA);
    setMissingInB(missing.missingInB);

    const changed = compareChangedByKey({
      rowsA: builtA.rows,
      rowsB: builtB.rows,
      keyColumnA: nextKeyA,
      keyColumnB: nextKeyB,
      headersA: aInfo.headers,
      headersB: bInfo.headers,
      caseInsensitive,
    });

    setChangedRows(changed.changedRows);

  };
  useEffect(() => {
    if (keyColumnA) {
      const aDupes = findDuplicateKeys({
        rows: rowsA,
        keyColumn: keyColumnA,
        caseInsensitive,
      });
      setDupesA(aDupes.duplicateKeys);
    } else {
      setDupesA([]);
    }
  
    if (keyColumnB) {
      const bDupes = findDuplicateKeys({
        rows: rowsB,
        keyColumn: keyColumnB,
        caseInsensitive,
      });
      setDupesB(bDupes.duplicateKeys);
    } else {
      setDupesB([]);
    }
  }, [rowsA, rowsB, keyColumnA, keyColumnB, caseInsensitive]);
  useEffect(() => {
    if (!parsedA || !parsedB) return;
  
    const aInfo = getHeadersAndDataRows(parsedA.rows, aFirstRowHeader);
    const bInfo = getHeadersAndDataRows(parsedB.rows, bFirstRowHeader);
  
    const builtA = buildRowObjects(aInfo.headers, aInfo.dataRows);
    const builtB = buildRowObjects(bInfo.headers, bInfo.dataRows);
  
    setRowsA(builtA.rows);
    setRowsB(builtB.rows);
  
    // keep key columns valid
    const defaultA = aInfo.headers[0] ?? '';
    const defaultB = bInfo.headers.includes(defaultA) ? defaultA : bInfo.headers[0] ?? '';
  
    if (!aInfo.headers.includes(keyColumnA)) setKeyColumnA(defaultA);
    if (!bInfo.headers.includes(keyColumnB)) setKeyColumnB(defaultB);
  }, [
    parsedA,
    parsedB,
    aFirstRowHeader,
    bFirstRowHeader,
    // include key columns because we validate them
    keyColumnA,
    keyColumnB,
  ]);
  
  const recomputeComparison = () => {
    if (!aHeaderInfo || !bHeaderInfo) return;
    if (!keyColumnA || !keyColumnB) return;

    if (!aHeaderInfo.headers.includes(keyColumnA)) return;
    if (!bHeaderInfo.headers.includes(keyColumnB)) return;

    const missing = compareMissingByKey({
      rowsA,
      rowsB,
      keyColumnA,
      keyColumnB,
      caseInsensitive,
    });

    setMissingInA(missing.missingInA);
    setMissingInB(missing.missingInB);

    const changed = compareChangedByKey({
      rowsA,
      rowsB,
      keyColumnA,
      keyColumnB,
      headersA: aHeaderInfo.headers,
      headersB: bHeaderInfo.headers,
      caseInsensitive,
    });

    setChangedRows(changed.changedRows);
  };

  
  useEffect(() => {
    recomputeComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyColumnA, keyColumnB, caseInsensitive, rowsA, rowsB, aHeaderInfo, bHeaderInfo]);
    

  const handleGenerateAiSummary = async () => {
    try {
      setAiLoading(true);
      setAiError('');
      setAiSummary('');

      const endpoint = 'https://tabularapp.onrender.com/api/summarize';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableA: tableAText,
          tableB: tableBText,
          stats: {
            totalA: rowsA.length,
            totalB: rowsB.length,
            missingInA: missingInA.length,
            missingInB: missingInB.length,
            changed: changedRows.length,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`AI request failed (${res.status})`);
      }

      const data = (await res.json()) as { summary: string };
      setAiSummary(data.summary || '');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (tableAText.trim() || tableBText.trim()) {
      handleParse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setAiSummary('');
    setAiError('');
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

            {showRawPreview ? (
              <div className="rawPreview">
                <div className="rawPreviewHeader">Raw preview (first 10 lines)</div>
                <pre className="rawPreviewBody">{aPreview || '—'}</pre>
              </div>
            ) : null}

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

            {showParsedPreview && parsedA?.rows?.length && aHeaderInfo ? (
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

            {showRawPreview ? (
              <div className="rawPreview">
                <div className="rawPreviewHeader">Raw preview (first 10 lines)</div>
                <pre className="rawPreviewBody">{bPreview || '—'}</pre>
              </div>
            ) : null}

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

            {showParsedPreview && parsedB?.rows?.length && bHeaderInfo ? (
              <div className="previewSection">
                <div className="previewHeader">Parsed Preview</div>
                <TablePreview headers={bHeaderInfo.headers} rows={bHeaderInfo.dataRows} />
              </div>
            ) : null}
          </section>
        </div>

        {/* ✅ ALWAYS VISIBLE: Display controls */}
        <section className="card settingsCard">
          <h2 className="cardTitle">Display</h2>

          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={showRawPreview}
              onChange={(e) => setShowRawPreview(e.target.checked)}
            />
            Show raw preview
          </label>

          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={showParsedPreview}
              onChange={(e) => setShowParsedPreview(e.target.checked)}
            />
            Show parsed preview tables
          </label>

          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={showSettings}
              onChange={(e) => setShowSettings(e.target.checked)}
            />
            Show settings
          </label>

          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={showResults}
              onChange={(e) => setShowResults(e.target.checked)}
            />
            Show results
          </label>

          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={showAiSummary}
              onChange={(e) => setShowAiSummary(e.target.checked)}
            />
            Show AI summary
          </label>

          <div className="parseMeta" style={{ marginTop: 8 }}>
            Tip: press <strong>Esc</strong> to reset layout.
          </div>
        </section>

        {showSettings ? (
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
        ) : null}

        <div className="actionsRow">
          <button className="btnPrimary" onClick={handleParse}>
            Parse
          </button>
          <button className="btnSecondary" onClick={handleClear}>
            Clear
          </button>
        </div>

        {showResults && parsedA && parsedB ? (
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

        {showAiSummary && (tableAText.trim() || tableBText.trim()) ? (
          <section className="card resultsCard">
            <h2 className="cardTitle">AI Summary</h2>

            <div className="resultsActionsRow">
              <button
                className="btnPrimary"
                onClick={handleGenerateAiSummary}
                disabled={aiLoading || (!tableAText.trim() && !tableBText.trim())}
              >
                {aiLoading ? 'Generating…' : 'Generate AI Summary'}
              </button>

              {aiError ? <span className="copyStatus">⚠️ {aiError}</span> : null}
            </div>

            <pre className="aiBox">{aiSummary || '—'}</pre>
          </section>
        ) : null}
      </main>

      <footer className="appFooter">
        <span>TabularApp • MVP</span>
      </footer>
    </div>
  );
}
