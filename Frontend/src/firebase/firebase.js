import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDIBdgXpup3iA5SvWBYk_7J-4BBqWX0_go",
  authDomain: "automatedhiringprocess.firebaseapp.com",
  projectId: "automatedhiringprocess",
  storageBucket: "automatedhiringprocess.firebasestorage.app",
  messagingSenderId: "640873098815",
  appId: "1:640873098815:web:440b4b666b9571108f128a",
  measurementId: "G-XF7HP4HB0L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth()
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage};