import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';

interface UseAnnouncerReturn {
  announcement: {
    message: string;
    priority: 'polite' | 'assertive';
  };
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

export const useAnnouncer = (): UseAnnouncerReturn => {
  const [announcement, setAnnouncement] = useState<{
    message: string;
    priority: 'polite' | 'assertive';
  }>({ message: '', priority: 'polite' });

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement({ message, priority });
  }, []);

  return { announcement, announce };
};
