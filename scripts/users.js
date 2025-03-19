import { app, auth, db } from "../configs/firebaseConfigs.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
    fetchUsers();
    
    const searchBar = document.getElementById("userSearch");
    if (searchBar) {
        searchBar.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            document.querySelectorAll("tbody tr").forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(searchTerm) ? "" : "none";
            });
        });
    }
});

async function fetchUsers() {
    const usersRef = collection(db, "Users");
    const usersSnapshot = await getDocs(usersRef);
    const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    displayUsers(usersList);
}

function displayUsers(users) {
    const tableBody = document.querySelector("tbody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.fullName || "N/A"}</td>
            <td>${user.email || "N/A"}</td>
            <td>${user.phoneNumber || "N/A"}</td>
            <td>${user.city || "N/A"}</td>
            <td>${user.username || "N/A"}</td>
            <td>${user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleString() : "N/A"}</td>
            <td><button class="delete-btn" data-id="${user.id}">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });

    attachDeleteEvent();
}

function attachDeleteEvent() {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const userId = button.getAttribute("data-id");
            if (confirm("Are you sure you want to delete this user?")) {
                await deleteDoc(doc(db, "Users", userId));
                fetchUsers();
            }
        });
    });
}
