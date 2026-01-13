import { useState } from "react";
import { Loader2 } from "lucide-react";
import MovieCard from "./MovieCard";
import { useMovies } from "@/hooks/useMovies";

const MovieGrid = () => {
  const { movies, loading, error } = useMovies();
  const [selectedGenre, setSelectedGenre] = useState("All");

  const genres = ["All", "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller"];

  const filteredMovies = selectedGenre === "All"
    ? movies
    : movies.filter((movie) => movie.genres?.includes(selectedGenre));

  if (loading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Failed to load movies. Please try again later.</p>
        </div>
      </section>
    );
  }

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
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedGenre === genre
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No movies found in this genre.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MovieGrid;
