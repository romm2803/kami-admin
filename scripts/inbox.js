import { db } from "../configs/firebaseConfigs.js";
import { collection, doc, getDocs, updateDoc, onSnapshot, arrayUnion } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const userListContainer = document.getElementById("users");
    const chatContainer = document.getElementById("chatContainer");
    const chatHeader = document.getElementById("chatHeader");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");

    if (!userListContainer || !chatContainer || !messageInput || !sendButton) {
        console.error("Required elements not found.");
        return;
    }

    let selectedUserId = null;

    async function loadUsers() {
        userListContainer.innerHTML = "";
        const usersSnapshot = await getDocs(collection(db, "Users"));
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            const userButton = document.createElement("li");
            userButton.textContent = user.fullName || `User ${doc.id}`;
            userButton.classList.add("user-item");
            userButton.addEventListener("click", () => selectUser(doc.id, user.fullName));
            userListContainer.appendChild(userButton);
        });
    }

    function selectUser(userId, userName) {
        selectedUserId = userId;
        chatHeader.innerText = userName || "User";
        chatContainer.innerHTML = "<p>Loading messages...</p>";
        listenForMessages();
    }

    function listenForMessages() {
        if (!selectedUserId) return;

        const userRef = doc(db, "Users", selectedUserId);
        onSnapshot(userRef, (docSnapshot) => {
            if (docSnapshot.exists() && docSnapshot.data().inbox) {
                const messages = docSnapshot.data().inbox;
                updateChatUI(messages);
            } else {
                chatContainer.innerHTML = "<p>No conversation yet.</p>";
            }
        });
    }

    function updateChatUI(messages) {
        chatContainer.innerHTML = messages.length ? "" : "<p>No messages yet.</p>";
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        messages.forEach(msg => {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", msg.sender === "admin" ? "admin-message" : "user-message");
            messageDiv.textContent = msg.message;
            chatContainer.appendChild(messageDiv);
        });

        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function sendMessage() {
        if (!selectedUserId) return;

        const message = messageInput.value.trim();
        if (!message) return;

        const newMessage = {
            message,
            sender: "admin",
            timestamp: new Date().toISOString(),
        };

        const userRef = doc(db, "Users", selectedUserId);
        await updateDoc(userRef, {
            inbox: arrayUnion(newMessage)
        });

        messageInput.value = "";
    }

    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

    loadUsers();
});
