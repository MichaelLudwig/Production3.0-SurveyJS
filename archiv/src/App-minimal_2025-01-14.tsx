import React, { useState } from 'react';
import './App.css';

const AppMinimal: React.FC = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cannabis Produktions-Dokumentation</h1>
        <div className="app-status">
          <span>Test-Modus - Schritt {step}</span>
        </div>
      </header>

      <main className="app-content">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Test der Basis-Anwendung</h2>
          <p>Wenn du das siehst, funktioniert die Grundstruktur.</p>
          
          <div style={{ margin: '2rem 0' }}>
            <button 
              onClick={() => setStep(step + 1)}
              style={{ 
                padding: '1rem 2rem', 
                fontSize: '1rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Nächster Schritt ({step + 1})
            </button>
          </div>
          
          <div>
            <h3>Browser-Info:</h3>
            <p>User Agent: {navigator.userAgent}</p>
            <p>URL: {window.location.href}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppMinimal;