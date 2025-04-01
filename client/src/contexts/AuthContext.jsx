import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

import { firebaseConfig } from "../firebase";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigateFunc = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        };
        setUser(storedUser);
        localStorage.setItem("auth", JSON.stringify(storedUser));
      } else {
        setUser(null);
        localStorage.removeItem("auth");
      }
    });

    return () => unsubscribe();
  }, []);

  const onRegister = async ({ email, password, repass, username, phone, location }) => {
    if (password !== repass) {
      throw new Error("Passwords don't match");
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = {
      email: result.user.email,
      uid: result.user.uid,
    };

    // 👇 Добавяне на допълнителни данни
    await setDoc(doc(db, "users", result.user.uid), {
      email,
      username,
      phone,
      location,
      createdAt: new Date(),
    });

    setUser(newUser);
    localStorage.setItem("auth", JSON.stringify(newUser));
    navigateFunc("/");
  };

  const onLogin = async ({ email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const result = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
    const loggedInUser = {
      email: result.user.email,
      uid: result.user.uid,
    };
    setUser(loggedInUser);
    localStorage.setItem("auth", JSON.stringify(loggedInUser));
    navigateFunc("/");
  };

  const onLogout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("auth");
    navigateFunc("/auth/login");
  };

  const authContext = {
    user,
    hasUser: !!user,
    onRegister,
    onLogin,
    onLogout,
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
export default AuthProvider;
