import { db } from "../configs/firebaseConfigs.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    if (!emailjs) {
        console.error("❌ EmailJS is not loaded. Make sure you included the EmailJS SDK in your HTML file.");
        return;
    }

    emailjs.init("p_ZO5Q_rO9N9d9nqF"); // Initialize EmailJS
    console.log("✅ EmailJS initialized successfully");

    const ordersList = document.getElementById("toProcess");
    const toShipList = document.getElementById("toShip");

    if (ordersList) {
        ordersList.addEventListener("click", async (event) => {
            if (event.target.classList.contains("move-next")) {
                const documentId = event.target.getAttribute("data-id"); // Firestore document ID
                const collectionName = event.target.getAttribute("data-collection");

                console.log(`🛠️ Order Processing Started: ${documentId}, Collection: ${collectionName}`);

                if (collectionName === "toProcess") {
                    fetchOrderDetails("toProcess", documentId, sendProcessingEmail);
                }
            }
        });
    }

    if (toShipList) {
        toShipList.addEventListener("click", async (event) => {
            if (event.target.classList.contains("move-next")) {
                const documentId = event.target.getAttribute("data-id");
                const collectionName = event.target.getAttribute("data-collection");

                console.log(`📦 Order Completed: ${documentId}, Collection: ${collectionName}`);

                if (collectionName === "toShip") {
                    fetchOrderDetails("toShip", documentId, sendCompletionEmail);
                }
            }
        });
    }
});

async function fetchOrderDetails(collection, documentId, callback) {
    try {
        const orderRef = doc(db, collection, documentId);
        const orderDoc = await getDoc(orderRef);

        if (!orderDoc.exists()) {
            console.error(`❌ Order ${documentId} not found in Firestore`);
            return;
        }

        const orderData = orderDoc.data();
        console.log("✅ Order Data:", orderData);

        if (!orderData.orderID) {
            console.error(`❌ No 'orderID' field found in document ${documentId}`);
            return;
        }

        if (!orderData.customerEmail) {
            console.error(`❌ No customer email found for Order ID: ${orderData.orderID}`);
            return;
        }

        callback(orderData.orderID, orderData.customerEmail);
    } catch (error) {
        console.error("❌ Error fetching order details:", error);
    }
}

function sendProcessingEmail(orderId, recipientEmail) {
    console.log(`📨 Sending processing email for Order ID: ${orderId} to ${recipientEmail}`);

    emailjs.send("service_v1x8d4l", "template_gv00i5k", {
        order_id: orderId,
        recipient_email: recipientEmail
    }).then(
        (response) => console.log("✅ Processing email sent successfully:", response),
        (error) => console.error("❌ Failed to send processing email:", error)
    );
}

function sendCompletionEmail(orderId, recipientEmail) {
    console.log(`📨 Sending completion email for Order ID: ${orderId} to ${recipientEmail}`);

    emailjs.send("service_v1x8d4l", "template_fgp7h19", {
        order_id: orderId,
        recipient_email: recipientEmail
    }).then(
        (response) => console.log("✅ Completion email sent successfully:", response),
        (error) => console.error("❌ Failed to send completion email:", error)
    );
}
