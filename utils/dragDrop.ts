// Drag and Drop utilities extracted from DragDropSystem
// These are separated for Fast Refresh compatibility

import { useState, useCallback } from 'react';

// Types
export type DragItem = any; // TCGCard | PocketCard | Pokemon | any

export interface Position {
  x: number;
  y: number;
}

export interface DropZoneConfig {
  accepts?: string[];
  onDrop?: (item: DragItem, fromContainer: string | null, toContainer: string, position: Position | null) => void;
}

export interface DropZoneInfo {
  element: HTMLElement;
  config: DropZoneConfig;
}

export interface DragDropContextValue {
  draggedItem: DragItem | null;
  draggedFromContainer: string | null;
  dragOffset: Position;
  dropZones: Map<string, DropZoneInfo>;
  isDragging: boolean;
  registerDropZone: (id: string, element: HTMLElement, config: DropZoneConfig) => void;
  unregisterDropZone: (id: string) => void;
  startDrag: (item: DragItem, fromContainer: string, offset: Position) => void;
  endDrag: (toContainer: string | null, position: Position | null) => void;
  cancelDrag: () => void;
}

// Hook for drag and drop logic
export function useDragDropLogic<T extends { id: string }>(
  items: T[],
  options: {
    onReorder?: (items: T[]) => void;
    onRemove?: (item: T) => void;
    onAdd?: (item: T, index: number) => void;
  } = {}
) {
  const [localItems, setLocalItems] = useState(items);
  
  const handleDrop = useCallback((draggedItem: T, fromContainer: string | null, toContainer: string, position: Position | null) => {
    if (!fromContainer || fromContainer !== toContainer) {
      // Adding from another container
      if (options.onAdd) {
        const index = position ? Math.floor(position.y / 100) : localItems.length;
        options.onAdd(draggedItem, index);
      }
    } else {
      // Reordering within same container
      const fromIndex = localItems.findIndex(item => item.id === draggedItem.id);
      const toIndex = position ? Math.floor(position.y / 100) : localItems.length - 1;
      
      if (fromIndex !== toIndex) {
        const newItems = [...localItems];
        const [removed] = newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, removed);
        
        setLocalItems(newItems);
        options.onReorder?.(newItems);
      }
    }
  }, [localItems, options]);
  
  const handleRemove = useCallback((item: T) => {
    const newItems = localItems.filter(i => i.id !== item.id);
    setLocalItems(newItems);
    options.onRemove?.(item);
  }, [localItems, options]);
  
  return {
    items: localItems,
    handleDrop,
    handleRemove,
    setItems: setLocalItems
  };
}