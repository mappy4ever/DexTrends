import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface FilterChip {
  id: string;
  label: string;
  value: string;
  category?: string;
  color?: string;
  icon?: React.ReactNode;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onRemove: (chipId: string) => void;
  onClearAll?: () => void;
  maxVisible?: number;
  showCategories?: boolean;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  onRemove,
  onClearAll,
  maxVisible = 10,
  showCategories = true,
  className
}) => {
  const visibleChips = chips.slice(0, maxVisible);
  const hiddenCount = chips.length - maxVisible;

  return (
    <motion.div 
      className={cn('filter-chips-container', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {chips.length > 0 && (
          <>
            {/* Active filters label */}
            <motion.span
              className="active-label"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              Active filters:
            </motion.span>

            {/* Filter chips */}
            {visibleChips.map((chip, index) => (
              <motion.div
                key={chip.id}
                className="filter-chip"
                layout
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: {
                    delay: index * 0.05
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8, 
                  y: -10,
                  transition: {
                    duration: 0.2
                  }
                }}
                whileHover={{ scale: 1.05 }}
                style={{
                  backgroundColor: chip.color ? `${chip.color}20` : undefined,
                  borderColor: chip.color || undefined
                }}
              >
                {chip.icon && (
                  <motion.span 
                    className="chip-icon"
                    initial={{ rotate: -180 }}
                    animate={{ rotate: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {chip.icon}
                  </motion.span>
                )}
                
                {showCategories && chip.category && (
                  <span className="chip-category">{chip.category}:</span>
                )}
                
                <span className="chip-label">{chip.label}</span>
                
                <motion.button
                  className="chip-remove"
                  onClick={() => onRemove(chip.id)}
                  whileHover={{ rotate: 90, scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M4.293 4.293a1 1 0 011.414 0L7 5.586l1.293-1.293a1 1 0 111.414 1.414L8.414 7l1.293 1.293a1 1 0 01-1.414 1.414L7 8.414 5.707 9.707a1 1 0 01-1.414-1.414L5.586 7 4.293 5.707a1 1 0 010-1.414z" />
                  </svg>
                </motion.button>
              </motion.div>
            ))}

            {/* Hidden count indicator */}
            {hiddenCount > 0 && (
              <motion.div
                className="hidden-count"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: visibleChips.length * 0.05 }}
              >
                +{hiddenCount} more
              </motion.div>
            )}

            {/* Clear all button */}
            <motion.button
              className="clear-all-chip"
              onClick={onClearAll}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.1 }}
            >
              Clear all
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Empty state */}
      <AnimatePresence>
        {chips.length === 0 && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            No filters applied
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .filter-chips-container {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding: 12px 0;
        }

        .active-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
          margin-right: 4px;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px 6px 12px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(209, 213, 219, 0.5);
          border-radius: 20px;
          font-size: 13px;
          color: #1f2937;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .filter-chip::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .filter-chip:hover::before {
          transform: translateX(100%);
        }

        .chip-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          color: #6b7280;
        }

        .chip-category {
          font-size: 11px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .chip-label {
          font-weight: 500;
        }

        .chip-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          margin-left: 2px;
          margin-right: -4px;
          background: rgba(0, 0, 0, 0.05);
          border: none;
          border-radius: 50%;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chip-remove:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .hidden-count {
          padding: 6px 12px;
          background: rgba(243, 244, 246, 0.8);
          border-radius: 20px;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .clear-all-chip {
          padding: 6px 12px;
          background: transparent;
          border: 1px dashed #d1d5db;
          border-radius: 20px;
          font-size: 13px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-all-chip:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .empty-state {
          padding: 8px 16px;
          font-size: 14px;
          color: #9ca3af;
          font-style: italic;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .active-label {
            color: #9ca3af;
          }

          .filter-chip {
            background: rgba(31, 41, 55, 0.9);
            border-color: rgba(75, 85, 99, 0.5);
            color: #f3f4f6;
          }

          .chip-category {
            color: #6b7280;
          }

          .chip-remove {
            background: rgba(255, 255, 255, 0.05);
            color: #9ca3af;
          }

          .chip-remove:hover {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
          }

          .hidden-count {
            background: rgba(55, 65, 81, 0.8);
            color: #9ca3af;
          }

          .clear-all-chip {
            border-color: #4b5563;
            color: #9ca3af;
          }

          .clear-all-chip:hover {
            border-color: #f87171;
            color: #f87171;
            background: rgba(239, 68, 68, 0.1);
          }

          .empty-state {
            color: #6b7280;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .filter-chips-container {
            font-size: 12px;
          }

          .filter-chip {
            padding: 4px 8px 4px 10px;
            font-size: 12px;
          }

          .chip-remove {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </motion.div>
  );
};