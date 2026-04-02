/**
 * CineSearch — Movie Data
 *
 * Poster images are loaded from:
 *   1. ../media/posters/<filename>  — drop your own images here (relative to html/index.html)
 *   2. TMDB CDN (https://image.tmdb.org/t/p/w500/<path>)
 *   3. Fallback placeholder rendered in JS
 *
 * To add your own poster: save the image to /media/posters/ and set
 *   localPoster: "../media/posters/your-file.jpg"
 */

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const moviesData = [
  {
    id: 1,
    title: "Demon Slayer: Infinity Castle",
    year: 2024,
    imdbRating: 9.1,
    genres: ["Action", "Animation", "Adventure"],
    plot: "Tanjiro and his comrades face Muzan's strongest demons in an endless labyrinth where time and space twist beyond imagination.",
    cast: ["Natsuki Hanae", "Akari Kito", "Yoshitsugu Matsuoka"],
    platforms: ["Crunchyroll", "Funimation"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/fwJO6qhCPDCXEBHXigTaVl9gBb7.jpg",
    localPoster: null
  },
  {
    id: 2,
    title: "Chainsaw Man: Reze Arc",
    year: 2024,
    imdbRating: 8.7,
    genres: ["Action", "Animation", "Fantasy"],
    plot: "Denji faces his most dangerous enemy yet — the mysterious Reze, who harbors secrets that could destroy everything he holds dear.",
    cast: ["Kikunosuke Toya", "Tomori Kusunoki", "Shiori Izawa"],
    platforms: ["Crunchyroll", "Netflix"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/zN41DPmPhwmgJjHwezALdrdvD0h.jpg",
    localPoster: null
  },
  {
    id: 3,
    title: "Dune: Part Two",
    year: 2024,
    imdbRating: 8.9,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    plot: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
    platforms: ["HBO Max", "Amazon Prime"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    localPoster: null
  },
  {
    id: 4,
    title: "Oppenheimer",
    year: 2023,
    imdbRating: 8.5,
    genres: ["Biography", "Drama", "History"],
    plot: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
    platforms: ["Peacock", "Amazon Prime"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    localPoster: null
  },
  {
    id: 5,
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    imdbRating: 8.7,
    genres: ["Animation", "Action", "Adventure"],
    plot: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
    platforms: ["Netflix", "Disney+"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    localPoster: null
  },
  {
    id: 6,
    title: "The Batman",
    year: 2022,
    imdbRating: 7.8,
    genres: ["Action", "Crime", "Drama"],
    plot: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
    cast: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano"],
    platforms: ["HBO Max", "Amazon Prime"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    localPoster: null
  },
  {
    id: 7,
    title: "Everything Everywhere All at Once",
    year: 2022,
    imdbRating: 7.8,
    genres: ["Action", "Comedy", "Sci-Fi"],
    plot: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes.",
    cast: ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan"],
    platforms: ["Netflix", "Showtime"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    localPoster: null
  },
  {
    id: 8,
    title: "Interstellar",
    year: 2014,
    imdbRating: 8.6,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival against a dying Earth.",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    platforms: ["Netflix", "Amazon Prime", "Paramount+"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    localPoster: null
  },
  {
    id: 9,
    title: "John Wick: Chapter 4",
    year: 2023,
    imdbRating: 7.7,
    genres: ["Action", "Thriller", "Crime"],
    plot: "John Wick uncovers a path to defeating The High Table, but before he can earn his freedom he must face off against a new enemy.",
    cast: ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård"],
    platforms: ["Lionsgate+", "Amazon Prime"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    localPoster: null
  },
  {
    id: 10,
    title: "Barbie",
    year: 2023,
    imdbRating: 6.8,
    genres: ["Comedy", "Adventure", "Fantasy"],
    plot: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
    cast: ["Margot Robbie", "Ryan Gosling", "America Ferrera"],
    platforms: ["HBO Max", "Netflix"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/iuFNMS8vlbZxOkIGUN9ggvEMgFV.jpg",
    localPoster: null
  },
  {
    id: 11,
    title: "The Shawshank Redemption",
    year: 1994,
    imdbRating: 9.3,
    genres: ["Drama", "Crime"],
    plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
    platforms: ["Netflix", "Amazon Prime"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    localPoster: null
  },
  {
    id: 12,
    title: "The Dark Knight",
    year: 2008,
    imdbRating: 9.0,
    genres: ["Action", "Crime", "Drama"],
    plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    platforms: ["HBO Max", "Amazon Prime"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    localPoster: null
  },
  {
    id: 13,
    title: "Parasite",
    year: 2019,
    imdbRating: 8.5,
    genres: ["Thriller", "Drama", "Crime"],
    plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
    platforms: ["Hulu", "Amazon Prime"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    localPoster: null
  },
  {
    id: 14,
    title: "Spirited Away",
    year: 2001,
    imdbRating: 8.6,
    genres: ["Animation", "Adventure", "Fantasy"],
    plot: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
    cast: ["Daveigh Chase", "Suzanne Pleshette", "Miyu Irino"],
    platforms: ["Netflix", "HBO Max"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    localPoster: null
  },
  {
    id: 15,
    title: "Inception",
    year: 2010,
    imdbRating: 8.8,
    genres: ["Sci-Fi", "Action", "Thriller"],
    plot: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
    platforms: ["Netflix", "HBO Max"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    localPoster: null
  },
  {
    id: 16,
    title: "Poor Things",
    year: 2023,
    imdbRating: 8.0,
    genres: ["Comedy", "Drama", "Fantasy"],
    plot: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
    cast: ["Emma Stone", "Mark Ruffalo", "Willem Dafoe"],
    platforms: ["Disney+", "Hulu"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/kCGlIMHnOm8JPXq3rXM6c5wkWtI.jpg",
    localPoster: null
  },
  {
    id: 17,
    title: "Killers of the Flower Moon",
    year: 2023,
    imdbRating: 7.6,
    genres: ["Crime", "Drama", "History"],
    plot: "Members of the Osage Nation are murdered under mysterious circumstances in the 1920s, sparking a major FBI investigation.",
    cast: ["Leonardo DiCaprio", "Robert De Niro", "Lily Gladstone"],
    platforms: ["Apple TV+"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/dB6ZpFVmF8WHgfHsBQUbXUWUvGQ.jpg",
    localPoster: null
  },
  {
    id: 18,
    title: "Perfect Days",
    year: 2023,
    imdbRating: 7.9,
    genres: ["Drama"],
    plot: "A toilet cleaner in Tokyo is content with his simple life, listening to cassette tapes and photographing trees, until two encounters challenge his carefully maintained equilibrium.",
    cast: ["Kōji Yakusho", "Tokio Emoto", "Arisa Nakano"],
    platforms: ["MUBI"],
    trailerUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    tmdbPoster: "/lRlff6I6t2Kx6YWPB8bZALbNEL.jpg",
    localPoster: null
  }
];

/* ─── Helpers ─── */

function getPosterUrl(movie) {
  if (movie.localPoster) return movie.localPoster;
  if (movie.tmdbPoster)  return `${TMDB_IMG}${movie.tmdbPoster}`;
  return null;
}

function getAllGenres() {
  const set = new Set();
  moviesData.forEach(m => m.genres.forEach(g => set.add(g)));
  return [...set].sort();
}

function filterMovies(movies, filters) {
  return movies.filter(movie => {
    if (filters.genres?.length && !movie.genres.some(g => filters.genres.includes(g))) return false;
    if (filters.minYear  && movie.year < filters.minYear)  return false;
    if (filters.maxYear  && movie.year > filters.maxYear)  return false;
    if (filters.minRating && movie.imdbRating < filters.minRating) return false;
    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      return (
        movie.title.toLowerCase().includes(q) ||
        movie.genres.some(g => g.toLowerCase().includes(q)) ||
        movie.plot.toLowerCase().includes(q) ||
        movie.cast.some(a => a.toLowerCase().includes(q))
      );
    }
    return true;
  });
}

function sortMovies(movies, sortBy) {
  const s = [...movies];
  switch (sortBy) {
    case "latest":        return s.sort((a,b) => b.year - a.year);
    case "oldest":        return s.sort((a,b) => a.year - b.year);
    case "highest-rated": return s.sort((a,b) => b.imdbRating - a.imdbRating);
    case "lowest-rated":  return s.sort((a,b) => a.imdbRating - b.imdbRating);
    default:              return s;
  }
}