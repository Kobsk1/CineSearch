// DOM Elements
let currentMovies = [...moviesData];
let currentFilters = {
    genres: [],
    minYear: null,
    maxYear: null,
    minRating: 0,
    searchTerm: ''
};
let favorites = JSON.parse(localStorage.getItem('cineSearchFavorites') || '[]');
let currentSort = 'default';
let currentView = 'home'; // 'home' or 'favorites'

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadFavorites();
    populateGenreFilters();
    updateFavoritesCount();
    renderHomePage();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Search
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Navigation
    document.getElementById('homeBtn').addEventListener('click', () => {
        currentView = 'home';
        resetFilters();
        renderHomePage();
        document.getElementById('hero').style.display = 'flex';
        document.getElementById('resultsSection').style.display = 'none';
    });
    
    document.getElementById('favoritesBtn').addEventListener('click', showFavorites);
    
    // Filter panel
    document.getElementById('filterBtn').addEventListener('click', () => {
        document.getElementById('filterPanel').classList.add('active');
    });
    document.getElementById('closeFilterBtn').addEventListener('click', () => {
        document.getElementById('filterPanel').classList.remove('active');
    });
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
    
    // Sorting
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        if (document.getElementById('resultsSection').style.display === 'block') {
            renderResults();
        }
    });
    
    // Rating slider
    const ratingSlider = document.getElementById('minRating');
    const ratingValue = document.getElementById('ratingValue');
    ratingSlider.addEventListener('input', (e) => {
        ratingValue.textContent = e.target.value;
    });
    
    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Trending tags
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            document.getElementById('searchInput').value = tag.textContent;
            performSearch();
        });
    });
}

// Perform search
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    currentFilters.searchTerm = searchTerm;
    currentView = 'search';
    
    // Hide hero, show results
    document.getElementById('hero').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    // Apply filters and render
    const filtered = filterMovies(moviesData, currentFilters);
    const sorted = sortMovies(filtered, currentSort);
    currentMovies = sorted;
    
    document.getElementById('resultsTitle').textContent = 
        searchTerm ? `Search Results for "${searchTerm}"` : 'All Movies';
    
    renderResults();
}

// Render home page (show all movies)
function renderHomePage() {
    currentFilters.searchTerm = '';
    document.getElementById('searchInput').value = '';
    const filtered = filterMovies(moviesData, currentFilters);
    const sorted = sortMovies(filtered, currentSort);
    currentMovies = sorted;
    renderResults();
}

// Show favorites only
function showFavorites() {
    currentView = 'favorites';
    const favoriteMovies = moviesData.filter(movie => favorites.includes(movie.id));
    currentMovies = sortMovies(favoriteMovies, currentSort);
    document.getElementById('hero').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsTitle').textContent = 'Your Favorites';
    renderResults();
}

// Render results grid
function renderResults() {
    const grid = document.getElementById('resultsGrid');
    
    if (currentMovies.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film"></i>
                <p>No movies found. Try adjusting your filters!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = currentMovies.map(movie => createMovieCard(movie)).join('');
    
    // Add event listeners to newly created cards
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn')) {
                const movieId = parseInt(card.dataset.id);
                openModal(movieId);
            }
        });
    });
    
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const movieId = parseInt(btn.dataset.id);
            toggleFavorite(movieId);
            btn.classList.toggle('active', favorites.includes(movieId));
            
            // Re-render if in favorites view
            if (currentView === 'favorites') {
                showFavorites();
            }
        });
    });
}

// Create movie card HTML
function createMovieCard(movie) {
    const isFavorite = favorites.includes(movie.id);
    const vibeColor = movie.vibeMatch >= 90 ? '#6cbfa5' : movie.vibeMatch >= 80 ? '#9b59b6' : '#f39c12';
    
    return `
        <div class="movie-card" data-id="${movie.id}">
            <div class="card-poster">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="vibe-badge" style="background: ${vibeColor}">
                    ${movie.vibeMatch}% Match
                </div>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${movie.id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="card-content">
                <h3 class="card-title">${movie.title}</h3>
                <div class="card-meta">
                    <span>${movie.year}</span>
                    <span class="imdb-rating">
                        <i class="fas fa-star"></i> ${movie.imdbRating}/10
                    </span>
                </div>
                <div class="genre-tags">
                    ${movie.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Open modal with movie details
function openModal(movieId) {
    const movie = moviesData.find(m => m.id === movieId);
    if (!movie) return;
    
    const isFavorite = favorites.includes(movie.id);
    const vibeColor = movie.vibeMatch >= 90 ? '#6cbfa5' : movie.vibeMatch >= 80 ? '#9b59b6' : '#f39c12';
    
    const modalContent = `
        <div class="modal-poster">
            <img src="${movie.poster}" alt="${movie.title}">
            <button class="play-button" id="playTrailerBtn">
                <i class="fas fa-play"></i>
            </button>
            <div class="trailer-placeholder" id="trailerPlaceholder">
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
        <div class="modal-info">
            <h2>${movie.title}</h2>
            <div class="modal-meta">
                <span class="modal-year">${movie.year}</span>
                <span class="modal-rating"><i class="fas fa-star"></i> ${movie.imdbRating}/10</span>
                <span class="modal-vibe" style="background: ${vibeColor}">${movie.vibeMatch}% Vibe Match</span>
            </div>
            <p class="modal-plot">${movie.plot}</p>
            <div class="cast-section">
                <h4>Cast</h4>
                <div class="cast-chips">
                    ${movie.cast.map(actor => `<span class="cast-chip">${actor}</span>`).join('')}
                </div>
            </div>
            <div class="platforms-section">
                <h4>Available on</h4>
                <div class="platform-chips">
                    ${movie.platforms.map(platform => `<span class="platform-chip">${platform}</span>`).join('')}
                </div>
            </div>
            <button class="modal-favorite" id="modalFavoriteBtn">
                <i class="fas ${isFavorite ? 'fa-heart' : 'fa-heart-o'}"></i>
                ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
        </div>
    `;
    
    document.getElementById('modalContent').innerHTML = modalContent;
    document.getElementById('modalOverlay').classList.add('active');
    
    // Modal event listeners
    document.getElementById('playTrailerBtn').addEventListener('click', () => {
        const trailer = document.getElementById('trailerPlaceholder');
        trailer.classList.toggle('active');
    });
    
    document.getElementById('modalFavoriteBtn').addEventListener('click', () => {
        toggleFavorite(movie.id);
        openModal(movie.id); // Refresh modal
        if (currentView === 'favorites') {
            showFavorites();
        } else {
            renderResults();
        }
        updateFavoritesCount();
    });
}

// Close modal
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Toggle favorite
function toggleFavorite(movieId) {
    const index = favorites.indexOf(movieId);
    if (index === -1) {
        favorites.push(movieId);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('cineSearchFavorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

// Update favorites count in navbar
function updateFavoritesCount() {
    const count = favorites.length;
    document.getElementById('favoritesCount').textContent = count;
}

// Load favorites from localStorage
function loadFavorites() {
    const stored = localStorage.getItem('cineSearchFavorites');
    if (stored) {
        favorites = JSON.parse(stored);
    }
}

// Populate genre filters
function populateGenreFilters() {
    const genres = getAllGenres();
    const container = document.getElementById('genreFilters');
    container.innerHTML = genres.map(genre => `
        <label class="genre-checkbox">
            <input type="checkbox" value="${genre}">
            <span>${genre}</span>
        </label>
    `).join('');
}

// Apply filters
function applyFilters() {
    // Get selected genres
    const selectedGenres = [];
    document.querySelectorAll('#genreFilters input:checked').forEach(cb => {
        selectedGenres.push(cb.value);
    });
    
    const minYear = document.getElementById('minYear').value;
    const maxYear = document.getElementById('maxYear').value;
    const minRating = parseFloat(document.getElementById('minRating').value);
    
    currentFilters = {
        genres: selectedGenres,
        minYear: minYear ? parseInt(minYear) : null,
        maxYear: maxYear ? parseInt(maxYear) : null,
        minRating: minRating,
        searchTerm: currentFilters.searchTerm || ''
    };
    
    // Close filter panel
    document.getElementById('filterPanel').classList.remove('active');
    
    // Re-render results
    if (document.getElementById('resultsSection').style.display === 'block') {
        performSearch();
    } else {
        renderHomePage();
    }
}

// Reset all filters
function resetFilters() {
    // Reset checkboxes
    document.querySelectorAll('#genreFilters input').forEach(cb => cb.checked = false);
    document.getElementById('minYear').value = '';
    document.getElementById('maxYear').value = '';
    document.getElementById('minRating').value = 0;
    document.getElementById('ratingValue').textContent = 0;
    document.getElementById('searchInput').value = '';
    
    currentFilters = {
        genres: [],
        minYear: null,
        maxYear: null,
        minRating: 0,
        searchTerm: ''
    };
    currentSort = 'default';
    document.getElementById('sortSelect').value = 'default';
    
    if (currentView === 'favorites') {
        showFavorites();
    } else {
        renderHomePage();
    }
    
    document.getElementById('filterPanel').classList.remove('active');
}

// Toggle dark/light theme
function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
}