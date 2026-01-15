import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Check, Ticket, MapPin, Calendar, Clock, Download, Armchair } from "lucide-react";

interface BookingReceiptProps {
  bookingCode: string;
  movieTitle: string;
  theaterName: string;
  theaterLocation: string;
  showDate: string;
  showTime: string;
  seats: string[];
  ticketCount: number;
  totalAmount: number;
  onClose: () => void;
}

const BookingReceipt = ({
  bookingCode,
  movieTitle,
  theaterName,
  theaterLocation,
  showDate,
  showTime,
  seats,
  ticketCount,
  totalAmount,
  onClose,
}: BookingReceiptProps) => {
  const handleDownload = () => {
    // Create a simple text receipt for demo
    const receipt = `
═══════════════════════════════════════
            BOOKING CONFIRMED
═══════════════════════════════════════

Booking Code: ${bookingCode}

Movie: ${movieTitle}

Theater: ${theaterName}
Location: ${theaterLocation}

Date: ${format(new Date(showDate), "EEEE, MMMM d, yyyy")}
Time: ${showTime.slice(0, 5)}

Seats: ${seats.sort().join(", ")}
Tickets: ${ticketCount}

Total Paid: ₹${totalAmount}

═══════════════════════════════════════
     Thank you for your booking!
═══════════════════════════════════════
    `;

    const blob = new Blob([receipt], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BookingReceipt_${bookingCode}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
            Payment Successful!
          </h3>
          <p className="text-muted-foreground">Your booking is confirmed</p>
        </div>
      </div>

      {/* Booking Code */}
      <div className="rounded-lg bg-primary/10 p-4 text-center">
        <p className="text-sm text-muted-foreground mb-1">Booking Code</p>
        <p className="text-2xl font-mono font-bold text-primary tracking-wider">
          {bookingCode}
        </p>
      </div>

      {/* Receipt Card */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Receipt Header */}
        <div className="bg-muted/50 p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Ticket className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-lg">{movieTitle}</p>
            </div>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{theaterName}</p>
              <p className="text-sm text-muted-foreground">{theaterLocation}</p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(showDate), "EEE, MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{showTime.slice(0, 5)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Armchair className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{ticketCount} {ticketCount === 1 ? "Ticket" : "Tickets"}</span>
              <span className="text-muted-foreground"> • Seats: {seats.sort().join(", ")}</span>
            </span>
          </div>

          <div className="pt-3 border-t border-dashed border-border flex justify-between items-center">
            <span className="font-medium">Total Paid</span>
            <span className="text-xl font-bold text-primary">₹{totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        📧 A confirmation email has been sent to your registered email address
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleDownload} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
        <Button onClick={onClose} className="flex-1">
          Done
        </Button>
      </div>
    </div>
  );
};

export default BookingReceipt;
