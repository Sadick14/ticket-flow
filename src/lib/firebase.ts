// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCioz6RGKlmYc3aIYpEWTCTYJFwtf0kDaA",
  authDomain: "ticketflow-5bf3g.firebaseapp.com",
  projectId: "ticketflow-5bf3g",
  storageBucket: "ticketflow-5bf3g.appspot.com",
  messagingSenderId: "618525371848",
  appId: "1:618525371848:web:ea66cbc638516eb579a4fd"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
