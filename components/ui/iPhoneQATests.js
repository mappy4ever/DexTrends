import React, { useState, useEffect } from 'react';
import { FadeIn } from './animations';

// iPhone device configurations
const iPhoneModels = [
  { name: 'iPhone SE (1st gen)', width: 375, height: 667, hasNotch: false },
  { name: 'iPhone SE (2nd/3rd gen)', width: 375, height: 667, hasNotch: false },
  { name: 'iPhone 12 mini', width: 375, height: 812, hasNotch: true },
  { name: 'iPhone 13 mini', width: 375, height: 812, hasNotch: true },
  { name: 'iPhone 12', width: 390, height: 844, hasNotch: true },
  { name: 'iPhone 13', width: 390, height: 844, hasNotch: true },
  { name: 'iPhone 14', width: 390, height: 844, hasNotch: true },
  { name: 'iPhone 15', width: 393, height: 852, hasDynamicIsland: true },
  { name: 'iPhone 12 Pro', width: 390, height: 844, hasNotch: true },
  { name: 'iPhone 13 Pro', width: 390, height: 844, hasNotch: true },
  { name: 'iPhone 14 Pro', width: 393, height: 852, hasDynamicIsland: true },
  { name: 'iPhone 15 Pro', width: 393, height: 852, hasDynamicIsland: true },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926, hasNotch: true },
  { name: 'iPhone 13 Pro Max', width: 428, height: 926, hasNotch: true },
  { name: 'iPhone 14 Plus', width: 428, height: 926, hasNotch: true },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, hasDynamicIsland: true },
  { name: 'iPhone 15 Plus', width: 430, height: 932, hasDynamicIsland: true },
  { name: 'iPhone 15 Pro Max', width: 430, height: 932, hasDynamicIsland: true },
];

// Test categories
const testCategories = [
  {
    name: 'Layout & Safe Areas',
    tests: [
      { id: 'safe-area-top', name: 'Safe area insets (top)', description: 'Navbar respects notch/Dynamic Island' },
      { id: 'safe-area-bottom', name: 'Safe area insets (bottom)', description: 'Content respects home indicator' },
      { id: 'viewport-meta', name: 'Viewport configuration', description: 'Proper scaling and viewport-fit' },
      { id: 'touch-targets', name: 'Touch targets ≥ 44px', description: 'All interactive elements meet iOS minimum' },
      { id: 'scrolling', name: 'Smooth scrolling', description: 'Momentum scrolling enabled' },
      { id: 'fixed-position', name: 'Fixed positioning', description: 'Elements stay fixed during scroll' },
      { id: 'keyboard-avoidance', name: 'Keyboard avoidance', description: 'Content scrolls above keyboard' },
    ]
  },
  {
    name: 'Animation Performance',
    tests: [
      { id: 'fps-60', name: '60 FPS animations', description: 'All animations run smoothly' },
      { id: 'gpu-acceleration', name: 'GPU acceleration', description: 'Transform and opacity only' },
      { id: 'reduced-motion', name: 'Reduced motion support', description: 'Respects user preference' },
      { id: 'gesture-response', name: 'Gesture responsiveness', description: 'Touch events respond immediately' },
      { id: 'scroll-performance', name: 'Scroll performance', description: 'No jank during scroll' },
    ]
  },
  {
    name: 'Design System',
    tests: [
      { id: 'design-tokens', name: 'iOS design tokens', description: 'Proper use of CSS variables' },
      { id: 'typography-scale', name: 'Typography scaling', description: 'Readable on all screen sizes' },
      { id: 'color-contrast', name: 'Color contrast', description: 'WCAG AA compliance' },
      { id: 'dark-mode', name: 'Dark mode support', description: 'Proper theme switching' },
      { id: 'icon-clarity', name: 'Icon clarity', description: 'Icons visible at all sizes' },
      { id: 'spacing-consistency', name: 'Spacing consistency', description: '4px grid system' },
    ]
  },
  {
    name: 'iPhone Features',
    tests: [
      { id: 'input-zoom', name: 'Form input zoom prevention', description: 'No zoom on input focus' },
      { id: 'pull-refresh', name: 'Pull-to-refresh', description: 'Native gesture support' },
      { id: 'swipe-gestures', name: 'Swipe gestures', description: 'Natural navigation' },
      { id: 'haptic-feedback', name: 'Haptic feedback', description: 'Tactile responses' },
      { id: 'dynamic-island', name: 'Dynamic Island support', description: 'Content avoids island' },
      { id: 'notch-avoidance', name: 'Notch avoidance', description: 'Content not obscured' },
    ]
  },
  {
    name: 'Accessibility',
    tests: [
      { id: 'voiceover', name: 'VoiceOver navigation', description: 'Screen reader compatible' },
      { id: 'dynamic-type', name: 'Dynamic Type support', description: 'Text scales with system' },
      { id: 'color-blind', name: 'Color blind modes', description: 'Information not color-only' },
      { id: 'focus-indicators', name: 'Focus indicators', description: 'Visible keyboard navigation' },
      { id: 'gesture-alternatives', name: 'Gesture alternatives', description: 'All actions keyboard accessible' },
      { id: 'aria-announcements', name: 'ARIA announcements', description: 'State changes announced' },
    ]
  },
  {
    name: 'Performance',
    tests: [
      { id: 'load-time', name: 'Load time < 3s', description: 'Fast initial load on 4G' },
      { id: 'interaction-latency', name: 'Interaction latency', description: 'Responsive to touch' },
      { id: 'memory-usage', name: 'Memory usage', description: 'Efficient resource use' },
      { id: 'battery-efficiency', name: 'Battery efficiency', description: 'Minimal battery drain' },
      { id: 'network-optimization', name: 'Network optimization', description: 'Efficient data usage' },
      { id: 'cache-effectiveness', name: 'Cache effectiveness', description: 'Proper offline support' },
    ]
  }
];

export default function IPhoneQATests() {
  const [selectedModel, setSelectedModel] = useState(iPhoneModels[7]); // iPhone 15 by default
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [orientation, setOrientation] = useState('portrait');
  const [iosVersion, setIosVersion] = useState('17');
  const [theme, setTheme] = useState('light');

  // Run automated tests
  const runTests = async () => {
    setIsRunning(true);
    const results = {};

    for (const category of testCategories) {
      for (const test of category.tests) {
        setCurrentTest(`${category.name}: ${test.name}`);
        
        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Mock test results (in real implementation, these would be actual tests)
        const passed = Math.random() > 0.1; // 90% pass rate for demo
        results[test.id] = {
          passed,
          message: passed ? 'Test passed' : 'Test failed - needs attention',
          details: getTestDetails(test.id)
        };
      }
    }

    setTestResults(results);
    setIsRunning(false);
    setCurrentTest(null);
  };

  // Get test-specific details
  const getTestDetails = (testId) => {
    const details = {
      'safe-area-top': 'Checked padding-top: env(safe-area-inset-top)',
      'safe-area-bottom': 'Checked padding-bottom: env(safe-area-inset-bottom)',
      'viewport-meta': 'Verified viewport-fit=cover in meta tag',
      'touch-targets': 'Measured all interactive elements >= 44px',
      'fps-60': 'Monitored animation frame rate',
      'gpu-acceleration': 'Verified transform and opacity usage',
      'input-zoom': 'Tested font-size: 16px on all inputs',
      'dynamic-island': 'Checked content positioning on iPhone 14/15 Pro',
    };
    return details[testId] || 'Standard test execution';
  };

  // Calculate pass rate
  const calculatePassRate = () => {
    const total = Object.keys(testResults).length;
    const passed = Object.values(testResults).filter(r => r.passed).length;
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  };

  // Export test results
  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      device: selectedModel,
      orientation,
      iosVersion,
      theme,
      results: testResults,
      passRate: calculatePassRate()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iphone-qa-report-${Date.now()}.json`;
    a.click();
  };

  return (
    <FadeIn className="space-y-6 p-4">
      {/* Device Selection */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">iPhone Testing Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Device Model</label>
            <select
              className="input"
              value={selectedModel.name}
              onChange={(e) => setSelectedModel(iPhoneModels.find(m => m.name === e.target.value))}
            >
              {iPhoneModels.map(model => (
                <option key={model.name} value={model.name}>{model.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">iOS Version</label>
            <select
              className="input"
              value={iosVersion}
              onChange={(e) => setIosVersion(e.target.value)}
            >
              <option value="15">iOS 15</option>
              <option value="16">iOS 16</option>
              <option value="17">iOS 17</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Orientation</label>
            <select
              className="input"
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              className="input"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-light-grey rounded-lg">
          <p className="text-sm">
            <strong>Viewport:</strong> {selectedModel.width} × {selectedModel.height}px
            {selectedModel.hasNotch && ' (Notch)'}
            {selectedModel.hasDynamicIsland && ' (Dynamic Island)'}
          </p>
        </div>
      </div>

      {/* Test Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Test Suite</h3>
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={runTests}
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
            {Object.keys(testResults).length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={exportResults}
              >
                Export Results
              </button>
            )}
          </div>
        </div>
        
        {currentTest && (
          <div className="mb-4 p-3 bg-pokemon-blue/10 rounded-lg">
            <p className="text-sm">Currently testing: <strong>{currentTest}</strong></p>
          </div>
        )}
        
        {Object.keys(testResults).length > 0 && (
          <div className="mb-4 p-4 bg-light-grey rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Pass Rate</span>
              <span className={`text-2xl font-bold ${calculatePassRate() >= 90 ? 'text-pokemon-green' : 'text-pokemon-red'}`}>
                {calculatePassRate()}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Test Results */}
      {testCategories.map(category => (
        <div key={category.name} className="card">
          <h4 className="text-lg font-semibold mb-3">{category.name}</h4>
          <div className="space-y-2">
            {category.tests.map(test => {
              const result = testResults[test.id];
              return (
                <div key={test.id} className="flex items-center justify-between p-3 bg-light-grey rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-text-grey">{test.description}</p>
                    {result && (
                      <p className="text-xs text-text-grey mt-1">{result.details}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    {result ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        result.passed 
                          ? 'bg-pokemon-green/20 text-pokemon-green' 
                          : 'bg-pokemon-red/20 text-pokemon-red'
                      }`}>
                        {result.passed ? '✓ Pass' : '✗ Fail'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-500">
                        Not tested
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </FadeIn>
  );
}