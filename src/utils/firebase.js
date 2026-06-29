import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if configuration is missing to avoid blocking execution/crashing
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_api_key_here";

if (!isConfigured) {
  console.warn(
    "Firebase holds placeholder values or is not configured. Please fill in your .env file with actual credentials."
  );
}

// Initialize Firebase
const app = initializeApp(
  isConfigured 
    ? firebaseConfig 
    : {
        apiKey: "placeholder",
        authDomain: "placeholder",
        projectId: "placeholder-project",
        storageBucket: "placeholder",
        messagingSenderId: "placeholder",
        appId: "placeholder"
      }
);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { isConfigured };
