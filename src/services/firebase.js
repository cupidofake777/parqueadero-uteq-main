import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBHa0qytj2_RQtPfXllVP-XgO32UYrSxoA",
  authDomain: "parqueadero-2475a.firebaseapp.com",
    databaseURL: "https://parqueadero-2475a-default-rtdb.firebaseio.com/",
  projectId: "parqueadero-2475a",
  storageBucket: "parqueadero-2475a.firebasestorage.app",
  messagingSenderId: "68679082854",
  appId: "1:68679082854:web:01ed62e5d48fbcb1611ea7"
};



const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);