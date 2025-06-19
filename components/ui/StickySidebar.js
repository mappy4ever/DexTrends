import React, { useState, useEffect } from 'react';
import { TypeBadge } from './TypeBadge';
import { BsFilter, BsX, BsChevronDown, BsChevronUp, BsFunnel } from 'react-icons/bs';

export default function StickySidebar({ 
  filters = [], 
  onFilterChange, 
  isOpen = true, 
  onToggle,
  className = "",
  children
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderFilter = (filter) => {
    switch (filter.type) {
      case 'search':
        return (
          <div key={filter.id} className="mb-6">
            <label className="block text-sm font-semibold text-dark-text mb-2">
              {filter.label}
            </label>
            <div className="relative">
              <input
                type="text"
                value={filter.value || ''}
                onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full px-4 py-3 rounded-lg bg-white border border-border-color focus:border-pokemon-blue focus:ring-2 focus:ring-pokemon-blue/20 focus:outline-none placeholder-text-grey transition-all duration-300 text-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-grey">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={filter.id} className="mb-6">
            <label className="block text-sm font-semibold text-dark-text mb-2">
              {filter.label}
            </label>
            <select
              value={filter.value || ''}
              onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-border-color focus:border-pokemon-blue focus:ring-2 focus:ring-pokemon-blue/20 focus:outline-none transition-all duration-300 text-sm"
            >
              <option value="">{filter.placeholder || `All ${filter.label}`}</option>
              {filter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={filter.id} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {filter.label}
              </label>
              <button
                onClick={() => toggleSection(filter.id)}
                className="text-text-grey hover:text-dark-text transition-colors"
              >
                {collapsedSections[filter.id] ? <BsChevronDown size={16} /> : <BsChevronUp size={16} />}
              </button>
            </div>
            {!collapsedSections[filter.id] && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filter.options?.map(option => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filter.value?.includes(option.value) || false}
                      onChange={(e) => {
                        const currentValues = filter.value || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(v => v !== option.value);
                        onFilterChange?.(filter.id, newValues);
                      }}
                      className="rounded border-border-color text-pokemon-red focus:ring-pokemon-red focus:ring-2"
                    />
                    <span className="text-sm text-dark-text group-hover:text-pokemon-red transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );

      case 'types':
        return (
          <div key={filter.id} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {filter.label || 'Types'}
              </label>
              <button
                onClick={() => toggleSection(filter.id)}
                className="text-text-grey hover:text-dark-text transition-colors"
              >
                {collapsedSections[filter.id] ? <BsChevronDown size={16} /> : <BsChevronUp size={16} />}
              </button>
            </div>
            {!collapsedSections[filter.id] && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
                  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
                  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
                ].map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      const currentTypes = filter.value || [];
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter(t => t !== type)
                        : [...currentTypes, type];
                      onFilterChange?.(filter.id, newTypes);
                    }}
                    className={`transition-all duration-300 ${
                      filter.value?.includes(type) ? 'scale-105 ring-2 ring-white/50' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <TypeBadge type={type} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'range':
        return (
          <div key={filter.id} className="mb-6">
            <label className="block text-sm font-semibold text-dark-text mb-2">
              {filter.label}
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min={filter.min || 0}
                max={filter.max || 100}
                value={filter.value || filter.min || 0}
                onChange={(e) => onFilterChange?.(filter.id, Number(e.target.value))}
                className="w-full h-2 bg-light-grey rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-text-grey">
                <span>{filter.min}</span>
                <span className="font-semibold text-pokemon-red">{filter.value || filter.min}</span>
                <span>{filter.max}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 p-4 bg-pokemon-red rounded-full shadow-lg text-white hover:scale-110 transition-all duration-300 touch-manipulation"
          style={{ minHeight: '48px', minWidth: '48px' }} // Ensure minimum touch target size
        >
          <BsFilter size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'sticky top-20 h-[calc(100vh-5rem)]'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          w-80 bg-white/95 backdrop-blur-sm border-r border-border-color shadow-lg transition-all duration-300 overflow-hidden
          ${className}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-color">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pokemon-red rounded-full flex items-center justify-center">
              <BsFunnel size={16} className="text-white" />
            </div>
            <h2 className="font-semibold text-lg text-dark-text">Filters</h2>
          </div>
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-lg bg-light-grey hover:bg-mid-grey transition-all duration-300 touch-manipulation"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <BsX size={20} />
            </button>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filters.map(renderFilter)}
          {children}
        </div>

        {/* Clear Filters Button */}
        {filters.some(f => f.value && (Array.isArray(f.value) ? f.value.length > 0 : f.value !== '')) && (
          <div className="p-4 border-t border-border-color">
            <button
              onClick={() => {
                filters.forEach(filter => {
                  onFilterChange?.(filter.id, Array.isArray(filter.value) ? [] : '');
                });
              }}
              className="w-full px-4 py-2 bg-pokemon-blue rounded-lg text-white font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-300"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}