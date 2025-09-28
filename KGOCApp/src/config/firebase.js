// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8tI041Rvp7MQ0fxUWdynTHiujzJQgwNU",
  authDomain: "kgoc-21abc.firebaseapp.com",
  projectId: "kgoc-21abc",
  storageBucket: "kgoc-21abc.firebasestorage.app",
  messagingSenderId: "164506106609",
  appId: "1:164506106609:web:8203aad46eac5042ce0750",
  measurementId: "G-H5EWJ99169"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services - REACTIVATED!
export const auth = getAuth(app);
export const db = getFirestore(app);    // ✅ تم تفعيل Firestore مرة أخرى
export const storage = getStorage(app); // ✅ تم تفعيل Storage مرة أخرى

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;