import React, { useEffect, useState } from "react";
import styles from "./Modal.module.scss";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import firebaseConfig from "../../../firebaseConfig";


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
  const [categories, setCategories] = useState<string[]>([]); // Estado para armazenar as categorias do Firestore

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        const categoriesCollection = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList: string[] = [];
        categoriesSnapshot.forEach((doc) => {
          const categoryData = doc.data();
          categoriesList.push(categoryData.category); // Considerando que cada documento tem um campo "category"
        });
        setCategories(categoriesList);
        // Definir a primeira categoria como a categoria inicial
        if (categoriesList.length > 0 && !category) {
          setCategory(categoriesList[0]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [isOpen]); // Executa quando o modal é aberto ou fechado

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
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
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
