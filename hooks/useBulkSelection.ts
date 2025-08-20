import { useState, useCallback, useMemo } from 'react';
import logger from '../utils/logger';

interface UseBulkSelectionOptions<T> {
  items: T[];
  getItemId: (item: T) => string | number;
  onSelectionChange?: (selectedItems: T[]) => void;
  maxSelection?: number;
}

interface UseBulkSelectionReturn<T> {
  selectedIds: Set<string | number>;
  selectedItems: T[];
  isSelected: (id: string | number) => boolean;
  toggleSelection: (id: string | number) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectRange: (startId: string | number, endId: string | number) => void;
  toggleAll: () => void;
  selectionCount: number;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
}

export const useBulkSelection = <T>({
  items,
  getItemId,
  onSelectionChange,
  maxSelection,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn<T> => {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Get selected items
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  // Check if an item is selected
  const isSelected = useCallback((id: string | number): boolean => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Toggle selection of a single item
  const toggleSelection = useCallback((id: string | number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        // Check max selection limit
        if (maxSelection && newSet.size >= maxSelection) {
          logger.warn('Maximum selection limit reached', { maxSelection });
          return prev;
        }
        newSet.add(id);
      }
      
      // Notify about selection change
      if (onSelectionChange) {
        const selectedItems = items.filter(item => newSet.has(getItemId(item)));
        onSelectionChange(selectedItems);
      }
      
      return newSet;
    });
  }, [items, getItemId, onSelectionChange, maxSelection]);

  // Select all items
  const selectAll = useCallback(() => {
    const allIds = items.map(getItemId);
    
    // Check max selection limit
    if (maxSelection && allIds.length > maxSelection) {
      logger.warn('Cannot select all: exceeds maximum selection limit', { 
        itemCount: allIds.length, 
        maxSelection 
      });
      return;
    }
    
    const newSet = new Set(allIds);
    setSelectedIds(newSet);
    
    if (onSelectionChange) {
      onSelectionChange(items);
    }
  }, [items, getItemId, onSelectionChange, maxSelection]);

  // Deselect all items
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

  // Select a range of items
  const selectRange = useCallback((startId: string | number, endId: string | number) => {
    const startIndex = items.findIndex(item => getItemId(item) === startId);
    const endIndex = items.findIndex(item => getItemId(item) === endId);
    
    if (startIndex === -1 || endIndex === -1) {
      logger.warn('Invalid range selection', { startId, endId });
      return;
    }
    
    const [from, to] = startIndex < endIndex 
      ? [startIndex, endIndex] 
      : [endIndex, startIndex];
    
    const rangeItems = items.slice(from, to + 1);
    const rangeIds = rangeItems.map(getItemId);
    
    // Check max selection limit
    if (maxSelection) {
      const newTotal = new Set([...selectedIds, ...rangeIds]).size;
      if (newTotal > maxSelection) {
        logger.warn('Range selection exceeds maximum limit', { 
          newTotal, 
          maxSelection 
        });
        return;
      }
    }
    
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      rangeIds.forEach(id => newSet.add(id));
      
      if (onSelectionChange) {
        const selectedItems = items.filter(item => newSet.has(getItemId(item)));
        onSelectionChange(selectedItems);
      }
      
      return newSet;
    });
  }, [items, getItemId, selectedIds, onSelectionChange, maxSelection]);

  // Toggle all items
  const toggleAll = useCallback(() => {
    if (selectedIds.size === 0) {
      selectAll();
    } else {
      deselectAll();
    }
  }, [selectedIds.size, selectAll, deselectAll]);

  // Calculate selection states
  const selectionCount = selectedIds.size;
  const isAllSelected = items.length > 0 && selectionCount === items.length;
  const isPartiallySelected = selectionCount > 0 && selectionCount < items.length;

  return {
    selectedIds,
    selectedItems,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    selectRange,
    toggleAll,
    selectionCount,
    isAllSelected,
    isPartiallySelected,
  };
};