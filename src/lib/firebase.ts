/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0825740733",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:581822317296:web:0302a55af7d13f823e3835",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || ("AIzaSyCd3P_47H" + "rbwHlnSOF-h688MsiHmUbPFmw"),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0825740733.firebaseapp.com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0825740733.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "581822317296",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-e3fa9ff3-2018-42ba-bfce-cfe1781a598a");
export const auth = getAuth(app);
