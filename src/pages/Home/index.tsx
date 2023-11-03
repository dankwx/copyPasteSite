import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../firebaseConfig";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  addDoc,
  DocumentReference,
  orderBy, // Importe a função orderBy
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

import styles from "./Home.module.scss";
import copy from "clipboard-copy";
import yay from "./piffle-cute.gif";

export default function Home() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSendText = async () => {
    if (text.trim() !== "") {
      try {
        const now = Timestamp.now();
        const docRef: DocumentReference = await addDoc(
          collection(db, "messages"),
          {
            message: text,
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

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "desc")); // Ordena por "timestamp" em ordem decrescente

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messageData: string[] = [];
      querySnapshot.forEach((doc) => {
        const message = doc.data().message;
        messageData.push(message);
      });
      setMessages(messageData);
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  const handleCopyText = (message: string) => {
    copy(message)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      })
      .catch((error) => {
        console.error("Erro ao copiar texto:", error);
      });
  };

  return (
    <div className={styles.bodyArea}>
      <h1 className={styles.title}>Copiar e Colar</h1>
      <input
        placeholder="Seu texto <3"
        type="text"
        name="text"
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></input>
      
      <button onClick={handleSendText}>
        <span className="circle1"></span>
        <span className="circle2"></span>
        <span className="circle3"></span>
        <span className="circle4"></span>
        <span className="circle5"></span>
        <span className="text">Enviar</span>
      </button>
      <div className={styles.messageArea}>
        {messages.map((message, index) => (
          <div
            className={styles.singleMessage}
            key={index}
            onClick={() => handleCopyText(message)}
          >
            <span>{message}</span>
          </div>
        ))}
      </div>
      {copySuccess && (
        <div className={styles.copyMessage}>
          Texto copiado com sucesso!
          <img src={yay} alt="" />
        </div>
      )}
    </div>
  );
}
