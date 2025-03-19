import { db } from "../configs/firebaseConfigs.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const userId = "6yn1fIiJ4eXbHkalbwXZzykxvd43"; // Manually set user ID

document.addEventListener("DOMContentLoaded", async function () {
    async function fetchTopLikedProducts() {
        try {
            const productsRef = collection(db, "Products");
            const q = query(productsRef, orderBy("likes", "desc"), limit(5)); // Get top 5 liked products
            const querySnapshot = await getDocs(q);

            const recommendations = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                recommendations.push({
                    name: data.prodName || "Unknown",
                    image: data.imageBase64 || "../assets/gianflex.png", // Use product image or placeholder
                });
            });

            if (recommendations.length === 0) {
                recommendations.push({
                    name: "No recommendations available",
                    image: "../assets/kami-logo.png", // Placeholder image
                });
            }

            displayCarousel(recommendations);
        } catch (error) {
            console.error("Error fetching top liked products:", error);
        }
    }

    function displayCarousel(recommendations) {
        const carouselContent = document.getElementById("carouselContent");
        if (!carouselContent) {
            console.error("Carousel content element not found");
            return;
        }
        carouselContent.innerHTML = "";

        recommendations.forEach((item, index) => {
            const activeClass = index === 0 ? "active" : "";
            const carouselItem = `
                <div class="carousel-item ${activeClass}">
                    <img src="${item.image}" class="d-block w-100" alt="${item.name}">
                    <div class="carousel-caption">
                        <h5>${item.name}</h5>
                    </div>
                </div>
            `;
            carouselContent.innerHTML += carouselItem;
        });
    }

    await fetchTopLikedProducts();
});
