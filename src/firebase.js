import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGlVLFYd0OLPvy3at5Ya4px-naVbyQYJs",
  authDomain: "dlproject-b7069.firebaseapp.com",
  projectId: "dlproject-b7069",
  storageBucket: "dlproject-b7069.firebasestorage.app",
  messagingSenderId: "791889186727",
  appId: "1:791889186727:web:10f8d399ff94ea5d40f082",
  measurementId: "G-DL3WRPNSY8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);