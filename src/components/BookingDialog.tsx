import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/useBookings";
import { useShowtimes } from "@/hooks/useShowtimes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Ticket, Calendar, Clock, Users, MapPin, Clapperboard, Armchair, CreditCard } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import SeatLayout from "./SeatLayout";
import PaymentMethods from "./PaymentMethods";
import BookingReceipt from "./BookingReceipt";

interface BookingDialogProps {
  movie: Tables<"movies">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingDialog = ({ movie, open, onOpenChange }: BookingDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking, updateBookingStatus } = useBookings();
  
  const [step, setStep] = useState<"tickets" | "showtimes" | "seats" | "payment" | "success">("tickets");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedShowtime, setSelectedShowtime] = useState<{
    id: string;
    theaterId: string;
    theaterName: string;
    theaterLocation: string;
    time: string;
    price: number;
    availableSeats: number;
    screenNumber: number;
  } | null>(null);
  const [ticketCount, setTicketCount] = useState("2");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  const { theatersWithShowtimes, loading: loadingShowtimes } = useShowtimes(movie.id, selectedDate);

  const totalAmount = selectedShowtime ? selectedShowtime.price * parseInt(ticketCount) : 0;

  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE, MMM d"),
    };
  });

  const handleProceedToShowtimes = () => {
    if (!user) {
      toast.error("Please sign in to continue");
      onOpenChange(false);
      navigate("/auth");
      return;
    }
    setStep("showtimes");
  };

  const handleSelectShowtime = (
    showtimeId: string,
    theaterId: string,
    theaterName: string,
    theaterLocation: string,
    time: string,
    price: number,
    availableSeats: number,
    screenNumber: number
  ) => {
    if (parseInt(ticketCount) > availableSeats) {
      toast.error(`Only ${availableSeats} seats available for this showtime`);
      return;
    }
    setSelectedShowtime({
      id: showtimeId,
      theaterId,
      theaterName,
      theaterLocation,
      time,
      price,
      availableSeats,
      screenNumber,
    });
    setSelectedSeats([]);
    setStep("seats");
  };

  const handleBackToTickets = () => {
    setStep("tickets");
    setSelectedShowtime(null);
    setSelectedSeats([]);
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length !== parseInt(ticketCount)) {
      toast.error(`Please select exactly ${ticketCount} seats`);
      return;
    }
    setStep("payment");
  };

  const handleMockPayment = async () => {
    if (!selectedShowtime) return;
    
    setIsProcessing(true);

    const booking = await createBooking(
      movie.id,
      parseInt(ticketCount),
      selectedDate,
      selectedShowtime.time,
      totalAmount
    );

    if (!booking) {
      setIsProcessing(false);
      return;
    }

    // Mock payment delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const success = await updateBookingStatus(booking.id, "paid");

    if (success) {
      setBookingCode(booking.booking_code || `BMS${booking.id.slice(0, 8).toUpperCase()}`);
      setStep("success");
      
      toast.success(
        `📧 Booking confirmation sent to ${user?.email}! Your booking code: ${booking.booking_code}`,
        { duration: 5000 }
      );
    }

    setIsProcessing(false);
  };

  const handleClose = () => {
    setStep("tickets");
    setSelectedShowtime(null);
    setTicketCount("2");
    setSelectedSeats([]);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === "showtimes") {
      setStep("tickets");
    } else if (step === "seats") {
      setSelectedSeats([]);
      setSelectedShowtime(null);
      setStep("showtimes");
    } else if (step === "payment") {
      setStep("seats");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === "success" ? (
              "Booking Confirmed! 🎉"
            ) : step === "tickets" ? (
              <span className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Book Tickets - {movie.title}
              </span>
            ) : step === "showtimes" ? (
              <span className="flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-primary" />
                Select Date & Showtime
              </span>
            ) : step === "seats" ? (
              <span className="flex items-center gap-2">
                <Armchair className="w-5 h-5 text-primary" />
                Select Your Seats
              </span>
            ) : step === "payment" ? (
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Complete Payment
              </span>
            ) : (
              `Book Tickets - ${movie.title}`
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Select Number of Tickets */}
        {step === "tickets" && (
          <div className="space-y-6">
            {/* Movie Info */}
            <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
              {movie.poster_url && (
                <img 
                  src={movie.poster_url} 
                  alt={movie.title}
                  className="w-20 h-28 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{movie.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {movie.genres?.slice(0, 3).join(" • ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {movie.duration_minutes} mins • {movie.languages?.join(", ")}
                </p>
              </div>
            </div>

            {/* Ticket Count Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4" />
                How many tickets?
              </Label>
              <Select value={ticketCount} onValueChange={setTicketCount}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Ticket" : "Tickets"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Estimate */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated price per ticket</span>
                <span>₹{movie.price || 250}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                <span>Estimated Total</span>
                <span className="text-primary">₹{(movie.price || 250) * parseInt(ticketCount)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Final price may vary based on showtime and theater
              </p>
            </div>

            <Button onClick={handleProceedToShowtimes} className="w-full" size="lg">
              Select Date & Showtime
            </Button>
          </div>
        )}

        {/* Step 2: Select Date & Showtime */}
        {step === "showtimes" && (
          <div className="space-y-4">
            {/* Ticket Count Badge */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-sm py-1 px-3">
                <Users className="w-3 h-3 mr-1" />
                {ticketCount} {parseInt(ticketCount) === 1 ? "Ticket" : "Tickets"}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleBackToTickets}>
                Change
              </Button>
            </div>

            {/* Horizontal Date Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Select Date
              </Label>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                  {availableDates.map((date) => {
                    const isSelected = selectedDate === date.value;
                    const dayName = format(new Date(date.value), "EEE");
                    const dayNum = format(new Date(date.value), "d");
                    const monthName = format(new Date(date.value), "MMM");
                    
                    return (
                      <button
                        key={date.value}
                        onClick={() => {
                          setSelectedDate(date.value);
                          setSelectedShowtime(null);
                        }}
                        className={`flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-xl border-2 transition-all ${
                          isSelected 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                        }`}
                      >
                        <span className={`text-xs font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                          {dayName}
                        </span>
                        <span className={`text-xl font-bold ${isSelected ? "text-primary" : ""}`}>
                          {dayNum}
                        </span>
                        <span className={`text-xs ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                          {monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Theaters & Showtimes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Available Theaters & Showtimes
              </Label>
              <ScrollArea className="h-[320px] pr-4">
                {loadingShowtimes ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : theatersWithShowtimes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No showtimes available for this date</p>
                    <p className="text-sm mt-1">Try selecting a different date</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {theatersWithShowtimes.map(({ theater, showtimes }) => (
                      <div
                        key={theater.id}
                        className="rounded-lg border border-border bg-card p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{theater.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {theater.location}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                            {theater.amenities?.slice(0, 3).map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {showtimes.map((showtime) => {
                            const hasEnoughSeats = showtime.available_seats >= parseInt(ticketCount);
                            return (
                              <Button
                                key={showtime.id}
                                variant="outline"
                                size="sm"
                                disabled={!hasEnoughSeats}
                                className={`flex flex-col items-center h-auto py-2 px-4 ${
                                  hasEnoughSeats 
                                    ? "hover:border-primary hover:bg-primary/5" 
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                                onClick={() =>
                                  handleSelectShowtime(
                                    showtime.id,
                                    theater.id,
                                    theater.name,
                                    theater.location,
                                    showtime.show_time,
                                    Number(showtime.price),
                                    showtime.available_seats,
                                    showtime.screen_number
                                  )
                                }
                              >
                                <span className={`font-semibold ${hasEnoughSeats ? "text-primary" : "text-muted-foreground"}`}>
                                  {showtime.show_time.slice(0, 5)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ₹{showtime.price}
                                </span>
                              </Button>
                            );
                          })}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Screen {showtimes[0]?.screen_number || 1} • {showtimes[0]?.available_seats || 0} seats available
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <Button variant="outline" onClick={handleBack} className="w-full">
              Back
            </Button>
          </div>
        )}

        {step === "seats" && selectedShowtime && (
          <div className="space-y-6">
            {/* Theater & Showtime Info */}
            <div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
              <div>
                <span className="font-medium">{selectedShowtime.theaterName}</span>
                <span className="text-muted-foreground"> • Screen {selectedShowtime.screenNumber}</span>
              </div>
              <div className="text-muted-foreground">
                {format(new Date(selectedDate), "MMM d")} at {selectedShowtime.time.slice(0, 5)}
              </div>
            </div>

            {/* Seat Layout */}
            <ScrollArea className="h-[350px]">
              <SeatLayout
                totalSeats={96}
                availableSeats={selectedShowtime.availableSeats}
                maxSelectable={parseInt(ticketCount)}
                selectedSeats={selectedSeats}
                onSeatsChange={setSelectedSeats}
              />
            </ScrollArea>

            {/* Price Summary */}
            <div className="rounded-lg bg-muted p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  {ticketCount} tickets × ₹{selectedShowtime.price}
                </p>
                {selectedSeats.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Seats: {selectedSeats.sort().join(", ")}
                  </p>
                )}
              </div>
              <span className="text-xl font-bold text-primary">₹{totalAmount}</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleProceedToPayment} 
                className="flex-1" 
                size="lg"
                disabled={selectedSeats.length !== parseInt(ticketCount)}
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}

        {step === "payment" && selectedShowtime && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 p-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Ticket className="w-4 h-4 text-primary" />
                  Booking Summary
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{movie.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {movie.genres?.slice(0, 2).join(", ")}
                    </p>
                  </div>
                  {movie.poster_url && (
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{selectedShowtime.theaterName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{format(new Date(selectedDate), "EEE, MMM d")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{selectedShowtime.time.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Armchair className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Screen {selectedShowtime.screenNumber}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="font-medium">{selectedSeats.sort().join(", ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{ticketCount} Ticket(s) × ₹{selectedShowtime.price}</span>
                    <span className="font-semibold text-primary">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Component */}
            <PaymentMethods
              totalAmount={totalAmount}
              isProcessing={isProcessing}
              onPayment={handleMockPayment}
              onBack={handleBack}
            />
          </div>
        )}

        {step === "success" && selectedShowtime && (
          <BookingReceipt
            bookingCode={bookingCode}
            movieTitle={movie.title}
            theaterName={selectedShowtime.theaterName}
            theaterLocation={selectedShowtime.theaterLocation}
            showDate={selectedDate}
            showTime={selectedShowtime.time}
            seats={selectedSeats}
            ticketCount={parseInt(ticketCount)}
            totalAmount={totalAmount}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
