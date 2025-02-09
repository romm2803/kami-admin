import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { auth, db } from "../configs/firebaseConfigs.js";


const createUser = async (email, password, fullName, username, phone) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "Users", user.uid), {
            uid: user.uid,
            email: user.email,
            username: username,
            fullName: fullName,
            phone: phone,
            createdAt: new Date(),
        });

        console.log("User signed up:", user);
    } catch (error) {
        console.error("Error signing up:", error.message);
    }
};

const handleSignUp = async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("registerFullName").value;
    const email = document.getElementById("registerEmail").value;
    const phone = document.getElementById("registerPhone").value;
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return; 
    }
    
    
    await createUser(email, password, fullName, username, phone);
    console.log("went through");
};

export { handleSignUp };
