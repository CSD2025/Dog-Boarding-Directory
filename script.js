// Data will be loaded from the Excel file
let businesses = [];
let filteredBusinesses = [];
let states = [];

// Wait for the document to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Set current year in footer
    document.getElementById("current-year").textContent =
        new Date().getFullYear();

    // Add event listeners
    document
        .getElementById("search-input")
        .addEventListener("input", filterBusinesses);
    document
        .getElementById("state-filter")
        .addEventListener("change", filterBusinesses);
    document
        .getElementById("rating-filter")
        .addEventListener("change", filterBusinesses);

    // Close modal when clicking outside
    window.addEventListener("click", function (event) {
        const modal = document.getElementById("business-modal");
        if (event.target === modal) {
            closeModal();
        }
    });

    // Load the data (in a real scenario, this would be fetched from a server)
    loadData();
});

// Load the JSON data that would be converted from your Excel file
function loadData() {
    // In a real scenario, you would use fetch to get the data from a JSON file
    // For GitHub Pages, you would need to convert your Excel to JSON first
    fetch("dog-boarding-data.json")
        .then((response) => response.json())
        .then((data) => {
            businesses = data;

            // Extract unique states
            const stateSet = new Set();
            businesses.forEach((business) => {
                if (business.state) {
                    stateSet.add(business.state);
                }
            });
            states = Array.from(stateSet).sort();

            // Populate state filter
            const stateFilter = document.getElementById("state-filter");
            states.forEach((state) => {
                const option = document.createElement("option");
                option.value = state;
                option.textContent = state;
                stateFilter.appendChild(option);
            });

            // Initial display
            filterBusinesses();
        })
        .catch((error) => {
            console.error("Error loading data:", error);
            document.getElementById("business-grid").innerHTML =
                "<p>Error loading data. Please try again later.</p>";
        });
}

// Filter businesses based on search input and filters
function filterBusinesses() {
    const searchTerm = document
        .getElementById("search-input")
        .value.toLowerCase();
    const stateFilter = document.getElementById("state-filter").value;
    const ratingFilter = document.getElementById("rating-filter").value;

    filteredBusinesses = businesses.filter((business) => {
        // Search term filter
        const matchesSearch =
            !searchTerm ||
            (business.name &&
                business.name.toLowerCase().includes(searchTerm)) ||
            (business.city &&
                business.city.toLowerCase().includes(searchTerm)) ||
            (business.full_address &&
                business.full_address.toLowerCase().includes(searchTerm));

        // State filter
        const matchesState = !stateFilter || business.state === stateFilter;

        // Rating filter
        const rating = parseFloat(business.rating) || 0;
        const matchesRating =
            !ratingFilter || rating >= parseFloat(ratingFilter);

        return matchesSearch && matchesState && matchesRating;
    });

    // Update count display
    document.getElementById("results-count").textContent =
        `Showing ${filteredBusinesses.length} of ${businesses.length} businesses`;

    // Display the filtered businesses
    displayBusinesses();
}

// Display the filtered businesses
function displayBusinesses() {
    const grid = document.getElementById("business-grid");
    grid.innerHTML = "";

    if (filteredBusinesses.length === 0) {
        grid.innerHTML =
            "<p>No businesses found matching your criteria. Try adjusting your search.</p>";
        return;
    }

    filteredBusinesses.forEach((business, index) => {
        const card = document.createElement("div");
        card.className = "business-card";
        card.addEventListener("click", () => openBusinessModal(business));

        const imageUrl =
            business.photo ||
            "https://placehold.co/600x400/orange/white?text=No+Image";

        card.innerHTML = `
            <div class="business-image" style="background-image: url('${imageUrl}')"></div>
            <div class="business-info">
                <h3 class="business-name">${business.name || "Unnamed Business"}</h3>
                <p class="business-location">${business.city || ""}, ${business.state || ""}</p>
                <div class="stars">${renderStars(business.rating)}</div>
                <p class="business-address">${business.full_address || "Address not available"}</p>
                <button class="view-button">View Details</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

// Render star ratings
function renderStars(rating) {
    if (!rating || isNaN(rating)) {
        return "☆☆☆☆☆";
    }

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));

    let stars = "";
    for (let i = 0; i < fullStars; i++) {
        stars += "★";
    }

    if (halfStar) {
        stars += "★";
    }

    for (let i = 0; i < emptyStars; i++) {
        stars += "☆";
    }

    return stars;
}

// Open business details modal
function openBusinessModal(business) {
    const modal = document.getElementById("business-modal");
    const modalContent = modal.querySelector(".modal-content");

    const imageUrl =
        business.photo ||
        "https://placehold.co/600x400/orange/white?text=No+Image";
    const workingHours = parseWorkingHours(business.working_hours);

    modalContent.innerHTML = `
        <button class="close-button" onclick="closeModal()">&times;</button>
        <h2>${business.name || "Unnamed Business"}</h2>
        
        <div class="modal-grid">
            <div>
                <div class="modal-image" style="background-image: url('${imageUrl}')"></div>
                
                <div class="contact-info">
                    <h3 class="section-title">Contact Information</h3>
                    ${
                        business.phone
                            ? `
                        <div class="contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <a href="tel:${business.phone}">${business.phone}</a>
                        </div>
                    `
                            : ""
                    }
                    
                    ${
                        business.site
                            ? `
                        <div class="contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <a href="${business.site}" target="_blank">${business.site}</a>
                        </div>
                    `
                            : ""
                    }
                    
                    <div class="contact-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>${business.full_address || "Address not available"}</span>
                    </div>
                    
                    ${
                        business.location_link
                            ? `
                        <div class="contact-item">
                            <a href="${business.location_link}" target="_blank">View on Google Maps</a>
                        </div>
                    `
                            : ""
                    }
                </div>
            </div>
            
            <div>
                <div style="margin-bottom: 20px;">
                    <h3 class="section-title">Ratings & Reviews</h3>
                    <div style="font-size: 1.5rem; color: #ffc107; margin-bottom: 10px;">
                        ${renderStars(business.rating)}
                        <span style="color: #333; margin-left: 10px;">${business.rating || "No rating"}</span>
                    </div>
                    <p>${business.reviews ? `${business.reviews} reviews` : "No reviews"}</p>
                    
                    <div style="margin-top: 10px;">
                        ${
                            business.business_status === "OPERATIONAL"
                                ? '<span style="color: green;">●</span> Currently Operational'
                                : '<span style="color: red;">●</span> Not Operational'
                        }
                    </div>
                </div>
                
                <div class="modal-hours">
                    <h3 class="section-title">Business Hours</h3>
                    ${formatWorkingHours(workingHours)}
                </div>
            </div>
        </div>
    `;

    modal.style.display = "flex";
}

// Close the modal
function closeModal() {
    document.getElementById("business-modal").style.display = "none";
}

// Parse working hours from JSON string
function parseWorkingHours(hoursString) {
    if (!hoursString) return {};

    try {
        return JSON.parse(hoursString);
    } catch (e) {
        console.error("Error parsing working hours:", e);
        return {};
    }
}

// Format working hours for display
function formatWorkingHours(hours) {
    if (!hours || Object.keys(hours).length === 0) {
        return "<p>Hours not available</p>";
    }

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];
    let html = "";

    days.forEach((day) => {
        html += `
            <div class="day-hours">
                <span>${day.slice(0, 3)}:</span>
                <span>${hours[day] || "Closed"}</span>
            </div>
        `;
    });

    return html;
}
