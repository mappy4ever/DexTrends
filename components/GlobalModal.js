import Modal from './Modal';
import { useModal } from '../context/ModalContext';

export default function GlobalModal() {
  const { modalContent, closeModal } = useModal();

  if (!modalContent) return null;

  return (
    <Modal onClose={closeModal}>
      {modalContent}
    </Modal>
  );
}