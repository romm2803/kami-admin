import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { db } from "../configs/firebaseConfigs.js";

const loadProducts = async () => {
    try {
        const productsRef = collection(db, "Products");
        const prodSnapshot = await getDocs(productsRef);
        const products = prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayProducts(products);
    } catch (error) {
        console.error("Error fetching products:", error.message);
    }
};

const displayProducts = (products) => {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        const pricePHP = parseFloat(product.prodPrice).toFixed(2);
        const priceJPY = (parseFloat(product.prodPrice) * 2.5).toFixed(2);

        productCard.innerHTML = `
            <img src="${product.imageURL}" alt="${product.prodName}">
            <h5>${product.prodName}</h5>
            <p>${product.prodDesc}</p>
            <p>Quantity: ${product.quantity}</p>
            <p>Price: ₱${pricePHP} | ¥${priceJPY}</p>
            <div class="card-buttons">
                <button class="btn btn-primary edit-btn" data-id="${product.id}">Edit</button>
                <button class="btn btn-danger delete-btn" data-id="${product.id}">Delete</button>
            </div>
        `;

        productList.appendChild(productCard);
    });

    // Debugging: Check if buttons have correct data-id
    document.querySelectorAll(".edit-btn").forEach(button => {
        console.log("Edit Button ID:", button.getAttribute("data-id"));
    });

    // Delete event listener
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async (event) => {
            const productId = event.target.getAttribute("data-id");
            if (confirm("Are you sure you want to delete this product?")) {
                try {
                    await deleteDoc(doc(db, "Products", productId));
                    alert("Product deleted successfully.");
                    loadProducts();
                } catch (error) {
                    console.error("Error deleting product:", error.message);
                }
            }
        });
    });

    // Edit event listener
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute("data-id");

            if (productId) {
                console.log("Navigating to edit page with ID:", productId);
                window.location.href = `../general/editProduct.html?productId=${productId}`;
            } else {
                console.error("Invalid product ID for editing.");
            }
        });
    });
};

window.onload = () => {
    console.log("Script Loaded, Fetching Products...");
    loadProducts();
};
