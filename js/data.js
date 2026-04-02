/**
 * CineSearch — Movie Data API Service
 * Now using TMDB
 */

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_API_KEY = "d09bee5fd836cd0d49f8a29c2fc16676";
const TMDB_READ_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMDliZWU1ZmQ4MzZjZDBkNDlmOGEyOWMyZmMxNjY3NiIsIm5iZiI6MTc3NTEwNDYyNC44MTEsInN1YiI6IjY5Y2RmMjcwOGRjOWRjODJkMDRiNGRhYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3MK5GrA9_07X6deid9qr9yWloTIzD8UlRLv8Ws9r5_U";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

let genresMap = {};

async function fetchGenres() {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/genre/movie/list?language=en-US`, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`
      }
    });
    const data = await res.json();
    if (data.genres) {
      data.genres.forEach(g => {
        genresMap[g.id] = g.name;
      });
    }
  } catch (err) {
    console.error("Error fetching genres", err);
  }
}

function getAllGenres() {
  return Object.values(genresMap).sort();
}

async function fetchMovies(filters, sortBy) {
  let endpoint = "";
  const params = new URLSearchParams({
    language: 'en-US',
    page: '1',
    include_adult: 'false'
  });

  if (filters.searchTerm) {
    endpoint = "/search/movie";
    params.set('query', filters.searchTerm);
  } else {
    endpoint = "/discover/movie";
    if (filters.genres && filters.genres.length > 0) {
      const genreIds = filters.genres.map(name => {
        return Object.keys(genresMap).find(key => genresMap[key] === name);
      }).filter(Boolean);
      if (genreIds.length > 0) {
        params.set('with_genres', genreIds.join(','));
      }
    }
    if (filters.minYear) {
      params.set('primary_release_date.gte', `${filters.minYear}-01-01`);
    }
    if (filters.maxYear) {
      params.set('primary_release_date.lte', `${filters.maxYear}-12-31`);
    }
    if (filters.minRating) {
      params.set('vote_average.gte', filters.minRating);
    }
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${params.toString()}`, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`
      }
    });
    const data = await res.json();
    let results = data.results || [];
    
    results = results.map(m => mapMovieData(m));

    // For secondary filtering when using keyword search
    if (filters.searchTerm) {
      results = filterMoviesLocally(results, filters);
    }

    return sortMovies(results, sortBy);
  } catch (err) {
    console.error("Error fetching movies", err);
    return [];
  }
}

async function fetchMovieDetails(id) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?append_to_response=credits,videos,watch/providers`, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`
      }
    });
    const tmdbObj = await res.json();
    
    if (tmdbObj.success === false) return null;

    const movie = mapMovieData(tmdbObj);
    
    let cast = [];
    if (tmdbObj.credits && tmdbObj.credits.cast) {
      cast = tmdbObj.credits.cast.slice(0, 8).map(c => c.name);
    }
    movie.cast = cast;

    let platforms = [];
    if (tmdbObj['watch/providers'] && tmdbObj['watch/providers'].results && tmdbObj['watch/providers'].results.US) {
      const usProviders = tmdbObj['watch/providers'].results.US.flatrate || [];
      platforms = usProviders.map(p => p.provider_name);
    }
    movie.platforms = [...new Set(platforms)];

    let trailerUrl = null;
    if (tmdbObj.videos && tmdbObj.videos.results) {
      const trailer = tmdbObj.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      }
    }
    movie.trailerUrl = trailerUrl;
    
    return movie;
  } catch(err) {
    console.error("Error fetching movie details", err);
    return null;
  }
}

function mapMovieData(tmdbObj) {
  const genreNames = [];
  if (tmdbObj.genres) {
    tmdbObj.genres.forEach(g => genreNames.push(g.name));
  } else if (tmdbObj.genre_ids) {
    tmdbObj.genre_ids.forEach(id => {
      if (genresMap[id]) genreNames.push(genresMap[id]);
    });
  }

  let year = "";
  if (tmdbObj.release_date) {
    year = parseInt(tmdbObj.release_date.split('-')[0]);
  }

  return {
    id: tmdbObj.id,
    title: tmdbObj.title || tmdbObj.original_title,
    year: year || "N/A",
    imdbRating: tmdbObj.vote_average ? parseFloat(tmdbObj.vote_average.toFixed(1)) : 0,
    genres: genreNames,
    plot: tmdbObj.overview || "No plot available.",
    cast: [],
    platforms: [],
    tmdbPoster: tmdbObj.poster_path,
  };
}

function getPosterUrl(movie) {
  if (movie.tmdbPoster)  return `${TMDB_IMG}${movie.tmdbPoster}`;
  return null;
}

function filterMoviesLocally(movies, filters) {
  return movies.filter(movie => {
    if (filters.genres?.length && !movie.genres.some(g => filters.genres.includes(g))) return false;
    if (filters.minYear  && movie.year !== "N/A" && movie.year < filters.minYear)  return false;
    if (filters.maxYear  && movie.year !== "N/A" && movie.year > filters.maxYear)  return false;
    if (filters.minRating && movie.imdbRating < filters.minRating) return false;
    return true;
  });
}

function sortMovies(movies, sortBy) {
  const s = [...movies];
  switch (sortBy) {
    case "latest":        return s.sort((a,b) => (b.year==="N/A"?0:b.year) - (a.year==="N/A"?0:a.year));
    case "oldest":        return s.sort((a,b) => (a.year==="N/A"?9999:a.year) - (b.year==="N/A"?9999:b.year));
    case "highest-rated": return s.sort((a,b) => b.imdbRating - a.imdbRating);
    case "lowest-rated":  return s.sort((a,b) => a.imdbRating - b.imdbRating);
    default:              return s;
  }
}