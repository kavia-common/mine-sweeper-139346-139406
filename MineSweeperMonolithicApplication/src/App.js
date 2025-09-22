import React, { useState, useEffect } from 'react';
import './App.css';
import Minesweeper from './components/Minesweeper/Minesweeper';

// PUBLIC_INTERFACE
function App() {
  /** Theme handling retained from template */
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: 'auto', paddingBottom: '0.5rem' }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <h1 style={{ marginTop: '3rem', marginBottom: '0.25rem' }}>KAVIA Minesweeper</h1>
        <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
          Current theme: <strong>{theme}</strong>
        </p>
      </header>
      <main style={{ padding: '1rem' }}>
        <Minesweeper />
      </main>
    </div>
  );
}

export default App;
