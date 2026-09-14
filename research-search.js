const researchForm = document.querySelector("#researchSearchForm");
const searchResults = document.querySelector("#searchResults");

if (researchForm && searchResults) {
    researchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = new FormData(researchForm).get("q").trim().toLowerCase();
        const title = "Human-centred design";
        const description = "Exploring user needs, testing assumptions, and turning insights into simple product decisions.";
        const matches = !query || `${title} ${description}`.toLowerCase().includes(query);
        searchResults.innerHTML = matches
            ? `<article class="search-result"><h3>${title}</h3><p>${description}</p></article>`
            : "<p>No research results found.</p>";
    });
}
