import { initializeApp } from "firebase/app";
import firebaseConfig from "../config/firebaseConfig";
import { getFirestore } from "firebase/firestore";

const firebaseApp = initializeApp(firebaseConfig);


// Inicializa o Firestore
const db = getFirestore(firebaseApp);

export { db };
export default firebaseApp;