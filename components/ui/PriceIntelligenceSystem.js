import React, { useState, useEffect, useMemo } from 'react';
import { FaChartLine, FaTrendingUp, FaTrendingDown, FaBrain, FaRobot, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { BsLightningFill, BsGraphUp, BsGraphDown, BsArrowUp, BsArrowDown } from 'react-icons/bs';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ScatterController,
  Title,
  Tooltip,
  Legend
);

export default function PriceIntelligenceSystem({ cardId, onPredictionUpdate }) {
  const [predictions, setPredictions] = useState(null);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [confidence, setConfidence] = useState(0);
  const [factors, setFactors] = useState([]);
  const [similarCards, setSimilarCards] = useState([]);

  useEffect(() => {
    if (cardId) {
      generatePricePredictions();
    }
  }, [cardId, timeframe]);

  const generatePricePredictions = async () => {
    setLoading(true);
    try {
      // Simulate AI prediction algorithm
      await new Promise(resolve => setTimeout(resolve, 2000));

      const currentPrice = Math.random() * 200 + 50; // $50-$250 range
      const volatility = Math.random() * 0.3 + 0.1; // 10-40% volatility
      
      // Generate prediction data points
      const predictions = generatePredictionPoints(currentPrice, volatility, timeframe);
      const analysis = generateMarketAnalysis(currentPrice, volatility);
      const factors = generatePriceFactors();
      const similar = generateSimilarCards(currentPrice);

      setPredictions(predictions);
      setMarketAnalysis(analysis);
      setFactors(factors);
      setSimilarCards(similar);
      setConfidence(Math.random() * 0.4 + 0.6); // 60-100% confidence

      onPredictionUpdate?.({
        predictions,
        analysis,
        confidence: confidence
      });

    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictionPoints = (basePrice, volatility, timeframe) => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const points = [];
    let currentPrice = basePrice;
    
    // Historical data (past 30 days)
    for (let i = -30; i <= 0; i++) {
      const randomChange = (Math.random() - 0.5) * volatility * 0.1;
      currentPrice += currentPrice * randomChange;
      points.push({
        x: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        y: Math.max(currentPrice, 5),
        type: 'historical'
      });
    }

    // Future predictions
    currentPrice = basePrice;
    for (let i = 1; i <= days; i++) {
      // Apply trend and volatility
      const trendFactor = Math.sin(i / days * Math.PI) * 0.2; // Cyclical trend
      const randomFactor = (Math.random() - 0.5) * volatility * 0.15;
      const seasonalFactor = Math.cos(i / 365 * 2 * Math.PI) * 0.1; // Seasonal
      
      currentPrice *= (1 + trendFactor + randomFactor + seasonalFactor);
      points.push({
        x: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        y: Math.max(currentPrice, 5),
        type: 'prediction',
        confidence: Math.max(0.9 - (i / days) * 0.4, 0.5) // Decreasing confidence
      });
    }

    return points;
  };

  const generateMarketAnalysis = (basePrice, volatility) => {
    const sentiment = Math.random() > 0.5 ? 'bullish' : 'bearish';
    const strength = Math.random() * 0.5 + 0.3; // 30-80%
    
    return {
      sentiment,
      strength,
      riskLevel: volatility > 0.25 ? 'high' : volatility > 0.15 ? 'medium' : 'low',
      recommendation: sentiment === 'bullish' ? 'buy' : 'hold',
      targetPrice: {
        low: basePrice * (sentiment === 'bullish' ? 1.1 : 0.9),
        high: basePrice * (sentiment === 'bullish' ? 1.3 : 1.1),
        timeframe: '30 days'
      },
      volume: {
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        change: Math.random() * 50 + 10 // 10-60%
      },
      marketCap: basePrice * (Math.random() * 1000 + 500), // Mock market cap
      liquidityScore: Math.random() * 40 + 60 // 60-100
    };
  };

  const generatePriceFactors = () => {
    const allFactors = [
      {
        name: 'Tournament Meta Relevance',
        impact: Math.random() * 0.4 + 0.1,
        direction: Math.random() > 0.5 ? 'positive' : 'negative',
        description: 'Card performance in competitive tournaments',
        weight: 0.25
      },
      {
        name: 'Set Rotation Impact',
        impact: Math.random() * 0.3 + 0.1,
        direction: Math.random() > 0.5 ? 'positive' : 'negative',
        description: 'Upcoming set rotation effects',
        weight: 0.2
      },
      {
        name: 'Card Rarity & Supply',
        impact: Math.random() * 0.5 + 0.2,
        direction: 'positive',
        description: 'Limited supply driving demand',
        weight: 0.2
      },
      {
        name: 'Social Media Buzz',
        impact: Math.random() * 0.3 + 0.05,
        direction: Math.random() > 0.3 ? 'positive' : 'negative',
        description: 'Community discussion and hype',
        weight: 0.15
      },
      {
        name: 'New Card Synergies',
        impact: Math.random() * 0.25 + 0.05,
        direction: Math.random() > 0.6 ? 'positive' : 'neutral',
        description: 'Synergy with newly released cards',
        weight: 0.1
      },
      {
        name: 'Collector Interest',
        impact: Math.random() * 0.35 + 0.1,
        direction: Math.random() > 0.4 ? 'positive' : 'neutral',
        description: 'Investment and collection demand',
        weight: 0.1
      }
    ];

    return allFactors
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .sort((a, b) => b.impact - a.impact);
  };

  const generateSimilarCards = (basePrice) => {
    return [
      {
        id: 'similar-1',
        name: 'Charizard ex',
        currentPrice: basePrice * (0.8 + Math.random() * 0.4),
        priceChange: (Math.random() - 0.5) * 0.3,
        correlation: 0.85,
        reason: 'Same rarity and competitive viability'
      },
      {
        id: 'similar-2',
        name: 'Blastoise VMAX',
        currentPrice: basePrice * (0.7 + Math.random() * 0.6),
        priceChange: (Math.random() - 0.5) * 0.25,
        correlation: 0.72,
        reason: 'Similar meta position and set'
      },
      {
        id: 'similar-3',
        name: 'Venusaur V',
        currentPrice: basePrice * (0.6 + Math.random() * 0.8),
        priceChange: (Math.random() - 0.5) * 0.4,
        correlation: 0.68,
        reason: 'Comparable tournament usage'
      }
    ];
  };

  const chartData = useMemo(() => {
    if (!predictions) return null;

    const historical = predictions.filter(p => p.type === 'historical');
    const future = predictions.filter(p => p.type === 'prediction');

    return {
      datasets: [
        {
          label: 'Historical Prices',
          data: historical,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.1
        },
        {
          label: 'AI Predictions',
          data: future,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 3,
          tension: 0.1
        }
      ]
    };
  }, [predictions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day'
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Price ($)'
        },
        beginAtZero: false
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const point = context.raw;
            let label = `$${point.y.toFixed(2)}`;
            if (point.confidence) {
              label += ` (${Math.round(point.confidence * 100)}% confidence)`;
            }
            return label;
          }
        }
      }
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600';
      case 'bearish': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-3">
              <FaBrain className="w-6 h-6 text-blue-500 animate-spin" />
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
            </div>
            <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="price-intelligence-system space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaBrain className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">AI Price Intelligence</h2>
              <p className="text-blue-100">Advanced market predictions powered by machine learning</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Confidence Score</div>
            <div className="text-3xl font-bold">{Math.round(confidence * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-2">
        {['7d', '30d', '90d'].map(period => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeframe === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Price Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FaChartLine className="mr-2" />
            Price Prediction Chart
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <FaRobot />
            <span>AI-Generated Forecast</span>
          </div>
        </div>
        
        <div className="h-80">
          {chartData && (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Market Analysis */}
      {marketAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BsGraphUp className="mr-2" />
              Market Sentiment
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Overall Sentiment</span>
                <div className="flex items-center space-x-2">
                  {marketAnalysis.sentiment === 'bullish' ? (
                    <BsArrowUp className="text-green-500" />
                  ) : (
                    <BsArrowDown className="text-red-500" />
                  )}
                  <span className={`font-medium capitalize ${getSentimentColor(marketAnalysis.sentiment)}`}>
                    {marketAnalysis.sentiment}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Signal Strength</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
        style={{ width: `${marketAnalysis.strength * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round(marketAnalysis.strength * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Risk Level</span>
                <span className={`font-medium capitalize ${getRiskColor(marketAnalysis.riskLevel)}`}>
                  {marketAnalysis.riskLevel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Recommendation</span>
                <span className={`font-medium uppercase px-2 py-1 rounded text-xs ${
                  marketAnalysis.recommendation === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  marketAnalysis.recommendation === 'sell' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {marketAnalysis.recommendation}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Price Targets
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target Range ({marketAnalysis.targetPrice.timeframe})</div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Low: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${marketAnalysis.targetPrice.low.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">High: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${marketAnalysis.targetPrice.high.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {marketAnalysis.liquidityScore.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Liquidity Score</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {marketAnalysis.volume.change.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Volume Change</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Factors */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <BsLightningFill className="mr-2 text-yellow-500" />
          Key Price Factors
        </h3>
        
        <div className="space-y-4">
          {factors.map((factor, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{factor.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{factor.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {factor.direction === 'positive' ? (
                    <FaTrendingUp className="text-green-500" />
                  ) : factor.direction === 'negative' ? (
                    <FaTrendingDown className="text-red-500" />
                  ) : (
                    <FaInfoCircle className="text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    factor.direction === 'positive' ? 'text-green-600' :
                    factor.direction === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {Math.round(factor.impact * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      factor.direction === 'positive' ? 'bg-green-500' :
                      factor.direction === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${factor.impact * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Weight: {Math.round(factor.weight * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Cards Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Similar Cards Correlation
        </h3>
        
        <div className="space-y-3">
          {similarCards.map((card, index) => (
            <div key={card.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{card.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{card.reason}</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    ${card.currentPrice.toFixed(2)}
                  </div>
                  <div className={`text-sm ${
                    card.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.priceChange >= 0 ? '+' : ''}{(card.priceChange * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Correlation</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {Math.round(card.correlation * 100)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <strong>Disclaimer:</strong> These predictions are generated by AI algorithms and should not be considered as financial advice. 
            Card prices are subject to market volatility and various unpredictable factors. Always do your own research before making investment decisions.
          </div>
        </div>
      </div>
    </div>
  );
}