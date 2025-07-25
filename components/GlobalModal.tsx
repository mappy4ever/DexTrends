import React from 'react';
import Modal from './ui/modals/Modal';
import { useModal } from '../context/UnifiedAppContext';

const GlobalModal: React.FC = () => {
  const { modal, closeModal } = useModal();

  if (!modal.isOpen || !modal.data) return null;

  return (
    <Modal isOpen={modal.isOpen} onClose={closeModal}>
      {modal.data}
    </Modal>
  );
};

export default GlobalModal;