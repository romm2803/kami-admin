import { db } from "../configs/firebaseConfigs.js";
import { collection, addDoc, getDocs, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Function to load orders dynamically
async function loadOrders() {
    const collections = {
        "Orders": "",
        "toProcess": "",
        "toPrepare": "",
        "toShip": "",
        "Completed": ""
    };

    for (const collectionName of Object.keys(collections)) {
        const section = document.getElementById(collectionName);
        if (!section) continue;
        section.innerHTML = `<tr><td colspan="6"><h4>${collections[collectionName]}</h4></td></tr>`;

        const snapshot = await getDocs(collection(db, collectionName));
        for (const docSnap of snapshot.docs) {
            const order = docSnap.data();
            const orderDetailsId = `details-${docSnap.id}`;

            let fullName = "N/A";
            if (order.orderedBy) {
                const userRef = doc(db, "Users", order.orderedBy);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    fullName = userSnap.data().fullName || "N/A";
                }
            }

            let itemsHTML = order.items?.map(item => `
                <p><strong>${item.prodName}</strong> (Qty: ${item.totalSelectedQuantity}, Price: ₱${item.prodPrice})<br>
                Category: ${item.catValue} | Type: ${item.typeValue} | Yen Price: ¥${item.priceYen || 0}</p>
            `).join("") || "<p>No items</p>";

            section.innerHTML += `
                <tr>
                    <td>${docSnap.id}</td>
                    <td>${fullName}</td>
                    <td>₱${order.totalPrice || 0}</td>
                    <td>${collectionName}</td>
                    <td>
                        <button class="btn btn-info toggle-details" data-target="${orderDetailsId}">View Details</button>
                    </td>
                    <td>
                        ${collectionName !== "Completed" ? `
                            <button class="btn btn-primary move-next" data-id="${docSnap.id}" data-collection="${collectionName}">Move to Next</button>
                        ` : `<span class="badge bg-success">Completed</span>`}
                    </td>
                </tr>
                <tr>
                    <td colspan="6">
                        <div id="${orderDetailsId}" class="order-details" style="display: none; text-align: left; padding: 10px;">
                            <p><strong>Delivery Address:</strong> ${order.deliveryAddress || "N/A"}</p>
                            <p><strong>Gcash Ref Number:</strong> ${order.gcashRefNumber || "N/A"}</p>
                            <p><strong>Items:</strong></p>
                            <div style="margin-left: 20px;">${itemsHTML}</div>
                            <p><strong>Status:</strong> ${order.status || "N/A"}</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    initializeEventListeners();
}



// Function to initialize event listeners
function initializeEventListeners() {
    document.querySelectorAll(".toggle-details").forEach(button => {
        button.addEventListener("click", (event) => {
            const targetId = event.target.getAttribute("data-target");
            const detailsDiv = document.getElementById(targetId);
            if (detailsDiv) {
                detailsDiv.style.display = detailsDiv.style.display === "none" ? "block" : "none";
            }
        });
    });

    document.querySelectorAll(".move-next").forEach(button => {
        button.addEventListener("click", async (event) => {
            const orderId = event.target.getAttribute("data-id");
            const currentCollection = event.target.getAttribute("data-collection");
            await moveOrderToNextStage(orderId, currentCollection);
        });
    });
}

// Function to move order to the next phase
async function moveOrderToNextStage(orderId, currentCollection) {
    const statusFlow = ["Orders", "toProcess", "toPrepare", "toShip", "Completed"];
    const statusLabels = {
        "Orders": "Pending",
        "toProcess": "Processing",
        "toPrepare": "Preparing",
        "toShip": "Shipping",
        "Completed": "Completed"
    };

    const currentIndex = statusFlow.indexOf(currentCollection);
    if (currentIndex !== -1 && currentIndex < statusFlow.length - 1) {
        const nextCollection = statusFlow[currentIndex + 1];

        const orderRef = doc(db, currentCollection, orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
            const orderData = orderSnap.data();
            orderData.status = statusLabels[nextCollection];

            await setDoc(doc(db, nextCollection, orderId), orderData);
            await deleteDoc(orderRef);

            console.log(`Order moved to ${nextCollection} with status: ${orderData.status}`);
            loadOrders();
        }
    }
}

// Voucher Handling
const voucherForm = document.getElementById("voucherForm");
const voucherModalElement = document.getElementById("voucherModal");
const voucherModal = new bootstrap.Modal(voucherModalElement);
const rewardTypeSelect = document.getElementById("rewardType");
const discountField = document.getElementById("discountField");
const rewardValueInput = document.getElementById("rewardValue");
const conditionSelect = document.getElementById("condition");
const conditionInputField = document.getElementById("conditionInputField");
const conditionInput = document.getElementById("conditionInput");
const timeUnitSelect = document.getElementById("timeUnit");
const availabilityInput = document.getElementById("availability");

rewardTypeSelect.addEventListener("change", () => {
    discountField.style.display = rewardTypeSelect.value === "discount" ? "block" : "none";
});

conditionSelect.addEventListener("change", () => {
    conditionInputField.style.display = conditionSelect.value ? "block" : "none";
});

async function addVoucher(data) {
    await addDoc(collection(db, "Vouchers"), data);
    alert("Voucher added successfully!");
}

async function addTicket(data) {
    await addDoc(collection(db, "Tickets"), data);
    alert("Ticket added successfully!");
}

voucherForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const condition = conditionSelect.value;
    const conditionValue = parseFloat(conditionInput.value);
    const rewardType = rewardTypeSelect.value;
    const rewardValue = rewardType === "discount" ? parseFloat(rewardValueInput?.value) / 100 : "free_spin";
    const displayValue = rewardType === "discount" ? parseFloat(rewardValueInput?.value) : "Free Spin";
    const availability = parseInt(availabilityInput.value);
    const timeUnit = timeUnitSelect.value;

    if (!condition || isNaN(conditionValue) || conditionValue <= 0 || isNaN(availability) || availability <= 0 || (rewardType === "discount" && (isNaN(rewardValue) || rewardValue <= 0))) {
        alert("Please fill in all fields correctly.");
        return;
    }

    let expirationDate = new Date();
    if (timeUnit === "days") {
        expirationDate.setDate(expirationDate.getDate() + availability);
    } else {
        expirationDate.setHours(expirationDate.getHours() + availability);
    }
    let expirationTimestamp = expirationDate.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const voucherData = {
        condition,
        conditionValue,
        rewardType,
        rewardValue,
        displayValue,
        availability: `${availability} ${timeUnit}`,
        expiresAt: expirationTimestamp,
        createdAt: new Date().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };

    try {
        await (rewardType === "discount" ? addVoucher(voucherData) : addTicket(voucherData));

        voucherForm.reset();
        discountField.style.display = "none";
        conditionInputField.style.display = "none";
        voucherModal.hide();
    } catch (error) {
        console.error("Error adding document:", error);
        alert("Failed to add document.");
    }
});

document.addEventListener("DOMContentLoaded", loadOrders);
