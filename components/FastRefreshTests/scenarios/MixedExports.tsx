import React, { useState } from 'react';
import { TestWrapper, RenderCounter } from '../common';
import styles from './TestScenarios.module.css';

export const SOME_CONSTANT = 'This is a non-React export';

export function utilityFunction(value: number) {
  return value * 2;
}

export interface SomeInterface {
  id: string;
  name: string;
}

const MixedExportsComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  const [testValue, setTestValue] = useState(5);
  
  return (
    <TestWrapper testName="Mixed Exports (React + Non-React)">
      <div className={styles.testContent}>
        <div className={styles.warning}>
          ⚠️ This file exports both React components and non-React values!
        </div>
        
        <div className={styles.description}>
          <h4>Current File Exports</h4>
          <pre className={styles.codeBlock}>
{`export const SOME_CONSTANT = 'This is a non-React export';
export function utilityFunction(value) { ... }
export interface SomeInterface { ... }
export default MixedExportsComponent; // React component`}
          </pre>
          
          <h4>Why It Can Break Fast Refresh</h4>
          <ul>
            <li>Files should export ONLY React components for Fast Refresh to work</li>
            <li>Mixed exports confuse the Fast Refresh boundary detection</li>
            <li>Changes to non-React exports may trigger full reloads</li>
            <li>State preservation becomes unreliable</li>
          </ul>
          
          <h4>How to Fix</h4>
          <p>Separate React components and utilities into different files:</p>
          <pre className={styles.codeBlock}>
{`// utils.ts - Non-React exports
export const SOME_CONSTANT = '...';
export function utilityFunction() { ... }

// MyComponent.tsx - React components only
import { utilityFunction } from './utils';
export default function MyComponent() { ... }`}
          </pre>
        </div>
        
        <div className={styles.demo}>
          <h4>Test The Issue</h4>
          <div className={styles.stateGrid}>
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Component State</div>
              <div className={styles.stateValue}>{count}</div>
              <button 
                className={styles.button}
                onClick={() => setCount(count + 1)}
                style={{ marginTop: '0.5rem' }}
              >
                Increment
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Using Utility</div>
              <div className={styles.stateValue}>
                {testValue} × 2 = {utilityFunction(testValue)}
              </div>
              <button 
                className={styles.button}
                onClick={() => setTestValue(testValue + 1)}
                style={{ marginTop: '0.5rem' }}
              >
                Increase
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Using Constant</div>
              <div className={styles.stateValue} style={{ fontSize: '0.875rem' }}>
                {SOME_CONSTANT}
              </div>
            </div>
          </div>
          
          <p className={styles.hint}>
            Try editing different parts of this file:
            <br />• Edit the component → Should preserve state
            <br />• Edit the utility function → May cause full reload
            <br />• Edit the constant → Will cause full reload
          </p>
        </div>
        
        <RenderCounter label="Mixed Exports Component" />
      </div>
    </TestWrapper>
  );
};

export default MixedExportsComponent;

export const PureReactComponent: React.FC = () => {
  const [value, setValue] = useState(0);
  
  return (
    <TestWrapper testName="Pure React Export (Comparison)">
      <div className={styles.testContent}>
        <div className={styles.success}>
          ✅ This is a pure React component in the same file
        </div>
        
        <div className={styles.demo}>
          <p>This component is in a file with mixed exports, but it's still a React component.</p>
          <p>Value: {value}</p>
          <button 
            className={styles.button}
            onClick={() => setValue(value + 1)}
          >
            Increment
          </button>
        </div>
        
        <RenderCounter label="Pure React Export" />
      </div>
    </TestWrapper>
  );
};