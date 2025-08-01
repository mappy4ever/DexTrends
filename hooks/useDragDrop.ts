import { useContext } from 'react';
import { DragDropContext } from '../components/ui/DragDropSystem';
import type { DragDropContextValue } from '../utils/dragDrop';

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
};