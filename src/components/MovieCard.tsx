import { Star, Heart } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import BookingDialog from "./BookingDialog";
import type { Tables } from "@/integrations/supabase/types";

interface MovieCardProps {
  movie: Tables<"movies">;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const formatVotes = (count: number | null) => {
    if (!count) return "0";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <>
      <div
        className="group relative cursor-pointer"
        onClick={() => setIsBookingOpen(true)}
      >
        {/* Poster Container */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Rating Badge */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-foreground font-semibold text-sm">{movie.rating}/10</span>
              <span className="text-muted-foreground text-xs ml-1">
                {formatVotes(movie.votes_count)} Votes
              </span>
            </div>
          </div>

          {/* Like Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isLiked ? "text-primary fill-primary" : "text-foreground"
              }`}
            />
          </button>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Movie Info */}
        <div className="mt-3 space-y-1">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex flex-wrap gap-1">
            {movie.genres?.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {movie.languages?.join(", ")}
          </p>
        </div>
      </div>

      <BookingDialog
        movie={movie}
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
      />
    </>
  );
};

export default MovieCard;
