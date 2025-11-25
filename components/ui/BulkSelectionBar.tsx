import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiDownload, FiTrash2, FiCopy, FiEdit } from 'react-icons/fi';
// Glass styles replaced with Tailwind classes - createGlassStyle removed
import Button from './Button';

interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

interface BulkSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  actions?: BulkAction[];
  className?: string;
  position?: 'top' | 'bottom';
  showCount?: boolean;
}

const BulkSelectionBar: React.FC<BulkSelectionBarProps> = ({
  selectedCount,
  totalCount,
  isAllSelected,
  isPartiallySelected,
  onSelectAll,
  onDeselectAll,
  actions = [],
  className = '',
  position = 'bottom',
  showCount = true,
}) => {
  const show = selectedCount > 0;

  const defaultActions: BulkAction[] = [
    {
      id: 'export',
      label: 'Export',
      icon: <FiDownload className="w-4 h-4" />,
      onClick: () => {},
      variant: 'secondary',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <FiTrash2 className="w-4 h-4" />,
      onClick: () => {},
      variant: 'danger',
    },
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className={`
            fixed ${position === 'bottom' ? 'bottom-4' : 'top-20'} 
            left-1/2 transform -translate-x-1/2 z-40
            ${className}
          `}
        >
          <div
            className="backdrop-blur-3xl bg-gradient-to-r from-white/90 via-white/80 to-white/90 dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/90 border border-white/40 dark:border-gray-700/40 shadow-2xl shadow-purple-500/20 px-6 py-4 rounded-full flex items-center gap-4"
          >
            {/* Checkbox */}
            <div className="flex items-center gap-3">
              <button
                onClick={isAllSelected ? onDeselectAll : onSelectAll}
                className="backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/20 shadow-sm w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110"
              >
                {isAllSelected && (
                  <FiCheck className="w-4 h-4 text-purple-600" />
                )}
                {isPartiallySelected && !isAllSelected && (
                  <div className="w-2 h-2 bg-purple-600 rounded-sm" />
                )}
              </button>
              
              {showCount && (
                <div className="text-sm font-medium">
                  <span className="text-purple-600 dark:text-purple-400">
                    {selectedCount}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {' / '}
                    {totalCount} selected
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {displayActions.map((action) => {
                const variantStyles = {
                  primary: 'from-purple-500 to-pink-500',
                  secondary: 'from-blue-500 to-cyan-500',
                  danger: 'from-red-500 to-orange-500',
                };

                return (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`
                      px-4 py-2 rounded-full font-medium text-sm
                      flex items-center gap-2 transition-all
                      ${action.disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:shadow-lg'
                      }
                      ${action.variant === 'danger'
                        ? `bg-gradient-to-r ${variantStyles.danger} text-white`
                        : action.variant === 'primary'
                        ? `bg-gradient-to-r ${variantStyles.primary} text-white`
                        : "backdrop-blur-md bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30 shadow-sm rounded-full"
                      }
                    `}
                  >
                    {action.icon}
                    {action.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Close Button */}
            <button
              onClick={onDeselectAll}
              className="backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/20 shadow-sm p-2 rounded-full hover:scale-110 transition-transform ml-2"
            >
              <FiX className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkSelectionBar;