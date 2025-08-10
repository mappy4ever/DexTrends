import React, { useState } from 'react';
import CardComparisonTool from './cards/CardComparisonTool';

interface Card {
  id?: string;
  name?: string;
  images?: { small?: string; large?: string };
  set?: { name?: string; releaseDate?: string };
  rarity?: string;
  hp?: string;
  types?: string[];
  artist?: string;
  attacks?: Array<{ name?: string; damage?: string; text?: string }>;
  weaknesses?: Array<{ type?: string; value?: string }>;
  resistances?: Array<{ type?: string; value?: string }>;
  retreatCost?: string[];
}

const ComparisonFAB = ({ selectedCards = [], className = '' }: { selectedCards?: Card[]; className?: string }) => {
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsComparisonOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 group ${className}`}
        title="Compare Cards"
        aria-label="Open card comparison tool"
      >
        <div className="flex items-center justify-center">
          <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        
        {/* Selection Counter Badge */}
        {selectedCards.length > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {selectedCards.length}
          </div>
        )}
      </button>

      {/* Tooltip */}
      <div className="fixed bottom-20 right-6 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
          Compare Cards
          {selectedCards.length > 0 && (
            <span className="ml-2 text-blue-300">({selectedCards.length} selected)</span>
          )}
        </div>
      </div>

      {/* Comparison Tool Modal */}
      <CardComparisonTool
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        initialCards={selectedCards}
      />
    </>
  );
};

export default ComparisonFAB;