import React, { useEffect, useState } from "react";
import styles from "./ModalCategory.module.scss";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import firebaseConfig from "../../../firebaseConfig";
import { getAuth } from "firebase/auth";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendText: (text: string, category: string) => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
}

const ModalCategory: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSendText,
  text,
  setText,
  category,
  setCategory,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>(""); // Estado para o valor do novo input de categoria
  const [dbCollection, setDbCollection] = useState<string>("messagos");
  const [dbCategories, setDbCategories] = useState<string>("categorios");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    const fetchCategories = async () => {
      if (auth.currentUser) {
        setDbCategories("categories");
      } else {
        setDbCategories("categorios");
      }
      try {
        const categoriesCollection = collection(db, dbCategories);
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList: string[] = [];
        categoriesSnapshot.forEach((doc) => {
          const categoryData = doc.data();
          categoriesList.push(categoryData.category);
        });
        setCategories(categoriesList);

        if (categoriesList.length > 0 && !category) {
          setCategory(categoriesList[0]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [isOpen, category, setCategory]);

  const handleSend = async () => {
    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const docRef = await addDoc(collection(db, dbCategories), {
        category: newCategory.trim(), // Adicionar a nova categoria ao Firestore
      });
      console.log("Document written with ID: ", docRef.id);

      // Atualizar o estado local com a nova categoria adicionada
      setCategories([...categories, newCategory.trim()]);

      onSendText(text, newCategory.trim()); // Enviar o texto e a nova categoria
      onClose();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return isOpen ? (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h1 className={styles.modalTitle}>Nova Categoria</h1>
        <div className={styles.middleContent}>
          <input
            className={styles.categorySelect}
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
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
    </div>
  ) : null;
};

export default ModalCategory;
