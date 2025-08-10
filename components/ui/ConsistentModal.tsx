// DEPRECATED: This component is being replaced by AdvancedModalSystem
// Using ModalWrapper for backwards compatibility
import React from 'react';
import Modal from './ModalWrapper';
import type { ModalProps } from './ModalWrapper';

export interface ConsistentModalProps extends ModalProps {
  description?: string;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const ConsistentModal: React.FC<ConsistentModalProps> = (props) => {
  // Map ConsistentModal props to Modal props
  const { 
    description, 
    footer, 
    closeOnOverlayClick = true,
    closeOnEscape = true,
    ...modalProps 
  } = props;

  return (
    <Modal 
      {...modalProps} 
      closeOnBackdrop={closeOnOverlayClick}
    />
  );
};

export default ConsistentModal;