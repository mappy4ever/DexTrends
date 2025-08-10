// DEPRECATED: This component is being replaced by AdvancedModalSystem
// Using ModalWrapper for backwards compatibility
import React from 'react';
import Modal from './ModalWrapper';
import type { ModalProps } from './ModalWrapper';

type ModalVariant = "scale" | "slide" | "flip" | "fade";
type ModalPosition = "center" | "top" | "bottom";

interface EnhancedModalProps extends ModalProps {
  variant?: ModalVariant;
  position?: ModalPosition;
  closeOnBackdrop?: boolean;
  backdropClassName?: string;
  contentClassName?: string;
}

const EnhancedModal: React.FC<EnhancedModalProps> = ({ 
  variant,
  position,
  closeOnBackdrop = true,
  backdropClassName,
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