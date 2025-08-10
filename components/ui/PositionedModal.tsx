// DEPRECATED: This component is being replaced by AdvancedModalSystem
// Using ModalWrapper for backwards compatibility
import React from 'react';
import Modal from './ModalWrapper';
import type { ModalProps } from './ModalWrapper';

interface PositionedModalProps extends Omit<ModalProps, 'size'> {
  maxWidth?: string;
  maxHeight?: string;
  centerVertically?: boolean;
}

// Map maxWidth to size prop
const mapWidthToSize = (maxWidth?: string): ModalProps['size'] => {
  if (!maxWidth) return 'md';
  if (maxWidth.includes('sm')) return 'sm';
  if (maxWidth.includes('lg')) return 'lg';
  if (maxWidth.includes('xl')) return 'xl';
  if (maxWidth.includes('full')) return 'full';
  return 'md';
};

// Enhanced Modal that appears at current scroll position
export const PositionedModal: React.FC<PositionedModalProps> = ({ 
  maxWidth = 'max-w-4xl',
  maxHeight = 'max-h-[90vh]',
  centerVertically = false,
  ...modalProps
}) => {
  // Map props and delegate to Modal
  return (
    <Modal 
      {...modalProps}
      size={mapWidthToSize(maxWidth)}
      className={`${modalProps.className || ''} ${maxHeight}`}
    />
  );
};

export default PositionedModal;