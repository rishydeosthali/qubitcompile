import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_hXh0VGz4TZUI_lG5ox-QQAZF_sdsQXo",
  authDomain: "qubitcompile.firebaseapp.com",
  projectId: "qubitcompile",
  storageBucket: "qubitcompile.firebasestorage.app",
  messagingSenderId: "55573825645",
  appId: "1:55573825645:web:1a6fccc4c8a832b46d1764",
  measurementId: "G-NB59QT7TRL"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, analytics, auth, googleProvider, db };