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

import styles from "./Login.module.scss";
import copy from "clipboard-copy";
import Modal from "../components/Modal/Modal";
import ModalCategory from "../components/ModalCategory/ModalCategory";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth";

export default function Login() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [loggedUser, setloggedUser] = useState<unknown | null>(null);

  const isAuthenticated = localStorage.getItem("authenticated");
  const [dbCollection, setDbCollection] = useState<string>("messagos");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [paswrd, setPaswrd] = useState("");
  const [hide, setHide] = useState(false);
  const [paswrdIcoPosition, setPaswrdIcoPosition] = useState(true);
  const [userIcoPosition, setUserIcoPosition] = useState(true);
  const [userError, setUserError] = useState(false);
  const [paswrdError, setPaswrdError] = useState(false);

  const login = async () => {
    logout();
    try {
      logout();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const user = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      localStorage.setItem("authenticated", "messages");
      // refrsh page
      window.location.reload();
      // goToHome();
    } catch (error) {
      setUserError(true);
      setPaswrdError(true);
      console.log("(400) Error logging in");
      setHide(true);
    }
  };

  //verifica se esta logado ou nao
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setloggedUser(user.email);
        setDbCollection("messages");
        window.location.href = "/";
      } else {
        setloggedUser(null);
        setDbCollection("messagos");
        // window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, []);

  //logout
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <main>
      <div className={styles.content}>
        <h3 className={styles.loginTitle}>Login</h3>
        <div className={styles.inputArea}>
          <input
            className={userError ? styles.inputUserError : styles.inputUser}
            type="text"
            name="user"
            placeholder="Usuário"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setLoginEmail(event.target.value);
            }}
            onFocus={() => setUserIcoPosition(false)}
          />
          <p>usuario</p>
        </div>

        <div className={styles.inputArea}>
          <input
            className={
              paswrdError ? styles.inputPasswordError : styles.inputPassword
            }
            type="password"
            name="password"
            placeholder="Senha"
            value={paswrd}
            onChange={(event) => {
              setPaswrd(event.target.value);
              setLoginPassword(event.target.value);
            }}
            onFocus={() => setPaswrdIcoPosition(false)}
          />
          <p>senha</p>
        </div>
        <div className={styles.errorBox}>
          <div className={styles.errorArea}>
            {hide && (
              <span className={styles.errorMessage}>
                Ops, usuário ou senha inválidos. Tente novamente!
              </span>
            )}
          </div>
        </div>

        <button
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onClick={(event) => {
            login();
          }}
          className={styles.button}
        >
          Continuar
        </button>
        <span className={styles.loginRedirect}>
          Não possui uma conta?{" "}
          <span
            className={styles.link}
            onClick={() => (window.location.href = "/Register")}
          >
            Efetue o Cadastro
          </span>
        </span>
      </div>
    </main>
  );
}
