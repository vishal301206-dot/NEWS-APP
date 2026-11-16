
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", getNews);

document.getElementById("locationInput")
    .addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            getNews();
        }
    });

async function getNews() {

    const API_KEY = document.getElementById("apiKey").value.trim();
    const location = document.getElementById("locationInput").value.trim();

    const message = document.getElementById("message");
    const newsContainer = document.getElementById("newsContainer");
    const heading = document.getElementById("heading");

    if (!API_KEY || !location) {
        message.textContent = "Please enter API key and city name!";
        return;
    }

    newsContainer.innerHTML = "";
    heading.textContent = `Recent News: ${location}`;
    message.textContent = "Loading recent news...";
    searchBtn.disabled = true;

    try {

        // Get today's date
        const today = new Date();

        // Calculate date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        // Format date as YYYY-MM-DD
        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        }

        const fromDate = formatDate(sevenDaysAgo);
        const toDate = formatDate(today);

        // NewsAPI request
        const params = new URLSearchParams({
            q: location,
            from: fromDate,
            to: toDate,
            sortBy: "publishedAt",
            language: "en",
            pageSize: "20"
        });

        const url =
            `https://newsapi.org/v2/everything?${params.toString()}`;

        const response = await fetch(url, {
            headers: {
                "X-Api-Key": API_KEY
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch news");
        }

        if (!data.articles || data.articles.length === 0) {
            message.textContent =
                "No recent news found. Try another city name.";
            return;
        }

        message.textContent =
            `${data.totalResults} articles found. Showing up to 20.`;

        data.articles.forEach(article => {

            const card = document.createElement("div");
            card.className = "news-card";

            // News image
            const image = document.createElement("img");

            if (article.urlToImage) {
                image.src = article.urlToImage;
                image.alt = "News image";
                image.loading = "lazy";

                image.onerror = function() {
                    this.style.display = "none";
                };

                card.appendChild(image);
            }

            const content = document.createElement("div");
            content.className = "news-content";

            const title = document.createElement("h3");
            title.textContent =
                article.title || "No title available";

            const description = document.createElement("p");
            description.textContent =
                article.description || "No description available.";

            const source = document.createElement("small");
            source.textContent =
                "Source: " + (article.source?.name || "Unknown");

            const date = document.createElement("small");
            date.textContent = article.publishedAt
                ? " | " + new Date(article.publishedAt).toLocaleString()
                : "";

            const link = document.createElement("a");
            link.href = article.url;
            link.textContent = "Read More";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            content.append(title, description, source, date, link);

            card.appendChild(content);
            newsContainer.appendChild(card);

        });

    } catch (error) {

        message.textContent = "Error: " + error.message;
        newsContainer.innerHTML = "";

    } finally {

        searchBtn.disabled = false;

    }
}
