import { db } from "../configs/firebaseConfigs.js";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("totalProducts")) {
        updateDashboardStats();
    }
    if (document.getElementById("productList")) {
        fetchProducts();
        setupSorting();
    }

    // Ensure preview modal is hidden on page load
    const modal = document.getElementById("productPreviewModal");
    if (modal) modal.style.display = "none";
});


async function fetchProducts() {
    try {
        const querySnapshot = await getDocs(collection(db, "Products"));
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (!products.length) console.warn("No products found in Firestore.");

        const now = Date.now(); // Get current timestamp

        for (const product of products) {
            if (product.quantity === 0) {
                const outOfStockTime = product.outOfStockTime || now; // Use stored timestamp or set it now

                if (!product.outOfStockTime) {
                    await updateDoc(doc(db, "Products", product.id), { outOfStockTime: now });
                } else if (now - outOfStockTime >= 60000) { // 1 min = 60,000 ms
                    await deleteDoc(doc(db, "Products", product.id));
                    console.log(`Deleted product: ${product.prodName} (Out of Stock for 1 min)`);
                }
            }
        }

        displayProducts(products.filter(product => product.quantity > 0 || !product.outOfStockTime));
        setupSearch(products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}



async function updateDashboardStats() {
    try {
        const productSnapshot = await getDocs(collection(db, "Products"));
        let totalProducts = productSnapshot.docs.reduce((sum, doc) => sum + (Number(doc.data().quantity) || 0), 0);
        document.getElementById("totalProducts").textContent = totalProducts;

        document.getElementById("totalUsers").textContent = (await getDocs(collection(db, "Users"))).size;

        let totalOrders = 0;
        const orderCollections = ["toProcess", "toPrepare", "toShip"];
        for (const collectionName of orderCollections) {
            totalOrders += (await getDocs(collection(db, collectionName))).size;
        }

        const completedOrdersSnapshot = await getDocs(collection(db, "Completed"));
        let completedOrders = completedOrdersSnapshot.size;

        document.getElementById("totalOrders").textContent = totalOrders;
        document.getElementById("completedOrders").textContent = completedOrders;
    } catch (error) {
        console.error("Error updating dashboard stats:", error);
    }
}


async function updateMonthlyRevenue() {
    try {
        const completedOrdersSnapshot = await getDocs(collection(db, "Completed"));
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        let monthlyRevenue = 0;

        completedOrdersSnapshot.forEach(doc => {
            const orderData = doc.data();
            if (orderData.totalPrice) {
                let orderDate = null;

                // Check if createdAt exists and is a Firestore Timestamp
                if (orderData.createdAt?.toDate) {
                    orderDate = orderData.createdAt.toDate();
                } else if (orderData.createdAt) {
                    orderDate = new Date(orderData.createdAt);
                }

                if (orderDate && orderDate.getMonth() + 1 === currentMonth && orderDate.getFullYear() === currentYear) {
                    monthlyRevenue += orderData.totalPrice;
                }
            }
        });

        document.getElementById("monthlyRevenue").textContent = `₱${monthlyRevenue.toLocaleString()}`;
    } catch (error) {
        console.error("Error fetching monthly revenue:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("monthlyRevenue")) {
        updateMonthlyRevenue();
    }
});

document.getElementById("currentMonth").textContent = new Date().toLocaleString('default', { month: 'long' });




function displayProducts(products) {
    const productList = document.getElementById("productList");
    if (!productList) return;

    productList.innerHTML = products.map(product => {
        const quantity = product.quantity || 0;
        const warningMessage = quantity === 0 ? `<span style="color: red; font-weight: bold;"> (Out of Stock!)</span>` : "";
        const imageUrl = product.imageBase64 || product.localImage || "../assets/gianflex.png";

        return `
            <tr>
                <td><img src="${imageUrl}" alt="${product.prodName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                <td>${product.prodName || "N/A"}</td>
                <td>${product.catValue || "N/A"}</td>
                <td>₱${product.prodPrice || "0.00"}</td>
                <td style="color: green;">¥${product.priceYen || "0"}</td>
                <td>${quantity}${warningMessage}</td>
                <td>${product.purchases || "0"}</td>
                <td>${product.likes || "0"}</td>
                <td>
                    <button class="preview-btn" data-id="${product.id}">Preview</button>
                    <button class="edit-btn" data-id="${product.id}">Edit</button>
                    <button class="delete-btn" data-id="${product.id}">Delete</button>
                </td>
            </tr>
        `;
    }).join("");

    setupDeleteButtons();
    setupEditButtons();
    setupPreviewButtons(products);
}

function setupDeleteButtons() {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async (event) => {
            const productId = event.target.getAttribute("data-id");
            if (confirm("Are you sure you want to delete this product?")) {
                try {
                    await deleteDoc(doc(db, "Products", productId));
                    alert("Product deleted successfully.");
                    fetchProducts();
                } catch (error) {
                    console.error("Error deleting product:", error.message);
                }
            }
        });
    });
}


function setupEditButtons() {
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute("data-id");
            window.location.href = `../general/editProduct.html?productId=${productId}`;
        });
    });
}

// Setup Preview Modal
function setupPreviewButtons(products) {
    const modal = document.getElementById("productPreviewModal");
    if (!modal) return;

    document.querySelectorAll(".preview-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute("data-id");
            const product = products.find(p => p.id === productId);

            if (product) {
                document.getElementById("previewName").textContent = product.prodName || "N/A";
                document.getElementById("previewCategory").textContent = product.catValue || "N/A";
                document.getElementById("previewPricePhp").textContent = `₱${product.prodPrice || "0.00"}`;
                document.getElementById("previewPriceYen").textContent = `¥${product.priceYen || "0"}`;
                document.getElementById("previewStock").textContent = product.quantity || "0";
                document.getElementById("previewImage").src = product.imageBase64 || product.localImage || "../assets/gianflex.png";
                document.getElementById("previewLikes").innerHTML = `<span style="color: red;">❤️</span> ${product.likes || 0}`;

                modal.style.display = "block";
            } else {
                console.error("Product not found for preview.");
            }
        });
    });
}

// Close Preview Modal
function closePreviewModal() {
    const modal = document.getElementById("productPreviewModal");
    if (modal) modal.style.display = "none";
}

// Close modal when clicking outside content or close button
document.addEventListener("click", (event) => {
    const modal = document.getElementById("productPreviewModal");
    const modalContent = document.querySelector("#productPreviewModal .modal-content");
    if (!modalContent) return; 
    if (event.target.classList.contains("close-btn") || (modal && event.target === modal && !modalContent.contains(event.target))) {
        closePreviewModal();
    }
});

// Expose function globally
window.closePreviewModal = closePreviewModal;

function setupSearch(products) {
    const searchInput = document.getElementById("productSearch");
    if (!searchInput) return;
    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.toLowerCase();
        displayProducts(products.filter(product => product.prodName.toLowerCase().includes(query)));
    });
}

function setupSorting() {
    const sortSelect = document.getElementById("sortOptions");
    if (!sortSelect) return;
    sortSelect.addEventListener("change", async () => {
        const querySnapshot = await getDocs(collection(db, "Products"));
        let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortBy = sortSelect.value;
        products.sort((a, b) => sortBy === "name-asc" ? a.prodName.localeCompare(b.prodName) : sortBy === "name-desc" ? b.prodName.localeCompare(a.prodName) : sortBy === "price-low-high" ? a.prodPrice - b.prodPrice : b.prodPrice - a.prodPrice);
        displayProducts(products);
    });
}
