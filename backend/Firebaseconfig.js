import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCakAoQneoKXCKac0WTiFc629E0_YLAzQU",
  authDomain: "drilly-a96b7.firebaseapp.com",
  projectId: "drilly-a96b7",
  storageBucket: "drilly-a96b7.firebasestorage.app",
  messagingSenderId: "925390712026",
  appId: "1:925390712026:web:c4e6e46881d1d0c106c9e3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
