import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedMovie {
  id: number;
  title: string;
  tagline: string;
  rating: number;
  genre: string;
  image: string;
}

const featuredMovies: FeaturedMovie[] = [
  {
    id: 1,
    title: "Galactic Warriors",
    tagline: "The universe needs heroes",
    rating: 8.5,
    genre: "Sci-Fi/Action",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&h=800&fit=crop",
  },
  {
    id: 2,
    title: "Midnight Shadows",
    tagline: "Some secrets never sleep",
    rating: 7.9,
    genre: "Thriller/Mystery",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=800&fit=crop",
  },
  {
    id: 3,
    title: "Ocean's Heart",
    tagline: "Love deeper than the sea",
    rating: 8.2,
    genre: "Romance/Drama",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=800&fit=crop",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  return (
    <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
      {featuredMovies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.image})` }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Content */}
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-xl space-y-4 md:space-y-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="text-foreground font-semibold">{movie.rating}/10</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{movie.genre}</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">
                {movie.title}
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground">
                {movie.tagline}
              </p>
              
              <div className="flex gap-4">
                <Button size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Book Tickets
                </Button>
                <Button variant="outline" size="lg">
                  Watch Trailer
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/50 hover:bg-background/80 flex items-center justify-center text-foreground transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/50 hover:bg-background/80 flex items-center justify-center text-foreground transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-primary w-6 md:w-8"
                : "bg-muted-foreground/50 hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
