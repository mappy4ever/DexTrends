import Modal from './ui/Modal';
import { useModal } from '../context/modalcontext';

export default function GlobalModal() {
  const { modalContent, closeModal } = useModal();

  if (!modalContent) return null;

  return (
    <Modal onClose={closeModal}>
      {modalContent}
    </Modal>
  );
}