import axios from "https://cdn.jsdelivr.net/npm/axios@1.3.5/+esm";

document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("animeCategory");
    fetchAnimeRecommendations("topAllTime"); // Load default category

    categorySelect.addEventListener("change", () => {
        fetchAnimeRecommendations(categorySelect.value);
    });

    // Auto-refresh trending anime every 12 hours
    setInterval(() => {
        if (categorySelect.value === "topTrending") {
            fetchAnimeRecommendations("topTrending");
        }
    }, 1800000); // 1800000ms = 30 minutes
});

async function fetchAnimeRecommendations(category) {
    let query;

    if (category === "topTrending") {
        query = `
            query {
                Page(page: 1, perPage: 10) {
                    media(type: ANIME, sort: TRENDING_DESC) {
                        id
                        title {
                            romaji
                            english
                        }
                        coverImage {
                            large
                        }
                        siteUrl
                    }
                }
            }
        `;
        document.getElementById("anime-title").innerText = "Top 10 Trending Anime";
    } else {
        query = `
            query {
                Page(page: 1, perPage: 10) {
                    media(type: ANIME, sort: POPULARITY_DESC) {
                        id
                        title {
                            romaji
                            english
                        }
                        coverImage {
                            large
                        }
                        siteUrl
                    }
                }
            }
        `;
        document.getElementById("anime-title").innerText = "Top 10 Anime of All Time";
    }

    try {
        const response = await axios.post("https://graphql.anilist.co", { query });
        const animeList = response.data.data.Page.media;
        displayAnimeRecommendations(animeList);
    } catch (error) {
        console.error("Error fetching data from AniList:", error);
        document.getElementById("anime-recommendations-container").innerHTML =
            "<p class='error-message'>Failed to load recommendations.</p>";
    }
}

function displayAnimeRecommendations(animeList) {
    const container = document.getElementById("anime-recommendations-container");
    container.innerHTML = "";
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.justifyContent = "left";
    container.style.gap = "15px";

    animeList.forEach((anime) => {
        const animeCard = document.createElement("div");
        animeCard.className = "anime-card";
        animeCard.style.width = "180px"; // Fixed width for consistency
        animeCard.style.border = "2px solid white";
        animeCard.style.padding = "10px";
        animeCard.style.textAlign = "center";
        animeCard.style.overflow = "hidden"; // Prevents text overflow issues

        animeCard.innerHTML = `
            <img src="${anime.coverImage.large}" alt="${anime.title.romaji}" style="width:100%; border-radius: 5px;">
            <h3 style="font-size: clamp(12px, 1.2vw, 16px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${anime.title.english || anime.title.romaji}
            </h3>
            <a href="${anime.siteUrl}" target="_blank" style="display: block; margin-top: 5px; font-size: 12px;">More Info</a>
        `;

        container.appendChild(animeCard);
    });
}
