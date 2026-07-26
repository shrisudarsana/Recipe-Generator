import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from environment variables
// Values will be read from frontend/.env.local during development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key-replace-me",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "recipe-generator-mock.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "recipe-generator-mock",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "recipe-generator-mock.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:000000000000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Database references
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
