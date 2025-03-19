import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
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
    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <img src="${product.imageBase64 || '../assets/gianflex.png'}" alt="${product.prodName}">
            <h5>${product.prodName}</h5>
            <p>${product.prodDesc}</p>
            <button class="btn btn-primary" data-id="${product.id}">Select</button>
        `;
    
        productList.appendChild(productCard);
    });
    
    document.querySelectorAll(".btn-primary").forEach(button => {
        button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute("data-id");
            if (productId) {
                window.location.href = `editProduct.html?productId=${productId}`;
            } else {
                console.error("Product ID is missing");
            }
        });
    });
};

window.onload = loadProducts;
