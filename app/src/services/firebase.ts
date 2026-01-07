import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4AP4vyNx0_-jUDnOKC4eKHsLT56R83Aw",
  authDomain: "boton-panico-mvp.firebaseapp.com",
  projectId: "boton-panico-mvp",
  storageBucket: "boton-panico-mvp.firebasestorage.app",
  messagingSenderId: "321200138272",
  appId: "1:321200138272:web:1e71a3423d70227cdb7445",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
