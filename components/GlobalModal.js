import Modal from './modal';
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