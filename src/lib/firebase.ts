import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0825740733",
  appId: "1:581822317296:web:0302a55af7d13f823e3835",
  apiKey: "AIzaSyCd3P_47HrbwHlnSOF-h688MsiHmUbPFmw",
  authDomain: "gen-lang-client-0825740733.firebaseapp.com",
  storageBucket: "gen-lang-client-0825740733.firebasestorage.app",
  messagingSenderId: "581822317296",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-e3fa9ff3-2018-42ba-bfce-cfe1781a598a");
export const auth = getAuth(app);
