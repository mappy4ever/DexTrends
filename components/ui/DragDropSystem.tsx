import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  createContext,
  useContext,
  Children,
  cloneElement,
  ReactNode,
  CSSProperties,
  MouseEvent,
  TouchEvent
} from 'react';

// Inline stubs for HapticFeedback and VisualFeedback (MicroInteractionSystem removed)
const HapticFeedback = {
  light: () => { if ('vibrate' in navigator) navigator.vibrate(10); },
  medium: () => { if ('vibrate' in navigator) navigator.vibrate(25); },
  strong: () => { if ('vibrate' in navigator) navigator.vibrate([50, 25, 50]); },
  success: () => { if ('vibrate' in navigator) navigator.vibrate([25, 50, 25]); },
  error: () => { if ('vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 100]); },
  select: () => { if ('vibrate' in navigator) navigator.vibrate(15); }
};

const VisualFeedback = {
  createRipple: () => {},
  pulse: () => {},
  highlight: () => {}
};
import { TCGCard } from '../../types/api/cards';
import { PocketCard } from '../../types/api/pocket-cards';
import { Pokemon } from "../../types/pokemon";
import { useDragDrop } from '../../hooks/useDragDrop';
import { useDragDropLogic } from '../../utils/dragDrop';

/**
 * Advanced Drag and Drop System for Card Management
 */

// Types
type DragItem = TCGCard | PocketCard | Pokemon | Record<string, unknown>;

interface Position {
  x: number;
  y: number;
}

interface DropZoneConfig {
  accepts?: string[];
  onDrop?: (item: DragItem, fromContainer: string | null, toContainer: string, position: Position | null) => void;
}

interface DropZoneInfo {
  element: HTMLElement;
  config: DropZoneConfig;
}

interface DragDropContextValue {
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

// Drag and Drop Context - exported for use in hooks
export const DragDropContext = createContext<DragDropContextValue | null>(null);

// NOTE: Hooks and utilities have been moved to separate files for Fast Refresh compatibility:
// - useDragDrop hook: /hooks/useDragDrop.ts
// - useDragDropLogic and types: /utils/dragDrop.ts

// Provider Props
interface DragDropProviderProps {
  children: ReactNode;
  onDragEnd?: (item: DragItem, fromContainer: string | null, toContainer: string | null, position: Position | null) => void;
  onDragStart?: (item: DragItem, fromContainer: string) => void;
  onDragOver?: (item: DragItem, overContainer: string) => void;
}

// Drag and Drop Provider
export const DragDropProvider: React.FC<DragDropProviderProps> = ({ 
  children, 
  onDragEnd, 
  onDragStart, 
  onDragOver 
}) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [draggedFromContainer, setDraggedFromContainer] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [dropZones, setDropZones] = useState<Map<string, DropZoneInfo>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  
  const registerDropZone = useCallback((id: string, element: HTMLElement, config: DropZoneConfig) => {
    setDropZones(prev => new Map(prev.set(id, { element, config })));
  }, []);
  
  const unregisterDropZone = useCallback((id: string) => {
    setDropZones(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);
  
  const startDrag = useCallback((item: DragItem, fromContainer: string, offset: Position) => {
    setDraggedItem(item);
    setDraggedFromContainer(fromContainer);
    setDragOffset(offset);
    setIsDragging(true);
    
    HapticFeedback.medium();
    
    if (onDragStart) {
      onDragStart(item, fromContainer);
    }
  }, [onDragStart]);
  
  const endDrag = useCallback((toContainer: string | null, position: Position | null) => {
    if (onDragEnd && draggedItem) {
      onDragEnd(draggedItem, draggedFromContainer, toContainer, position);
    }
    
    setDraggedItem(null);
    setDraggedFromContainer(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    
    HapticFeedback.success();
  }, [draggedItem, draggedFromContainer, onDragEnd]);
  
  const cancelDrag = useCallback(() => {
    setDraggedItem(null);
    setDraggedFromContainer(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    
    HapticFeedback.light();
  }, []);
  
  const contextValue: DragDropContextValue = {
    draggedItem,
    draggedFromContainer,
    dragOffset,
    dropZones,
    isDragging,
    registerDropZone,
    unregisterDropZone,
    startDrag,
    endDrag,
    cancelDrag
  };
  
  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
};

// Draggable Item Props
interface DraggableItemProps {
  children: ReactNode;
  item: DragItem;
  containerId: string;
  disabled?: boolean;
  dragHandle?: ReactNode;
  preview?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: (item: DragItem) => void;
  [key: string]: unknown;
}

// Draggable Item Component
export const DraggableItem: React.FC<DraggableItemProps> = ({
  children,
  item,
  containerId,
  disabled = false,
  dragHandle,
  preview,
  className = '',
  style = {},
  onDragStart,
  onDragEnd,
  ...props
}) => {
  const { startDrag, endDrag, isDragging, draggedItem } = useDragDrop();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDraggedItem, setIsDraggedItem] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Position>({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState<Position>({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  
  useEffect(() => {
    setIsDraggedItem(draggedItem === item);
  }, [draggedItem, item]);
  
  const handleMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (disabled || !elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const startPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    setDragStartPos(startPos);
    setCurrentPos({ x: event.clientX, y: event.clientY });
    setIsPressed(true);
    
    // Prevent text selection
    event.preventDefault();
  }, [disabled]);
  
  const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
    if (!isPressed || disabled) return;
    
    const deltaX = event.clientX - currentPos.x;
    const deltaY = event.clientY - currentPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Start dragging if moved more than 5 pixels
    if (distance > 5 && !isDragging) {
      startDrag(item, containerId, dragStartPos);
      
      if (onDragStart) {
        onDragStart(item);
      }
    }
    
    setCurrentPos({ x: event.clientX, y: event.clientY });
  }, [isPressed, disabled, isDragging, currentPos, startDrag, item, containerId, dragStartPos, onDragStart]);
  
  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
    
    if (isDraggedItem) {
      // Find drop zone under cursor
      const elementUnderCursor = document.elementFromPoint(currentPos.x, currentPos.y);
      const dropZone = elementUnderCursor?.closest('[data-drop-zone]');
      
      if (dropZone) {
        const dropZoneId = dropZone.getAttribute('data-drop-zone');
        const position = getDropPosition(dropZone as HTMLElement, currentPos);
        endDrag(dropZoneId, position);
      } else {
        endDrag(null, null);
      }
      
      if (onDragEnd) {
        onDragEnd(item);
      }
    }
  }, [isDraggedItem, currentPos, endDrag, item, onDragEnd]);
  
  const getDropPosition = (dropZone: HTMLElement, mousePos: Position): Position => {
    const rect = dropZone.getBoundingClientRect();
    const x = ((mousePos.x - rect.left) / rect.width) * 100;
    const y = ((mousePos.y - rect.top) / rect.height) * 100;
    return { x, y };
  };
  
  // Add global mouse event listeners
  useEffect(() => {
    if (isPressed) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isPressed, handleMouseMove, handleMouseUp]);
  
  // Touch events for mobile
  const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (disabled || !elementRef.current) return;
    
    const touch = event.touches[0];
    const rect = elementRef.current.getBoundingClientRect();
    const startPos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    
    setDragStartPos(startPos);
    setCurrentPos({ x: touch.clientX, y: touch.clientY });
    setIsPressed(true);
    
    // Prevent scrolling
    event.preventDefault();
  }, [disabled]);
  
  const handleTouchMove = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (!isPressed || disabled) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - currentPos.x;
    const deltaY = touch.clientY - currentPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > 5 && !isDragging) {
      startDrag(item, containerId, dragStartPos);
      HapticFeedback.medium();
      
      if (onDragStart) {
        onDragStart(item);
      }
    }
    
    setCurrentPos({ x: touch.clientX, y: touch.clientY });
    
    // Prevent scrolling during drag
    event.preventDefault();
  }, [isPressed, disabled, isDragging, currentPos, startDrag, item, containerId, dragStartPos, onDragStart]);
  
  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    
    if (isDraggedItem) {
      const elementUnderCursor = document.elementFromPoint(currentPos.x, currentPos.y);
      const dropZone = elementUnderCursor?.closest('[data-drop-zone]');
      
      if (dropZone) {
        const dropZoneId = dropZone.getAttribute('data-drop-zone');
        const position = getDropPosition(dropZone as HTMLElement, currentPos);
        endDrag(dropZoneId, position);
      } else {
        endDrag(null, null);
      }
      
      HapticFeedback.success();
      
      if (onDragEnd) {
        onDragEnd(item);
      }
    }
  }, [isDraggedItem, currentPos, endDrag, item, onDragEnd]);
  
  const getDragStyles = (): CSSProperties => {
    if (!isDraggedItem) return {};
    
    return {
      position: 'fixed',
      left: currentPos.x - dragStartPos.x,
      top: currentPos.y - dragStartPos.y,
      zIndex: 1000,
      transform: 'rotate(5deg) scale(1.05)',
      opacity: 0.9,
      pointerEvents: 'none',
      transition: 'none'
    };
  };
  
  const getItemClasses = () => {
    const baseClasses = 'draggable-item transition-all duration-200';
    const stateClasses = [
      isDraggedItem && 'dragging opacity-50',
      isPressed && !isDraggedItem && 'pressed scale-95',
      !disabled && 'cursor-grab active:cursor-grabbing',
      disabled && 'opacity-50 cursor-not-allowed'
    ].filter(Boolean).join(' ');
    
    return `${baseClasses} ${stateClasses} ${className}`;
  };
  
  return (
    <>
      <div
        ref={elementRef}
        className={getItemClasses()}
        style={{ ...style, ...(isDraggedItem ? {} : {}) }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-draggable="true"
        data-item-id={(item as any)?.id || item}
        {...props}
      >
        {children}
      </div>
      
      {/* Drag Preview */}
      {isDraggedItem && (
        <div
          className="drag-preview pointer-events-none" style={getDragStyles()}>
          {preview || children}
        </div>
      )}
    </>
  );
};

// Drop Zone Props
interface DropZoneProps {
  children: ReactNode;
  id: string;
  accepts?: string[];
  onDrop?: (item: DragItem, fromContainer: string | null, toContainer: string, position: Position | null) => void;
  onDragEnter?: (item: DragItem) => void;
  onDragLeave?: (item: DragItem) => void;
  className?: string;
  dropIndicator?: boolean;
  highlightOnHover?: boolean;
  [key: string]: unknown;
}

// Drop Zone Component
export const DropZone: React.FC<DropZoneProps> = ({
  children,
  id,
  accepts = [],
  onDrop,
  onDragEnter,
  onDragLeave,
  className = '',
  dropIndicator = true,
  highlightOnHover = true,
  ...props
}) => {
  const { 
    registerDropZone, 
    unregisterDropZone, 
    isDragging, 
    draggedItem 
  } = useDragDrop();
  
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canAccept, setCanAccept] = useState(true);
  
  useEffect(() => {
    if (elementRef.current) {
      registerDropZone(id, elementRef.current, { accepts, onDrop });
    }
    
    return () => unregisterDropZone(id);
  }, [id, accepts, onDrop, registerDropZone, unregisterDropZone]);
  
  useEffect(() => {
    if (draggedItem && accepts.length > 0) {
      const itemType = (draggedItem as any).type || 'default';
      setCanAccept(accepts.includes(itemType) || accepts.includes('*'));
    } else {
      setCanAccept(true);
    }
  }, [draggedItem, accepts]);
  
  const handleMouseEnter = useCallback(() => {
    if (isDragging && canAccept) {
      setIsHovered(true);
      HapticFeedback.light();
      
      if (onDragEnter && draggedItem) {
        onDragEnter(draggedItem);
      }
    }
  }, [isDragging, canAccept, onDragEnter, draggedItem]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    
    if (onDragLeave && draggedItem) {
      onDragLeave(draggedItem);
    }
  }, [onDragLeave, draggedItem]);
  
  const getDropZoneClasses = () => {
    const baseClasses = 'drop-zone transition-all duration-200';
    const stateClasses = [
      isDragging && canAccept && 'drag-active',
      isHovered && 'drag-hover bg-blue-50 border-2 border-blue-300 border-dashed',
      isDragging && !canAccept && 'drag-reject opacity-50',
      highlightOnHover && isDragging && canAccept && 'border border-gray-300 border-dashed'
    ].filter(Boolean).join(' ');
    
    return `${baseClasses} ${stateClasses} ${className}`;
  };
  
  return (
    <div
      ref={elementRef}
      className={getDropZoneClasses()}
      data-drop-zone={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      
      {/* Drop Indicator */}
      {dropIndicator && isDragging && canAccept && isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg pointer-events-none">
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Drop here</span>
          </div>
        </div>
      )}
      
      {/* Reject Indicator */}
      {dropIndicator && isDragging && !canAccept && isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90 rounded-lg pointer-events-none">
          <div className="flex items-center gap-2 text-red-600 font-medium">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            <span>Cannot drop here</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Sortable List Props
interface SortableListProps<T> {
  items: T[];
  onReorder?: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T) => string;
  direction?: 'vertical' | 'horizontal';
  className?: string;
  itemClassName?: string;
  [key: string]: unknown;
}

// Sortable List Component
export function SortableList<T extends DragItem>({
  items,
  onReorder,
  renderItem,
  keyExtractor = (item) => (item as any).id,
  direction = 'vertical',
  className = '',
  itemClassName = '',
  ...props
}: SortableListProps<T>) {
  const [sortedItems, setSortedItems] = useState(items);
  const [draggedOver, setDraggedOver] = useState<number | null>(null);
  
  useEffect(() => {
    setSortedItems(items);
  }, [items]);
  
  const handleDragEnd = useCallback((draggedItem: DragItem, fromContainer: string | null, toContainer: string | null, position: Position | null) => {
    if (!toContainer || toContainer !== 'sortable-list') return;
    
    const draggedIndex = sortedItems.findIndex(item => keyExtractor(item) === keyExtractor(draggedItem as T));
    const newItems = [...sortedItems];
    
    // Remove dragged item
    newItems.splice(draggedIndex, 1);
    
    // Find insertion index based on position
    let insertIndex = 0;
    if (draggedOver !== null) {
      insertIndex = draggedOver;
    }
    
    // Insert at new position
    newItems.splice(insertIndex, 0, draggedItem as T);
    
    setSortedItems(newItems);
    setDraggedOver(null);
    
    if (onReorder) {
      onReorder(newItems);
    }
  }, [sortedItems, keyExtractor, draggedOver, onReorder]);
  
  const handleDragEnter = useCallback((index: number) => {
    setDraggedOver(index);
  }, []);
  
  const getListClasses = () => {
    const directionClasses = direction === 'horizontal' 
      ? 'flex flex-row gap-4' 
      : 'flex flex-col gap-2';
    
    return `sortable-list ${directionClasses} ${className}`;
  };
  
  const getItemClasses = (index: number) => {
    const baseClasses = 'sortable-item relative';
    const stateClasses = [
      draggedOver === index && 'drag-over',
      itemClassName
    ].filter(Boolean).join(' ');
    
    return `${baseClasses} ${stateClasses}`;
  };
  
  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <DropZone 
        id="sortable-list" 
        className={getListClasses()}
        dropIndicator={false}
        {...props}
      >
        {sortedItems.map((item, index) => (
          <div
            key={keyExtractor(item)}
            className={getItemClasses(index)}
            onMouseEnter={() => handleDragEnter(index)}
          >
            <DraggableItem 
              item={item} 
              containerId="sortable-list"
              className="w-full">

              {renderItem(item, index)}
            </DraggableItem>
            
            {/* Drop indicator line */}
            {draggedOver === index && (
              <div className={`
                absolute bg-blue-500 z-10 pointer-events-none
                ${direction === 'horizontal' 
                  ? 'left-0 top-0 bottom-0 w-1' 
                  : 'left-0 right-0 top-0 h-1'
                }
              `} />
            )}
          </div>
        ))}
      </DropZone>
    </DragDropProvider>
  );
}

// Card type for drag and drop - union of different card types
type BaseCard = {
  id: string;
  name: string;
  image?: string;
};

type CardWithImages = BaseCard & {
  images?: { large?: string; small?: string };
};

type CardType = TCGCard | PocketCard | CardWithImages;

// Card Grid Props
interface DraggableCardGridProps {
  cards: CardType[];
  onCardMove?: (card: CardType, fromContainer: string, toContainer: string) => void;
  onCardDrop?: (card: CardType, fromContainer: string | null, toContainer: string | null, position: Position | null) => void;
  gridClassName?: string;
  cardClassName?: string;
  columns?: number;
  renderCard?: (card: CardType, index: number) => ReactNode;
  keyExtractor?: (card: CardType) => string;
  [key: string]: unknown;
}

// Card Grid with Drag and Drop
export const DraggableCardGrid: React.FC<DraggableCardGridProps> = ({
  cards,
  onCardMove,
  onCardDrop,
  gridClassName = '',
  cardClassName = '',
  columns = 4,
  renderCard,
  keyExtractor = (card) => card.id,
  ...props
}) => {
  const handleDragEnd = useCallback((draggedCard: DragItem, fromContainer: string | null, toContainer: string | null, position: Position | null) => {
    if (onCardDrop) {
      onCardDrop(draggedCard as CardType, fromContainer, toContainer, position);
    }
  }, [onCardDrop]);
  
  const getGridClasses = () => {
    return `
      grid gap-4 
      grid-cols-1 
      sm:grid-cols-2 
      md:grid-cols-${Math.min(columns, 3)} 
      lg:grid-cols-${columns}
      ${gridClassName}
    `;
  };
  
  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className={getGridClasses()} {...props}>
        {cards.map((card, index) => (
          <DraggableItem
            key={keyExtractor(card)}
            item={card}
            containerId="card-grid"
            className={`draggable-card ${cardClassName}`}
          >
            {renderCard ? renderCard(card, index) : (
              <div className="card p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src={'image' in card && card.image ? card.image : 'images' in card && card.images?.large ? card.images.large : '/back-card.png'} 
                  alt={card.name} 
                  className="w-full h-auto rounded"  />
                <h3 className="mt-2 font-medium text-center">{card.name}</h3>
              </div>
            )}
          </DraggableItem>
        ))}
      </div>
    </DragDropProvider>
  );
};

// Collection Manager Props
interface DragDropCollectionManagerProps {
  collections: Record<string, CardType[]>;
  onMoveCard?: (card: CardType, fromContainer: string, toContainer: string) => void;
  onCreateCollection?: (name: string) => void;
  onDeleteCollection?: (id: string) => void;
  className?: string;
}

// Collection Manager with Drag and Drop
export const DragDropCollectionManager: React.FC<DragDropCollectionManagerProps> = ({
  collections,
  onMoveCard,
  onCreateCollection,
  onDeleteCollection,
  className = ''
}) => {
  const [collectionState, setCollectionState] = useState(collections);
  
  useEffect(() => {
    setCollectionState(collections);
  }, [collections]);
  
  const handleDragEnd = useCallback((draggedCard: DragItem, fromContainer: string | null, toContainer: string | null, position: Position | null) => {
    if (!fromContainer || !toContainer || fromContainer === toContainer) return;
    
    // Update local state
    setCollectionState(prev => {
      const newState = { ...prev };
      
      // Remove from source
      if (newState[fromContainer]) {
        newState[fromContainer] = newState[fromContainer].filter(
          card => card.id !== (draggedCard as CardType).id
        );
      }
      
      // Add to target
      if (newState[toContainer]) {
        newState[toContainer] = [...newState[toContainer], draggedCard as CardType];
      }
      
      return newState;
    });
    
    // Notify parent
    if (onMoveCard) {
      onMoveCard(draggedCard as CardType, fromContainer, toContainer);
    }
    
    HapticFeedback.success();
  }, [onMoveCard]);
  
  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className={`collection-manager ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(collectionState).map(([collectionId, cards]) => (
            <div key={collectionId} className="collection">
              <div className="collection-header flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize">
                  {collectionId.replace('-', ' ')}
                </h3>
                <span className="text-sm text-gray-500">
                  {cards.length} cards
                </span>
              </div>
              
              <DropZone
                id={collectionId}
                className="collection-drop-zone min-h-40 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200" accepts={['card']}>
                <div className="grid grid-cols-2 gap-2">
                  {cards.map((card) => (
                    <DraggableItem
                      key={card.id}
                      item={card}
                      containerId={collectionId}
                      className="collection-card">

                      <div className="card-mini bg-white rounded p-2 shadow-sm hover:shadow-md transition-shadow">
                        <img 
                          src={'image' in card && card.image ? card.image : 'images' in card && card.images?.small ? card.images.small : '/back-card.png'} 
                          alt={card.name}
                          className="w-full h-20 object-cover rounded mb-1"  />
                        <p className="text-xs text-center truncate">{card.name}</p>
                      </div>
                    </DraggableItem>
                  ))}
                </div>
                
                {cards.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-sm">Drop cards here</p>
                    </div>
                  </div>
                )}
              </DropZone>
            </div>
          ))}
        </div>
      </div>
    </DragDropProvider>
  );
};


// Default export contains only React components
export default {
  DragDropProvider,
  DraggableItem,
  DropZone,
  SortableList,
  DraggableCardGrid,
  DragDropCollectionManager
};