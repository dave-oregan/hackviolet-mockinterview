import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'

// should remove hardcoding
const firebaseConfig = {
  apiKey: KEY,
  authDomain: "hackviolet2026.firebaseapp.com",
  projectId: "hackviolet2026",
  storageBucket: "hackviolet2026.firebasestorage.app",
  messagingSenderId: "1011083306946",
  appId: "1:1011083306946:web:1068984f915acf8d99585b",
  measurementId: "G-8BVNT24YM0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const FIREBASE_DB = getFirestore(app);