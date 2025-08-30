import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { FiX, FiFilter, FiCheck } from 'react-icons/fi';
import { cn } from '@/utils/cn';

interface FilterOption {
  id: string;
  label: string;
  value: string | number | boolean;
  icon?: React.ReactNode;
  color?: string;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'single' | 'multiple' | 'range';
  options: FilterOption[];
}

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, any>;
  onApplyFilters: (filters: Record<string, any>) => void;
  title?: string;
  showApplyButton?: boolean;
  className?: string;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  filterGroups,
  selectedFilters: initialFilters,
  onApplyFilters,
  title = "Filters",
  showApplyButton = true,
  className
}) => {
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState(0);

  useEffect(() => {
    setSelectedFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const height = sheetRef.current.scrollHeight;
      setSheetHeight(Math.min(height, window.innerHeight * 0.9));
    }
  }, [isOpen]);

  const handleDrag = (event: any, info: PanInfo) => {
    setDragY(info.offset.y);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.y;
    
    if (info.offset.y > threshold || velocity > 500) {
      onClose();
    }
    setDragY(0);
  };

  const toggleFilter = (groupId: string, optionId: string, type: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'single') {
        newFilters[groupId] = optionId;
      } else if (type === 'multiple') {
        if (!newFilters[groupId]) {
          newFilters[groupId] = [];
        }
        const index = newFilters[groupId].indexOf(optionId);
        if (index > -1) {
          newFilters[groupId] = newFilters[groupId].filter((id: string) => id !== optionId);
        } else {
          newFilters[groupId] = [...newFilters[groupId], optionId];
        }
      }
      
      return newFilters;
    });
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
    onClose();
  };

  const handleReset = () => {
    setSelectedFilters({});
  };

  const getFilterCount = () => {
    let count = 0;
    Object.values(selectedFilters).forEach(value => {
      if (Array.isArray(value)) {
        count += value.length;
      } else if (value) {
        count++;
      }
    });
    return count;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[999] md:hidden"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[1000] md:hidden",
              "bg-white dark:bg-gray-900 rounded-t-3xl",
              "shadow-2xl border-t border-gray-200 dark:border-gray-700",
              className
            )}
            initial={{ y: '100%' }}
            animate={{ 
              y: dragY > 0 ? dragY : 0,
              transition: { type: 'spring', damping: 30, stiffness: 300 }
            }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ maxHeight: '90vh' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <FiFilter className="text-xl text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
                {getFilterCount() > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                    {getFilterCount()}
                  </span>
                )}
              </div>
              <button
                onClick={handleReset}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Reset
              </button>
            </div>

            {/* Filter Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              {filterGroups.map((group) => (
                <div key={group.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <h3 className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50">
                    {group.label}
                  </h3>
                  
                  {/* Grid layout for filter options */}
                  <div className={cn(
                    "p-4 gap-3",
                    group.type === 'single' ? 'flex flex-wrap' : 'grid grid-cols-2'
                  )}>
                    {group.options.map((option) => {
                      const isSelected = group.type === 'single' 
                        ? selectedFilters[group.id] === option.id
                        : selectedFilters[group.id]?.includes(option.id);

                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleFilter(group.id, option.id, group.type)}
                          className={cn(
                            "relative flex items-center justify-center gap-2 px-4 py-3 rounded-2xl",
                            "font-medium text-sm transition-all duration-200",
                            "border-2 min-h-[48px]",
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
                            "hover:scale-[1.02] active:scale-[0.98]"
                          )}
                        >
                          {option.icon && <span className="text-base">{option.icon}</span>}
                          <span>{option.label}</span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1 right-1"
                            >
                              <FiCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with Apply Button */}
            {showApplyButton && (
              <div className="sticky bottom-0 px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-2xl hover:shadow-lg transition-all duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Filter Pills Component for showing active filters
export const FilterPills: React.FC<{
  activeFilters: Record<string, any>;
  filterGroups: FilterGroup[];
  onRemoveFilter: (groupId: string, optionId?: string) => void;
  className?: string;
}> = ({ activeFilters, filterGroups, onRemoveFilter, className }) => {
  const getFilterLabel = (groupId: string, optionId: string) => {
    const group = filterGroups.find(g => g.id === groupId);
    const option = group?.options.find(o => o.id === optionId);
    return option?.label || optionId;
  };

  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-hide py-2", className)}>
      {Object.entries(activeFilters).map(([groupId, value]) => {
        if (Array.isArray(value)) {
          return value.map((optionId: string) => (
            <motion.button
              key={`${groupId}-${optionId}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => onRemoveFilter(groupId, optionId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium whitespace-nowrap"
            >
              <span>{getFilterLabel(groupId, optionId)}</span>
              <FiX className="w-3.5 h-3.5" />
            </motion.button>
          ));
        } else if (value) {
          return (
            <motion.button
              key={groupId}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => onRemoveFilter(groupId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium whitespace-nowrap"
            >
              <span>{getFilterLabel(groupId, value)}</span>
              <FiX className="w-3.5 h-3.5" />
            </motion.button>
          );
        }
        return null;
      })}
    </div>
  );
};