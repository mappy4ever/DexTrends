import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiDownload, FiTrash2, FiCopy, FiEdit } from 'react-icons/fi';
import { createGlassStyle } from './design-system/glass-constants';
import { GradientButton } from './design-system';

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
            className={`${createGlassStyle({
              blur: '3xl',
              opacity: 'strong',
              gradient: true,
              border: 'strong',
              shadow: 'glow',
              rounded: 'full',
            })} px-6 py-4 rounded-full flex items-center gap-4`}
          >
            {/* Checkbox */}
            <div className="flex items-center gap-3">
              <button
                onClick={isAllSelected ? onDeselectAll : onSelectAll}
                className={`${createGlassStyle({
                  blur: 'sm',
                  opacity: 'subtle',
                  gradient: false,
                  border: 'subtle',
                  shadow: 'sm',
                  rounded: 'md',
                })} w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110`}
              >
                {isAllSelected && (
                  <FiCheck className="w-4 h-4 text-amber-600" />
                )}
                {isPartiallySelected && !isAllSelected && (
                  <div className="w-2 h-2 bg-amber-600 rounded-sm" />
                )}
              </button>
              
              {showCount && (
                <div className="text-sm font-medium">
                  <span className="text-amber-600 dark:text-amber-400">
                    {selectedCount}
                  </span>
                  <span className="text-stone-600 dark:text-stone-300">
                    {' / '}
                    {totalCount} selected
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-stone-300 dark:bg-stone-600" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {displayActions.map((action) => {
                const variantStyles = {
                  primary: 'from-amber-500 to-amber-600',
                  secondary: 'from-amber-500 to-amber-600',
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
                        : createGlassStyle({
                            blur: 'md',
                            opacity: 'medium',
                            gradient: false,
                            border: 'medium',
                            shadow: 'sm',
                            rounded: 'full',
                          })
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
              className={`${createGlassStyle({
                blur: 'sm',
                opacity: 'subtle',
                gradient: false,
                border: 'subtle',
                shadow: 'sm',
                rounded: 'full',
              })} p-2 rounded-full hover:scale-110 transition-transform ml-2`}
            >
              <FiX className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkSelectionBar;