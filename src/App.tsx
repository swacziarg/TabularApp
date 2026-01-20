import { useState } from 'react';
import './App.css';

export default function App() {
  const [tableAText, setTableAText] = useState('');
  const [tableBText, setTableBText] = useState('');

  const handleParse = () => {
    // Parsing logic comes in later commits
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
            <h2 className="cardTitle">Table A</h2>
            <textarea
              className="textarea"
              placeholder="Paste Table A here (TSV / CSV / pipe / etc.)"
              value={tableAText}
              onChange={(e) => setTableAText(e.target.value)}
            />
          </section>

          <section className="card">
            <h2 className="cardTitle">Table B</h2>
            <textarea
              className="textarea"
              placeholder="Paste Table B here (TSV / CSV / pipe / etc.)"
              value={tableBText}
              onChange={(e) => setTableBText(e.target.value)}
            />
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
