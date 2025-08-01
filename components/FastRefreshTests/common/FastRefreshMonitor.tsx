import React, { useEffect, useState, useRef } from 'react';
import styles from './FastRefreshMonitor.module.css';

interface MonitorState {
  isHMRActive: boolean;
  lastUpdateType: 'none' | 'fast' | 'full';
  updateCount: number;
  errors: string[];
  warnings: string[];
}

export const FastRefreshMonitor: React.FC = () => {
  const [state, setState] = useState<MonitorState>({
    isHMRActive: false,
    lastUpdateType: 'none',
    updateCount: 0,
    errors: [],
    warnings: []
  });
  
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && (module as any).hot) {
      setState(prev => ({ ...prev, isHMRActive: true }));
      
      const hot = (module as any).hot;
      
      hot.addStatusHandler((status: string) => {
        console.log('[FastRefreshMonitor] HMR Status:', status);
        
        if (status === 'ready') {
          setState(prev => ({
            ...prev,
            updateCount: prev.updateCount + 1,
            lastUpdateType: initialLoadRef.current ? 'none' : 'fast'
          }));
          initialLoadRef.current = false;
        }
        
        if (status === 'abort' || status === 'fail') {
          setState(prev => ({
            ...prev,
            lastUpdateType: 'full',
            errors: [...prev.errors, `HMR ${status} at ${new Date().toLocaleTimeString()}`]
          }));
        }
      });

      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      console.error = (...args) => {
        originalConsoleError(...args);
        const errorMsg = args.join(' ');
        if (errorMsg.includes('Fast Refresh')) {
          setState(prev => ({
            ...prev,
            errors: [...prev.errors.slice(-4), errorMsg]
          }));
        }
      };
      
      console.warn = (...args) => {
        originalConsoleWarn(...args);
        const warnMsg = args.join(' ');
        if (warnMsg.includes('Fast Refresh') || warnMsg.includes('HMR')) {
          setState(prev => ({
            ...prev,
            warnings: [...prev.warnings.slice(-4), warnMsg]
          }));
        }
      };

      return () => {
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
      };
    }
    return undefined;
  }, []);

  const getStatusColor = () => {
    if (!state.isHMRActive) return styles.statusInactive;
    if (state.errors.length > 0) return styles.statusError;
    if (state.warnings.length > 0) return styles.statusWarning;
    return styles.statusActive;
  };

  const getUpdateTypeLabel = () => {
    switch (state.lastUpdateType) {
      case 'fast': return '⚡ Fast Refresh';
      case 'full': return '🔄 Full Reload';
      default: return '⏸️ No Updates';
    }
  };

  return (
    <div className={styles.monitor}>
      <div className={styles.header}>
        <h3>Fast Refresh Monitor</h3>
        <div className={`${styles.status} ${getStatusColor()}`}>
          {state.isHMRActive ? '● Active' : '○ Inactive'}
        </div>
      </div>
      
      <div className={styles.grid}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Update Type</div>
          <div className={styles.statValue}>{getUpdateTypeLabel()}</div>
        </div>
        
        <div className={styles.stat}>
          <div className={styles.statLabel}>Update Count</div>
          <div className={styles.statValue}>{state.updateCount}</div>
        </div>
        
        <div className={styles.stat}>
          <div className={styles.statLabel}>Errors</div>
          <div className={`${styles.statValue} ${styles.errorCount}`}>
            {state.errors.length}
          </div>
        </div>
        
        <div className={styles.stat}>
          <div className={styles.statLabel}>Warnings</div>
          <div className={`${styles.statValue} ${styles.warningCount}`}>
            {state.warnings.length}
          </div>
        </div>
      </div>
      
      {state.errors.length > 0 && (
        <div className={styles.errorList}>
          <h4>Recent Errors</h4>
          {state.errors.map((error, index) => (
            <div key={index} className={styles.errorItem}>
              {error}
            </div>
          ))}
        </div>
      )}
      
      {state.warnings.length > 0 && (
        <div className={styles.warningList}>
          <h4>Recent Warnings</h4>
          {state.warnings.map((warning, index) => (
            <div key={index} className={styles.warningItem}>
              {warning}
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.tips}>
        <h4>Quick Tips</h4>
        <ul>
          <li>Edit this component to test Fast Refresh</li>
          <li>Check console for detailed HMR logs</li>
          <li>Full reloads indicate Fast Refresh failures</li>
        </ul>
      </div>
    </div>
  );
};