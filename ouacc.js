document.addEventListener("DOMContentLoaded", function () {
    const nav = document.getElementById("main-nav");
    const toggle = document.querySelector(".nav-toggle");
    const groups = document.querySelectorAll(".nav-group");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            const open = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!open));
            nav.classList.toggle("is-open", !open);
        });
    }

    groups.forEach(function (group) {
        const button = group.querySelector(".nav-caret");
        if (!button) return;
        button.addEventListener("click", function (event) {
            event.preventDefault();
            const open = group.classList.contains("is-open");
            groups.forEach(function (other) {
                other.classList.remove("is-open");
                const b = other.querySelector(".nav-caret");
                if (b) b.setAttribute("aria-expanded", "false");
            });
            group.classList.toggle("is-open", !open);
            button.setAttribute("aria-expanded", String(!open));
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            groups.forEach(function (group) {
                group.classList.remove("is-open");
                const button = group.querySelector(".nav-caret");
                if (button) button.setAttribute("aria-expanded", "false");
            });
            if (toggle && nav) {
                toggle.setAttribute("aria-expanded", "false");
                nav.classList.remove("is-open");
            }
        }
    });


    const searchForm = document.getElementById("site-search-form");
    const searchInput = document.getElementById("site-search-input");
    const searchResults = document.getElementById("search-results");
    const searchStatus = document.getElementById("search-status");

    function normalise(value) {
        return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function escapeHtml(value) {
        return value.replace(/[&<>\"']/g, function (char) {
            return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
        });
    }

    function rankResult(item, query) {
        const q = normalise(query).trim();
        if (!q) return 0;
        const terms = q.split(/\s+/).filter(Boolean);
        const title = normalise(item.title);
        const text = normalise(item.text);
        let score = 0;
        terms.forEach(function (term) {
            if (title.includes(term)) score += 8;
            if (text.includes(term)) score += 2;
            if (item.url.toLowerCase().includes(term)) score += 1;
        });
        if (title === q) score += 20;
        return terms.every(function (term) { return title.includes(term) || text.includes(term); }) ? score : 0;
    }

    function renderSearchResults(items, query) {
        if (!searchResults || !searchStatus) return;
        const ranked = items.map(function (item) {
            return { item: item, score: rankResult(item, query) };
        }).filter(function (x) { return x.score > 0; })
          .sort(function (a, b) { return b.score - a.score || a.item.title.localeCompare(b.item.title); })
          .slice(0, 40);
        if (!query.trim()) {
            searchStatus.textContent = "Enter a search term to begin.";
            searchResults.innerHTML = "";
            return;
        }
        searchStatus.textContent = ranked.length + " result" + (ranked.length === 1 ? "" : "s") + " for “" + query.trim() + "”.";
        searchResults.innerHTML = ranked.length ? ranked.map(function (r) {
            return '<article class="search-result"><h2><a href="' + encodeURI(r.item.url) + '">' + escapeHtml(r.item.title) + '</a></h2><p>' + escapeHtml(r.item.snippet) + '</p><a class="text-link" href="' + encodeURI(r.item.url) + '">Open page</a></article>';
        }).join("") : '<p class="search-empty">No pages matched your search. Try a broader term.</p>';
    }

    if (searchForm && searchInput) {
        let searchData = [];
        fetch("search-index.json", { cache: "no-store" })
            .then(function (response) {
                if (!response.ok) throw new Error("Search index unavailable");
                return response.json();
            })
            .then(function (data) {
                searchData = data;
                const params = new URLSearchParams(window.location.search);
                const initial = params.get("q") || "";
                if (initial) {
                    searchInput.value = initial;
                    renderSearchResults(searchData, initial);
                }
            })
            .catch(function () {
                if (searchStatus) searchStatus.textContent = "Search is temporarily unavailable.";
            });
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const query = searchInput.value.trim();
            const next = query ? "?q=" + encodeURIComponent(query) : "search.html";
            window.history.replaceState({}, "", next);
            renderSearchResults(searchData, query);
        });
    }
});