import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { CleanRaritySymbol } from './CleanRaritySymbol';
import type { CardSet } from '@/types/api/cards';

interface ProfessionalSetHeaderProps {
  setInfo: CardSet;
  cardCount: number;
  statistics: {
    rarityDistribution: Record<string, number>;
    valueByRarity: Record<string, { total: number; average: number; count: number }>;
    highestValueCards: Array<{ name: string; marketPrice: number; rarity?: string; images: { small: string } }>;
  };
  onScrollToCards?: () => void;
}

export const ProfessionalSetHeader: React.FC<ProfessionalSetHeaderProps> = ({
  setInfo,
  cardCount,
  statistics,
  onScrollToCards
}) => {
  // Calculate total set value
  const totalValue = Object.values(statistics.valueByRarity).reduce(
    (sum, data) => sum + data.total,
    0
  );

  // Get top rarities by count
  const topRarities = Object.entries(statistics.rarityDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Format date
  const releaseDate = new Date(setInfo.releaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Set Logo */}
            {setInfo.images?.logo && (
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                  <Image
                    src={setInfo.images.logo}
                    alt={setInfo.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            
            {/* Set Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {setInfo.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {setInfo.series} Series
              </p>
              
              {/* Key Info Pills */}
              <div className="flex flex-wrap gap-2">
                <InfoPill label="Released" value={releaseDate} />
                <InfoPill label="Set Size" value={`${setInfo.printedTotal} cards`} />
                {setInfo.ptcgoCode && <InfoPill label="Code" value={setInfo.ptcgoCode} />}
              </div>
            </div>
          </div>
          
          {/* Set Symbol */}
          {setInfo.images?.symbol && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 relative opacity-60">
                <Image
                  src={setInfo.images.symbol}
                  alt={`${setInfo.name} symbol`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Collection Stats */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Collection Overview
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total Cards"
              value={cardCount.toString()}
              subtext={`of ${setInfo.total}`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />
            <StatCard
              label="Est. Value"
              value={`$${totalValue.toFixed(0)}`}
              subtext="market price"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="Rarities"
              value={Object.keys(statistics.rarityDistribution).length.toString()}
              subtext="unique types"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
            />
            <StatCard
              label="Avg. Value"
              value={`$${cardCount > 0 ? (totalValue / cardCount).toFixed(2) : '0'}`}
              subtext="per card"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>
        </div>
        
        {/* Rarity Distribution */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Rarity Distribution
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
            {topRarities.map(([rarity, count]) => {
              const percentage = (count / cardCount) * 100;
              const valueData = statistics.valueByRarity[rarity];
              
              return (
                <div key={rarity} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CleanRaritySymbol rarity={rarity} size="xs" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {rarity}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {valueData && valueData.average > 0 && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Avg value: ${valueData.average.toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Top Value Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Most Valuable Cards
          </h3>
          <div className="space-y-2">
            {statistics.highestValueCards.length > 0 ? (
              statistics.highestValueCards.slice(0, 5).map((card, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={card.images.small}
                      alt={card.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {card.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {card.rarity && <CleanRaritySymbol rarity={card.rarity} size="xs" />}
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        ${card.marketPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No price data available
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Browse the complete collection below
          </p>
          <button
            onClick={onScrollToCards}
            className={cn(
              'px-4 py-2 rounded-lg',
              'bg-purple-600 hover:bg-purple-700 text-white',
              'font-medium text-sm',
              'transition-colors duration-200',
              'flex items-center gap-2'
            )}
          >
            <span>View Cards</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}: </span>
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{value}</span>
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
}> = ({ label, value, subtext, icon }) => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
    <div className="flex items-start justify-between mb-1">
      <div className="text-gray-400 dark:text-gray-500">
        {icon}
      </div>
    </div>
    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{subtext}</p>
    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{label}</p>
  </div>
);

export default ProfessionalSetHeader;