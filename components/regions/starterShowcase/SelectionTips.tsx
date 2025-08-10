import React from 'react';
import { BsController } from 'react-icons/bs';

interface SelectionTipsProps {
  theme: string;
}

export const SelectionTips: React.FC<SelectionTipsProps> = ({ theme }) => {
  return (
    <div className="mt-12 text-center">
      <div className={`inline-block p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <h3 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
          <BsController className="text-blue-500" />
          Choosing Your Starter
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
          Your starter Pokémon will be your first partner on your journey. Consider their type advantages 
          against early gym leaders, their evolution potential, and which one you connect with most!
        </p>
      </div>
    </div>
  );
};