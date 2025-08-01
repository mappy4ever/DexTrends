import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/fast-refresh-test.module.css';
import { 
  FastRefreshMonitor,
  AnonymousExports,
  NamedExportExample,
  MixedExports,
  PureReactComponent,
  NestedComponents,
  CorrectPatternExample,
  ConditionalHooks,
  CorrectHooksExample,
  DynamicImports,
  OptimizedLazyPattern,
  StatePreservation,
  ModuleLevelStateExample
} from '../components/FastRefreshTests';

const FastRefreshTestV2 = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [renderCount, setRenderCount] = useState(0);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'anonymous', label: 'Anonymous Exports' },
    { id: 'mixed', label: 'Mixed Exports' },
    { id: 'nested', label: 'Nested Components' },
    { id: 'hooks', label: 'Hook Violations' },
    { id: 'dynamic', label: 'Dynamic Imports' },
    { id: 'state', label: 'State Preservation' },
    { id: 'monitor', label: 'Monitor' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className={styles.overview}>
            <h2>Fast Refresh Diagnostic Tool V2</h2>
            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <h3>Status</h3>
                <div className={styles.statusActive}>
                  ✅ Safe Version (No HMR Handlers)
                </div>
              </div>
              <div className={styles.statusCard}>
                <h3>Render Count</h3>
                <div className={styles.renderCount}>{renderCount}</div>
              </div>
              <div className={styles.statusCard}>
                <h3>Mount Time</h3>
                <div className={styles.mountTime}>
                  {new Date(mountTimeRef.current).toLocaleTimeString()}
                </div>
              </div>
              <div className={styles.statusCard}>
                <h3>Environment</h3>
                <div className={styles.environment}>
                  {process.env.NODE_ENV}
                </div>
              </div>
            </div>
            
            <div className={styles.instructions}>
              <h3>How to Use This Tool</h3>
              <ol>
                <li>Navigate through the tabs to test different Fast Refresh scenarios</li>
                <li>Make changes to the test components and observe the behavior</li>
                <li>Look for full page reloads vs. component-only updates</li>
              </ol>
              
              <h3>Common Issues That Break Fast Refresh</h3>
              <ul>
                <li>Anonymous default exports (now fixed in our demo)</li>
                <li>Mixed React and non-React exports</li>
                <li>Components defined inside other components</li>
                <li>Conditional hook calls</li>
                <li>Circular dependencies</li>
              </ul>
              
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#222', borderRadius: '0.5rem' }}>
                <p style={{ color: '#0f0', margin: 0 }}>
                  ✅ V2: HMR handlers removed to prevent interference
                </p>
              </div>
            </div>
          </div>
        );

      case 'anonymous':
        return (
          <>
            <AnonymousExports />
            <NamedExportExample />
          </>
        );

      case 'mixed':
        return (
          <>
            <MixedExports />
            <PureReactComponent />
          </>
        );

      case 'nested':
        return (
          <>
            <NestedComponents />
            <CorrectPatternExample />
          </>
        );

      case 'hooks':
        return (
          <>
            <ConditionalHooks />
            <CorrectHooksExample />
          </>
        );

      case 'dynamic':
        return (
          <>
            <DynamicImports />
            <OptimizedLazyPattern />
          </>
        );

      case 'state':
        return (
          <>
            <StatePreservation />
            <ModuleLevelStateExample />
          </>
        );

      case 'monitor':
        return (
          <div className={styles.monitor}>
            <h2>Fast Refresh Monitor</h2>
            <FastRefreshMonitor />
            <div className={styles.info} style={{ marginTop: '1rem' }}>
              Note: Direct HMR event logging has been disabled in V2 to prevent interference.
              The monitor component above provides safe observation of Fast Refresh behavior.
            </div>
          </div>
        );

      default:
        return (
          <div className={styles.testPlaceholder}>
            <h2>Select a test scenario</h2>
            <p>Choose a tab above to explore different Fast Refresh scenarios.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Fast Refresh Diagnostic Tool</h1>
        <div className={styles.liveIndicator}>
          <span className={styles.dot}></span>
          V2 - Safe Mode
        </div>
      </header>

      <nav className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className={styles.content}>
        {renderTabContent()}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInfo}>
          <span>Page Render #{renderCount}</span>
          <span>•</span>
          <span>Next.js {process.env.NEXT_RUNTIME_VERSION || 'Unknown'}</span>
          <span>•</span>
          <span>V2 - No HMR Handlers</span>
        </div>
      </footer>
    </div>
  );
};

export default FastRefreshTestV2;