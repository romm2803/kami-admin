import { setDoc, doc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { db } from "../configs/firebaseConfigs.js";

const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const addToDatabase = async (prodName, prodDesc, prodPrice, catValue, typeValue, priceYen, isLimited, quantity, purchases, likes, imageBase64) => {
    console.log("Adding to database...");
    try {
        const productsRef = collection(db, "Products");
        const q = query(productsRef, where("prodName", "==", prodName));
        const prodSnapshot = await getDocs(q);

        if (!prodSnapshot.empty) {
            console.log("Product exists");
            alert("Product already exists!");
            return false;
        }

        const productRef = doc(productsRef);
        await setDoc(productRef, {
            prodName,
            prodDesc,
            prodPrice,
            catValue,
            typeValue,
            priceYen,
            isLimited,
            quantity,
            purchases,
            likes,
            imageBase64, // Store Base64 string instead of URL
            createdAt: new Date(),
        });

        console.log("Stored:", prodName);
        return true;
    } catch (error) {
        console.error("Error adding product:", error.message);
        return false;
    }
};

// Handle category change (show/hide custom input)
document.getElementById('catValue').addEventListener('change', function() {
    const customCategoryInput = document.getElementById('customCategoryInput');
    customCategoryInput.style.display = this.value === "Others" ? "inline-block" : "none";
});

// Handle confirm button click
document.getElementById('addProductBtn').addEventListener('click', async function () {
    const prodName = document.getElementById('prodName').value;
    const prodDesc = document.getElementById('prodDesc').value;
    let catValue = document.getElementById('catValue').value;
    const typeValue = document.getElementById('typeValue').value;
    const prodPrice = parseFloat(document.getElementById('prodPrice').value);
    const priceYen = prodPrice * 2.5;
    const isLimited = document.getElementById('isLimited').checked;
    const quantity = parseInt(document.getElementById('quantity').value);
    let likes = 0;
    let purchases = 0;
    const imageFile = document.getElementById('prodImage').files[0];

    if (catValue === "Others") {
        catValue = document.getElementById('customCategoryInput').value.trim();
        if (!catValue) {
            document.getElementById('errorMessage').innerText = "Please enter a category name!";
            document.getElementById('errorMessage').style.display = 'block';
            return;
        }
    }

    if (!prodName || !prodDesc || !catValue || !typeValue || !prodPrice || !imageFile) {
        document.getElementById('errorMessage').innerText = "All fields are required, including an image!";
        document.getElementById('errorMessage').style.display = 'block';
        return;
    }

    document.getElementById('errorMessage').style.display = 'none';

    // Convert image to Base64
    try {
        const imageBase64 = await convertImageToBase64(imageFile);
        const success = await addToDatabase(prodName, prodDesc, prodPrice, catValue, typeValue, priceYen, isLimited, quantity, purchases, likes, imageBase64);

        if (success) {
            document.getElementById('successMessage').innerText = "Product added successfully!";
            document.getElementById('successMessage').style.display = 'block';
        }
    } catch (error) {
        document.getElementById('errorMessage').innerText = "Image conversion failed!";
        document.getElementById('errorMessage').style.display = 'block';
    }
});

// Redirect to edit page when clicking edit
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-btn')) {
        const productId = event.target.dataset.id;
        window.location.href = `editProduct.html?productId=${productId}`;
    }
});

export { addToDatabase };
