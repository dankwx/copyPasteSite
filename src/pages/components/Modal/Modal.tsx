// Modal.tsx

import React from "react";
import styles from "./Modal.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendText: (text: string, category: string) => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSendText,
  text,
  setText,
  category,
  setCategory,
}) => {
  const handleSend = () => {
    onSendText(text, category);
    onClose();
  };

  return isOpen ? (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h1 className={styles.modalTitle}>Nova Nota</h1>
        <textarea
          placeholder="Seu texto <3"
          name="text"
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              handleSend();
            }
          }}
        ></textarea>
        <select
          name="category"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.categorySelect}
        >
          <option value="Links">Links</option>
          <option value="Paleta de Cor">Paleta de Cor</option>
        </select>
        <div className={styles.modalButtons}>
          <button onClick={handleSend} className={styles.sendButton}>
            Enviar
          </button>
          <button onClick={onClose} className={styles.closeButton}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Modal;
