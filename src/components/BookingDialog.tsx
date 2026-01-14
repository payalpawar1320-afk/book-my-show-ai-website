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
import { Loader2, CreditCard, Check, Ticket, Calendar, Clock, Users, MapPin, Clapperboard, Armchair } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import SeatLayout from "./SeatLayout";

interface BookingDialogProps {
  movie: Tables<"movies">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingDialog = ({ movie, open, onOpenChange }: BookingDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking, updateBookingStatus } = useBookings();
  
  const [step, setStep] = useState<"theaters" | "quantity" | "seats" | "payment" | "success">("theaters");
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
    if (!user) {
      toast.error("Please sign in to continue");
      onOpenChange(false);
      navigate("/auth");
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
    setStep("quantity");
  };

  const handleProceedToSeatSelection = () => {
    if (parseInt(ticketCount) > (selectedShowtime?.availableSeats || 0)) {
      toast.error(`Only ${selectedShowtime?.availableSeats} seats available`);
      return;
    }
    setSelectedSeats([]);
    setStep("seats");
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
    setStep("theaters");
    setSelectedShowtime(null);
    setTicketCount("2");
    setSelectedSeats([]);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === "quantity") {
      setSelectedShowtime(null);
      setStep("theaters");
    } else if (step === "seats") {
      setSelectedSeats([]);
      setStep("quantity");
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
            ) : step === "theaters" ? (
              <span className="flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-primary" />
                Theaters Showing {movie.title}
              </span>
            ) : step === "seats" ? (
              <span className="flex items-center gap-2">
                <Armchair className="w-5 h-5 text-primary" />
                Select Your Seats
              </span>
            ) : (
              `Book Tickets - ${movie.title}`
            )}
          </DialogTitle>
        </DialogHeader>

        {step === "theaters" && (
          <div className="space-y-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Select Date
              </Label>
              <RadioGroup
                value={selectedDate}
                onValueChange={(date) => {
                  setSelectedDate(date);
                  setSelectedShowtime(null);
                }}
                className="flex flex-wrap gap-2"
              >
                {availableDates.map((date) => (
                  <div key={date.value}>
                    <RadioGroupItem
                      value={date.value}
                      id={`date-${date.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`date-${date.value}`}
                      className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-border bg-card px-3 py-2 text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-accent transition-colors"
                    >
                      {date.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Theaters & Showtimes */}
            <ScrollArea className="h-[400px] pr-4">
              {loadingShowtimes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : theatersWithShowtimes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No showtimes available for this date</p>
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
                        {showtimes.map((showtime) => (
                          <Button
                            key={showtime.id}
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center h-auto py-2 px-4 hover:border-primary hover:bg-primary/5"
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
                            <span className="font-semibold text-primary">
                              {showtime.show_time.slice(0, 5)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ₹{showtime.price}
                            </span>
                          </Button>
                        ))}
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
        )}

        {step === "quantity" && selectedShowtime && (
          <div className="space-y-6">
            {/* Selected Theater Info */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{selectedShowtime.theaterName}</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {selectedShowtime.theaterLocation}
              </p>
              <div className="flex items-center gap-4 text-sm pl-6">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedShowtime.time.slice(0, 5)}
                </span>
                <span>Screen {selectedShowtime.screenNumber}</span>
                <span className="text-primary font-medium">₹{selectedShowtime.price}/seat</span>
              </div>
            </div>

            {/* Ticket Count Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                How many tickets?
              </Label>
              <Select value={ticketCount} onValueChange={setTicketCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: Math.min(10, selectedShowtime.availableSeats) }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Ticket" : "Tickets"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedShowtime.availableSeats} seats available
              </p>
            </div>

            {/* Price Preview */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per ticket</span>
                <span>₹{selectedShowtime.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span>{ticketCount} tickets</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total Amount</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleProceedToSeatSelection} className="flex-1" size="lg">
                Select Seats
              </Button>
            </div>
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
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{movie.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedDate), "EEE, MMM d")} at {selectedShowtime.time.slice(0, 5)}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{selectedShowtime.theaterName}</p>
                <p>{selectedShowtime.theaterLocation}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Seats: {selectedSeats.sort().join(", ")}
                </span>
                <span className="font-semibold">₹{totalAmount}</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-medium">Mock Payment</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This is a demo payment. Click the button below to simulate a successful payment.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleMockPayment}
                className="flex-1"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{totalAmount}</>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && selectedShowtime && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-500" />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-1">Payment Successful!</h3>
              <p className="text-muted-foreground text-sm">
                Your tickets have been booked successfully
              </p>
            </div>

            <div className="rounded-lg bg-primary/10 p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Booking Code</p>
              <p className="text-2xl font-bold text-primary tracking-wider">{bookingCode}</p>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>{movie.title}</strong></p>
              <p>{selectedShowtime.theaterName}</p>
              <p>{format(new Date(selectedDate), "EEEE, MMMM d, yyyy")} at {selectedShowtime.time.slice(0, 5)}</p>
              <p>Seats: {selectedSeats.sort().join(", ")}</p>
            </div>

            <Button onClick={handleClose} className="w-full" size="lg">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
