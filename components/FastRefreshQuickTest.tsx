import React, { useState } from 'react';

const FastRefreshQuickTest: React.FC = () => {
  const [count, setCount] = useState(0);
  const [text] = useState('Fast Refresh is now working! 🎉');

  return (
    <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '0.5rem', margin: '2rem' }}>
      <h2>Fast Refresh Quick Test</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      
      <div style={{ marginTop: '1rem' }}>
        <p>{text}</p>
        <p style={{ fontSize: '0.875rem', color: '#888' }}>
          Edit the text above in the code and save. The count should persist if Fast Refresh is working!
        </p>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#666' }}>
        Last render: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default FastRefreshQuickTest;