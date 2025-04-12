// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2vGw4LoiiCUn3n2bdgJTsVKM1zNEJkPI",
  authDomain: "easterngreenhomes-new.firebaseapp.com",
  projectId: "easterngreenhomes-new",
  storageBucket: "easterngreenhomes-new.firebasestorage.app",
  messagingSenderId: "235366881721",
  appId: "1:235366881721:web:168b02589b374597ce3e68",
  measurementId: "G-SKFC3MN6FR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, db, storage, googleProvider }; 