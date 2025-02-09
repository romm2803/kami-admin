import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqbQV3olBCpcJi4GMuTNdsDi4BxwsGRC8",
  authDomain: "kami-system.firebaseapp.com",
  projectId: "kami-system",
  storageBucket: "kami-system.appspot.com",  
  messagingSenderId: "876550192385",
  appId: "1:876550192385:web:312d574a073e98ae0a2f00",
  measurementId: "G-2XY947PY3V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
