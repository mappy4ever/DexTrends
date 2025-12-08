import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { cn } from '../../utils/cn';
import Button from './Button';
import { TRANSITION, SPRING_PHYSICS, TYPOGRAPHY } from './design-system/glass-constants';

// ===========================================
// TYPES
// ===========================================

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  multiSelect?: boolean;
}

export interface FilterDrawerProps {
  filters: FilterGroup[];
  activeFilterCount: number;
  onClearAll?: () => void;
  className?: string;
}

// ===========================================
// FILTER CHIP
// ===========================================

interface FilterChipProps {
  option: FilterOption;
  isActive: boolean;
  onClick: () => void;
}

function FilterChip({ option, isActive, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium',
        TRANSITION.fast,
        isActive
          ? 'bg-amber-600 text-white'
          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
      )}
    >
      {option.icon && <span className="mr-1">{option.icon}</span>}
      {option.label}
    </button>
  );
}

// ===========================================
// FILTER GROUP ACCORDION
// ===========================================

interface FilterGroupAccordionProps {
  group: FilterGroup;
}

function FilterGroupAccordion({ group }: FilterGroupAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-stone-200 dark:border-stone-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-1"
      >
        <span className={cn(TYPOGRAPHY.label)}>{group.label}</span>
        <FiChevronDown
          className={cn(
            'w-5 h-5 text-stone-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pb-4">
              {group.options.map((option) => (
                <FilterChip
                  key={option.value}
                  option={option}
                  isActive={group.value === option.value}
                  onClick={() => group.onChange(option.value)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================================
// MAIN FILTER DRAWER
// ===========================================

export function FilterDrawer({
  filters,
  activeFilterCount,
  onClearAll,
  className,
}: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Filter trigger button - shown on mobile */}
      <div className={cn('md:hidden', className)}>
        <Button
          variant="secondary"
          size="md"
          onClick={() => setIsOpen(true)}
          icon={<FiFilter className="w-4 h-4" />}
          className="w-full"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop inline filters */}
      <div className="hidden md:block space-y-3">
        {filters.map((group) => (
          <div
            key={group.id}
            className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700"
          >
            <span className={cn(TYPOGRAPHY.label, 'w-20 flex-shrink-0')}>{group.label}</span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {group.options.map((option) => (
                <FilterChip
                  key={option.value}
                  option={option}
                  isActive={group.value === option.value}
                  onClick={() => group.onChange(option.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={SPRING_PHYSICS.gentle}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            >
              <div className="bg-white dark:bg-stone-900 rounded-t-2xl max-h-[80vh] overflow-hidden">
                {/* Handle bar */}
                <div className="flex justify-center py-2">
                  <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b border-stone-200 dark:border-stone-700">
                  <h2 className={cn(TYPOGRAPHY.heading.h4)}>Filters</h2>
                  <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && onClearAll && (
                      <button
                        onClick={onClearAll}
                        className="text-sm text-amber-600 dark:text-amber-400 font-medium"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Filter groups */}
                <div className="px-4 py-2 overflow-y-auto max-h-[60vh]">
                  {filters.map((group) => (
                    <FilterGroupAccordion key={group.id} group={group} />
                  ))}
                </div>

                {/* Apply button */}
                <div className="p-4 border-t border-stone-200 dark:border-stone-700">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => setIsOpen(false)}
                  >
                    Show Results
                    {activeFilterCount > 0 && (
                      <span className="ml-2">({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''})</span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ===========================================
// ACTIVE FILTER PILLS (Shows selected filters)
// ===========================================

export interface ActiveFilterPillsProps {
  filters: Array<{
    label: string;
    value: string;
    onRemove: () => void;
  }>;
  onClearAll?: () => void;
  className?: string;
}

export function ActiveFilterPills({ filters, onClearAll, className }: ActiveFilterPillsProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter, index) => (
        <button
          key={index}
          onClick={filter.onRemove}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
            'hover:bg-amber-200 dark:hover:bg-amber-900/50',
            TRANSITION.fast
          )}
        >
          <span>{filter.label}: {filter.value}</span>
          <FiX className="w-3 h-3" />
        </button>
      ))}
      {filters.length > 1 && onClearAll && (
        <button
          onClick={onClearAll}
          className="text-xs text-stone-500 dark:text-stone-300 hover:text-stone-700 dark:hover:text-stone-200"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

export default FilterDrawer;
