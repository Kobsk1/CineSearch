/* =============================================
   CineSearch — main.js
   ============================================= */

let currentMovies  = [];
let currentFilters = { genres: [], minYear: null, maxYear: null, minRating: 0, searchTerm: "" };
let favorites      = JSON.parse(localStorage.getItem("cs_favorites") || "[]");
let currentSort    = "default";
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
    $("hero").style.display = "flex";
    $("resultsSection").style.display = "none";
    resetFiltersState();
  });
  $("homeLogoBtn").addEventListener("click", e => {
    e.preventDefault();
    currentView = "home";
    $("hero").style.display = "flex";
    $("resultsSection").style.display = "none";
    resetFiltersState();
  });
  $("favoritesBtn").addEventListener("click", showFavorites);

  // Filter panel
  $("filterBtn").addEventListener("click", openFilterPanel);
  $("closeFilterBtn").addEventListener("click", closeFilterPanel);
  $("fpOverlay").addEventListener("click", closeFilterPanel);
  $("applyFiltersBtn").addEventListener("click", applyFilters);
  $("resetFiltersBtn").addEventListener("click", resetFilters);

  // Sort
  $("sortSelect").addEventListener("change", e => {
    currentSort = e.target.value;
    if (currentView !== "home") renderResults();
  });

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

  // Genre quick-chips in hero
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      $("searchInput").value = chip.dataset.q;
      doSearch();
    });
  });
}

/* ─── Core Views ─── */
function showHome() {
  $("hero").style.display = "flex";
  $("resultsSection").style.display = "none";
}

async function doSearch() {
  const term = $("searchInput").value.trim();
  currentFilters.searchTerm = term;
  currentView = "search";

  $("hero").style.display = "none";
  $("resultsSection").style.display = "block";
  $("resultsTitle").textContent = "Loading...";
  $("resultsGrid").innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Loading movies...</p></div>';

  currentMovies = await fetchMovies(currentFilters, currentSort);

  $("resultsTitle").textContent = term ? `Results for "${term}"` : "All Movies";
  renderResults();
}

function showFavorites() {
  currentView = "favorites";
  currentMovies = sortMovies(favorites, currentSort);
  $("hero").style.display = "none";
  $("resultsSection").style.display = "block";
  $("resultsTitle").textContent = `Saved Movies (${currentMovies.length})`;
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
      if (currentView === "favorites") showFavorites();
    });
  });
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
  $("modalContent").innerHTML = '<div style="width:100%;text-align:center;padding:4rem;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--primary);"></i><p style="margin-top:1rem;">Loading details...</p></div>';

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
      <div class="modal-trailer" style="margin-top: 1.5rem;">
        <p class="modal-section-title">Trailer</p>
        <iframe width="100%" height="215" src="${movie.trailerUrl}" title="YouTube trailer" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 8px;"></iframe>
      </div>
    `;
  }

  $("modalContent").innerHTML = `
    <div class="modal-poster-col">${posterEl}</div>
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
  const selected = [...document.querySelectorAll("#genreFilters input:checked")].map(c => c.value);
  const minYear  = $("minYear").value  ? +$("minYear").value  : null;
  const maxYear  = $("maxYear").value  ? +$("maxYear").value  : null;
  const minRating= +$("minRating").value;

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
  resetFiltersState();
  closeFilterPanel();
}

function resetFiltersState() {
  currentFilters = { genres: [], minYear: null, maxYear: null, minRating: 0, searchTerm: "" };
  $("searchInput").value   = "";
  $("sortSelect").value    = "default";
  currentSort = "default";
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
let toastTimer;
function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ─── Util ─── */
function $(id) { return document.getElementById(id); }