import React from 'react';
import { FaStar } from 'react-icons/fa';

interface BaseStatsRankingProps {
  totalStats: number;
}

const getStatRating = (total: number): { label: string; color: string; bgColor: string } => {
  if (total >= 600) return { label: 'Legendary', color: 'text-purple-600', bgColor: 'bg-purple-500' };
  if (total >= 540) return { label: 'Excellent', color: 'text-indigo-600', bgColor: 'bg-indigo-500' };
  if (total >= 500) return { label: 'Very Strong', color: 'text-emerald-600', bgColor: 'bg-emerald-500' };
  if (total >= 450) return { label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' };
  if (total >= 400) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-500' };
  if (total >= 350) return { label: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
  if (total >= 300) return { label: 'Below Average', color: 'text-orange-600', bgColor: 'bg-orange-500' };
  return { label: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' };
};

export const BaseStatsRanking: React.FC<BaseStatsRankingProps> = ({ totalStats }) => {
  const rating = getStatRating(totalStats);
  
  return (
    <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center shadow-md shadow-cyan-500/10">
          <FaStar className="w-5 h-5 text-cyan-400" />
        </div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-cyan-400">Base Stats Ranking</h3>
      </div>
      
      <div className="text-center">
        <div className="text-5xl font-bold mb-3" style={{ color: 'rgb(23, 162, 184)' }}>
          {totalStats}
        </div>
        
        <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-white text-sm font-medium ${rating.bgColor}`}>
          {rating.label}
        </div>
      </div>
    </div>
  );
};

export default BaseStatsRanking;