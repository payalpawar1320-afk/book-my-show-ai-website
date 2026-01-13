import MovieCard from "./MovieCard";

interface Movie {
  id: number;
  title: string;
  poster: string;
  rating: number;
  votes: string;
  genres: string[];
  languages: string[];
}

const movies: Movie[] = [
  {
    id: 1,
    title: "The Last Kingdom",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    rating: 8.7,
    votes: "125.3K",
    genres: ["Action", "Drama"],
    languages: ["Hindi", "English"],
  },
  {
    id: 2,
    title: "Eternal Echoes",
    poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
    rating: 8.2,
    votes: "98.1K",
    genres: ["Romance", "Drama"],
    languages: ["Hindi"],
  },
  {
    id: 3,
    title: "Cyber Nexus",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop",
    rating: 7.9,
    votes: "67.8K",
    genres: ["Sci-Fi", "Thriller"],
    languages: ["English", "Hindi"],
  },
  {
    id: 4,
    title: "Mountain's Call",
    poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
    rating: 8.5,
    votes: "142.6K",
    genres: ["Adventure", "Drama"],
    languages: ["Hindi", "Telugu"],
  },
  {
    id: 5,
    title: "Dark Horizon",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    rating: 7.6,
    votes: "54.2K",
    genres: ["Horror", "Mystery"],
    languages: ["English"],
  },
  {
    id: 6,
    title: "City Lights",
    poster: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400&h=600&fit=crop",
    rating: 8.1,
    votes: "89.4K",
    genres: ["Comedy", "Romance"],
    languages: ["Hindi", "Marathi"],
  },
  {
    id: 7,
    title: "Warriors Rise",
    poster: "https://images.unsplash.com/photo-1545296664-39db56ad95bd?w=400&h=600&fit=crop",
    rating: 8.8,
    votes: "201.3K",
    genres: ["Action", "Fantasy"],
    languages: ["Telugu", "Hindi"],
  },
  {
    id: 8,
    title: "Silent Waters",
    poster: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=400&h=600&fit=crop",
    rating: 7.4,
    votes: "43.7K",
    genres: ["Drama", "Thriller"],
    languages: ["Tamil", "Hindi"],
  },
  {
    id: 9,
    title: "Beyond Stars",
    poster: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop",
    rating: 9.1,
    votes: "315.8K",
    genres: ["Sci-Fi", "Adventure"],
    languages: ["English", "Hindi"],
  },
  {
    id: 10,
    title: "Royal Legacy",
    poster: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=600&fit=crop",
    rating: 8.3,
    votes: "156.2K",
    genres: ["Historical", "Drama"],
    languages: ["Hindi"],
  },
];

const MovieGrid = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Recommended Movies
            </h2>
            <p className="text-muted-foreground mt-1">
              Top picks for you
            </p>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
            See All →
          </button>
        </div>

        {/* Genre Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {["All", "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller"].map(
            (genre, index) => (
              <button
                key={genre}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  index === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {genre}
              </button>
            )
          )}
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              title={movie.title}
              poster={movie.poster}
              rating={movie.rating}
              votes={movie.votes}
              genres={movie.genres}
              languages={movie.languages}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieGrid;
