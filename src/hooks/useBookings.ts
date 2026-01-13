import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings"> & {
  movies?: Tables<"movies">;
};

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, movies(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };

    fetchBookings();

    // Real-time subscription
    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookings((prev) => [payload.new as Booking, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setBookings((prev) =>
              prev.map((b) =>
                b.id === (payload.new as Booking).id ? (payload.new as Booking) : b
              )
            );
          } else if (payload.eventType === "DELETE") {
            setBookings((prev) =>
              prev.filter((b) => b.id !== (payload.old as Booking).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createBooking = async (
    movieId: string,
    seats: number,
    showDate: string,
    showTime: string,
    totalAmount: number
  ) => {
    if (!user) {
      toast.error("Please sign in to book tickets");
      return null;
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        movie_id: movieId,
        seats,
        show_date: showDate,
        show_time: showTime,
        total_amount: totalAmount,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create booking: " + error.message);
      return null;
    }

    return data;
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: "pending" | "confirmed" | "paid" | "cancelled"
  ) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to update booking: " + error.message);
      return false;
    }

    return true;
  };

  return { bookings, loading, createBooking, updateBookingStatus };
};
