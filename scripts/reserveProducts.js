import { db } from "../configs/firebaseConfigs.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("reservedProductList")) {
        fetchReservedProducts();
    }
});

// Fetch reserved products from "Reservation" collection
async function fetchReservedProducts() {
    try {
        console.log("Fetching reserved products...");
        const querySnapshot = await getDocs(collection(db, "Reservation"));
        const reservedProducts = [];

        for (const docSnap of querySnapshot.docs) {
            const reservationData = docSnap.data();
            const productRef = doc(db, "Products", reservationData.itemID);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
                reservedProducts.push({
                    id: docSnap.id,
                    ...reservationData,
                    ...productSnap.data() // Merge product details
                });
            }
        }

        console.log("Fetched reserved products:", reservedProducts);
        displayReservedProducts(reservedProducts);
    } catch (error) {
        console.error("Error fetching reserved products:", error);
    }
}

// Display reserved products in the table
function displayReservedProducts(products) {
    const productList = document.getElementById("reservedProductList");
    if (!productList) return;

    productList.innerHTML = products.map(product => {
        let imageUrl = product.imageBase64 || product.localImage || "../assets/gianflex.png";

        return `
            <tr>
                <td><img src="${imageUrl}" alt="${product.prodName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                <td>${product.prodName || "N/A"}</td>
                <td>${product.catValue || "N/A"}</td>
                <td>₱${product.prodPrice || "0.00"}</td>
                <td style="color: green;">¥${product.priceYen || "0"}</td>
                <td>${product.reservedBy?.[0]?.qty || "0"}</td>
                <td>${product.reservedBy?.[0]?.userID || "N/A"}</td>
            </tr>
        `;
    }).join("");
}
