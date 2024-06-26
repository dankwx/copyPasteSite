import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../firebaseConfig";
import {
  QueryDocumentSnapshot,
  DocumentData,
  doc,
  getDocs,
} from "firebase/firestore";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  addDoc,
  DocumentReference,
  orderBy,
  deleteDoc,
  QuerySnapshot,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

import styles from "./Home.module.scss";
import copy from "clipboard-copy";
import Modal from "../components/Modal/Modal";
import ModalCategory from "../components/ModalCategory/ModalCategory";
import { getAuth } from "firebase/auth";
import { signOut } from "firebase/auth";

interface Message {
  message: string;
  category: string;
  timestamp: Timestamp;
}

export default function Home() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [loggedUser, setLoggedUser] = useState<unknown | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("Geral");
  const [filterCategory, setFilterCategory] = useState<string>("Geral");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCategoryOpen, setIsModalCategoryOpen] = useState(false);
  const [dbCollection, setDbCollection] = useState<string>("messagos");
  const [dbCategories, setDbCategories] = useState<string>("categorios");
  const [authStateChangedComplete, setAuthStateChangedComplete] =
    useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedUser(user.email);
        setDbCollection("messages");
        setDbCategories("categories"); // Atualiza dbCategories para "categories" quando logado
      } else {
        setLoggedUser(null);
        setDbCollection("messagos");
        setDbCategories("categorios"); // Atualiza dbCategories para "categorios" quando deslogado
      }
      setAuthStateChangedComplete(true); // Marca como completo após a execução
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (authStateChangedComplete) {
      const fetchCategories = async () => {
        try {
          const categoriesCollection = collection(db, dbCategories); // Usa o valor atualizado de dbCategories
          const categoriesSnapshot = await getDocs(categoriesCollection);
          const categoriesList: string[] = [];
          categoriesSnapshot.forEach((doc) => {
            const categoryData = doc.data();
            categoriesList.push(categoryData.category);
          });
          setCategories(categoriesList);
          if (categoriesList.length > 0) {
            setCategory(categoriesList[0]);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };

      fetchCategories();
    }
  }, [authStateChangedComplete, dbCategories, db]);

  useEffect(() => {
    const fetchMessages = async () => {
      const q = query(
        collection(db, dbCollection),
        orderBy("timestamp", "desc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messageData: Message[] = [];
        querySnapshot.forEach((doc) => {
          const message = doc.data().message;
          const category = doc.data().category;
          const timestamp = doc.data().timestamp;
          messageData.push({
            message: message,
            category: category,
            timestamp: timestamp,
          });
        });
        setMessages(messageData);
      });

      return () => {
        unsubscribe();
      };
    };

    fetchMessages();
  }, [db, dbCollection]);

  const logout = async () => {
    await signOut(auth);
  };

  const handleSendText = async () => {
    if (text.trim() !== "") {
      try {
        const now = Timestamp.now();
        const formattedText = text.replace(/\n/g, "<br>");
        const docRef: DocumentReference = await addDoc(
          collection(db, dbCollection),
          {
            message: formattedText,
            category: category,
            timestamp: now,
          }
        );
        console.log("Document written with ID:", docRef.id);
        setText("");
      } catch (error) {
        console.error("Error adding document:", error);
      }
    }
  };

  const handleCopyText = (message: Message) => {
    const formattedMessage = message.message.replace(/\n/g, "<br>");

    copy(formattedMessage)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      })
      .catch((error) => {
        console.error("Erro ao copiar texto:", error);
      });
  };

  const isLink = (str: string): boolean => {
    const pattern = /^(https?:\/\/)?([\w.]+)\.([a-z]{2,6}\.?)(\/[\w.]*)*\/?$/i;
    return pattern.test(str);
  };

  const LinkWrapper: React.FC<{ message: Message }> = ({ message }) => {
    const isMessageLink = isLink(message.message);

    if (isMessageLink) {
      return (
        <a
          href={message.message}
          className={styles.linkMessage}
          target="_blank"
          rel="noopener noreferrer"
        >
          {message.message}
        </a>
      );
    } else {
      return <span dangerouslySetInnerHTML={{ __html: message.message }} />;
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    try {
      if (!authStateChangedComplete) {
        console.error("Aguardando a conclusão da autenticação...");
        return;
      }
      const messagesCollection = collection(db, dbCollection);
      const q = query(messagesCollection, orderBy("timestamp", "desc"));
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const docToDelete: QueryDocumentSnapshot<DocumentData> | undefined =
        querySnapshot.docs.find(
          (doc) => doc.data().message === message.message
        );

      if (docToDelete) {
        await deleteDoc(doc(db, dbCollection, docToDelete.id));
      }
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
    }
  };

  return (
    <div className={styles.bodyArea}>
      <div className={styles.topArea}>
        <div className={styles.topContent}>
          <div className={styles.textBackground}>
            <h1 className={styles.title}>Copiar e Colar</h1>
          </div>

          <button onClick={() => setIsModalOpen(true)}>Nova nota</button>
          <label htmlFor="Filtro">Filtrar</label>
          <div className={styles.filterSection}>
            <select
              name="showOnly"
              id="showOnly"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button onClick={() => setIsModalCategoryOpen(true)}>
              Nova categoria
            </button>
          </div>
        </div>
      </div>
      <div className={styles.messageArea}>
        {messages.length === 0 ? (
          <div className={styles.noMessage}>
            <h1>Nenhum texto ainda :(</h1>
          </div>
        ) : (
          messages
            .filter(
              (message) =>
                filterCategory === "Geral" ||
                message.category === filterCategory
            )
            .map((message, index) => (
              <div className={styles.singleMessage} key={index}>
                <div className={styles.upperArea}>
                  <div className={styles.messageCategory}>
                    {message.category}
                  </div>

                  <div className={styles.svgArea}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className={styles.copyIcon}
                      onClick={() => handleCopyText(message)}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                      />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className={styles.deleteIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(message);
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </div>
                </div>
                <div className={styles.contentArea}>
                  <LinkWrapper message={message} />
                </div>
              </div>
            ))
        )}
      </div>
      {copySuccess && (
        <div className={styles.copyMessage}>Texto copiado com sucesso!</div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSendText={handleSendText}
        text={text}
        setText={setText}
        category={category}
        setCategory={setCategory}
      />
      <ModalCategory
        isOpen={isModalCategoryOpen}
        onClose={() => setIsModalCategoryOpen(false)}
        onSendText={handleSendText}
        text={text}
        setText={setText}
        category={category}
        setCategory={setCategory}
      />
    </div>
  );
}
