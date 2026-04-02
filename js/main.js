/* =============================================
   CineSearch — main.js
   ============================================= */

let currentMovies  = [];
let currentFilters = { genres: [], minYear: null, maxYear: null, minRating: 0, searchTerm: "" };
let favorites      = JSON.parse(localStorage.getItem("cs_favorites") || "[]");
let currentSort    = "default";
let currentView    = "home"; // "home" | "search" | "favorites"

/* ─── Init ─── */
document.addEventListener("DOMContentLoaded", () => {
  loadFavorites();
  bindEvents();
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

function doSearch() {
  const term = $("searchInput").value.trim();
  currentFilters.searchTerm = term;
  currentView = "search";

  const filtered = filterMovies(moviesData, currentFilters);
  currentMovies   = sortMovies(filtered, currentSort);

  $("hero").style.display = "none";
  $("resultsSection").style.display = "block";
  $("resultsTitle").textContent = term ? `Results for "${term}"` : "All Movies";
  renderResults();
}

function showFavorites() {
  currentView = "favorites";
  const faved = moviesData.filter(m => favorites.includes(m.id));
  currentMovies = sortMovies(faved, currentSort);
  $("hero").style.display = "none";
  $("resultsSection").style.display = "block";
  $("resultsTitle").textContent = `Saved Movies (${faved.length})`;
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

  // Card click → modal
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
      toggleFavorite(id);
      btn.classList.toggle("active", favorites.includes(id));
      btn.querySelector("i").className = favorites.includes(id) ? "fas fa-bookmark" : "far fa-bookmark";
      if (currentView === "favorites") showFavorites();
    });
  });
}

function buildCard(movie) {
  const saved     = favorites.includes(movie.id);
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
function openModal(id) {
  const movie = moviesData.find(m => m.id === id);
  if (!movie) return;

  const saved     = favorites.includes(id);
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
          ${movie.cast.map(a => `<span class="chip-sm">${a}</span>`).join("")}
        </div>
      </div>
      <div>
        <p class="modal-section-title">Available on</p>
        <div class="chips-row">
          ${movie.platforms.map(p => `<span class="chip-sm chip-platform">${p}</span>`).join("")}
        </div>
      </div>
      ${trailerHTML}
      <button class="modal-save-btn ${saved ? "active" : ""}" id="modalSaveBtn" data-id="${id}" style="margin-top: 1rem;">
        <i class="${saved ? "fas" : "far"} fa-bookmark"></i>
        ${saved ? "Remove from Saved" : "Save Movie"}
      </button>
    </div>`;

  $("modalBackdrop").classList.add("active");
  document.body.style.overflow = "hidden";

  $("modalSaveBtn").addEventListener("click", () => {
    toggleFavorite(id);
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
function toggleFavorite(id) {
  const idx = favorites.indexOf(id);
  if (idx === -1) {
    favorites.push(id);
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