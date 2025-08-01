import React, { useEffect, useRef, useState } from 'react';
import styles from './RenderCounter.module.css';

interface RenderCounterProps {
  label?: string;
  showTimestamp?: boolean;
}

export const RenderCounter: React.FC<RenderCounterProps> = ({ 
  label = 'Component', 
  showTimestamp = true 
}) => {
  const renderCount = useRef(0);
  const [, forceRender] = useState({});
  const lastRenderTime = useRef(Date.now());
  const timeSinceLastRender = Date.now() - lastRenderTime.current;

  useEffect(() => {
    renderCount.current += 1;
    lastRenderTime.current = Date.now();
    
    const timer = setTimeout(() => {
      const element = document.querySelector(`[data-render-id="${label}"]`);
      if (element) {
        element.classList.add(styles.justRendered);
        setTimeout(() => {
          element.classList.remove(styles.justRendered);
        }, 1000);
      }
    }, 0);

    return () => clearTimeout(timer);
  });

  return (
    <div className={styles.counter} data-render-id={label}>
      <div className={styles.label}>{label}</div>
      <div className={styles.count}>{renderCount.current}</div>
      {showTimestamp && (
        <div className={styles.timestamp}>
          Last: {new Date().toLocaleTimeString()}
          <br />
          <span className={styles.delta}>
            {timeSinceLastRender > 1000 
              ? `${Math.floor(timeSinceLastRender / 1000)}s ago`
              : 'Just now'}
          </span>
        </div>
      )}
      <button 
        className={styles.forceButton}
        onClick={() => forceRender({})}
      >
        Force Render
      </button>
    </div>
  );
};