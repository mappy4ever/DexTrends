import { useState, useCallback } from 'react';

interface UseBottomSheetReturn {
  isOpen: boolean;
  snapPoint: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSnapPoint: (point: number) => void;
}

export const useBottomSheet = (initialOpen: boolean = false): UseBottomSheetReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [snapPoint, setSnapPoint] = useState(0.6);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    snapPoint,
    open,
    close,
    toggle,
    setSnapPoint
  };
};
