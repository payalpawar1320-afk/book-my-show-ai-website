import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/useBookings";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CreditCard, Check, Ticket, Calendar, Clock, Users } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface BookingDialogProps {
  movie: Tables<"movies">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const showTimes = ["10:00", "13:30", "17:00", "20:30", "23:00"];

const BookingDialog = ({ movie, open, onOpenChange }: BookingDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBooking, updateBookingStatus } = useBookings();
  
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState(showTimes[0]);
  const [seats, setSeats] = useState("2");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  const price = Number(movie.price) || 250;
  const totalAmount = price * parseInt(seats);

  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE, MMM d"),
    };
  });

  const handleProceedToPayment = () => {
    if (!user) {
      toast.error("Please sign in to continue");
      onOpenChange(false);
      navigate("/auth");
      return;
    }
    setStep("payment");
  };

  const handleMockPayment = async () => {
    setIsProcessing(true);

    // Create booking first
    const booking = await createBooking(
      movie.id,
      parseInt(seats),
      selectedDate,
      selectedTime,
      totalAmount
    );

    if (!booking) {
      setIsProcessing(false);
      return;
    }

    // Mock payment delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update to paid status
    const success = await updateBookingStatus(booking.id, "paid");

    if (success) {
      setBookingCode(booking.booking_code || `BMS${booking.id.slice(0, 8).toUpperCase()}`);
      setStep("success");
      
      // Mock email notification
      toast.success(
        `📧 Booking confirmation sent to ${user?.email}! Your booking code: ${booking.booking_code}`,
        { duration: 5000 }
      );
    }

    setIsProcessing(false);
  };

  const handleClose = () => {
    setStep("details");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === "success" ? "Booking Confirmed! 🎉" : `Book Tickets - ${movie.title}`}
          </DialogTitle>
        </DialogHeader>

        {step === "details" && (
          <div className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Select Date
              </Label>
              <RadioGroup
                value={selectedDate}
                onValueChange={setSelectedDate}
                className="flex flex-wrap gap-2"
              >
                {availableDates.map((date) => (
                  <div key={date.value}>
                    <RadioGroupItem
                      value={date.value}
                      id={date.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={date.value}
                      className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-border bg-card px-3 py-2 text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-accent transition-colors"
                    >
                      {date.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select Show Time
              </Label>
              <RadioGroup
                value={selectedTime}
                onValueChange={setSelectedTime}
                className="flex flex-wrap gap-2"
              >
                {showTimes.map((time) => (
                  <div key={time}>
                    <RadioGroupItem
                      value={time}
                      id={time}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={time}
                      className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-border bg-card px-4 py-2 text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-accent transition-colors"
                    >
                      {time}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Seats Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Number of Seats
              </Label>
              <Select value={seats} onValueChange={setSeats}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Seat" : "Seats"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Summary */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per ticket</span>
                <span>₹{price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span>{seats} tickets</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total Amount</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>
            </div>

            <Button onClick={handleProceedToPayment} className="w-full" size="lg">
              Proceed to Payment
            </Button>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{movie.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedDate), "EEE, MMM d")} at {selectedTime}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{seats} seats</span>
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

            <Button
              onClick={handleMockPayment}
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>Pay ₹{totalAmount}</>
              )}
            </Button>
          </div>
        )}

        {step === "success" && (
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
              <p>{format(new Date(selectedDate), "EEEE, MMMM d, yyyy")} at {selectedTime}</p>
              <p>{seats} {parseInt(seats) === 1 ? "seat" : "seats"}</p>
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
