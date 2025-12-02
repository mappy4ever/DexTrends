/**
 * EmptyStateGlass - Deprecated wrapper for EmptyState
 *
 * @deprecated Use EmptyState directly from './EmptyState'
 * This file exists for backwards compatibility only.
 * Glass effects should only be used on modals/sheets per design rules.
 */

import React from 'react';
import { EmptyState } from './EmptyState';

type EmptyStateType = 'search' | 'no-data' | 'error' | 'loading' | 'custom';

interface EmptyStateGlassProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  iconText?: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

/**
 * Maps EmptyStateGlass type to EmptyState illustration
 */
function mapTypeToIllustration(type: EmptyStateType): 'search' | 'empty' | 'error' | 'pokemon' | 'card' | 'collection' {
  switch (type) {
    case 'search':
      return 'search';
    case 'error':
      return 'error';
    case 'no-data':
    case 'loading':
    case 'custom':
    default:
      return 'empty';
  }
}

/**
 * Default titles/messages for backwards compatibility
 */
const defaultConfigs = {
  search: {
    title: 'No results found',
    message: "Try adjusting your search or filters to find what you're looking for.",
  },
  'no-data': {
    title: 'No data yet',
    message: 'Start by adding your first item to see it here.',
  },
  error: {
    title: 'Something went wrong',
    message: 'We encountered an error loading this content. Please try again.',
  },
  loading: {
    title: 'Loading...',
    message: 'Please wait while we fetch your data.',
  },
  custom: {
    title: '',
    message: '',
  },
};

/**
 * @deprecated Use EmptyState directly
 */
const EmptyStateGlass: React.FC<EmptyStateGlassProps> = ({
  type = 'no-data',
  title,
  message,
  icon,
  actionButton,
  secondaryButton,
  className = '',
}) => {
  const config = defaultConfigs[type];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  return (
    <EmptyState
      title={displayTitle}
      description={displayMessage}
      icon={icon}
      illustration={mapTypeToIllustration(type)}
      action={actionButton ? {
        label: actionButton.text,
        onClick: actionButton.onClick,
        variant: actionButton.variant === 'danger' ? 'primary' : actionButton.variant,
      } : undefined}
      secondaryAction={secondaryButton ? {
        label: secondaryButton.text,
        onClick: secondaryButton.onClick,
      } : undefined}
      className={className}
    />
  );
};

export default EmptyStateGlass;
