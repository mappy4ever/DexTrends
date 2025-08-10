import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import Modal from './modals/Modal';
import { useNotifications } from '../../hooks/useNotifications';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Type definitions
interface CardImage {
  small?: string;
  large?: string;
}

interface CardSet {
  id: string;
  name: string;
}

interface Card {
  id: string;
  name: string;
  images?: CardImage;
  set?: CardSet;
  rarity?: string;
  marketPrice?: string | number;
  currentPrice?: string | number;
}

interface PortfolioCard extends Card {
  originalId: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  condition: string;
  notes: string;
  addedToPortfolio: string;
}

interface Portfolio {
  id: string;
  name: string;
  description: string;
  type: 'collection' | 'investment' | 'trading' | 'graded';
  cards: PortfolioCard[];
  created: string;
}

interface PerformanceData {
  cost: number;
  current: number;
  count: number;
  gainLoss?: number;
  gainLossPercent?: number;
}

interface CardPerformance extends PortfolioCard {
  currentPrice: number;
  gainLoss: number;
  gainLossPercent: number;
  currentValue: number;
  costBasis: number;
}

interface MonthlyData {
  month: string;
  value: number;
  invested: number;
}

interface PortfolioMetrics {
  totalCost: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  performanceByRarity: Record<string, PerformanceData>;
  cardPerformance: CardPerformance[];
  topGainers: CardPerformance[];
  topLosers: CardPerformance[];
  highValueCards: CardPerformance[];
  diversificationScore: number;
  monthlyData: MonthlyData[];
  totalCards: number;
  uniqueCards: number;
}

interface CardEntry {
  quantity: number;
  purchasePrice: string;
  purchaseDate: string;
  condition: string;
  notes: string;
}

interface PortfolioManagerProps {
  userCards?: Card[];
  onUpdateCard?: (card: Card) => void;
}

/**
 * Advanced Portfolio Management System
 * Investment tracking, performance analysis, and portfolio optimization
 */
const PortfolioManager: React.FC<PortfolioManagerProps> = ({ userCards = [], onUpdateCard }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('1M');
  const [newPortfolio, setNewPortfolio] = useState<{ name: string; description: string; type: Portfolio['type'] }>({ name: '', description: '', type: 'collection' });
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [cardEntry, setCardEntry] = useState<CardEntry>({
    quantity: 1,
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    condition: 'Near Mint',
    notes: ''
  });
  const { notify } = useNotifications();

  // Load portfolios from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cardPortfolios');
    if (saved) {
      const parsedPortfolios = JSON.parse(saved) as Portfolio[];
      setPortfolios(parsedPortfolios);
      // Use functional setState to avoid dependency on selectedPortfolio
      setSelectedPortfolio(current => {
        if (!current && parsedPortfolios.length > 0) {
          return parsedPortfolios[0];
        }
        return current;
      });
    } else {
      // Create default portfolio
      const defaultPortfolio: Portfolio = {
        id: 'default',
        name: 'My Collection',
        description: 'Main card collection',
        type: 'collection',
        cards: [],
        created: new Date().toISOString()
      };
      setPortfolios([defaultPortfolio]);
      setSelectedPortfolio(defaultPortfolio);
    }
  }, []); // Only run on mount

  // Save portfolios to localStorage
  const savePortfolios = (newPortfolios: Portfolio[]) => {
    setPortfolios(newPortfolios);
    localStorage.setItem('cardPortfolios', JSON.stringify(newPortfolios));
  };

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo<PortfolioMetrics | null>(() => {
    if (!selectedPortfolio || !selectedPortfolio.cards.length) return null;

    const cards = selectedPortfolio.cards;
    const totalCost = cards.reduce((sum, card) => sum + (card.purchasePrice * card.quantity), 0);
    const currentValue = cards.reduce((sum, card) => {
      const currentPrice = parseFloat(String(card.currentPrice || card.marketPrice || card.purchasePrice));
      return sum + (currentPrice * card.quantity);
    }, 0);
    
    const totalGainLoss = currentValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0;

    // Performance by category
    const performanceByRarity = cards.reduce<Record<string, PerformanceData>>((acc, card) => {
      const rarity = card.rarity || 'Unknown';
      const cost = card.purchasePrice * card.quantity;
      const current = (parseFloat(String(card.currentPrice || card.marketPrice || card.purchasePrice))) * card.quantity;
      
      if (!acc[rarity]) {
        acc[rarity] = { cost: 0, current: 0, count: 0 };
      }
      acc[rarity].cost += cost;
      acc[rarity].current += current;
      acc[rarity].count += card.quantity;
      return acc;
    }, {});

    // Calculate performance per rarity
    Object.keys(performanceByRarity).forEach(rarity => {
      const data = performanceByRarity[rarity];
      data.gainLoss = data.current - data.cost;
      data.gainLossPercent = data.cost > 0 ? ((data.current - data.cost) / data.cost) * 100 : 0;
    });

    // Top performers
    const cardPerformance: CardPerformance[] = cards.map(card => {
      const currentPrice = parseFloat(String(card.currentPrice || card.marketPrice || card.purchasePrice));
      const gainLoss = (currentPrice - card.purchasePrice) * card.quantity;
      const gainLossPercent = ((currentPrice - card.purchasePrice) / card.purchasePrice) * 100;
      
      return {
        ...card,
        currentPrice,
        gainLoss,
        gainLossPercent,
        currentValue: currentPrice * card.quantity,
        costBasis: card.purchasePrice * card.quantity
      };
    });

    const topGainers = cardPerformance
      .filter(card => card.gainLoss > 0)
      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
      .slice(0, 5);

    const topLosers = cardPerformance
      .filter(card => card.gainLoss < 0)
      .sort((a, b) => a.gainLossPercent - b.gainLossPercent)
      .slice(0, 5);

    // Risk analysis
    const highValueCards = cardPerformance.filter(card => card.currentValue > 100);
    const diversificationScore = Object.keys(performanceByRarity).length / Math.max(1, cards.length / 10);
    
    // Monthly breakdown (mock data for demonstration)
    const monthlyData = generateMonthlyData(totalCost, currentValue);

    return {
      totalCost,
      currentValue,
      totalGainLoss,
      totalGainLossPercent,
      performanceByRarity,
      cardPerformance,
      topGainers,
      topLosers,
      highValueCards,
      diversificationScore,
      monthlyData,
      totalCards: cards.reduce((sum, card) => sum + card.quantity, 0),
      uniqueCards: cards.length
    };
  }, [selectedPortfolio]);

  // Generate mock monthly performance data
  const generateMonthlyData = (cost: number, current: number): MonthlyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const start = cost;
    const end = current;
    const step = (end - start) / (months.length - 1);
    
    return months.map((month, index) => ({
      month,
      value: start + (step * index) + (Math.random() * 100 - 50), // Add some randomness
      invested: start + (index * 100) // Gradual investment
    }));
  };

  // Create new portfolio
  const createPortfolio = () => {
    if (!newPortfolio.name.trim()) {
      notify.error('Portfolio name is required');
      return;
    }

    const portfolio: Portfolio = {
      id: Date.now().toString(),
      ...newPortfolio,
      cards: [],
      created: new Date().toISOString()
    };

    const updatedPortfolios = [...portfolios, portfolio];
    savePortfolios(updatedPortfolios);
    setSelectedPortfolio(portfolio);
    setShowCreateModal(false);
    setNewPortfolio({ name: '', description: '', type: 'collection' });
    notify.success('Portfolio created successfully');
  };

  // Add card to portfolio
  const addCardToPortfolio = () => {
    if (!selectedCard || !cardEntry.purchasePrice) {
      notify.error('Please select a card and enter purchase details');
      return;
    }

    const portfolioCard: PortfolioCard = {
      ...selectedCard,
      id: `${selectedCard.id}_${Date.now()}`,
      originalId: selectedCard.id,
      quantity: parseInt(String(cardEntry.quantity)),
      purchasePrice: parseFloat(cardEntry.purchasePrice),
      purchaseDate: cardEntry.purchaseDate,
      condition: cardEntry.condition,
      notes: cardEntry.notes,
      addedToPortfolio: new Date().toISOString()
    };

    const updatedPortfolio: Portfolio = {
      ...selectedPortfolio!,
      cards: [...selectedPortfolio!.cards, portfolioCard]
    };

    const updatedPortfolios = portfolios.map(p => 
      p.id === selectedPortfolio!.id ? updatedPortfolio : p
    );

    savePortfolios(updatedPortfolios);
    setSelectedPortfolio(updatedPortfolio);
    setShowAddCardModal(false);
    setSelectedCard(null);
    setCardEntry({
      quantity: 1,
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      condition: 'Near Mint',
      notes: ''
    });
    notify.success('Card added to portfolio');
  };

  // Remove card from portfolio
  const removeCardFromPortfolio = (cardId: string) => {
    const updatedPortfolio: Portfolio = {
      ...selectedPortfolio!,
      cards: selectedPortfolio!.cards.filter(card => card.id !== cardId)
    };

    const updatedPortfolios = portfolios.map(p => 
      p.id === selectedPortfolio!.id ? updatedPortfolio : p
    );

    savePortfolios(updatedPortfolios);
    setSelectedPortfolio(updatedPortfolio);
    notify.success('Card removed from portfolio');
  };

  // Chart configurations
  const performanceChart = portfolioMetrics ? {
    data: {
      labels: portfolioMetrics.monthlyData.map(d => d.month),
      datasets: [
        {
          label: 'Portfolio Value',
          data: portfolioMetrics.monthlyData.map(d => d.value),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Money Invested',
          data: portfolioMetrics.monthlyData.map(d => d.invested),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: 'Portfolio Performance Over Time' }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value: unknown) {
              return '$' + Number(value).toLocaleString();
            }
          }
        }
      }
    }
  } : null;

  const allocationChart = portfolioMetrics ? {
    data: {
      labels: Object.keys(portfolioMetrics.performanceByRarity),
      datasets: [
        {
          data: Object.values(portfolioMetrics.performanceByRarity).map(r => r.current),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' as const },
        title: { display: true, text: 'Portfolio Allocation by Rarity' }
      }
    }
  } : null;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <ChartPieIcon className="h-5 w-5" /> },
    { id: 'holdings', name: 'Holdings', icon: <BanknotesIcon className="h-5 w-5" /> },
    { id: 'performance', name: 'Performance', icon: <ArrowTrendingUpIcon className="h-5 w-5" /> },
    { id: 'analysis', name: 'Analysis', icon: <EyeIcon className="h-5 w-5" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <ChartPieIcon className="h-6 w-6 mr-2 text-purple-500" />
            Portfolio Manager
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your investments and analyze performance
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedPortfolio?.id || ''}
            onChange={(e) => {
              const portfolio = portfolios.find(p => p.id === e.target.value);
              setSelectedPortfolio(portfolio || null);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            {portfolios.map(portfolio => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Portfolio</span>
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      {portfolioMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${portfolioMetrics.currentValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${portfolioMetrics.totalCost.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <div className="flex items-center">
              {portfolioMetrics.totalGainLoss >= 0 ? 
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" /> :
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-500" />
              }
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gain/Loss</p>
                <p className={`text-2xl font-bold ${
                  portfolioMetrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {portfolioMetrics.totalGainLoss >= 0 ? '+' : ''}${portfolioMetrics.totalGainLoss.toLocaleString()}
                </p>
                <p className={`text-sm ${
                  portfolioMetrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ({portfolioMetrics.totalGainLossPercent.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <ChartPieIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cards</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolioMetrics.totalCards}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {portfolioMetrics.uniqueCards} unique
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && portfolioMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {performanceChart && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
              <Line data={performanceChart.data} options={performanceChart.options} />
            </div>
          )}
          
          {allocationChart && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
              <Doughnut data={allocationChart.data} options={allocationChart.options} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'holdings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Portfolio Holdings
            </h3>
            <button
              onClick={() => setShowAddCardModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Card</span>
            </button>
          </div>

          {selectedPortfolio?.cards.length ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Card
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cost Basis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Gain/Loss
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedPortfolio.cards.map((card) => {
                      const currentPrice = parseFloat(String(card.currentPrice || card.marketPrice || card.purchasePrice));
                      const costBasis = card.purchasePrice * card.quantity;
                      const currentValue = currentPrice * card.quantity;
                      const gainLoss = currentValue - costBasis;
                      const gainLossPercent = ((currentPrice - card.purchasePrice) / card.purchasePrice) * 100;

                      return (
                        <tr key={card.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                className="h-12 w-8 object-cover rounded" 
                                src={card.images?.small || '/back-card.png'} 
                                alt={card.name}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {card.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {card.set?.name} • {card.condition}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {card.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${costBasis.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${currentValue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
                            </div>
                            <div className={`text-xs ${
                              gainLoss >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              ({gainLossPercent.toFixed(1)}%)
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => removeCardFromPortfolio(card.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border">
              <ChartPieIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No cards in portfolio
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your portfolio by adding cards
              </p>
              <button
                onClick={() => setShowAddCardModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Card
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'performance' && portfolioMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
              Top Performers
            </h3>
            <div className="space-y-3">
              {portfolioMetrics.topGainers.map((card) => (
                <div key={card.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{card.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {card.quantity} cards • {card.set?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      +${card.gainLoss.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-500">
                      +{card.gainLossPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ArrowTrendingDownIcon className="h-5 w-5 mr-2 text-red-500" />
              Underperformers
            </h3>
            <div className="space-y-3">
              {portfolioMetrics.topLosers.length > 0 ? portfolioMetrics.topLosers.map((card) => (
                <div key={card.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{card.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {card.quantity} cards • {card.set?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      ${card.gainLoss.toFixed(2)}
                    </p>
                    <p className="text-sm text-red-500">
                      {card.gainLossPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <CheckCircleIcon className="h-8 w-8 mx-auto mb-2" />
                  <p>All cards are performing well!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && portfolioMetrics && (
        <div className="space-y-6">
          {/* Risk Analysis */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-500" />
              Risk Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {portfolioMetrics.diversificationScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Diversification Score
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {portfolioMetrics.diversificationScore >= 2 ? 'Well diversified' : 'Consider diversifying'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {portfolioMetrics.highValueCards.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  High Value Cards
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Cards worth $100+
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {((portfolioMetrics.currentValue / portfolioMetrics.totalCost - 1) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Return
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Since inception
                </div>
              </div>
            </div>
          </div>

          {/* Performance by Rarity */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance by Rarity
            </h3>
            <div className="space-y-4">
              {Object.entries(portfolioMetrics.performanceByRarity).map(([rarity, data]) => (
                <div key={rarity} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{rarity}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{data.count} cards</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      data.gainLoss! >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.gainLoss! >= 0 ? '+' : ''}${data.gainLoss!.toFixed(2)}
                    </div>
                    <div className={`text-sm ${
                      data.gainLoss! >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {data.gainLossPercent!.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Portfolio Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Portfolio">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Portfolio Name
            </label>
            <input
              type="text"
              value={newPortfolio.name}
              onChange={(e) => setNewPortfolio(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newPortfolio.description}
              onChange={(e) => setNewPortfolio(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Portfolio description..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={newPortfolio.type}
              onChange={(e) => setNewPortfolio(prev => ({ ...prev, type: e.target.value as Portfolio['type'] }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="collection">Collection</option>
              <option value="investment">Investment</option>
              <option value="trading">Trading</option>
              <option value="graded">Graded Cards</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={createPortfolio}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Portfolio
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Card Modal */}
      <Modal isOpen={showAddCardModal} onClose={() => setShowAddCardModal(false)} title="Add Card to Portfolio">
        <div className="space-y-4">
          {!selectedCard ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search for a card
              </label>
              <select
                onChange={(e) => {
                  const card = userCards.find(c => c.id === e.target.value);
                  setSelectedCard(card || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="">Select a card...</option>
                {userCards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.name} - {card.set?.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img 
                  src={selectedCard.images?.small || '/back-card.png'} 
                  alt={selectedCard.name}
                  className="w-12 h-16 object-cover rounded"  
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedCard.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{selectedCard.set?.name}</div>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={cardEntry.quantity}
                    onChange={(e) => setCardEntry(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Price ($)
                  </label>
                  <input
                    type="number"
                    value={cardEntry.purchasePrice}
                    onChange={(e) => setCardEntry(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={cardEntry.purchaseDate}
                    onChange={(e) => setCardEntry(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Condition
                  </label>
                  <select
                    value={cardEntry.condition}
                    onChange={(e) => setCardEntry(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="Mint">Mint</option>
                    <option value="Near Mint">Near Mint</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Light Played">Light Played</option>
                    <option value="Played">Played</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={cardEntry.notes}
                  onChange={(e) => setCardEntry(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="Any additional notes..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddCardModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={addCardToPortfolio}
              disabled={!selectedCard || !cardEntry.purchasePrice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Portfolio
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PortfolioManager;