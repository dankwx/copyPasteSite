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
} from "firebase/firestore";
import styles from "./Home.module.scss";

export default function Home() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState<string>("");

  const handleSendText = async () => {
    if (text.trim() !== "") {
      try {
        const docRef: DocumentReference = await addDoc(
          collection(db, "messages"),
          {
            message: text,
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
    const q = query(collection(db, "messages"));

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
          <div className={styles.singleMessage} key={index}>
            <span>{message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
