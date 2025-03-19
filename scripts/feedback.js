import { db } from "../configs/firebaseConfigs.js";
import { collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const feedbackTable = document.getElementById("feedbackTable");
const searchInput = document.getElementById("search");

// Function to fetch user's full name from Users collection
async function fetchUserName(userId) {
    try {
        const userRef = doc(db, "Users", userId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data().fullName || "Unknown User" : "Unknown User";
    } catch (error) {
        console.error("Error fetching user name:", error);
        return "Unknown User";
    }
}

// Function to generate star ratings
function generateStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? `<i class="fa fa-star text-warning"></i> ` : `<i class="fa-regular fa-star text-warning"></i> `;
    }
    return stars;
}

// Function to load feedback
async function loadFeedback() {
    const querySnapshot = await getDocs(collection(db, "userFeedbacks"));
    feedbackTable.innerHTML = "";

    for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const userId = data.userID || "Unknown";
        const orderId = data.orderID || "No Order ID";
        const rating = generateStars(data.rating || 0);
        const review = data.review || "No Feedback";

        // Fetch the full name of the user
        const userName = await fetchUserName(userId);

        // Append the row to the table
        feedbackTable.innerHTML += `
            <tr>
                <td>${userName}</td> 
                <td>${orderId}</td>
                <td>${rating}</td>
                <td style="color: green">${review}</td>
            </tr>
        `;
    }
}

// Search filter functionality
searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();
    document.querySelectorAll("#feedbackTable tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(searchText) ? "" : "none";
    });
});

// Load feedback on page load
loadFeedback();
