/**
 * EmptyState - Modern empty state component with animations
 * Used when there's no data to display or when a search returns no results
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  illustration?: 'search' | 'empty' | 'error' | 'pokemon' | 'card' | 'collection';
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const illustrations = {
  search: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
      <motion.circle
        cx="50"
        cy="50"
        r="30"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      <motion.line
        x1="72"
        y1="72"
        x2="100"
        y2="100"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
      <motion.text
        x="50"
        y="55"
        textAnchor="middle"
        className="text-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        ?
      </motion.text>
    </svg>
  ),
  empty: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
      <motion.rect
        x="20"
        y="30"
        width="80"
        height="60"
        rx="8"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.line
        x1="35"
        y1="50"
        x2="85"
        y2="50"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      />
      <motion.line
        x1="35"
        y1="60"
        x2="70"
        y2="60"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      />
      <motion.line
        x1="35"
        y1="70"
        x2="55"
        y2="70"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      />
    </svg>
  ),
  error: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
      <motion.circle
        cx="60"
        cy="60"
        r="40"
        stroke="currentColor"
        strokeWidth="4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      />
      <motion.line
        x1="45"
        y1="45"
        x2="75"
        y2="75"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      />
      <motion.line
        x1="75"
        y1="45"
        x2="45"
        y2="75"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
    </svg>
  ),
  pokemon: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
      <motion.circle
        cx="60"
        cy="60"
        r="45"
        stroke="currentColor"
        strokeWidth="4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 150 }}
      />
      <motion.line
        x1="15"
        y1="60"
        x2="105"
        y2="60"
        stroke="currentColor"
        strokeWidth="4"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      />
      <motion.circle
        cx="60"
        cy="60"
        r="15"
        stroke="currentColor"
        strokeWidth="4"
        fill="white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      />
      <motion.circle
        cx="60"
        cy="60"
        r="6"
        fill="currentColor"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
      />
    </svg>
  ),
  card: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
      <motion.rect
        x="25"
        y="15"
        width="70"
        height="90"
        rx="8"
        stroke="currentColor"
        strokeWidth="3"
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.rect
        x="35"
        y="25"
        width="50"
        height="40"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.4 }}
      />
      <motion.line
        x1="35"
        y1="75"
        x2="85"
        y2="75"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5 }}
      />
      <motion.line
        x1="35"
        y1="85"
        x2="65"
        y2="85"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6 }}
      />
    </svg>
  ),
  collection: (
    <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
      <motion.rect
        x="10"
        y="20"
        width="40"
        height="50"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      />
      <motion.rect
        x="40"
        y="25"
        width="40"
        height="50"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      />
      <motion.rect
        x="70"
        y="20"
        width="40"
        height="50"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      />
      <motion.path
        d="M30 85 L60 95 L90 85"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      />
    </svg>
  )
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  illustration = 'empty',
  action,
  secondaryAction,
  size = 'md',
  className
}) => {
  const sizeStyles = {
    sm: {
      container: 'py-6 px-4',
      icon: 'w-16 h-16',
      title: 'text-base',
      description: 'text-sm'
    },
    md: {
      container: 'py-10 px-6',
      icon: 'w-24 h-24',
      title: 'text-lg',
      description: 'text-base'
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-32 h-32',
      title: 'text-xl',
      description: 'text-lg'
    }
  };

  const styles = sizeStyles[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        styles.container,
        className
      )}
    >
      {/* Icon/Illustration */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={cn(
          'text-stone-300 dark:text-stone-600 mb-4',
          styles.icon
        )}
      >
        {icon || illustrations[illustration]}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          'font-semibold text-stone-700 dark:text-stone-300 mb-2',
          styles.title
        )}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'text-stone-500 dark:text-stone-300 max-w-md mb-6',
            styles.description
          )}
        >
          {description}
        </motion.p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              size={size === 'lg' ? 'lg' : 'md'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              size={size === 'lg' ? 'lg' : 'md'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * NoSearchResults - Specialized empty state for search
 */
export const NoSearchResults: React.FC<{
  searchTerm?: string;
  onClear?: () => void;
  suggestions?: string[];
  className?: string;
}> = ({ searchTerm, onClear, suggestions, className }) => {
  return (
    <EmptyState
      illustration="search"
      title={searchTerm ? `No results for "${searchTerm}"` : "No results found"}
      description="Try adjusting your search or filters to find what you're looking for."
      action={onClear ? { label: "Clear Search", onClick: onClear, variant: "secondary" } : undefined}
      className={className}
    />
  );
};

/**
 * EmptyCollection - Empty state for collections
 */
export const EmptyCollection: React.FC<{
  collectionName?: string;
  onAdd?: () => void;
  className?: string;
}> = ({ collectionName = "collection", onAdd, className }) => {
  return (
    <EmptyState
      illustration="collection"
      title={`Your ${collectionName} is empty`}
      description={`Start building your ${collectionName} by adding your first item.`}
      action={onAdd ? { label: "Add First Item", onClick: onAdd } : undefined}
      className={className}
    />
  );
};

/**
 * ErrorState - Empty state for errors
 */
export const ErrorState: React.FC<{
  error?: string;
  onRetry?: () => void;
  className?: string;
}> = ({ error, onRetry, className }) => {
  return (
    <EmptyState
      illustration="error"
      title="Something went wrong"
      description={error || "We encountered an error while loading this content. Please try again."}
      action={onRetry ? { label: "Try Again", onClick: onRetry } : undefined}
      className={className}
    />
  );
};

export default EmptyState;
