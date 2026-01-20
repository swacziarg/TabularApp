import './App.css';

export default function App() {
  return (
    <div className="appShell">
      <header className="appHeader">
        <h1 className="appTitle">Table Compare MVP</h1>
        <p className="appSubtitle">Paste two tables, compare by key, export results.</p>
      </header>

      <main className="appMain">
        <div className="card">
          <h2>Getting started</h2>
          <ol>
            <li>Paste Table A + Table B</li>
            <li>Choose delimiter + headers</li>
            <li>Select key column</li>
            <li>View missing + changed rows</li>
          </ol>
        </div>
      </main>

      <footer className="appFooter">
        <span>TabularApp • MVP</span>
      </footer>
    </div>
  );
}
