import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Theater {
  id: string;
  name: string;
  location: string;
  city: string;
  amenities: string[];
  total_screens: number;
}

interface Showtime {
  id: string;
  movie_id: string;
  theater_id: string;
  show_date: string;
  show_time: string;
  screen_number: number;
  available_seats: number;
  price: number;
  is_available: boolean;
  theater: Theater;
}

interface TheaterWithShowtimes {
  theater: Theater;
  showtimes: Showtime[];
}

export const useShowtimes = (movieId: string, date: string) => {
  const [theatersWithShowtimes, setTheatersWithShowtimes] = useState<TheaterWithShowtimes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!movieId || !date) {
        setTheatersWithShowtimes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("showtimes")
          .select(`
            *,
            theater:theaters(*)
          `)
          .eq("movie_id", movieId)
          .eq("show_date", date)
          .eq("is_available", true)
          .order("show_time", { ascending: true });

        if (error) throw error;

        // Group by theater
        const groupedByTheater = (data || []).reduce((acc, showtime) => {
          const theaterId = showtime.theater_id;
          if (!acc[theaterId]) {
            acc[theaterId] = {
              theater: showtime.theater as Theater,
              showtimes: [],
            };
          }
          acc[theaterId].showtimes.push(showtime as unknown as Showtime);
          return acc;
        }, {} as Record<string, TheaterWithShowtimes>);

        setTheatersWithShowtimes(Object.values(groupedByTheater));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch showtimes");
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId, date]);

  return { theatersWithShowtimes, loading, error };
};
