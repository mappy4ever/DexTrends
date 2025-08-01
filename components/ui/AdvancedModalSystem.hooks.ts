import { useContext, useCallback, ComponentType } from 'react';
import { 
  ModalContext,
  ConfirmationModal, 
  ImageModal, 
  LoadingModal,
  type ModalContextValue,
  type ConfirmationModalProps,
  type ImageModalProps
} from './AdvancedModalSystem';

export const useModal = (): ModalContextValue => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

// Custom Modal Hook
export const useModalManager = () => {
  const { openModal, closeModal, closeAllModals } = useModal();
  
  const confirm = useCallback((options: Partial<ConfirmationModalProps> = {}) => {
    return new Promise<boolean>((resolve) => {
      const modalId = openModal(ConfirmationModal, {
        props: {
          ...options,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false)
        },
        closable: false
      });
    });
  }, [openModal]);
  
  const showImage = useCallback((src: string, options: Partial<ImageModalProps> = {}) => {
    return openModal(ImageModal, {
      props: { src, ...options },
      size: 'large',
      animation: 'scale'
    });
  }, [openModal]);
  
  const showLoading = useCallback((message = 'Loading...', progress?: number) => {
    return openModal(LoadingModal, {
      props: { message, progress },
      closable: false,
      backdrop: false,
      size: 'small'
    });
  }, [openModal]);
  
  return {
    openModal,
    closeModal,
    closeAllModals,
    confirm,
    showImage,
    showLoading
  };
};