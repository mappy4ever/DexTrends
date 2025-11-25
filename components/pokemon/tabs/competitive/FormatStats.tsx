import React from 'react';

interface FormatStatsProps {
  stats?: any;
  pokemon?: any;
  species?: any;
  competitiveTiers?: any;
  estimatedTier?: any;
  formatEligibility?: any;
  usageStats?: any;
  baseStatTotal?: any;
}

export const FormatStats: React.FC<FormatStatsProps> = ({ stats, pokemon }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-2">Format Statistics</h3>
      <p className="text-gray-500 dark:text-gray-400">Format stats coming soon...</p>
    </div>
  );
};

export default FormatStats;