import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface FilterOption {
  id: string;
  label: string;
  value: string | number;
  count?: number;
  color?: string;
  icon?: React.ReactNode;
}

interface FilterGroup {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'range' | 'tags';
  options: FilterOption[];
  collapsed?: boolean;
}

interface AnimatedFilterPanelProps {
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, values: string[]) => void;
  onClearAll?: () => void;
  showCount?: boolean;
  className?: string;
}

export const AnimatedFilterPanel: React.FC<AnimatedFilterPanelProps> = ({
  filterGroups,
  selectedFilters,
  onFilterChange,
  onClearAll,
  showCount = true,
  className
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
    filterGroups.reduce((acc, group) => ({
      ...acc,
      [group.id]: group.collapsed || false
    }), {})
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleFilterToggle = (groupId: string, value: string, isRadio: boolean) => {
    const currentValues = selectedFilters[groupId] || [];
    let newValues: string[];

    if (isRadio) {
      newValues = [value];
    } else {
      newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
    }

    onFilterChange(groupId, newValues);
  };

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce((acc, values) => acc + values.length, 0);
  };

  const activeCount = getActiveFilterCount();

  return (
    <motion.div 
      className={cn('animated-filter-panel', className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="filter-header">
        <h3 className="filter-title">
          Filters
          {activeCount > 0 && (
            <motion.span
              className="active-count"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {activeCount}
            </motion.span>
          )}
        </h3>
        
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              className="clear-all-btn"
              onClick={onClearAll}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear all
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Search within filters */}
      <div className="filter-search">
        <input
          type="text"
          placeholder="Search filters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="filter-search-input"
        />
        <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M7 13A6 6 0 107 1a6 6 0 000 12zM12 12l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Filter Groups */}
      <div className="filter-groups">
        {filterGroups.map((group, groupIndex) => {
          const isCollapsed = collapsedGroups[group.id];
          const groupFilters = searchQuery
            ? group.options.filter(opt => 
                opt.label.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : group.options;

          if (searchQuery && groupFilters.length === 0) return null;

          return (
            <motion.div
              key={group.id}
              className="filter-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              {/* Group Header */}
              <motion.button
                className="group-header"
                onClick={() => toggleGroup(group.id)}
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="group-title">{group.title}</span>
                <motion.svg
                  className="collapse-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  animate={{ rotate: isCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L8 8.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd" />
                </motion.svg>
              </motion.button>

              {/* Group Options */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    className="group-options"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {group.type === 'tags' ? (
                      <div className="tag-options">
                        {groupFilters.map((option, index) => {
                          const isSelected = selectedFilters[group.id]?.includes(option.value.toString());
                          
                          return (
                            <motion.button
                              key={option.id}
                              className={cn('tag-option', isSelected && 'selected')}
                              onClick={() => handleFilterToggle(group.id, option.value.toString(), false)}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{
                                backgroundColor: isSelected && option.color ? option.color : undefined
                              }}
                            >
                              {option.icon && <span className="tag-icon">{option.icon}</span>}
                              {option.label}
                              {showCount && option.count !== undefined && (
                                <span className="tag-count">({option.count})</span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="checkbox-options">
                        {groupFilters.map((option, index) => {
                          const isSelected = selectedFilters[group.id]?.includes(option.value.toString());
                          const isRadio = group.type === 'radio';
                          
                          return (
                            <motion.label
                              key={option.id}
                              className={cn('filter-option', isSelected && 'selected')}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ x: 5 }}
                            >
                              <input
                                type={isRadio ? 'radio' : 'checkbox'}
                                checked={isSelected}
                                onChange={() => handleFilterToggle(group.id, option.value.toString(), isRadio)}
                                className="filter-input"
                              />
                              
                              <motion.div
                                className={cn('custom-checkbox', isRadio && 'radio')}
                                animate={{
                                  backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                  borderColor: isSelected ? '#3b82f6' : '#d1d5db'
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 12 12"
                                      fill="white"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      transition={{ type: "spring", stiffness: 500 }}
                                    >
                                      {isRadio ? (
                                        <circle cx="6" cy="6" r="3" />
                                      ) : (
                                        <path d="M10 3L4.5 8.5 2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                      )}
                                    </motion.svg>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                              
                              <span className="option-label">{option.label}</span>
                              
                              {showCount && option.count !== undefined && (
                                <motion.span
                                  className="option-count"
                                  animate={{
                                    opacity: isSelected ? 1 : 0.6,
                                    scale: isSelected ? 1.1 : 1
                                  }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {option.count}
                                </motion.span>
                              )}
                            </motion.label>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        .animated-filter-panel {
          width: 280px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(209, 213, 219, 0.3);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }

        .filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .filter-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .active-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: #3b82f6;
          color: white;
          font-size: 12px;
          font-weight: 600;
          border-radius: 10px;
        }

        .clear-all-btn {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-all-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .filter-search {
          position: relative;
          margin-bottom: 20px;
        }

        .filter-search-input {
          width: 100%;
          padding: 10px 36px 10px 12px;
          background: rgba(243, 244, 246, 0.5);
          border: 1px solid transparent;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .filter-search-input:focus {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .filter-groups {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .filter-group {
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);
          padding-bottom: 16px;
        }

        .filter-group:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 0;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .group-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .collapse-icon {
          color: #9ca3af;
          transition: transform 0.2s ease;
        }

        .group-options {
          overflow: hidden;
          margin-top: 12px;
        }

        .tag-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag-option {
          padding: 6px 12px;
          background: rgba(243, 244, 246, 0.6);
          border: 1px solid transparent;
          border-radius: 20px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tag-option:hover {
          background: rgba(243, 244, 246, 0.9);
          border-color: #e5e7eb;
        }

        .tag-option.selected {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .tag-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .tag-count {
          opacity: 0.7;
          font-size: 12px;
        }

        .checkbox-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .filter-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-option:hover {
          background: rgba(243, 244, 246, 0.5);
        }

        .filter-option.selected {
          background: rgba(59, 130, 246, 0.05);
        }

        .filter-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .custom-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .custom-checkbox.radio {
          border-radius: 50%;
        }

        .option-label {
          flex: 1;
          font-size: 14px;
          color: #1f2937;
        }

        .option-count {
          font-size: 12px;
          color: #9ca3af;
          padding: 2px 6px;
          background: rgba(243, 244, 246, 0.6);
          border-radius: 12px;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .animated-filter-panel {
            background: rgba(31, 41, 55, 0.95);
            border-color: rgba(75, 85, 99, 0.3);
          }

          .filter-title {
            color: #f3f4f6;
          }

          .clear-all-btn {
            border-color: #4b5563;
            color: #9ca3af;
          }

          .filter-search-input {
            background: rgba(55, 65, 81, 0.5);
            color: #f3f4f6;
          }

          .group-title {
            color: #e5e7eb;
          }

          .tag-option {
            background: rgba(55, 65, 81, 0.6);
            color: #e5e7eb;
          }

          .option-label {
            color: #f3f4f6;
          }

          .custom-checkbox {
            border-color: #4b5563;
          }
        }
      `}</style>
    </motion.div>
  );
};