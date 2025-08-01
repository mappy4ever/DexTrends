import React, { ReactNode, useEffect, useRef } from 'react';
import styles from './TestWrapper.module.css';

interface TestWrapperProps {
  testName: string;
  children: ReactNode;
  onRender?: (renderCount: number) => void;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ 
  testName, 
  children, 
  onRender 
}) => {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    if (onRender) {
      onRender(renderCount.current);
    }
    
    console.log(`[${testName}] Render #${renderCount.current} at ${new Date().toLocaleTimeString()}`);
  });

  return (
    <div className={styles.wrapper} data-testid={`test-wrapper-${testName}`}>
      <div className={styles.header}>
        <h3>{testName}</h3>
        <div className={styles.stats}>
          <span className={styles.renderBadge}>
            Renders: {renderCount.current}
          </span>
          <span className={styles.mountBadge}>
            Mounted: {new Date(mountTime.current).toLocaleTimeString()}
          </span>
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};