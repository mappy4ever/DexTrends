import React, { useState, useEffect } from 'react';
import { TestWrapper, RenderCounter } from '../common';
import styles from './TestScenarios.module.css';

const ConditionalHooksTest: React.FC = () => {
  const [showHook, setShowHook] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const BadComponent = () => {
    const [count, setCount] = useState(0);
    
    // Fixed: Always call hook, but conditionally execute its logic
    useEffect(() => {
      if (showHook) {
        console.log('This hook is conditional!');
      }
    }, [showHook]);
    
    // Simulate error for testing
    try {
      if (showHook && !error) {
        // Simulate conditional hook error for demo
      }
    } catch (e: any) {
      if (!error) {
        setError(e.message);
      }
    }
    
    return (
      <div className={styles.componentBox}>
        <h5>❌ Conditional Hook Usage</h5>
        <p>Count: {count}</p>
        <button 
          className={styles.button}
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
        {error && (
          <div className={styles.hookError}>
            Error: {error}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <TestWrapper testName="Conditional Hooks (Rule Violation)">
      <div className={styles.testContent}>
        <div className={styles.warning}>
          ⚠️ Conditional hooks violate React's Rules of Hooks!
        </div>
        
        <div className={styles.description}>
          <h4>Common Hook Violations</h4>
          <pre className={styles.codeBlock}>
{`// ❌ BAD: Conditional hook
if (condition) {
  useEffect(() => {}, []);
}

// ❌ BAD: Hook in loop
for (let i = 0; i < items.length; i++) {
  useState(0);
}

// ❌ BAD: Hook after early return
if (!data) return null;
useState(0); // Never reached sometimes!`}
          </pre>
          
          <h4>Why It Breaks Fast Refresh</h4>
          <ul>
            <li>React relies on consistent hook call order</li>
            <li>Conditional hooks corrupt React's internal state</li>
            <li>Fast Refresh can't reconcile inconsistent hook calls</li>
            <li>Often causes "Rendered fewer hooks" errors</li>
          </ul>
          
          <h4>How to Fix</h4>
          <pre className={styles.codeBlock}>
{`// ✅ GOOD: Conditional logic inside hook
useEffect(() => {
  if (condition) {
    // Do something
  }
}, [condition]);

// ✅ GOOD: All hooks at top level
const [state1] = useState(0);
const [state2] = useState(0);
if (!data) return null;`}
          </pre>
        </div>
        
        <div className={styles.demo}>
          <h4>Test Hook Violations</h4>
          <button 
            className={styles.button}
            onClick={() => setShowHook(!showHook)}
            style={{ marginBottom: '1rem' }}
          >
            Toggle Conditional Hook ({showHook ? 'ON' : 'OFF'})
          </button>
          
          <BadComponent />
          
          <p className={styles.hint}>
            Toggle the conditional hook to see errors and Fast Refresh failures
          </p>
        </div>
        
        <RenderCounter label="Hook Violations Test" />
      </div>
    </TestWrapper>
  );
};

export const CorrectHooksExample: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (enabled) {
      console.log('Effect running - correctly implemented');
    }
  }, [enabled]);
  
  const items = [1, 2, 3];
  const [itemStates] = useState(() => items.map(() => 0));
  
  return (
    <TestWrapper testName="Correct Hook Usage">
      <div className={styles.testContent}>
        <div className={styles.success}>
          ✅ All hooks called unconditionally at the top level!
        </div>
        
        <div className={styles.demo}>
          <h4>Properly Implemented Hooks</h4>
          
          <div className={styles.stateGrid}>
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Effect Enabled</div>
              <button 
                className={styles.button}
                onClick={() => setEnabled(!enabled)}
              >
                {enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>State Counter</div>
              <div className={styles.stateValue}>{count}</div>
              <button 
                className={styles.button}
                onClick={() => setCount(count + 1)}
                style={{ marginTop: '0.5rem' }}
              >
                Increment
              </button>
            </div>
          </div>
          
          <div className={styles.info} style={{ marginTop: '1rem' }}>
            <strong>Best Practices Applied:</strong>
            <ul style={{ marginBottom: 0, marginTop: '0.5rem' }}>
              <li>All hooks at component top level</li>
              <li>Conditional logic inside useEffect</li>
              <li>Consistent hook call order</li>
              <li>No hooks in loops or conditions</li>
            </ul>
          </div>
        </div>
        
        <RenderCounter label="Correct Hooks" />
      </div>
    </TestWrapper>
  );
};

export default ConditionalHooksTest;