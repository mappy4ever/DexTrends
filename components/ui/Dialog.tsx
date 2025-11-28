import React from 'react';
import { Modal, ModalProps } from './Modal';
import { cn } from '../../utils/cn';

export interface DialogProps extends Omit<ModalProps, 'children'> {
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  confirmButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  cancelButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Dialog Component - Specialized modal for confirmations and alerts
 * Built on top of Modal component for consistency
 */
export const Dialog: React.FC<DialogProps> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  confirmButtonProps,
  cancelButtonProps,
  size = 'sm',
  ...modalProps
}) => {
  const variantStyles = {
    default: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
  };

  const handleCancel = () => {
    onCancel?.();
    modalProps.onClose();
  };

  const handleConfirm = () => {
    onConfirm?.();
    modalProps.onClose();
  };

  return (
    <Modal
      {...modalProps}
      size={size}
      footer={
        <div className="flex gap-3 justify-end">
          {onCancel !== undefined && (
            <button
              onClick={handleCancel}
              className={cn(
                'px-4 py-2 rounded-lg font-medium',
                'bg-stone-200 dark:bg-stone-700',
                'text-stone-900 dark:text-stone-100',
                'hover:bg-stone-300 dark:hover:bg-stone-600',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500',
                'transition-colors duration-200'
              )}
              {...cancelButtonProps}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-white',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'transition-colors duration-200',
              variantStyles[variant]
            )}
            {...confirmButtonProps}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <div className="py-4">
        {typeof message === 'string' ? (
          <p className="text-stone-700 dark:text-stone-300">{message}</p>
        ) : (
          message
        )}
      </div>
    </Modal>
  );
};

export default Dialog;