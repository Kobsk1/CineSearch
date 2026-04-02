// Mock movie database
const moviesData = [
    {
        id: 1,
        title: "Chainsaw Man - Reze Arc",
        year: 2024,
        imdbRating: 8.7,
        vibeMatch: 94,
        genres: ["Action", "Animation", "Fantasy"],
        plot: "Denji faces his most dangerous enemy yet - the mysterious Reze, who harbors secrets that could destroy everything he holds dear.",
        cast: ["Kikunosuke Toya", "Tomori Kusunoki", "Shiori Izawa"],
        platforms: ["Crunchyroll", "Netflix"],
        poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%236cbfa5'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='20' font-family='Arial' dy='.3em'%3ECSM%3A Reze%3C/text%3E%3C/svg%3E"
    },
    {
        id: 2,
        title: "Demon Slayer: Infinity Castle",
        year: 2024,
        imdbRating: 9.1,
        vibeMatch: 98,
        genres: ["Action", "Animation", "Adventure"],
        plot: "Tanjiro and his comrades face Muzan's strongest demons in an endless labyrinth where time and space twist beyond imagination.",
        cast: ["Natsuki Hanae", "Akari Kito", "Yoshitsugu Matsuoka"],
        platforms: ["Crunchyroll", "Funimation"],
        poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%239b59b6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='18' font-family='Arial' dy='.3em'%3EDemon Slayer%3C/text%3E%3C/svg%3E"
    },
    {
        id: 3,
        title: "Interstellar",
        year: 2014,
        imdbRating: 8.6,
        vibeMatch: 89,
        genres: ["Sci-Fi", "Drama", "Adventure"],
        plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        platforms: ["Netflix", "Amazon Prime", "HBO Max"],
        poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='20' font-family='Arial' dy='.3em'%3EInterstellar%3C/text%3E%3C/svg%3E"
    },
    {
        id: 4,
        title: "Oppenheimer",
        year: 2023,
        imdbRating: 8.5,
        vibeMatch: 92,
        genres: ["Biography", "Drama", "History"],
        plot: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
        platforms: ["Peacock", "Amazon Prime"],
        poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23444'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='18' font-family='Arial' dy='.3em'%3EOppenheimer%3C/text%3E%3C/svg%3E"
    },
    {
        id: 5,
        title: "Spider-Man: Across the Spider-Verse",
        year: 2023,
        imdbRating: 8.7,
        vibeMatch: 96,
        genres: ["Animation", "Action", "Adventure"],
        plot: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
        cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
        platforms: ["Netflix", "Disney+"],
        poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23e74c3c'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='16' font-family='Arial' dy='.3em'%3ESpider-Verse%3C/text%3E%3C/svg%3E"
    },
    {
        id: 6,
        title: "The Batman",
        year: 2022,
        imdbRating: 7.8,
        vibeMatch: 85,
        genres: ["Action", "Crime", "Drama"],
        plot: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
        cast: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano"],
        platforms: ["HBO Max", "Amazon Prime"],
        poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='20' font-family='Arial' dy='.3em'%3EBatman%3C/text%3E%3C/svg%3E"
    },
    {
        id: 7,
        title: "Everything Everywhere All at Once",
        year: 2022,
        imdbRating: 7.8,
        vibeMatch: 91,
        genres: ["Action", "Adventure", "Comedy"],
        plot: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence.",
        cast: ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan"],
        platforms: ["Netflix", "Showtime"],
        poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23f39c12'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='14' font-family='Arial' dy='.3em'%3EEEAAO%3C/text%3E%3C/svg%3E"
    },
    {
        id: 8,
        title: "Dune: Part Two",
        year: 2024,
        imdbRating: 8.9,
        vibeMatch: 93,
        genres: ["Sci-Fi", "Adventure", "Drama"],
        plot: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
        platforms: ["HBO Max", "Amazon Prime"],
        poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23c0392b'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='20' font-family='Arial' dy='.3em'%3EDune 2%3C/text%3E%3C/svg%3E"
    },
    {
        id: 9,
        title: "John Wick: Chapter 4",
        year: 2023,
        imdbRating: 7.7,
        vibeMatch: 88,
        genres: ["Action", "Thriller", "Crime"],
        plot: "John Wick uncovers a path to defeating The High Table, but before he can earn his freedom, Wick must face off against a new enemy.",
        cast: ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård"],
        platforms: ["Lionsgate", "Amazon Prime"],
        poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='18' font-family='Arial' dy='.3em'%3EJohn Wick 4%3C/text%3E%3C/svg%3E"
    },
    {
        id: 10,
        title: "Barbie",
        year: 2023,
        imdbRating: 6.8,
        vibeMatch: 84,
        genres: ["Comedy", "Adventure", "Fantasy"],
        plot: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
        cast: ["Margot Robbie", "Ryan Gosling", "America Ferrera"],
        platforms: ["HBO Max", "Netflix"],
        poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23e91e63'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='20' font-family='Arial' dy='.3em'%3EBarbie%3C/text%3E%3C/svg%3E"
    }
];

// Helper function to get unique genres
function getAllGenres() {
    const genres = new Set();
    moviesData.forEach(movie => {
        movie.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
}

// Helper function to filter movies
function filterMovies(movies, filters) {
    return movies.filter(movie => {
        // Genre filter
        if (filters.genres && filters.genres.length > 0) {
            if (!movie.genres.some(g => filters.genres.includes(g))) {
                return false;
            }
        }
        
        // Year filter
        if (filters.minYear && movie.year < filters.minYear) return false;
        if (filters.maxYear && movie.year > filters.maxYear) return false;
        
        // Rating filter
        if (filters.minRating && movie.imdbRating < filters.minRating) return false;
        
        // Search filter
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            return movie.title.toLowerCase().includes(searchLower) ||
                   movie.genres.some(g => g.toLowerCase().includes(searchLower)) ||
                   movie.plot.toLowerCase().includes(searchLower);
        }
        
        return true;
    });
}

// Helper function to sort movies
function sortMovies(movies, sortBy) {
    const sorted = [...movies];
    switch(sortBy) {
        case 'latest':
            return sorted.sort((a, b) => b.year - a.year);
        case 'oldest':
            return sorted.sort((a, b) => a.year - b.year);
        case 'highest-rated':
            return sorted.sort((a, b) => b.imdbRating - a.imdbRating);
        case 'lowest-rated':
            return sorted.sort((a, b) => a.imdbRating - b.imdbRating);
        case 'highest-vibe':
            return sorted.sort((a, b) => b.vibeMatch - a.vibeMatch);
        default:
            return sorted;
    }
}