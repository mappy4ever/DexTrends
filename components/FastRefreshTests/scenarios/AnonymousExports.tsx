import React, { useState } from 'react';
import { TestWrapper, RenderCounter } from '../common';
import styles from './TestScenarios.module.css';

const AnonymousExportDemo = () => {
  const [count, setCount] = useState(0);
  
  return (
    <TestWrapper testName="Anonymous Default Export (Demo)">
      <div className={styles.testContent}>
        <div className={styles.warning}>
          ⚠️ This component DEMONSTRATES an anonymous default export issue (now fixed for safety)
        </div>
        
        <div className={styles.description}>
          <h4>What Was Wrong?</h4>
          <p>This component WAS exported as an anonymous arrow function:</p>
          <pre className={styles.codeBlock}>
{`// ❌ BAD - This was causing infinite refresh!
const AnonymousExportsComponent = () => {
export default AnonymousExportsComponent;

  // Component code
}`}
          </pre>
          
          <h4>Why It Breaks Fast Refresh</h4>
          <ul>
            <li>React can't preserve component state between updates</li>
            <li>The component has no stable identity</li>
            <li>Every edit causes a full page reload</li>
          </ul>
          
          <h4>How to Fix</h4>
          <p>Use a named function or add a displayName:</p>
          <pre className={styles.codeBlock}>
{`// Option 1: Named function
const MyComponent = () => {
  // Component code
};
export default MyComponent;

// Option 2: Function declaration
export default function MyComponent() {
  // Component code
}`}
          </pre>
          
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,255,0,0.1)', border: '1px solid rgba(0,255,0,0.3)', borderRadius: '0.5rem' }}>
            <p style={{ margin: 0, color: '#0f0' }}>
              ✅ This component has been fixed! It now uses: <code>const AnonymousExportDemo = () =&gt; {`{}`}</code>
            </p>
          </div>
        </div>
        
        <div className={styles.demo}>
          <h4>Test It Yourself</h4>
          <p>Current count: {count}</p>
          <button 
            className={styles.button}
            onClick={() => setCount(count + 1)}
          >
            Increment Counter
          </button>
          <p className={styles.hint}>
            Now edit this file and watch the counter reset (full page reload)
          </p>
        </div>
        
        <RenderCounter label="Anonymous Component" />
      </div>
    </TestWrapper>
  );
};

export default AnonymousExportDemo;

export const NamedExportExample = () => {
  const [count, setCount] = useState(0);
  
  return (
    <TestWrapper testName="Named Export (Working)">
      <div className={styles.testContent}>
        <div className={styles.success}>
          ✅ This component uses a named export, which works with Fast Refresh!
        </div>
        
        <div className={styles.demo}>
          <p>Current count: {count}</p>
          <button 
            className={styles.button}
            onClick={() => setCount(count + 1)}
          >
            Increment Counter
          </button>
          <p className={styles.hint}>
            Edit this component - the counter value will be preserved!
          </p>
        </div>
        
        <RenderCounter label="Named Component" />
      </div>
    </TestWrapper>
  );
};