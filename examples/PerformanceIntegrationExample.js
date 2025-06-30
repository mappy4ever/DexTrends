/**
 * Performance Integration Example
 * Demonstrates how to integrate all performance optimizations in your DexTrends app
 */

import React from 'react';
import { PerformanceProvider, usePerformance } from '../components/providers/PerformanceProvider';
import PerformanceDashboard from '../components/ui/PerformanceDashboard';
import VirtualizedCardGrid from '../components/ui/VirtualizedCardGrid';
import OptimizedImage from '../components/ui/OptimizedImage';
import { withOptimizations } from '../utils/reactOptimizations';
import { optimizedFetch } from '../utils/apiOptimizations';

// Example of an optimized card list component
const OptimizedCardList = withOptimizations(({ cards, onCardClick }) => {
  return (
    <div className="min-h-screen">
      <VirtualizedCardGrid
        cards={cards}
        cardType="tcg"
        showPrice={true}
        showSet={true}
        showTypes={true}
        onCardClick={onCardClick}
        enableSmoothing={true}
        hasMore={cards.length < 1000}
        onLoadMore={async () => {
          // Simulate loading more cards with optimized fetch
          return optimizedFetch('/api/cards', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
        }}
      />
    </div>
  );
}, {
  enableMemo: true,
  enableProfiling: true,
  enableSuggestions: true
});

// Example of an optimized card component
const OptimizedCard = withOptimizations(({ card }) => {
  return (
    <div className="card-container">
      <OptimizedImage
        src={card.images?.small}
        alt={card.name}
        width={245}
        height={342}
        enableProgressiveLoading={true}
        enableLazyLoading={true}
        enableMonitoring={true}
        format="webp"
        className="rounded-lg shadow-md"
      />
      <h3 className="mt-2 font-semibold">{card.name}</h3>
      <p className="text-sm text-gray-600">{card.set?.name}</p>
    </div>
  );
});

// Example page component with performance monitoring
const PerformanceOptimizedPage = () => {
  const [cards, setCards] = React.useState([]);
  const [showDashboard, setShowDashboard] = React.useState(false);
  const { runPerformanceTests, getReport, suggestions } = usePerformance();

  // Load cards with optimized fetch
  React.useEffect(() => {
    const loadCards = async () => {
      try {
        const data = await optimizedFetch('/api/cards?limit=100');
        setCards(data.cards || []);
      } catch (error) {
        console.error('Failed to load cards:', error);
      }
    };

    loadCards();
  }, []);

  // Run performance tests periodically
  React.useEffect(() => {
    const runTests = async () => {
      try {
        const results = await runPerformanceTests();
        console.log('Performance test results:', results);
      } catch (error) {
        console.error('Performance tests failed:', error);
      }
    };

    // Run tests every 5 minutes
    const interval = setInterval(runTests, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [runPerformanceTests]);

  const handleDownloadReport = () => {
    const report = getReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Performance Controls */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Performance Optimized Cards</h1>
        <div className="flex items-center space-x-4">
          {suggestions.length > 0 && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              {suggestions.length} performance suggestions
            </div>
          )}
          <button
            onClick={() => setShowDashboard(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Performance Dashboard
          </button>
          <button
            onClick={handleDownloadReport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Performance Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Performance Suggestions:</h3>
          <ul className="space-y-1">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <li key={index} className="text-yellow-700 text-sm">
                • {suggestion.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optimized Card Grid */}
      <OptimizedCardList 
        cards={cards}
        onCardClick={(card) => {
          console.log('Card clicked:', card.name);
          // Navigate to card details with performance tracking
        }}
      />

      {/* Performance Dashboard */}
      <PerformanceDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </div>
  );
};

// Main App component with Performance Provider
const App = () => {
  return (
    <PerformanceProvider enabledByDefault={true} testingMode={process.env.NODE_ENV === 'development'}>
      <PerformanceOptimizedPage />
    </PerformanceProvider>
  );
};

export default App;

// Usage examples for different scenarios:

// 1. For existing components, wrap with performance monitoring:
/*
const ExistingComponent = ({ data }) => {
  return <div>{data.map(item => <Item key={item.id} item={item} />)}</div>;
};

const OptimizedExistingComponent = withOptimizations(ExistingComponent, {
  enableMemo: true,
  enableProfiling: true
});
*/

// 2. For API calls, use optimized fetch:
/*
const fetchCardData = async (cardId) => {
  return optimizedFetch(`/api/cards/${cardId}`, {
    method: 'GET',
    // This will automatically cache, retry on failure, and monitor performance
  });
};
*/

// 3. For images, use OptimizedImage:
/*
<OptimizedImage
  src={card.images?.large}
  alt={card.name}
  width={400}
  height={560}
  enableProgressiveLoading={true}
  enableLazyLoading={true}
  enableMonitoring={true}
  format="webp"
  priority={card.featured} // High priority for featured cards
/>
*/

// 4. For large lists, use VirtualizedCardGrid:
/*
<VirtualizedCardGrid
  cards={allCards}
  cardType="tcg"
  minCardWidth={200}
  cardHeight={320}
  hasMore={hasMoreCards}
  onLoadMore={loadMoreCards}
  enableSmoothing={true}
/>
*/

// 5. Performance testing in development:
/*
import { runBasicPerformanceTests } from '../utils/performanceTests';

const runTests = async () => {
  const results = await runBasicPerformanceTests();
  console.log('Performance Results:', results);
  
  if (results.summary.successRate < 80) {
    console.warn('Performance tests failing, check recommendations');
  }
};
*/