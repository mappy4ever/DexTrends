/**
 * ConfirmDialog - Confirmation dialog wrapper for Modal
 *
 * A simple, accessible confirmation dialog for destructive actions
 * or important decisions.
 *
 * Usage:
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Item?"
 *   message="This action cannot be undone."
 *   confirmText="Delete"
 *   variant="danger"
 * />
 */

import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { cn } from '@/utils/cn';
import { HiExclamation, HiInformationCircle, HiCheckCircle, HiXCircle } from 'react-icons/hi';

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Called when dialog should close */
  onClose: () => void;
  /** Called when user confirms */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message?: string;
  /** Confirm button text (default: "Confirm") */
  confirmText?: string;
  /** Cancel button text (default: "Cancel") */
  cancelText?: string;
  /** Dialog variant affects icon and confirm button color */
  variant?: 'default' | 'danger' | 'warning' | 'success';
  /** Show loading state on confirm button */
  loading?: boolean;
  /** Custom icon override */
  icon?: React.ReactNode;
  /** Additional content between message and buttons */
  children?: React.ReactNode;
}

const variantConfig = {
  default: {
    icon: HiInformationCircle,
    iconClass: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    buttonVariant: 'primary' as const,
  },
  danger: {
    icon: HiXCircle,
    iconClass: 'text-red-500 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: HiExclamation,
    iconClass: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    buttonVariant: 'primary' as const,
  },
  success: {
    icon: HiCheckCircle,
    iconClass: 'text-green-500 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    buttonVariant: 'primary' as const,
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  icon,
  children,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = async () => {
    await onConfirm();
    // Only close if onConfirm doesn't throw
    // Parent can handle closing in onConfirm if needed
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      showCloseButton={false}
    >
      <div className="flex flex-col items-center text-center px-2 pb-2">
        {/* Icon */}
        <div className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center mb-4',
          config.iconBg
        )}>
          {icon || <IconComponent className={cn('w-8 h-8', config.iconClass)} />}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
            {message}
          </p>
        )}

        {/* Custom content */}
        {children && (
          <div className="w-full mb-4">
            {children}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 w-full mt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            loading={loading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
