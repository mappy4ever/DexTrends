import React, { useState, Suspense, lazy } from 'react';
import { TestWrapper, RenderCounter } from '../common';
import styles from './TestScenarios.module.css';

// Define the component separately with a proper name
const LazyLoadedComponent = () => {
  const [count, setCount] = useState(0);
  return (
    <div className={styles.componentBox}>
      <h5>Lazy Loaded Component</h5>
      <p>Count: {count}</p>
      <button 
        className={styles.button}
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
      <p className={styles.hint}>
        This component was loaded dynamically!
      </p>
    </div>
  );
};

const LazyComponent = lazy(() => 
  new Promise<{ default: React.ComponentType }>(resolve => {
    setTimeout(() => {
      resolve({
        default: LazyLoadedComponent
      });
    }, 1000);
  })
);

const DynamicImportsTest: React.FC = () => {
  const [showLazy, setShowLazy] = useState(false);
  const [dynamicComponent, setDynamicComponent] = useState<React.ComponentType<{ label?: string }> | null>(null);
  const [mainCount, setMainCount] = useState(0);
  
  const loadDynamicComponent = async () => {
    const importedModule = await import('../common/RenderCounter');
    setDynamicComponent(() => importedModule.RenderCounter);
  };
  
  return (
    <TestWrapper testName="Dynamic Imports & Code Splitting">
      <div className={styles.testContent}>
        <div className={styles.info}>
          ℹ️ Dynamic imports can affect Fast Refresh boundaries
        </div>
        
        <div className={styles.description}>
          <h4>Dynamic Import Patterns</h4>
          <pre className={styles.codeBlock}>
{`// React.lazy for components
const LazyComponent = lazy(() => import('./Component'));

// Dynamic import() for code splitting
const module = await import('./module');

// Conditional loading
if (condition) {
  const { Component } = await import('./Component');
}`}
          </pre>
          
          <h4>Fast Refresh Considerations</h4>
          <ul>
            <li>Lazy components create module boundaries</li>
            <li>Changes in lazy components may not trigger parent refresh</li>
            <li>Dynamic imports can break the update chain</li>
            <li>Suspense boundaries affect error handling</li>
          </ul>
          
          <h4>Best Practices</h4>
          <ul>
            <li>Use React.lazy() for route-based code splitting</li>
            <li>Keep lazy boundaries at high levels</li>
            <li>Avoid dynamic imports in frequently updated code</li>
            <li>Always wrap lazy components in Suspense</li>
          </ul>
        </div>
        
        <div className={styles.demo}>
          <h4>Test Dynamic Loading</h4>
          
          <div className={styles.stateGrid}>
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Main State</div>
              <div className={styles.stateValue}>{mainCount}</div>
              <button 
                className={styles.button}
                onClick={() => setMainCount(mainCount + 1)}
                style={{ marginTop: '0.5rem' }}
              >
                Update Main
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Lazy Component</div>
              <button 
                className={styles.button}
                onClick={() => setShowLazy(!showLazy)}
              >
                {showLazy ? 'Hide' : 'Show'} Lazy
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Dynamic Import</div>
              <button 
                className={styles.button}
                onClick={loadDynamicComponent}
              >
                Load Component
              </button>
            </div>
          </div>
          
          {showLazy && (
            <Suspense fallback={
              <div className={styles.lazyLoading}>
                <div className={styles.spinner}></div>
                <p>Loading component...</p>
              </div>
            }>
              <LazyComponent />
            </Suspense>
          )}
          
          {dynamicComponent && (
            <div style={{ marginTop: '1rem' }}>
              {React.createElement(dynamicComponent, { label: 'Dynamically Imported' })}
            </div>
          )}
          
          <p className={styles.hint}>
            Edit this file and observe how lazy boundaries affect updates
          </p>
        </div>
        
        <RenderCounter label="Dynamic Imports Test" />
      </div>
    </TestWrapper>
  );
};

export const OptimizedLazyPattern: React.FC = () => {
  const [showFeature, setShowFeature] = useState(false);
  
  return (
    <TestWrapper testName="Optimized Lazy Loading Pattern">
      <div className={styles.testContent}>
        <div className={styles.success}>
          ✅ Properly structured lazy loading with Fast Refresh support
        </div>
        
        <div className={styles.demo}>
          <h4>Route-Based Code Splitting</h4>
          <pre className={styles.codeBlock}>
{`// pages/features/heavy-feature.tsx
const HeavyFeature = lazy(() => import('../components/HeavyFeature'));

export default function FeaturePage() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyFeature />
    </Suspense>
  );
}`}
          </pre>
          
          <button 
            className={styles.button}
            onClick={() => setShowFeature(!showFeature)}
          >
            {showFeature ? 'Hide' : 'Show'} Feature Demo
          </button>
          
          {showFeature && (
            <div className={styles.info} style={{ marginTop: '1rem' }}>
              <strong>Benefits of this pattern:</strong>
              <ul style={{ marginBottom: 0, marginTop: '0.5rem' }}>
                <li>Clear module boundaries</li>
                <li>Predictable Fast Refresh behavior</li>
                <li>Optimal bundle splitting</li>
                <li>Better error boundaries</li>
              </ul>
            </div>
          )}
        </div>
        
        <RenderCounter label="Optimized Pattern" />
      </div>
    </TestWrapper>
  );
};

export default DynamicImportsTest;