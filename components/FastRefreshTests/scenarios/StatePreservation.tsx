import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import logger from '@/utils/logger';
import { TestWrapper, RenderCounter } from '../common';
import styles from './TestScenarios.module.css';

const StatePreservationTest: React.FC = () => {
  const [simpleState, setSimpleState] = useState(0);
  const [objectState, setObjectState] = useState({ count: 0, text: 'Initial' });
  const [arrayState, setArrayState] = useState([1, 2, 3]);
  const [inputValue, setInputValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [selectValue, setSelectValue] = useState('option1');
  
  const refValue = useRef(0);
  const [refDisplay, setRefDisplay] = useState(0);
  
  const memoizedValue = useMemo(() => {
    return simpleState * 2;
  }, [simpleState]);
  
  const callbackFunction = useCallback(() => {
    logger.debug('Callback with state:', simpleState);
  }, [simpleState]);
  
  useEffect(() => {
    logger.debug('Effect ran with state:', simpleState);
  }, [simpleState]);
  
  return (
    <TestWrapper testName="State Preservation During Fast Refresh">
      <div className={styles.testContent}>
        <div className={styles.success}>
          ✅ When Fast Refresh works correctly, all state should be preserved!
        </div>
        
        <div className={styles.description}>
          <h4>What Should Be Preserved</h4>
          <ul>
            <li>useState values (primitives and objects)</li>
            <li>useRef values</li>
            <li>Form input states</li>
            <li>useMemo and useCallback results</li>
            <li>Component mount state</li>
          </ul>
          
          <h4>What Gets Reset</h4>
          <ul>
            <li>Module-level variables</li>
            <li>Non-React state</li>
            <li>Event listeners outside React</li>
            <li>Timers and intervals (sometimes)</li>
          </ul>
        </div>
        
        <div className={styles.demo}>
          <h4>Test State Preservation</h4>
          
          <div className={styles.stateGrid}>
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Simple State</div>
              <div className={styles.stateValue}>{simpleState}</div>
              <button 
                className={styles.button}
                onClick={() => setSimpleState(simpleState + 1)}
                style={{ marginTop: '0.5rem' }}
              >
                Increment
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Object State</div>
              <div className={styles.stateValue} style={{ fontSize: '0.875rem' }}>
                Count: {objectState.count}<br />
                Text: {objectState.text}
              </div>
              <button 
                className={styles.button}
                onClick={() => setObjectState({
                  count: objectState.count + 1,
                  text: `Updated ${objectState.count + 1}`
                })}
                style={{ marginTop: '0.5rem' }}
              >
                Update
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Array State</div>
              <div className={styles.stateValue} style={{ fontSize: '0.875rem' }}>
                [{arrayState.join(', ')}]
              </div>
              <button 
                className={styles.button}
                onClick={() => setArrayState([...arrayState, arrayState.length + 1])}
                style={{ marginTop: '0.5rem' }}
              >
                Add Item
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>useRef Value</div>
              <div className={styles.stateValue}>{refDisplay}</div>
              <button 
                className={styles.button}
                onClick={() => {
                  refValue.current += 1;
                  setRefDisplay(refValue.current);
                }}
                style={{ marginTop: '0.5rem' }}
              >
                Update Ref
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Memoized Value</div>
              <div className={styles.stateValue}>
                {simpleState} × 2 = {memoizedValue}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h4>Form State Preservation</h4>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ color: '#888', fontSize: '0.875rem' }}>Text Input:</label>
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type something..."
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.25rem',
                    background: '#222',
                    border: '1px solid #444',
                    color: '#fff',
                    borderRadius: '0.25rem'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '2rem' }}>
                <label style={{ color: '#888', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox"
                    checked={checkboxValue}
                    onChange={(e) => setCheckboxValue(e.target.checked)}
                  />
                  Checkbox State
                </label>
                
                <label style={{ color: '#888', fontSize: '0.875rem' }}>
                  Select:
                  <select 
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    style={{
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      background: '#222',
                      border: '1px solid #444',
                      color: '#fff',
                      borderRadius: '0.25rem'
                    }}
                  >
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
          
          <p className={styles.hint}>
            Edit this component and watch all state values persist through Fast Refresh!
            <br />
            If any values reset, it indicates a Fast Refresh failure.
          </p>
        </div>
        
        <RenderCounter label="State Preservation Test" />
      </div>
    </TestWrapper>
  );
};

let moduleVariable = 0;

export const ModuleLevelStateExample: React.FC = () => {
  const [componentState, setComponentState] = useState(0);
  const [moduleDisplay, setModuleDisplay] = useState(moduleVariable);
  
  return (
    <TestWrapper testName="Module vs Component State">
      <div className={styles.testContent}>
        <div className={styles.info}>
          ℹ️ Module-level variables reset during Fast Refresh
        </div>
        
        <div className={styles.demo}>
          <div className={styles.stateGrid}>
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Component State ✅</div>
              <div className={styles.stateValue}>{componentState}</div>
              <button 
                className={styles.button}
                onClick={() => setComponentState(componentState + 1)}
                style={{ marginTop: '0.5rem' }}
              >
                Increment
              </button>
            </div>
            
            <div className={styles.stateItem}>
              <div className={styles.stateLabel}>Module Variable ❌</div>
              <div className={styles.stateValue}>{moduleDisplay}</div>
              <button 
                className={styles.button}
                onClick={() => {
                  moduleVariable += 1;
                  setModuleDisplay(moduleVariable);
                }}
                style={{ marginTop: '0.5rem' }}
              >
                Increment
              </button>
            </div>
          </div>
          
          <p className={styles.hint}>
            Component state persists, but module variable resets to 0 on Fast Refresh
          </p>
        </div>
        
        <RenderCounter label="Module State Demo" />
      </div>
    </TestWrapper>
  );
};

export default StatePreservationTest;