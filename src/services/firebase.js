// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyARpw965cZFQ-JBtiipbR8JyYRGIhSwNNY",
  authDomain: "evolviq-795b7.firebaseapp.com",
  projectId: "evolviq-795b7",
  storageBucket: "evolviq-795b7.firebasestorage.app",
  messagingSenderId: "642121169607",
  appId: "1:642121169607:web:b09c609b5d962802291ce2",
  measurementId: "G-QSQXDSFPXJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;