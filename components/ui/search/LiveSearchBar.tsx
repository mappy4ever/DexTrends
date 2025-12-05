import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/utils/cn';

interface LiveSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  showVoiceSearch?: boolean;
  showFilters?: boolean;
  onVoiceSearch?: () => void;
  onFilterClick?: () => void;
  className?: string;
}

export const LiveSearchBar: React.FC<LiveSearchBarProps> = ({
  onSearch,
  placeholder = 'Type to search...',
  suggestions = [],
  showVoiceSearch = true,
  showFilters = true,
  onVoiceSearch,
  onFilterClick,
  className
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Motion values for animations
  const cursorX = useMotionValue(0);
  const cursorOpacity = useMotionValue(1);

  // Animated placeholder effect
  useEffect(() => {
    if (!query && !isFocused) {
      const interval = setInterval(() => {
        setCharIndex(prev => (prev + 1) % placeholder.length);
      }, 150);
      return () => clearInterval(interval);
    }
    // Return empty cleanup function when condition is false
    return () => {};
  }, [query, isFocused, placeholder]);

  // Cursor blink animation
  useEffect(() => {
    const interval = setInterval(() => {
      cursorOpacity.set(cursorOpacity.get() === 1 ? 0 : 1);
    }, 500);
    return () => clearInterval(interval);
  }, [cursorOpacity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
    
    // Update cursor position
    if (inputRef.current) {
      const textWidth = getTextWidth(newQuery, '16px Inter, system-ui, sans-serif');
      cursorX.set(textWidth);
    }
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    onVoiceSearch?.();
    
    // Simulate voice search completion
    setTimeout(() => {
      setIsListening(false);
      setQuery('Pokemon cards near me');
      onSearch('Pokemon cards near me');
    }, 2000);
  };

  // Helper function to measure text width
  const getTextWidth = (text: string, font: string): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = font;
      return context.measureText(text).width;
    }
    return 0;
  };

  return (
    <div className={cn('live-search-bar', className)}>
      <motion.div
        className={cn('search-container', isFocused && 'focused')}
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(217, 119, 6, 0.1), 0 8px 32px rgba(217, 119, 6, 0.15)'
            : '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Input Field */}
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="search-input"
            placeholder=""
          />
          
          {/* Animated Placeholder */}
          {!query && (
            <div className="placeholder-container">
              {placeholder.split('').map((char, index) => (
                <motion.span
                  key={index}
                  className="placeholder-char"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{
                    opacity: index <= charIndex ? 0.5 : 0,
                    y: index <= charIndex ? 0 : 5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {char}
                </motion.span>
              ))}
              
              {/* Animated Cursor */}
              <motion.span
                className="animated-cursor"
                style={{
                  x: cursorX,
                  opacity: cursorOpacity
                }}
              >
                |
              </motion.span>
            </div>
          )}
          
          {/* Live Character Counter */}
          <AnimatePresence>
            {query && (
              <motion.div
                className="char-counter"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {query.length}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {/* Voice Search */}
          {showVoiceSearch && (
            <motion.button
              className="voice-button"
              onClick={handleVoiceSearch}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                color: isListening ? '#ef4444' : '#9ca3af'
              }}
            >
              {isListening ? (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 11a3 3 0 01-3-3V4a3 3 0 116 0v4a3 3 0 01-3 3z" />
                    <path d="M5 8a3 3 0 006 0M8 11v3M6 14h4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </motion.div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 11a3 3 0 01-3-3V4a3 3 0 116 0v4a3 3 0 01-3 3z" />
                  <path d="M5 8a3 3 0 006 0M8 11v3M6 14h4" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              )}
            </motion.button>
          )}

          {/* Filter Button */}
          {showFilters && (
            <motion.button
              className="filter-button"
              onClick={onFilterClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M2 4a1 1 0 011-1h10a1 1 0 110 2H3a1 1 0 01-1-1zM4 8a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zM7 11a1 1 0 100 2h2a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <motion.span
                className="filter-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                3
              </motion.span>
            </motion.button>
          )}
        </div>

        {/* Progress Bar */}
        <motion.div
          className="progress-bar"
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: isFocused ? 1 : 0,
            opacity: isFocused ? 1 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
        />
      </motion.div>

      {/* Suggestions */}
      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            className="suggestions-container"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion}
                className="suggestion-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                onClick={() => {
                  setQuery(suggestion);
                  onSearch(suggestion);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#9ca3af">
                  <path d="M6.5 12.5L2 8l1.5-1.5L6.5 9.5 12.5 3.5 14 5z" />
                </svg>
                {suggestion}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Listening Overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="voice-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="voice-wave"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
            />
            <p>Listening...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .live-search-bar {
          position: relative;
          width: 100%;
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(214, 211, 209, 0.3);
          border-radius: 28px;
          transition: all 0.3s ease;
        }

        .search-container.focused {
          background: rgba(255, 255, 255, 0.95);
          border-color: #d97706;
        }

        .search-icon {
          display: flex;
          color: #9ca3af;
        }

        .input-wrapper {
          flex: 1;
          position: relative;
        }

        .search-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          color: #1f2937;
        }

        .placeholder-container {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .placeholder-char {
          color: #9ca3af;
          font-size: 16px;
        }

        .animated-cursor {
          position: absolute;
          color: #d97706;
          font-weight: 300;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .char-counter {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: #9ca3af;
          background: rgba(243, 244, 246, 0.8);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .voice-button,
        .filter-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          position: relative;
        }

        .filter-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background: #d97706;
          color: white;
          font-size: 10px;
          font-weight: 600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-bar {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #d97706, #d97706);
          transform-origin: left;
        }

        .suggestions-container {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(214, 211, 209, 0.3);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 8px;
          z-index: 50;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .voice-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          z-index: 100;
        }

        .voice-wave {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, #ef4444, transparent);
          border-radius: 50%;
        }

        .voice-overlay p {
          color: white;
          font-size: 18px;
          font-weight: 500;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .search-container {
            background: rgba(31, 41, 55, 0.9);
            border-color: rgba(68, 64, 60, 0.3);
          }

          .search-input {
            color: #f3f4f6;
          }

          .suggestions-container {
            background: rgba(31, 41, 55, 0.98);
            border-color: rgba(68, 64, 60, 0.3);
          }

          .suggestion-item {
            color: #f3f4f6;
          }
        }
      `}</style>
    </div>
  );
};