import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { createGlassStyle } from './design-system/glass-constants';
import { GradientButton } from './design-system';
import { TypeBadge } from './TypeBadge';
import logger from '../../utils/logger';

interface ComparisonItem {
  id: string | number;
  name: string;
  image?: string;
  type?: string | string[];
  stats?: Record<string, number>;
  attributes?: Record<string, any>;
}

interface ComparisonModalProps {
  items: ComparisonItem[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  maxItems?: number;
  compareFields?: string[];
  renderCustomField?: (field: string, item: ComparisonItem) => React.ReactNode;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({
  items,
  isOpen,
  onClose,
  title = 'Compare Items',
  maxItems = 4,
  compareFields,
  renderCustomField,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['stats']));
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  // Limit items to maxItems
  const compareItems = items.slice(0, maxItems);

  // Get all unique fields from items
  const allFields = useMemo(() => {
    if (compareFields) return compareFields;

    const fieldSet = new Set<string>();
    compareItems.forEach(item => {
      if (item.stats) {
        Object.keys(item.stats).forEach(key => fieldSet.add(`stats.${key}`));
      }
      if (item.attributes) {
        Object.keys(item.attributes).forEach(key => fieldSet.add(`attributes.${key}`));
      }
    });
    return Array.from(fieldSet);
  }, [compareItems, compareFields]);

  // Group fields by category
  const fieldGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    allFields.forEach(field => {
      const [category, ...rest] = field.split('.');
      if (!groups[category]) groups[category] = [];
      groups[category].push(rest.join('.') || field);
    });
    return groups;
  }, [allFields]);

  // Get value from nested path
  const getValue = (item: ComparisonItem, path: string): any => {
    const keys = path.split('.');
    let value: any = item;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return null;
    }
    return value;
  };

  // Check if values differ across items
  const valuesDiffer = (field: string): boolean => {
    const values = compareItems.map(item => getValue(item, field));
    return new Set(values.map(v => JSON.stringify(v))).size > 1;
  };

  // Get the best value for a field (highest for stats)
  const getBestValue = (field: string): any => {
    if (field.startsWith('stats.')) {
      const values = compareItems
        .map(item => getValue(item, field))
        .filter(v => typeof v === 'number') as number[];
      return Math.max(...values);
    }
    return null;
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 flex items-center justify-center"
            onClick={onClose}
          >
            <div
              className={`${createGlassStyle({
                blur: '3xl',
                opacity: 'strong',
                gradient: true,
                border: 'strong',
                shadow: 'glow',
                rounded: 'xl',
              })} w-full h-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/20 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setHighlightDifferences(!highlightDifferences)}
                      className={`${createGlassStyle({
                        blur: 'sm',
                        opacity: 'subtle',
                        gradient: false,
                        border: 'subtle',
                        shadow: 'sm',
                        rounded: 'full',
                      })} px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform`}
                    >
                      {highlightDifferences ? (
                        <FiCheck className="w-4 h-4 text-purple-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-400 rounded" />
                      )}
                      Highlight Differences
                    </button>
                    <button
                      onClick={onClose}
                      className={`${createGlassStyle({
                        blur: 'sm',
                        opacity: 'subtle',
                        gradient: false,
                        border: 'subtle',
                        shadow: 'sm',
                        rounded: 'full',
                      })} p-2 rounded-full hover:scale-110 transition-transform`}
                    >
                      <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                {/* Items Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {compareItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${createGlassStyle({
                        blur: 'xl',
                        opacity: 'medium',
                        gradient: false,
                        border: 'medium',
                        shadow: 'md',
                        rounded: 'xl',
                      })} p-4 rounded-2xl text-center`}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 mx-auto mb-3 object-contain"
                        />
                      )}
                      <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                      {item.type && (
                        <div className="flex justify-center gap-2">
                          {Array.isArray(item.type) ? (
                            item.type.map(t => <TypeBadge key={t} type={t} size="sm" />)
                          ) : (
                            <TypeBadge type={item.type} size="sm" />
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Add more items placeholder */}
                  {items.length < maxItems && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`${createGlassStyle({
                        blur: 'md',
                        opacity: 'subtle',
                        gradient: false,
                        border: 'subtle',
                        shadow: 'sm',
                        rounded: 'xl',
                      })} p-4 rounded-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform`}
                      onClick={() => logger.info('Add more items to compare')}
                    >
                      <FiPlus className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Item</span>
                    </motion.button>
                  )}
                </div>

                {/* Comparison Table */}
                <div className="space-y-4">
                  {Object.entries(fieldGroups).map(([category, fields]) => (
                    <div
                      key={category}
                      className={`${createGlassStyle({
                        blur: 'xl',
                        opacity: 'subtle',
                        gradient: false,
                        border: 'subtle',
                        shadow: 'md',
                        rounded: 'xl',
                      })} rounded-2xl overflow-hidden`}
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(category)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <h3 className="font-semibold text-lg capitalize">
                          {category.replace('_', ' ')}
                        </h3>
                        {expandedSections.has(category) ? (
                          <FiChevronUp className="w-5 h-5" />
                        ) : (
                          <FiChevronDown className="w-5 h-5" />
                        )}
                      </button>

                      {/* Section Content */}
                      <AnimatePresence>
                        {expandedSections.has(category) && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4">
                              <table className="w-full">
                                <tbody>
                                  {fields.map(field => {
                                    const fullField = category === field ? field : `${category}.${field}`;
                                    const differs = valuesDiffer(fullField);
                                    const bestValue = getBestValue(fullField);

                                    return (
                                      <tr
                                        key={field}
                                        className={`border-t border-white/10 dark:border-gray-700/20 ${
                                          highlightDifferences && differs
                                            ? 'bg-purple-500/10'
                                            : ''
                                        }`}
                                      >
                                        <td className="py-2 pr-4 text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                          {field.replace(/_/g, ' ')}
                                        </td>
                                        {compareItems.map(item => {
                                          const value = getValue(item, fullField);
                                          const isBest = bestValue !== null && value === bestValue;

                                          return (
                                            <td
                                              key={item.id}
                                              className="py-2 px-2 text-sm text-center"
                                            >
                                              {renderCustomField ? (
                                                renderCustomField(fullField, item)
                                              ) : (
                                                <span
                                                  className={`${
                                                    isBest
                                                      ? 'font-bold text-green-600 dark:text-green-400'
                                                      : ''
                                                  }`}
                                                >
                                                  {value !== null && value !== undefined
                                                    ? String(value)
                                                    : '-'}
                                                </span>
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComparisonModal;