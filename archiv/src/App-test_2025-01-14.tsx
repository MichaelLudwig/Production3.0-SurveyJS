import React from 'react';

const AppTest: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Test App</h1>
      <p>Wenn du das siehst, funktioniert React grundsätzlich.</p>
      <button onClick={() => alert('Button funktioniert!')}>
        Test Button
      </button>
    </div>
  );
};

export default AppTest;