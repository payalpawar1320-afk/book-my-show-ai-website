import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMovies } from "@/hooks/useMovies";
import BookingDialog from "./BookingDialog";
import type { Tables } from "@/integrations/supabase/types";

const HeroCarousel = () => {
  const { featuredMovies, loading } = useMovies();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<Tables<"movies"> | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    if (featuredMovies.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const handleBookNow = (movie: Tables<"movies">) => {
    setSelectedMovie(movie);
    setIsBookingOpen(true);
  };

  if (loading) {
    return (
      <section className="h-[50vh] md:h-[70vh] flex items-center justify-center bg-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  if (featuredMovies.length === 0) {
    return null;
  }

  return (
    <>
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
              style={{ backgroundImage: `url(${movie.backdrop_url || movie.poster_url})` }}
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
                  <span className="text-muted-foreground">{movie.genres?.join(", ")}</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">
                  {movie.title}
                </h2>
                
                <p className="text-lg md:text-xl text-muted-foreground line-clamp-2">
                  {movie.synopsis}
                </p>
                
                <div className="flex gap-4">
                  <Button size="lg" className="gap-2" onClick={() => handleBookNow(movie)}>
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

      {selectedMovie && (
        <BookingDialog
          movie={selectedMovie}
          open={isBookingOpen}
          onOpenChange={setIsBookingOpen}
        />
      )}
    </>
  );
};

export default HeroCarousel;
