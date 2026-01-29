import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC54XoaybfKycfbZpZ9bhkzHyLz9XT6KhM",
  authDomain: "movie-admin-panel-56c60.firebaseapp.com",
  projectId: "movie-admin-panel-56c60",
  storageBucket: "movie-admin-panel-56c60.firebasestorage.app",
  messagingSenderId: "777965966412",
  appId: "1:32b6a0c57bf931691690e9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
