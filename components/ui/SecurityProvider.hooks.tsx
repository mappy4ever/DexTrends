import { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import logger from '../../utils/logger';
import { SecurityContext, SecurityContextValue } from './SecurityProvider';

export const useSecurity = (): SecurityContextValue => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
};
