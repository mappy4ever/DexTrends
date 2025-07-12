import Modal from './ui/modals/Modal';
import { useModal } from '../context/UnifiedAppContext';

export default function GlobalModal() {
  const { modalContent, closeModal } = useModal();

  if (!modalContent) return null;

  return (
    <Modal onClose={closeModal}>
      {modalContent}
    </Modal>
  );
}