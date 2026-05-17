/**
 * CineSearch — Backend API client
 */

const API_BASE = (() => {
  if (window.CINESEARCH_API_BASE) return window.CINESEARCH_API_BASE.replace(/\/$/, '');
  if (window.location.port === '8080' || window.location.port === '80') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:3000/api';
})();

function getToken() {
  return localStorage.getItem('cs_token');
}

function setAuth({ token, username, user_id }) {
  localStorage.setItem('cs_token', token);
  localStorage.setItem('cs_username', username);
  localStorage.setItem('cs_user_id', String(user_id));
}

function clearAuth() {
  localStorage.removeItem('cs_token');
  localStorage.removeItem('cs_username');
  localStorage.removeItem('cs_user_id');
}

function getAuthUser() {
  const token = getToken();
  if (!token) return null;
  return {
    token,
    username: localStorage.getItem('cs_username'),
    user_id: localStorage.getItem('cs_user_id'),
  };
}

function isLoggedIn() {
  return !!getToken();
}

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

async function registerUser(username, email, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

async function loginUser(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function fetchFavorites() {
  return apiFetch('/favorites');
}

async function saveFavorite(tmdb_movie_id, movie_title, poster_path) {
  return apiFetch('/favorites', {
    method: 'POST',
    body: JSON.stringify({ tmdb_movie_id, movie_title, poster_path }),
  });
}

async function removeFavorite(tmdb_movie_id) {
  return apiFetch(`/favorites/${tmdb_movie_id}`, { method: 'DELETE' });
}

async function clearAllFavoritesApi() {
  return apiFetch('/favorites', { method: 'DELETE' });
}

async function fetchComments(tmdb_movie_id) {
  return apiFetch(`/comments/${tmdb_movie_id}`);
}

async function postComment(tmdb_movie_id, movie_title, comment_text) {
  return apiFetch('/comments', {
    method: 'POST',
    body: JSON.stringify({ tmdb_movie_id, movie_title, comment_text }),
  });
}

async function deleteComment(comment_id) {
  return apiFetch(`/comments/${comment_id}`, { method: 'DELETE' });
}

async function fetchMovieRatingStats(tmdb_movie_id) {
  return apiFetch(`/ratings/${tmdb_movie_id}`);
}

async function fetchMyRating(tmdb_movie_id) {
  return apiFetch(`/ratings/${tmdb_movie_id}/mine`);
}

async function submitRating(tmdb_movie_id, movie_title, rating) {
  return apiFetch('/ratings', {
    method: 'POST',
    body: JSON.stringify({ tmdb_movie_id, movie_title, rating }),
  });
}

async function deleteRating(tmdb_movie_id) {
  return apiFetch(`/ratings/${tmdb_movie_id}`, { method: 'DELETE' });
}

function mapFavoriteRow(row) {
  return {
    id: row.tmdb_movie_id,
    title: row.movie_title,
    tmdbPoster: row.poster_path || null,
    year: 'N/A',
    imdbRating: 0,
    genres: [],
    plot: '',
  };
}