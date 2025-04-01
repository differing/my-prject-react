// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyD3DYJprxb-eIw6ivTfY031k-LPwckPN_4",
  authDomain: "car-market-f1ae8.firebaseapp.com",
  projectId: "car-market-f1ae8",
  storageBucket: "car-market-f1ae8.firebasestorage.app",
  messagingSenderId: "1048137737499",
  appId: "1:1048137737499:web:37ab9879aed51c7f3d5fbe",
  measurementId: "G-WVQG2F5510"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firestore and Auth instances
export const db = getFirestore(app);
export const auth = getAuth(app);
