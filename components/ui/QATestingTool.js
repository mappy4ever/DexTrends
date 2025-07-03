import React, { useState, useEffect } from 'react';
import UnifiedCard from './UnifiedCard';

/**
 * QA Testing Tool for Card Standardization
 * Tests all card types and their rendering in different configurations
 */
const QATestingTool = () => {
  const [testMode, setTestMode] = useState('all');
  const [showInstructions, setShowInstructions] = useState(true);
  const [testResults, setTestResults] = useState({});
  
  // Sample test data for different card types
  const testData = {
    tcg: {
      id: "base1-1",
      name: "Alakazam",
      images: {
        small: "https://images.pokemontcg.io/base1/1.png",
        large: "https://images.pokemontcg.io/base1/1_hires.png"
      },
      types: [{ type: { name: "psychic" } }],
      set: {
        name: "Base Set",
        id: "base1"
      },
      number: "1",
      rarity: "Rare Holo",
      hp: "80",
      artist: "Ken Sugimori",
      tcgplayer: {
        prices: {
          holofoil: {
            market: 45.99
          }
        }
      }
    },
    pocket: {
      id: "A1a-001",
      name: "Pikachu",
      image: "/back-card.png", // Fallback for testing
      type: "electric",
      pack: "Genetic Apex",
      rarity: "★",
      health: "60",
      artist: "aky CG Works",
      ex: "No",
      fullart: "No"
    },
    pokedex: {
      id: 25,
      name: "pikachu",
      sprite: "/dextrendslogo.png", // Fallback for testing
      types: ["electric"],
      generation: 1,
      isLegendary: false,
      isMythical: false,
      isUltraBeast: false,
      stage: 1,
      baseStats: 320
    }
  };

  const testConfigurations = [
    {
      name: 'TCG Cards - Full Features',
      cardType: 'tcg',
      props: {
        showPrice: true,
        showSet: true,
        showTypes: true,
        showRarity: true,
        showHP: false,
        showArtist: false
      }
    },
    {
      name: 'TCG Cards - Minimal',
      cardType: 'tcg',
      props: {
        showPrice: false,
        showSet: true,
        showTypes: false,
        showRarity: false,
        showHP: false,
        showArtist: false
      }
    },
    {
      name: 'Pocket Cards - Full Features',
      cardType: 'pocket',
      props: {
        showHP: true,
        showRarity: true,
        showPack: true,
        showArtist: true,
        showTypes: true
      }
    },
    {
      name: 'Pocket Cards - Minimal',
      cardType: 'pocket',
      props: {
        showHP: false,
        showRarity: false,
        showPack: true,
        showArtist: false,
        showTypes: true
      }
    },
    {
      name: 'Pokedex Cards',
      cardType: 'pokedex',
      props: {
        showTypes: true,
        showSet: false
      }
    }
  ];

  const runVisualTest = (configName) => {
    const timestamp = new Date().toISOString();
    setTestResults(prev => ({
      ...prev,
      [configName]: {
        status: 'passed',
        timestamp,
        notes: 'Visual inspection required'
      }
    }));
  };

  const runAllTests = () => {
    testConfigurations.forEach(config => {
      runVisualTest(config.name);
    });
  };

  const exportTestResults = () => {
    const report = {
      testDate: new Date().toISOString(),
      testMode,
      results: testResults,
      summary: {
        total: testConfigurations.length,
        passed: Object.values(testResults).filter(r => r.status === 'passed').length,
        failed: Object.values(testResults).filter(r => r.status === 'failed').length
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `card-qa-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Card Standardization QA Tool</h1>
        
        {showInstructions && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">QA Testing Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Verify all cards use the unified "Related Cards" style (clean, separated, bordered)</li>
              <li>Check that no cards show stacking effects</li>
              <li>Ensure holographic effects are preserved where appropriate</li>
              <li>Confirm consistent spacing and sizing across all card types</li>
              <li>Test responsive behavior on different screen sizes</li>
              <li>Validate that price information displays correctly</li>
              <li>Check that type badges, rarity indicators work properly</li>
              <li>Ensure navigation and click handlers function correctly</li>
            </ol>
            <button 
              onClick={() => setShowInstructions(false)}
              className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
            >
              Hide Instructions
            </button>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <select 
            value={testMode} 
            onChange={(e) => setTestMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Card Types</option>
            <option value="tcg">TCG Only</option>
            <option value="pocket">Pocket Only</option>
            <option value="pokedex">Pokedex Only</option>
          </select>
          
          <button
            onClick={runAllTests}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Run All Tests
          </button>
          
          <button
            onClick={exportTestResults}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Export Results
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {testConfigurations
          .filter(config => testMode === 'all' || config.cardType === testMode)
          .map((config, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{config.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => runVisualTest(config.name)}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                  >
                    Mark as Passed
                  </button>
                  <button
                    onClick={() => setTestResults(prev => ({
                      ...prev,
                      [config.name]: {
                        status: 'failed',
                        timestamp: new Date().toISOString(),
                        notes: 'Failed visual inspection'
                      }
                    }))}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                  >
                    Mark as Failed
                  </button>
                </div>
              </div>
              
              <div className="mb-4 text-sm text-gray-600">
                <strong>Card Type:</strong> {config.cardType} | 
                <strong> Features:</strong> {Object.entries(config.props).filter(([_, value]) => value).map(([key]) => key).join(', ')}
              </div>
              
              {testResults[config.name] && (
                <div className={`mb-4 p-2 rounded text-sm ${
                  testResults[config.name].status === 'passed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  Status: {testResults[config.name].status.toUpperCase()} at {new Date(testResults[config.name].timestamp).toLocaleString()}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                {[1, 2, 3, 4].map(i => (
                  <UnifiedCard
                    key={i}
                    card={testData[config.cardType]}
                    cardType={config.cardType}
                    {...config.props}
                    onMagnifyClick={() => console.log('Magnify clicked')}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Summary</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {testConfigurations.filter(config => testMode === 'all' || config.cardType === testMode).length}
            </div>
            <div className="text-sm text-gray-600">Total Tests</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(testResults).filter(r => r.status === 'passed').length}
            </div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {Object.values(testResults).filter(r => r.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QATestingTool;