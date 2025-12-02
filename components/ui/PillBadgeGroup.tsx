import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { PillBadge, PillBadgeProps } from './PillBadge';

export interface PillBadgeOption {
  id: string;
  label: string;
  value?: string | number;
  color?: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface PillBadgeGroupProps {
  options: PillBadgeOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  variant?: PillBadgeProps['variant'];
  size?: PillBadgeProps['size'];
  multiple?: boolean;
  showAll?: boolean;
  allLabel?: string;
  maxVisible?: number;
  sortable?: boolean;
  removable?: boolean;
  className?: string;
  groupClassName?: string;
  onSort?: (options: PillBadgeOption[]) => void;
}

export const PillBadgeGroup: React.FC<PillBadgeGroupProps> = ({
  options,
  value,
  onChange,
  variant = 'outlined',
  size = 'md',
  multiple = false,
  showAll = false,
  allLabel = 'All',
  maxVisible,
  sortable = false,
  removable = false,
  className,
  groupClassName,
  onSort
}) => {
  const [showMore, setShowMore] = useState(false);
  
  const selectedValues = useMemo(() => 
    Array.isArray(value) ? value : (value ? [value] : []),
  [value]);
  const visibleOptions = maxVisible && !showMore ? options.slice(0, maxVisible) : options;
  const hiddenCount = maxVisible ? Math.max(0, options.length - maxVisible) : 0;

  const handleSelect = useCallback((optionId: string) => {
    if (!onChange) return;

    if (optionId === 'all') {
      onChange(multiple ? [] : '');
      return;
    }

    if (multiple) {
      const newValues = selectedValues.includes(optionId)
        ? selectedValues.filter(v => v !== optionId)
        : [...selectedValues, optionId];
      onChange(newValues);
    } else {
      onChange(selectedValues.includes(optionId) ? '' : optionId);
    }
  }, [onChange, multiple, selectedValues]);

  const handleRemove = useCallback((optionId: string) => {
    if (!onChange || !removable) return;
    
    if (multiple) {
      onChange(selectedValues.filter(v => v !== optionId));
    } else if (selectedValues.includes(optionId)) {
      onChange('');
    }
  }, [onChange, removable, multiple, selectedValues]);

  const isAllSelected = selectedValues.length === 0;

  return (
    <div className={cn('pill-badge-group', groupClassName)}>
      <div className={cn(
        'flex flex-wrap items-center gap-2',
        className
      )}>
        {showAll && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <PillBadge
              label={allLabel}
              variant={variant}
              size={size}
              selected={isAllSelected}
              interactive
              onClick={() => handleSelect('all')}
            />
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {visibleOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: index * 0.03 }
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <PillBadge
                label={option.label}
                value={option.value}
                variant={variant}
                size={size}
                color={option.color}
                icon={option.icon}
                count={option.count}
                selected={selectedValues.includes(option.id)}
                disabled={option.disabled}
                interactive
                onClick={() => handleSelect(option.id)}
                onRemove={removable ? () => handleRemove(option.id) : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {hiddenCount > 0 && (
          <motion.button
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1 text-sm',
              'text-stone-600 dark:text-stone-300',
              'hover:text-stone-900 dark:hover:text-stone-100',
              'transition-colors duration-200'
            )}
            onClick={() => setShowMore(!showMore)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showMore ? (
              <>Show less</>
            ) : (
              <>+{hiddenCount} more</>
            )}
          </motion.button>
        )}
      </div>

      {selectedValues.length > 0 && onChange && (
        <motion.div
          className="mt-3 flex items-center gap-2 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-stone-600 dark:text-stone-300">
            {selectedValues.length} selected
          </span>
          <button
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            onClick={() => onChange(multiple ? [] : '')}
          >
            Clear all
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default PillBadgeGroup;