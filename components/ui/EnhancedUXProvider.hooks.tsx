import { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { UXContext } from './EnhancedUXProvider';

export const useUX = () => {
  const context = useContext(UXContext);
  if (!context) {
    throw new Error('useUX must be used within EnhancedUXProvider');
  }
  return context;
};
