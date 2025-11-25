import { useContext } from 'react';
// import { DragDropContext } from '../components/ui/DragDropSystem'; // Removed in Stage 8
// import type { DragDropContextValue } from '../utils/dragDrop';

// Simple fallback implementation for removed DragDropSystem
const mockDragDropContext = {
  isDragging: false,
  draggedItem: null,
  setDraggedItem: () => {},
  handleDragStart: () => {},
  handleDragEnd: () => {},
  handleDrop: () => {}
};

export const useDragDrop = () => {
  // const context = useContext(DragDropContext); // Removed in Stage 8
  // if (!context) {
  //   throw new Error('useDragDrop must be used within DragDropProvider');
  // }
  // return context;
  
  // Return mock implementation to maintain compatibility
  return mockDragDropContext;
};