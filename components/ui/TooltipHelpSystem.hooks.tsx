import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { HapticFeedback } from './MicroInteractionSystem';
import { TooltipContext } from './TooltipHelpSystem';

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within TooltipProvider');
  }
  return context;
};

export const useContextualHelp = () => {
  const [helpData, setHelpData] = useState<Map<string, React.ReactNode>>(new Map());
  
  const registerHelp = useCallback((key: string, content: React.ReactNode) => {
    setHelpData(prev => new Map(prev.set(key, content)));
  }, []);
  
  const getHelp = useCallback((key: string) => {
    return helpData.get(key);
  }, [helpData]);
  
  const removeHelp = useCallback((key: string) => {
    setHelpData(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);
  
  return {
    registerHelp,
    getHelp,
    removeHelp,
    helpData
  };
};
