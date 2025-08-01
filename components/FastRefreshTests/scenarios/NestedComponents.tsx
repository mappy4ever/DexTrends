import React, { useState } from 'react';
import { TestWrapper, RenderCounter } from '../common';
import styles from './TestScenarios.module.css';

const NestedComponentsTest: React.FC = () => {
  const [parentCount, setParentCount] = useState(0);
  const [showNested, setShowNested] = useState(true);
  
  const NestedInsideComponent = () => {
    const [nestedCount, setNestedCount] = useState(0);
    
    return (
      <div className={styles.componentBox}>
        <h5>❌ Component Defined Inside Parent</h5>
        <p>Nested count: {nestedCount}</p>
        <button 
          className={styles.button}
          onClick={() => setNestedCount(nestedCount + 1)}
        >
          Increment Nested
        </button>
        <p className={styles.hint}>
          This component loses state on parent re-render!
        </p>
      </div>
    );
  };
  
  return (
    <TestWrapper testName="Nested Component Definitions">
      <div className={styles.testContent}>
        <div className={styles.warning}>
          ⚠️ Components defined inside other components break Fast Refresh!
        </div>
        
        <div className={styles.description}>
          <h4>The Problem</h4>
          <pre className={styles.codeBlock}>
{`function ParentComponent() {
  // ❌ BAD: Component defined inside parent
  const ChildComponent = () => {
    return <div>Child</div>;
  };
  
  return <ChildComponent />;
}`}
          </pre>
          
          <h4>Why It Breaks</h4>
          <ul>
            <li>Inner component is recreated on every parent render</li>
            <li>React sees it as a new component type each time</li>
            <li>All state in the nested component is lost</li>
            <li>Fast Refresh can't track component identity</li>
          </ul>
          
          <h4>How to Fix</h4>
          <pre className={styles.codeBlock}>
{`// ✅ GOOD: Define components at module level
const ChildComponent = () => {
  return <div>Child</div>;
};

function ParentComponent() {
  return <ChildComponent />;
}`}
          </pre>
        </div>
        
        <div className={styles.demo}>
          <h4>Live Demonstration</h4>
          <div className={styles.stateGrid}>
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Parent State</div>
              <div className={styles.stateValue}>{parentCount}</div>
              <button 
                className={styles.button}
                onClick={() => setParentCount(parentCount + 1)}
                style={{ marginTop: '0.5rem' }}
              >
                Update Parent
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Toggle Nested</div>
              <button 
                className={styles.button}
                onClick={() => setShowNested(!showNested)}
              >
                {showNested ? 'Hide' : 'Show'} Nested
              </button>
            </div>
          </div>
          
          {showNested && <NestedInsideComponent />}
          
          <p className={styles.hint}>
            Notice: When you update the parent, the nested component's state resets!
          </p>
        </div>
        
        <RenderCounter label="Parent Component" />
      </div>
    </TestWrapper>
  );
};

const ProperlyDefinedChild: React.FC<{ label: string }> = ({ label }) => {
  const [count, setCount] = useState(0);
  
  return (
    <div className={styles.componentBox}>
      <h5>✅ Properly Defined Component</h5>
      <p>{label} - Count: {count}</p>
      <button 
        className={styles.button}
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
      <p className={styles.hint}>
        This component preserves state correctly!
      </p>
    </div>
  );
};

export const CorrectPatternExample: React.FC = () => {
  const [parentCount, setParentCount] = useState(0);
  const [showChild, setShowChild] = useState(true);
  
  return (
    <TestWrapper testName="Correct Component Pattern">
      <div className={styles.testContent}>
        <div className={styles.success}>
          ✅ Components defined at module level work with Fast Refresh!
        </div>
        
        <div className={styles.demo}>
          <div className={styles.stateGrid}>
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Parent State</div>
              <div className={styles.stateValue}>{parentCount}</div>
              <button 
                className={styles.button}
                onClick={() => setParentCount(parentCount + 1)}
                style={{ marginTop: '0.5rem' }}
              >
                Update Parent
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Toggle Child</div>
              <button 
                className={styles.button}
                onClick={() => setShowChild(!showChild)}
              >
                {showChild ? 'Hide' : 'Show'} Child
              </button>
            </div>
          </div>
          
          {showChild && <ProperlyDefinedChild label="Module-level component" />}
          
          <p className={styles.hint}>
            The child component maintains its state even when parent updates!
          </p>
        </div>
        
        <RenderCounter label="Correct Pattern" />
      </div>
    </TestWrapper>
  );
};

export default NestedComponentsTest;