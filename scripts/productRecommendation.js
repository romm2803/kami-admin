import { db } from "../configs/firebaseConfigs.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Function to fetch product data and generate recommendations
async function fetchAndRecommendProducts() {
    try {
        const querySnapshot = await getDocs(collection(db, "Products"));
        const products = [];

        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        if (products.length === 0) {
            console.warn("No products found in Firestore.");
            return;
        }

        recommendProducts(products);
        recommendAnime(products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Generate recommendations based on product category
function recommendProducts(products) {
    const categoryCount = {};
    
    // Count occurrences of each category
    products.forEach(product => {
        if (product.catValue) {
            categoryCount[product.catValue] = (categoryCount[product.catValue] || 0) + 1;
        }
    });

    console.log("Category Count:", categoryCount); // Debugging: Log category counts

    // Determine the most popular category
    let popularCategory = null;
    let maxCount = 0;
    
    Object.entries(categoryCount).forEach(([category, count]) => {
        if (count > maxCount) {
            maxCount = count;
            popularCategory = category;
        }
    });

    console.log("Popular Category:", popularCategory); // Debugging: Log popular category

    if (!popularCategory) {
        console.warn("No popular category found.");
        return;
    }

    // Filter products by the most popular category
    const recommendedProducts = products
        .filter(p => p.catValue === popularCategory)
        .slice(0, 5); // Limit to top 5 products

    console.log("Recommended Products:", recommendedProducts); // Debugging: Log recommended products
    displayRecommendedProducts(recommendedProducts);
}

// Display recommended products
function displayRecommendedProducts(products) {
    const container = document.getElementById("recommendedProducts");
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.imageBase64 || product.localImage || '../assets/kami-logo.png'}" alt="${product.prodName}">
            <p>${product.prodName}</p>
            <p>${product.catValue}</p>
        </div>
    `).join("");
}

// Fetch and display similar anime recommendations from AniList
async function recommendAnime(products) {
    const categoryCount = {};
    
    // Count occurrences of each category
    products.forEach(product => {
        if (product.catValue) {
            categoryCount[product.catValue] = (categoryCount[product.catValue] || 0) + 1;
        }
    });

    // Determine the most popular category
    let popularCategory = null;
    let maxCount = 0;
    
    Object.entries(categoryCount).forEach(([category, count]) => {
        if (count > maxCount) {
            maxCount = count;
            popularCategory = category;
        }
    });

    if (!popularCategory) {
        console.warn("No popular anime category found.");
        return;
    }

    try {
        // Fetch anime recommendations from AniList based on the popular category
        const response = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                query ($search: String) {
                    Page(perPage: 5) {
                        media(search: $search, type: ANIME) {
                            title {
                                romaji
                            }
                            coverImage {
                                large
                            }
                            siteUrl
                        }
                    }
                }
                `,
                variables: { search: popularCategory }
            })
        });

        const data = await response.json();
        console.log("AniList API Response:", data); // Debugging: Log API response

        // Display recommended anime
        displayRecommendedAnime(data.data.Page.media);
    } catch (error) {
        console.error("Error fetching anime recommendations:", error);
    }
}

// Display recommended anime
function displayRecommendedAnime(animeList) {
    const container = document.getElementById("recommendedAnime");
    if (!container) return;

    container.innerHTML = animeList.map(anime => `
        <div class="anime-pair">
            <div class="anime-item">
                <a href="${anime.siteUrl}" target="_blank">
                    <img src="${anime.coverImage.large}" alt="${anime.title.romaji}">
                    <p>${anime.title.romaji}</p>
                </a>
            </div>
        </div>
    `).join("");
}

// Run the recommendation functions on page load
document.addEventListener("DOMContentLoaded", fetchAndRecommendProducts);
