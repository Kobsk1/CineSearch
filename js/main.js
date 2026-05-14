/* =============================================
   CineSearch — main.js
   ============================================= */

let currentMovies  = [];
let currentFilters = { genres: [], minYear: null, maxYear: null, minRating: 0, searchTerm: "" };
let favorites      = JSON.parse(localStorage.getItem("cs_favorites") || "[]");
let currentSort    = "default";
let currentPage    = 1;
let isFetching     = false;
let currentView    = "home"; // "home" | "search" | "favorites"

/* ─── Init ─── */
document.addEventListener("DOMContentLoaded", async () => {
  const rawFavs = JSON.parse(localStorage.getItem("cs_favorites") || "[]");
  if (rawFavs.length > 0 && typeof rawFavs[0] !== 'object') {
    localStorage.removeItem("cs_favorites");
  }
  
  loadFavorites();
  bindEvents();
  
  await fetchGenres();
  populateGenreFilters();
  
  updateFavBadge();
  updateNavVisibility();
  showHome();
});

/* ─── Event Binding ─── */
function bindEvents() {
  // Search
  $("searchBtn").addEventListener("click", doSearch);
  $("searchInput").addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });

  // Nav
  $("homeBtn").addEventListener("click", () => {
    currentView = "home";
    resetFiltersState();
    $("contentLayoutWrapper").style.display = "none"; 
    showHome();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  $("homeLogoBtn").addEventListener("click", e => {
    e.preventDefault();
    currentView = "home";
    resetFiltersState();
    $("contentLayoutWrapper").style.display = "none"; 
    showHome();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Navbar search
  const navInput = $("navSearchInput");
  navInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      $("searchInput").value = navInput.value;
      doSearch();
    }
  });
  $("searchInput").addEventListener("input", e => {
  navInput.value = e.target.value;
  }); 

  $("favoritesBtn").addEventListener("click", showFavorites);

  // Filter panel
  $("filterBtn").addEventListener("click", openFilterPanel);
  $("closeFilterBtn").addEventListener("click", closeFilterPanel);
  $("fpOverlay").addEventListener("click", closeFilterPanel);
  $("applyFiltersBtn").addEventListener("click", applyFilters);
  $("resetFiltersBtn").addEventListener("click", resetFilters);

  // Clear all favorites
  $("clearAllBtn").addEventListener("click", clearAllFavorites);

  // Rating slider
  $("minRating").addEventListener("input", e => {
    $("ratingValue").textContent = e.target.value;
  });

  // Modal close
  $("modalClose").addEventListener("click", closeModal);
  $("modalBackdrop").addEventListener("click", e => {
    if (e.target === $("modalBackdrop")) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // Theme
  $("themeToggle").addEventListener("click", toggleTheme);

  // Scroll-to-top button
  const scrollTopBtn = $("scrollTopBtn");
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 360) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    });
  }

// Genre quick-chips in hero
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const genre = chip.dataset.q;
    currentFilters = { genres: [genre], minYear: null, maxYear: null, minRating: 0, searchTerm: "" };
    $("searchInput").value = "";
    currentView = "search";
    updateNavVisibility();

    $("hero").style.display = "none";
    $("contentLayout").style.display = "flex";
    $("clearAllBtn").style.display = "none"; 
    $("resultsTitle").textContent = `Genre: ${genre}`;
    $("resultsGrid").innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading movies...</p></div>';

fetchMovies(currentFilters, currentSort).then(movies => {
      currentMovies = movies;
      $("resultsTitle").textContent = `Genre: ${genre} (${movies.length} results)`;
      renderResults();
    });
  });
});
} 

/* ─── Core Views ─── */

function buildSkeletons(count = 10) {
  return Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-poster"></div>
      <div class="skeleton-info">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line xshort"></div>
      </div>
    </div>
  `).join("");
}

function buildSidebarSkeletons(count = 10) {
  return Array(count).fill(0).map(() => `
    <div class="sidebar-skeleton">
      <div class="sidebar-skeleton-rank"></div>
      <div class="sidebar-skeleton-poster"></div>
      <div class="sidebar-skeleton-info">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join("");
}

function buildSidebarCard(movie) {
  const posterUrl = getPosterUrl(movie);
  const posterEl = posterUrl
    ? `<img src="${posterUrl}" alt="${movie.title.replace(/"/g, '&quot;')}" loading="lazy">`
    : `<div class="sidebar-poster-fallback"><i class="fas fa-film"></i></div>`;

  return `
    <div class="sidebar-movie-item" data-id="${movie.id}">
      <span class="sidebar-rank">${movie.rank}</span>
      <div class="sidebar-poster">${posterEl}</div>
      <div class="sidebar-info">
        <p class="sidebar-title">${movie.title}</p>
        <p class="sidebar-meta">${movie.year} &nbsp;·&nbsp; <i class="fas fa-star" style="color:var(--gold);font-size:.7rem;"></i> ${movie.imdbRating}</p>
        <div class="sidebar-genres">
          ${movie.genres.slice(0,1).map(g => `<span class="genre-pill">${g}</span>`).join("")}
        </div>
      </div>
    </div>`;
}

async function showHome() {
  $("hero").style.display = "flex";
  $("contentLayoutWrapper").style.display = "none";
  $("homeTrendingSection").style.display = "block";
  updateNavVisibility();
  await showHomeTrending('day');
}

async function showHomeTrending(timeWindow = 'day') {
  const grid = $("homeTrendingGrid");
  grid.innerHTML = buildSkeletons(10);

  const movies = await fetchTrending(timeWindow);

  if (!movies.length) {
    $("homeTrendingSection").style.display = "none";
    return;
  }

  grid.innerHTML = movies.map(m => buildTrendingCard(m)).join("");

  grid.querySelectorAll(".movie-card").forEach(card => {
    card.addEventListener("click", e => {
      if (!e.target.closest(".save-btn")) openModal(+card.dataset.id);
    });
  });

  grid.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = +btn.dataset.id;
      const movie = movies.find(m => m.id === id);
      if (movie) toggleFavorite(movie);
      const isSaved = favorites.some(f => f.id === id);
      btn.classList.toggle("active", isSaved);
      btn.querySelector("i").className = isSaved ? "fas fa-bookmark" : "far fa-bookmark";
      updateFavBadge();
    });
  });
}

function switchHomeTrendingTab(timeWindow) {
  $("homeTabToday").classList.toggle("active", timeWindow === 'day');
  $("homeTabWeek").classList.toggle("active", timeWindow === 'week');
  showHomeTrending(timeWindow);
}

async function showTrending(timeWindow = 'day') {
  const grid = $("trendingGrid");
  grid.innerHTML = buildSidebarSkeletons();

  const movies = await fetchTrending(timeWindow);

  if (!movies.length) return;

  grid.innerHTML = movies.map(m => buildSidebarCard(m)).join("");

  grid.querySelectorAll(".sidebar-movie-item").forEach(item => {
    item.addEventListener("click", () => openModal(+item.dataset.id));
  });
}

async function showRecsStrip() {
  if (favorites.length === 0) {
    $("recsStrip").style.display = "none";
    return;
  }

  const strip = $("recsStrip");
  const grid = $("recsStripGrid");
  strip.style.display = "block";
  grid.innerHTML = buildHorizontalSkeletons(8);

  const recs = await fetchRecommendations(favorites, 12);

  if (!recs.length) {
    strip.style.display = "none";
    return;
  }

  // Build subtitle from top genre
  const genreCounts = {};
  favorites.forEach(m => m.genres.forEach(g => {
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  }));
  const topGenre = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  $("recsStripSubtitle").textContent = `Based on your saved ${topGenre} films`;

  grid.innerHTML = recs.map(m => buildStripCard(m)).join("");

  grid.querySelectorAll(".strip-card").forEach(card => {
    card.addEventListener("click", e => {
      if (!e.target.closest(".save-btn")) openModal(+card.dataset.id);
    });
  });

  grid.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = +btn.dataset.id;
      const movie = recs.find(m => m.id === id);
      if (movie) toggleFavorite(movie);
      const isSaved = favorites.some(f => f.id === id);
      btn.classList.toggle("active", isSaved);
      btn.querySelector("i").className = isSaved ? "fas fa-bookmark" : "far fa-bookmark";
      updateFavBadge();
    });
  });
}

function buildHorizontalSkeletons(count = 8) {
  return Array(count).fill(0).map(() => `
    <div class="strip-skeleton">
      <div class="strip-skeleton-poster"></div>
      <div class="strip-skeleton-line"></div>
      <div class="strip-skeleton-line short"></div>
    </div>
  `).join("");
}

function buildStripCard(movie) {
  const saved = favorites.some(f => f.id === movie.id);
  const posterUrl = getPosterUrl(movie);
  const posterEl = posterUrl
    ? `<img src="${posterUrl}" alt="${movie.title.replace(/"/g, '&quot;')}" loading="lazy">`
    : `<div class="strip-poster-fallback"><i class="fas fa-film"></i></div>`;

  return `
    <div class="strip-card" data-id="${movie.id}">
      <div class="strip-poster">
        ${posterEl}
        <button class="save-btn ${saved ? "active" : ""}" data-id="${movie.id}">
          <i class="${saved ? "fas" : "far"} fa-bookmark"></i>
        </button>
      </div>
      <p class="strip-title" title="${movie.title}">${movie.title}</p>
      <p class="strip-meta">${movie.year} &nbsp;·&nbsp; <i class="fas fa-star" style="color:var(--gold);font-size:.65rem;"></i> ${movie.imdbRating}</p>
    </div>`;
}

function switchTrendingTab(timeWindow) {
  $("tabToday").classList.toggle("active", timeWindow === 'day');
  $("tabWeek").classList.toggle("active", timeWindow === 'week');
  showTrending(timeWindow);
}

function buildTrendingCard(movie) {
  const saved     = favorites.some(f => f.id === movie.id);
  const posterUrl = getPosterUrl(movie);
  const posterEl  = posterUrl
    ? `<img src="${posterUrl}" alt="${movie.title.replace(/"/g, '&quot;')}" loading="lazy" onerror="this.outerHTML=fallbackPoster(this.alt)">`
    : fallbackPoster(movie.title);

  return `
    <div class="movie-card trending-card" data-id="${movie.id}">
      <div class="card-poster">
        ${posterEl}
        <div class="rank-badge">${movie.rank}</div>
        <div class="card-overlay">
          <p class="card-overlay-text">${movie.plot}</p>
        </div>
        <button class="save-btn ${saved ? "active" : ""}" data-id="${movie.id}">
          <i class="${saved ? "fas" : "far"} fa-bookmark"></i>
        </button>
      </div>
      <div class="card-info">
        <p class="card-title" title="${movie.title}">${movie.title}</p>
        <div class="card-meta">
          <span>${movie.year}</span>
          <span class="card-rating"><i class="fas fa-star"></i>${movie.imdbRating}</span>
        </div>
        <div class="card-genres">
          ${movie.genres.slice(0,2).map(g => `<span class="genre-pill">${g}</span>`).join("")}
        </div>
      </div>
    </div>`;
}

async function doSearch() {
  const term = $("searchInput").value.trim();
  currentFilters.searchTerm = term;
  currentView = "search";
  currentPage = 1;
  currentMovies = [];
  updateNavVisibility();

  $("hero").style.display = "none";
  $("homeTrendingSection").style.display = "none";
  $("contentLayoutWrapper").style.display = "block"; // CHANGED
  $("contentLayout").style.display = "flex";
  $("resultsTitle").textContent = "Loading...";
  $("resultsGrid").innerHTML = buildSkeletons();
  $("clearAllBtn").style.display = "none";

  const [movies] = await Promise.all([
    fetchMovies(currentFilters, currentSort, currentPage),
    showTrending('day'),
    showRecsStrip()        // ADD THIS
  ]);

  currentMovies = movies;
  $("resultsTitle").textContent = term ? `Results for "${term}"` : "All Movies";
  renderResults();
}

async function loadMore() {
  if (isFetching) return;
  isFetching = true;

  const btn = $("loadMoreBtn");
  if (btn) {
    btn.textContent = "Loading...";
    btn.disabled = true;
  }

  currentPage++;
  const newMovies = await fetchMovies(currentFilters, currentSort, currentPage);

  if (!newMovies.length) {
    if (btn) btn.remove();
    isFetching = false;
    return;
  }

  currentMovies = [...currentMovies, ...newMovies];

  // Append new cards without wiping the grid
  const grid = $("resultsGrid");
  const temp = document.createElement("div");
  temp.innerHTML = newMovies.map(m => buildCard(m)).join("");

  temp.querySelectorAll(".movie-card").forEach(card => {
    card.addEventListener("click", e => {
      if (!e.target.closest(".save-btn")) openModal(+card.dataset.id);
    });
    grid.appendChild(card);
  });

  // Re-bind all save buttons
  grid.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = +btn.dataset.id;
      const movie = currentMovies.find(m => m.id === id);
      if (movie) toggleFavorite(movie);
      const isSaved = favorites.some(f => f.id === id);
      btn.classList.toggle("active", isSaved);
      btn.querySelector("i").className = isSaved ? "fas fa-bookmark" : "far fa-bookmark";
      updateFavBadge();
    });
  });

  if (btn) {
    btn.textContent = "Load More";
    btn.disabled = false;
  }

  isFetching = false;
}

function showFavorites() {
  currentView = "favorites";
  updateNavVisibility();
  currentMovies = sortMovies(favorites, currentSort);
  $("hero").style.display = "none";
  $("homeTrendingSection").style.display = "none";
  $("contentLayoutWrapper").style.display = "block"; // CHANGED
  $("contentLayout").style.display = "flex";
  $("recsStrip").style.display = "none"; // hide recs on favorites
  $("resultsTitle").textContent = `Saved Movies (${currentMovies.length})`;
  $("clearAllBtn").style.display = "flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
  const existingBtn = $("loadMoreBtn");
  if (existingBtn) existingBtn.remove();
  showTrending('day');
  renderResults();
}

/* ─── Render ─── */
function renderResults() {
  const grid = $("resultsGrid");

  if (!currentMovies.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-film"></i>
        <p>No movies found. Try adjusting your search or filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = currentMovies.map(m => buildCard(m)).join("");

  grid.querySelectorAll(".movie-card").forEach(card => {
    card.addEventListener("click", e => {
      if (!e.target.closest(".save-btn")) openModal(+card.dataset.id);
    });
  });

  // Save buttons
  grid.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = +btn.dataset.id;
      const movie = currentMovies.find(m => m.id === id);
      if (movie) toggleFavorite(movie);
      const isSaved = favorites.some(f => f.id === id);
      btn.classList.toggle("active", isSaved);
      btn.querySelector("i").className = isSaved ? "fas fa-bookmark" : "far fa-bookmark";
      updateFavBadge();
      if (currentView === "favorites") showFavorites();
    });
  });

  const existingBtn = $("loadMoreBtn");
  if (existingBtn) existingBtn.remove();

  if (currentView !== "favorites") {
    const loadBtn = document.createElement("button");
    loadBtn.id = "loadMoreBtn";
    loadBtn.className = "load-more-btn";
    loadBtn.textContent = "Load More";
    loadBtn.addEventListener("click", loadMore);
    $("resultsSection").appendChild(loadBtn);
  }
}

function buildCard(movie) {
  const saved     = favorites.some(f => f.id === movie.id);
  const posterUrl = getPosterUrl(movie);
  const posterEl  = posterUrl
    ? `<img src="${posterUrl}" alt="${movie.title.replace(/"/g, '&quot;')}" loading="lazy" onerror="this.outerHTML=fallbackPoster(this.alt)">`
    : fallbackPoster(movie.title);

  return `
    <div class="movie-card" data-id="${movie.id}">
      <div class="card-poster">
        ${posterEl}
        <div class="card-overlay">
          <p class="card-overlay-text">${movie.plot}</p>
        </div>
        <button class="save-btn ${saved ? "active" : ""}" data-id="${movie.id}" title="${saved ? "Remove from saved" : "Save movie"}">
          <i class="${saved ? "fas" : "far"} fa-bookmark"></i>
        </button>
      </div>
      <div class="card-info">
        <p class="card-title" title="${movie.title}">${movie.title}</p>
        <div class="card-meta">
          <span>${movie.year}</span>
          <span class="card-rating"><i class="fas fa-star"></i>${movie.imdbRating}</span>
        </div>
        <div class="card-genres">
          ${movie.genres.slice(0,2).map(g => `<span class="genre-pill">${g}</span>`).join("")}
        </div>
      </div>
    </div>`;
}

function fallbackPoster(title) {
  const initial = title.charAt(0).toUpperCase();
  return `<div class="card-poster-fallback">
    <i class="fas fa-film"></i>
    <span>${initial}</span>
  </div>`;
}

/* ─── Modal ─── */
async function openModal(id) {
  $("modalBackdrop").classList.add("active");
  document.body.style.overflow = "hidden";
  $("modalContent").innerHTML = '<div class="modal-loading-state"><i class="fas fa-spinner fa-spin"></i><p>Loading details...</p></div>';

  const movie = await fetchMovieDetails(id);
  if (!movie) {
    $("modalContent").innerHTML = '<div style="text-align:center;padding:2rem;">Failed to load movie details.</div>';
    return;
  }

  const saved     = favorites.some(f => f.id === id);
  const posterUrl = getPosterUrl(movie);
  const posterEl  = posterUrl
    ? `<img src="${posterUrl}" alt="${movie.title.replace(/"/g, '&quot;')}" onerror="this.outerHTML='<div class=\\'modal-poster-fallback\\'><i class=\\'fas fa-film\\'></i><span>' + this.alt + '</span></div>'">`
    : `<div class="modal-poster-fallback"><i class="fas fa-film"></i><span>${movie.title}</span></div>`;

let trailerHTML = '';
  if (movie.trailerUrl) {
    trailerHTML = `
      <div class="modal-trailer">
        <p class="modal-section-title">Trailer</p>
        <div class="trailer-wrapper">
          <iframe src="${movie.trailerUrl}" title="YouTube trailer" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    `;
  }

  $("modalContent").innerHTML = `
    <div class="modal-poster-col">
      ${posterEl}
    </div>
    <div class="modal-info-col">
      <h2 class="modal-title">${movie.title}</h2>
      <div class="modal-tags">
        <span class="modal-tag tag-year">${movie.year}</span>
        <span class="modal-tag tag-rating"><i class="fas fa-star"></i> ${movie.imdbRating} / 10</span>
        ${movie.genres.map(g => `<span class="modal-tag tag-genre">${g}</span>`).join("")}
      </div>
      <p class="modal-plot">${movie.plot}</p>
      <div>
        <p class="modal-section-title">Cast</p>
        <div class="chips-row">
          ${movie.cast.length ? movie.cast.map(a => `<span class="chip-sm">${a}</span>`).join("") : '<span>N/A</span>'}
        </div>
      </div>
      <div>
        <p class="modal-section-title">Available on (US)</p>
        <div class="chips-row">
          ${movie.platforms.length ? movie.platforms.map(p => `<span class="chip-sm chip-platform">${p}</span>`).join("") : '<span>Unavailable / Unknown</span>'}
        </div>
      </div>
      ${trailerHTML}
      <button class="modal-save-btn ${saved ? "active" : ""}" id="modalSaveBtn" data-id="${id}" style="margin-top: 1rem;">
        <i class="${saved ? "fas" : "far"} fa-bookmark"></i>
        ${saved ? "Remove from Saved" : "Save Movie"}
      </button>
    </div>`;

  $("modalSaveBtn").addEventListener("click", () => {
    toggleFavorite(movie);
    openModal(id); // refresh
    if (currentView === "favorites") showFavorites();
    else if (currentView === "search") renderResults();
  });
}

function closeModal() {
  $("modalBackdrop").classList.remove("active");
  document.body.style.overflow = "";
}

/* ─── Favorites ─── */
function toggleFavorite(movie) {
  const idx = favorites.findIndex(f => f.id === movie.id);
  if (idx === -1) {
    favorites.push(movie);
    showToast("Saved to your list");
  } else {
    favorites.splice(idx, 1);
    showToast("Removed from your list");
  }
  localStorage.setItem("cs_favorites", JSON.stringify(favorites));
  updateFavBadge();
}

function loadFavorites() {
  favorites = JSON.parse(localStorage.getItem("cs_favorites") || "[]");
}

function clearAllFavorites() {
  if (favorites.length === 0) return;
  
  if (confirm("Are you sure you want to clear all saved movies? This action cannot be undone.")) {
    favorites = [];
    localStorage.setItem("cs_favorites", JSON.stringify(favorites));
    updateFavBadge();
    showToast("All saved movies cleared");
    
    // Refresh the view
    if (currentView === "favorites") {
      showFavorites();
    } else if (currentView === "home") {
      showHome();
    }
  }
}

function updateFavBadge() {
  $("favoritesCount").textContent = favorites.length;
}

/* ─── Filter Panel ─── */
function openFilterPanel() {
  $("filterPanel").classList.add("active");
  $("fpOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeFilterPanel() {
  $("filterPanel").classList.remove("active");
  $("fpOverlay").classList.remove("active");
  document.body.style.overflow = "";
}

function populateGenreFilters() {
  const container = $("genreFilters");
  container.innerHTML = getAllGenres().map(g => `
    <label class="g-label">
      <input type="checkbox" value="${g}">
      <span>${g}</span>
    </label>`).join("");
}

function applyFilters() {
  const selected  = [...document.querySelectorAll("#genreFilters input:checked")].map(c => c.value);
  const minYear   = $("minYear").value  ? +$("minYear").value  : null;
  const maxYear   = $("maxYear").value  ? +$("maxYear").value  : null;
  const minRating = +$("minRating").value;
  const sortVal   = document.querySelector('input[name="sortOption"]:checked')?.value || "default";

  currentSort = sortVal;
  currentFilters = { genres: selected, minYear, maxYear, minRating, searchTerm: currentFilters.searchTerm };
  closeFilterPanel();
  doSearch();
}

function resetFilters() {
  document.querySelectorAll("#genreFilters input").forEach(c => c.checked = false);
  $("minYear").value    = "";
  $("maxYear").value    = "";
  $("minRating").value  = 0;
  $("ratingValue").textContent = 0;
  const defaultRadio = document.querySelector('input[name="sortOption"][value="default"]');
  if (defaultRadio) defaultRadio.checked = true;
  resetFiltersState();
  closeFilterPanel();
}

function resetFiltersState() {
  currentFilters = { genres: [], minYear: null, maxYear: null, minRating: 0, searchTerm: "" };
  $("searchInput").value = "";
  currentSort = "default";
  const defaultRadio = document.querySelector('input[name="sortOption"][value="default"]');
  if (defaultRadio) defaultRadio.checked = true;
}

/* ─── Theme ─── */
function toggleTheme() {
  const isLight = document.body.getAttribute("data-theme") === "light";
  if (isLight) {
    document.body.removeAttribute("data-theme");
    $("themeToggle").innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    document.body.setAttribute("data-theme", "light");
    $("themeToggle").innerHTML = '<i class="fas fa-sun"></i>';
  }
}

/* ─── Toast ─── */
let toastTimer = null;
function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.style.opacity = "1";
  t.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(-50%) translateY(120%)";
  }, 2200);
}

/* ─── Util ─── */
function $(id) { return document.getElementById(id); }

function sortMovies(movies, sortBy) {
  const sorted = [...movies]; // Create a copy to avoid mutating original

  switch (sortBy) {
    case "latest":
      return sorted.sort((a, b) => (b.year === "N/A" ? 0 : b.year) - (a.year === "N/A" ? 0 : a.year));
    case "oldest":
      return sorted.sort((a, b) => (a.year === "N/A" ? 9999 : a.year) - (b.year === "N/A" ? 9999 : b.year));
    case "highest-rated":
      return sorted.sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));
    case "lowest-rated":
      return sorted.sort((a, b) => parseFloat(a.imdbRating) - parseFloat(b.imdbRating));
    case "default":
    default:
      // For "default" (relevance), return as-is or implement custom logic if needed
      return sorted;
  }
}

function updateNavVisibility() {
  const navActions = document.querySelector(".nav-actions");
  const navSearchWrap = $("navSearchWrap");

  if (currentView === "home") {
    navActions.style.opacity = "0";
    navActions.style.pointerEvents = "none";
    navSearchWrap.classList.remove("visible");
  } else {
    navActions.style.opacity = "1";
    navActions.style.pointerEvents = "all";
    navSearchWrap.classList.add("visible");
    // Sync whatever was searched
    $("navSearchInput").value = $("searchInput").value;
  }
}