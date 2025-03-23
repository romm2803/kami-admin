import { db } from "../configs/firebaseConfigs.js";
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

export async function updateProductStock(productId, quantity) {
    if (!productId || quantity === undefined) {
        console.error("updateProductStock: Missing product ID or quantity", { productId, quantity });
        return;
    }

    const productRef = doc(db, "Products", productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
        console.error("updateProductStock: Product not found", productId);
        return;
    }

    const productData = productSnap.data();
    const newQuantity = Math.max((productData.quantity || 0) - quantity, 0);

    await updateDoc(productRef, { quantity: newQuantity });
    console.log(`Stock updated: ${productId}, New Quantity: ${newQuantity}`);
}
