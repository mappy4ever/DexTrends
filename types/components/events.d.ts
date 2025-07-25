// Event handler type definitions for components

import { MouseEvent, KeyboardEvent, FocusEvent, ChangeEvent, FormEvent, DragEvent, TouchEvent, WheelEvent, ClipboardEvent } from 'react';

// Mouse event handlers
export type MouseEventHandler<T = HTMLElement> = (event: MouseEvent<T>) => void;
export type ClickHandler<T = HTMLElement> = MouseEventHandler<T>;
export type DoubleClickHandler<T = HTMLElement> = MouseEventHandler<T>;
export type MouseDownHandler<T = HTMLElement> = MouseEventHandler<T>;
export type MouseUpHandler<T = HTMLElement> = MouseEventHandler<T>;
export type MouseEnterHandler<T = HTMLElement> = MouseEventHandler<T>;
export type MouseLeaveHandler<T = HTMLElement> = MouseEventHandler<T>;
export type MouseMoveHandler<T = HTMLElement> = MouseEventHandler<T>;
export type MouseOverHandler<T = HTMLElement> = MouseEventHandler<T>;
export type MouseOutHandler<T = HTMLElement> = MouseEventHandler<T>;
export type ContextMenuHandler<T = HTMLElement> = MouseEventHandler<T>;

// Keyboard event handlers
export type KeyboardEventHandler<T = HTMLElement> = (event: KeyboardEvent<T>) => void;
export type KeyDownHandler<T = HTMLElement> = KeyboardEventHandler<T>;
export type KeyUpHandler<T = HTMLElement> = KeyboardEventHandler<T>;
export type KeyPressHandler<T = HTMLElement> = KeyboardEventHandler<T>;

// Focus event handlers
export type FocusEventHandler<T = HTMLElement> = (event: FocusEvent<T>) => void;
export type FocusHandler<T = HTMLElement> = FocusEventHandler<T>;
export type BlurHandler<T = HTMLElement> = FocusEventHandler<T>;

// Form event handlers
export type FormEventHandler<T = HTMLFormElement> = (event: FormEvent<T>) => void;
export type SubmitHandler<T = HTMLFormElement> = FormEventHandler<T>;
export type ChangeEventHandler<T = HTMLElement> = (event: ChangeEvent<T>) => void;
export type InputEventHandler<T = HTMLInputElement> = (event: ChangeEvent<T>) => void;
export type TextAreaEventHandler = ChangeEventHandler<HTMLTextAreaElement>;
export type SelectEventHandler = ChangeEventHandler<HTMLSelectElement>;

// Touch event handlers
export type TouchEventHandler<T = HTMLElement> = (event: TouchEvent<T>) => void;
export type TouchStartHandler<T = HTMLElement> = TouchEventHandler<T>;
export type TouchEndHandler<T = HTMLElement> = TouchEventHandler<T>;
export type TouchMoveHandler<T = HTMLElement> = TouchEventHandler<T>;
export type TouchCancelHandler<T = HTMLElement> = TouchEventHandler<T>;

// Drag event handlers
export type DragEventHandler<T = HTMLElement> = (event: DragEvent<T>) => void;
export type DragStartHandler<T = HTMLElement> = DragEventHandler<T>;
export type DragEndHandler<T = HTMLElement> = DragEventHandler<T>;
export type DragEnterHandler<T = HTMLElement> = DragEventHandler<T>;
export type DragLeaveHandler<T = HTMLElement> = DragEventHandler<T>;
export type DragOverHandler<T = HTMLElement> = DragEventHandler<T>;
export type DropHandler<T = HTMLElement> = DragEventHandler<T>;

// Other event handlers
export type WheelEventHandler<T = HTMLElement> = (event: WheelEvent<T>) => void;
export type ScrollHandler<T = HTMLElement> = (event: Event) => void;
export type ClipboardEventHandler<T = HTMLElement> = (event: ClipboardEvent<T>) => void;
export type CopyHandler<T = HTMLElement> = ClipboardEventHandler<T>;
export type CutHandler<T = HTMLElement> = ClipboardEventHandler<T>;
export type PasteHandler<T = HTMLElement> = ClipboardEventHandler<T>;

// Custom event handlers
export type ToggleHandler = (value: boolean) => void;
export type SelectHandler<T = any> = (value: T) => void;
export type MultiSelectHandler<T = any> = (values: T[]) => void;
export type SearchHandler = (query: string) => void;
export type SortHandler<T = any> = (field: keyof T | string, order: 'asc' | 'desc') => void;
export type PageChangeHandler = (page: number, pageSize?: number) => void;
export type FilterHandler<T = any> = (filters: Partial<T>) => void;
export type UploadHandler = (file: File | File[]) => void | Promise<void>;
export type DeleteHandler<T = any> = (item: T) => void | Promise<void>;
export type SaveHandler<T = any> = (data: T) => void | Promise<void>;
export type CancelHandler = () => void;
export type RetryHandler = () => void | Promise<void>;
export type RefreshHandler = () => void | Promise<void>;

// Component-specific event handlers
export interface CardEventHandlers {
  onClick?: ClickHandler;
  onDoubleClick?: DoubleClickHandler;
  onMouseEnter?: MouseEnterHandler;
  onMouseLeave?: MouseLeaveHandler;
  onFavorite?: (isFavorite: boolean) => void;
  onCompare?: (isComparing: boolean) => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void | Promise<void>;
}

export interface ListEventHandlers<T> {
  onItemClick?: (item: T, index: number) => void;
  onItemSelect?: (item: T, selected: boolean) => void;
  onItemsSelect?: (items: T[]) => void;
  onSort?: SortHandler<T>;
  onFilter?: FilterHandler<T>;
  onSearch?: SearchHandler;
  onLoadMore?: () => void | Promise<void>;
  onRefresh?: RefreshHandler;
}

export interface FormEventHandlers<T = any> {
  onSubmit?: (data: T) => void | Promise<void>;
  onChange?: (field: keyof T, value: any) => void;
  onFieldChange?: (changes: Partial<T>) => void;
  onValidate?: (data: T) => boolean | Promise<boolean>;
  onReset?: () => void;
  onCancel?: CancelHandler;
  onDirtyChange?: (isDirty: boolean) => void;
}

export interface ModalEventHandlers {
  onOpen?: () => void;
  onClose?: () => void;
  onConfirm?: () => void | Promise<void>;
  onCancel?: CancelHandler;
  onBackdropClick?: ClickHandler;
  onEscapePress?: KeyDownHandler;
}

export interface NavigationEventHandlers {
  onNavigate?: (path: string) => void;
  onTabChange?: (tabId: string) => void;
  onMenuToggle?: ToggleHandler;
  onSearch?: SearchHandler;
  onUserMenuClick?: () => void;
  onNotificationClick?: () => void;
}

// Gesture event handlers
export interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

// Animation event handlers
export interface AnimationHandlers {
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  onAnimationIteration?: () => void;
  onTransitionEnd?: () => void;
}

// Media event handlers
export interface MediaHandlers {
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onVolumeChange?: (volume: number) => void;
  onSeeking?: (time: number) => void;
  onSeeked?: () => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
}

// Lifecycle-like handlers for components
export interface ComponentLifecycleHandlers {
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdate?: () => void;
  onError?: (error: Error, errorInfo: any) => void;
  onReady?: () => void;
  onDestroy?: () => void;
}

// Keyboard navigation handlers
export interface KeyboardNavigationHandlers {
  onArrowUp?: KeyDownHandler;
  onArrowDown?: KeyDownHandler;
  onArrowLeft?: KeyDownHandler;
  onArrowRight?: KeyDownHandler;
  onEnter?: KeyDownHandler;
  onEscape?: KeyDownHandler;
  onSpace?: KeyDownHandler;
  onTab?: KeyDownHandler;
  onShiftTab?: KeyDownHandler;
  onHome?: KeyDownHandler;
  onEnd?: KeyDownHandler;
  onPageUp?: KeyDownHandler;
  onPageDown?: KeyDownHandler;
}

// Intersection observer handlers
export interface IntersectionHandlers {
  onIntersect?: (isIntersecting: boolean) => void;
  onEnterViewport?: () => void;
  onLeaveViewport?: () => void;
}

// Resize observer handlers
export interface ResizeHandlers {
  onResize?: (width: number, height: number) => void;
  onWidthChange?: (width: number) => void;
  onHeightChange?: (height: number) => void;
}

// Custom Pokemon/TCG specific handlers
export interface PokemonHandlers {
  onPokemonSelect?: (pokemonId: string | number) => void;
  onTypeFilter?: (types: string[]) => void;
  onGenerationChange?: (generation: number) => void;
  onEvolutionClick?: (evolutionId: string | number) => void;
  onMoveLearn?: (moveId: string) => void;
  onAbilityClick?: (abilityId: string) => void;
}

export interface TCGHandlers {
  onCardSelect?: (cardId: string) => void;
  onSetChange?: (setId: string) => void;
  onRarityFilter?: (rarities: string[]) => void;
  onPriceUpdate?: (cardId: string, price: number) => void;
  onDeckAdd?: (cardId: string, count: number) => void;
  onDeckRemove?: (cardId: string, count: number) => void;
  onCollectionAdd?: (cardId: string) => void;
  onCollectionRemove?: (cardId: string) => void;
  onPackOpen?: (packId: string) => void;
  onTradeOffer?: (offeredCards: string[], requestedCards: string[]) => void;
}