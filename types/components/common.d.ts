// Common component prop types and interfaces

import { ReactNode, CSSProperties } from 'react';

// Base component props that many components extend
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  id?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

// Size variants used across many components
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type CompactSize = 'compact' | 'regular' | 'large';

// Common color schemes
export type ColorScheme = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

// Loading states
export interface LoadingProps extends BaseComponentProps {
  loading?: boolean;
  loadingText?: string;
  spinner?: boolean;
  overlay?: boolean;
}

// Error states
export interface ErrorProps extends BaseComponentProps {
  error?: Error | string | null;
  onRetry?: () => void;
  retryText?: string;
}

// Card component props (used by many card-like components)
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  onClick?: () => void;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  disabled?: boolean;
  selected?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  shadow?: boolean | 'sm' | 'md' | 'lg' | 'xl';
}

// List component props
export interface ListProps<T> extends BaseComponentProps {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: string;
  emptyComponent?: ReactNode;
  loading?: boolean;
  loadingComponent?: ReactNode;
  error?: Error | string | null;
  errorComponent?: ReactNode;
  onItemClick?: (item: T, index: number) => void;
  selectedItems?: T[];
  multiSelect?: boolean;
}

// Modal/Dialog props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
  preventScroll?: boolean;
  centered?: boolean;
  animation?: 'fade' | 'slide' | 'scale' | 'none';
}

// Form-related props
export interface InputProps extends BaseComponentProps {
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url';
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  size?: ComponentSize;
  error?: boolean | string;
  success?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyUp?: (event: React.KeyboardEvent) => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
  icon?: ReactNode;
  description?: string;
}

export interface SelectProps<T = any> extends BaseComponentProps {
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean | string;
  size?: ComponentSize;
  onChange?: (value: T) => void;
  onSearch?: (query: string) => void;
  renderOption?: (option: SelectOption<T>) => ReactNode;
  renderValue?: (value: T) => ReactNode;
}

// Button props
export interface ButtonProps extends BaseComponentProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  color?: ColorScheme;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  target?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

// Image props
export interface ImageProps extends BaseComponentProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  sizes?: string;
}

// Navigation props
export interface NavItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  children?: NavItem[];
  active?: boolean;
}

export interface NavigationProps extends BaseComponentProps {
  items: NavItem[];
  activeItemId?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'tabs' | 'pills' | 'underline' | 'menu';
  size?: ComponentSize;
  fullWidth?: boolean;
  sticky?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onItemClick?: (item: NavItem) => void;
}

// Table props
export interface Column<T> {
  key: string;
  title: string;
  dataIndex?: keyof T | string;
  render?: (value: unknown, record: T, index: number) => ReactNode;  // Table cell value - can be any table data type
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  fixed?: 'left' | 'right';
  className?: string;
}

export interface TableProps<T> extends BaseComponentProps {
  columns: Column<T>[];
  data: T[];
  rowKey?: keyof T | ((record: T) => string | number);
  loading?: boolean;
  empty?: ReactNode;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  sorting?: {
    field?: string;
    order?: 'asc' | 'desc';
    onChange: (field: string, order: 'asc' | 'desc') => void;
  };
  selection?: {
    selectedKeys: (string | number)[];
    onChange: (selectedKeys: (string | number)[]) => void;
    type?: 'checkbox' | 'radio';
  };
  expandable?: {
    expandedKeys: (string | number)[];
    onExpand: (expanded: boolean, record: T) => void;
    expandedRowRender: (record: T) => ReactNode;
  };
  onRowClick?: (record: T, index: number) => void;
  rowClassName?: (record: T, index: number) => string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  sticky?: boolean;
}

// Toast/Notification props
export interface ToastProps {
  id?: string;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

// Tooltip props
export interface TooltipProps extends BaseComponentProps {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  delay?: number | { show?: number; hide?: number };
  arrow?: boolean;
  offset?: [number, number];
  disabled?: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

// Badge props
export interface BadgeProps extends BaseComponentProps {
  count?: number | string;
  dot?: boolean;
  max?: number;
  showZero?: boolean;
  color?: ColorScheme | string;
  size?: 'sm' | 'md' | 'lg';
  offset?: [number, number];
  status?: 'success' | 'processing' | 'error' | 'default' | 'warning';
  text?: string;
}

// Progress props
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: ComponentSize;
  variant?: 'line' | 'circle' | 'dashboard';
  strokeWidth?: number;
  showInfo?: boolean;
  format?: (value: number, max: number) => ReactNode;
  color?: ColorScheme | string | string[];
  trailColor?: string;
  strokeLinecap?: 'round' | 'square';
  status?: 'active' | 'success' | 'exception' | 'normal';
}

// Skeleton props
export interface SkeletonProps extends BaseComponentProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
  count?: number;
}

// Accessibility props
export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  'aria-busy'?: boolean;
  role?: string;
  tabIndex?: number;
}