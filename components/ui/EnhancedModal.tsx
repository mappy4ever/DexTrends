// DEPRECATED: This component is being replaced by AdvancedModalSystem
// Using ModalWrapper for backwards compatibility
import React from 'react';
import Modal from './ModalWrapper';
import type { ModalProps } from './ModalWrapper';

interface EnhancedModalProps extends ModalProps {
  closeOnBackdrop?: boolean;
  contentClassName?: string;
}

const EnhancedModal: React.FC<EnhancedModalProps> = ({ 
  closeOnBackdrop = true,
  contentClassName,
  className,
  ...modalProps
}) => {
  // Combine class names
  const combinedClassName = [className, contentClassName].filter(Boolean).join(' ');
  
  // Map props to Modal
  return (
    <Modal 
      {...modalProps}
      className={combinedClassName}
      closeOnBackdrop={closeOnBackdrop}
    />
  );
};

export default EnhancedModal;