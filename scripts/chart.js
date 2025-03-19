import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { db } from "../configs/firebaseConfigs.js";

document.addEventListener("DOMContentLoaded", async function () {
    const ctx = document.getElementById("dashboardChart").getContext("2d");

    async function fetchCounts() {
        let totalProducts = 0;
        let totalUsers = 0;
        let totalOrders = 0;
        let completedOrders = 0;

        // Fetch total products including quantities
        const productsSnapshot = await getDocs(collection(db, "Products"));
        productsSnapshot.forEach(doc => {
            totalProducts += doc.data().quantity || 0;
        });

        // Fetch total users
        const usersSnapshot = await getDocs(collection(db, "Users"));
        totalUsers = usersSnapshot.size;

        // Fetch total pending orders
        const ordersSnapshot = await getDocs(collection(db, "Orders"));
        totalOrders = ordersSnapshot.size;

        // Fetch completed orders
        const completedOrdersSnapshot = await getDocs(collection(db, "Completed"));
        completedOrders = completedOrdersSnapshot.size;

        return { totalProducts, totalUsers, totalOrders, completedOrders };
    }

    const counts = await fetchCounts();

    const data = {
        labels: ["Total Products", "Total Users", "Total Orders", "Completed Orders"],
        datasets: [{
            label: "Statistics",
            data: [counts.totalProducts, counts.totalUsers, counts.totalOrders, counts.completedOrders],
            backgroundColor: ["#4CAF50", "#2196F3", "#FF9800", "#E91E63"],
            borderColor: "white",
            borderWidth: 1
        }]
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { ticks: { color: "white", beginAtZero: true } },
            y: { ticks: { color: "white" } }
        },
        plugins: {
            legend: { labels: { color: "white" } }
        }
    };

    new Chart(ctx, { type: "bar", data: data, options: options });

    document.getElementById("toggleChart").addEventListener("change", function () {
        document.getElementById("chartSection").style.display = this.checked ? "block" : "none";
    });

    document.querySelector(".chart-container").style.overflowX = "auto";
});
