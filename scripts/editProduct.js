import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { db } from "../configs/firebaseConfigs.js";

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("productId"); // Get the productId from the URL

if (!productId) {
    console.error("No product ID found in URL.");
} else {
    console.log("Editing product with ID:", productId);
    loadProductDetails(productId); // Load product details if productId exists
}

// Load product details to pre-populate the form
async function loadProductDetails(productId) {
    try {
        const productRef = doc(db, "Products", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            const productData = productSnap.data();
            document.getElementById('prodName').value = productData.prodName || "";
            document.getElementById('prodDesc').value = productData.prodDesc || "";
            document.getElementById('catValue').value = productData.catValue || "";
            document.getElementById('typeValue').value = productData.typeValue || "";
            document.getElementById('prodPrice').value = productData.prodPrice || "";
            document.getElementById('quantity').value = productData.quantity || "";
            document.getElementById('isLimited').checked = productData.isLimited || false;

            // Handle showing the custom category input if needed
            const customCategoryInput = document.getElementById('customCategoryInput');
            if (productData.catValue === "Others" && productData.customCategory) {
                customCategoryInput.style.display = "inline-block";
                customCategoryInput.value = productData.customCategory || "";
            } else {
                customCategoryInput.style.display = "none";
            }
        } else {
            console.error("Product not found.");
        }
    } catch (error) {
        console.error("Error loading product details:", error.message);
    }
}

// Update the product details
document.addEventListener('DOMContentLoaded', () => {
    const updateBtn = document.getElementById('updateProductBtn');
    const catValue = document.getElementById('catValue');
    const customCategoryInput = document.getElementById('customCategoryInput');

    // Initially check if "Others" is selected (if so, show input)
    if (catValue.value === "Others") {
        customCategoryInput.style.display = "inline-block";
    }

    // Add event listener to show input field when "Others" is selected
    catValue.addEventListener('change', function() {
        if (catValue.value === "Others") {
            customCategoryInput.style.display = "inline-block";  // Show the custom category input
        } else {
            customCategoryInput.style.display = "none";  // Hide the custom category input
        }
    });

    if (updateBtn) {
        updateBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent the default button behavior

            // Get the updated values from the form
            const updatedProduct = {
                prodName: document.getElementById('prodName').value,
                prodDesc: document.getElementById('prodDesc').value,
                catValue: document.getElementById('catValue').value,
                typeValue: document.getElementById('typeValue').value,
                prodPrice: parseFloat(document.getElementById('prodPrice').value) || 0, // Ensure number type for prodPrice
                quantity: parseInt(document.getElementById('quantity').value) || 0, // Ensure number type for quantity
                isLimited: document.getElementById('isLimited').checked,
            };

            // If "Others" is selected, include custom category input value
            if (catValue.value === "Others") {
                updatedProduct.customCategory = customCategoryInput.value.trim();
            }

            console.log("Updating product data:", updatedProduct);

            try {
                const productRef = doc(db, "Products", productId);
                await updateDoc(productRef, updatedProduct);
                console.log("Product updated successfully!");
                document.getElementById('successMessage').style.display = "block";
                document.getElementById('errorMessage').style.display = "none";
            } catch (error) {
                console.error("Error updating product:", error);
                document.getElementById('errorMessage').style.display = "block";
                document.getElementById('successMessage').style.display = "none";
            }
        });
    } else {
        console.error('Update button not found!');
    }
});
