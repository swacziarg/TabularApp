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

  const aChars = tableAText.length;
  const bChars = tableBText.length;

  const aLines = useMemo(() => getLineCount(tableAText), [tableAText]);
  const bLines = useMemo(() => getLineCount(tableBText), [tableBText]);

  const aPreview = useMemo(() => getPreview(tableAText, 10), [tableAText]);
  const bPreview = useMemo(() => getPreview(tableBText, 10), [tableBText]);

  const handleParse = () => {
    alert('Parse clicked (coming next)');
  };

  const handleClear = () => {
    setTableAText('');
    setTableBText('');
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

            <div className="rawPreview">
              <div className="rawPreviewHeader">Raw preview (first 10 lines)</div>
              <pre className="rawPreviewBody">{aPreview || '—'}</pre>
            </div>
          </section>

          <section className="card">
            <div className="cardTopRow">
              <h2 className="cardTitle">Table B</h2>
              <div className="metaPills">
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

            <div className="rawPreview">
              <div className="rawPreviewHeader">Raw preview (first 10 lines)</div>
              <pre className="rawPreviewBody">{bPreview || '—'}</pre>
            </div>
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
