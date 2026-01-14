import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface Seat {
  id: string;
  row: string;
  number: number;
  isAvailable: boolean;
}

interface SeatLayoutProps {
  totalSeats: number;
  availableSeats: number;
  maxSelectable: number;
  selectedSeats: string[];
  onSeatsChange: (seats: string[]) => void;
}

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SEATS_PER_ROW = 12;

const SeatLayout = ({
  totalSeats,
  availableSeats,
  maxSelectable,
  selectedSeats,
  onSeatsChange,
}: SeatLayoutProps) => {
  // Generate seat layout with random unavailable seats
  const seats = useMemo(() => {
    const allSeats: Seat[] = [];
    const totalInLayout = Math.min(totalSeats, ROWS.length * SEATS_PER_ROW);
    const unavailableCount = totalInLayout - availableSeats;
    
    // Create all seats first
    let seatIndex = 0;
    for (const row of ROWS) {
      for (let num = 1; num <= SEATS_PER_ROW; num++) {
        if (seatIndex >= totalInLayout) break;
        allSeats.push({
          id: `${row}${num}`,
          row,
          number: num,
          isAvailable: true,
        });
        seatIndex++;
      }
      if (seatIndex >= totalInLayout) break;
    }

    // Randomly mark some seats as unavailable
    const unavailableIndices = new Set<number>();
    while (unavailableIndices.size < unavailableCount && unavailableIndices.size < allSeats.length) {
      const randomIndex = Math.floor(Math.random() * allSeats.length);
      unavailableIndices.add(randomIndex);
    }

    unavailableIndices.forEach((index) => {
      allSeats[index].isAvailable = false;
    });

    return allSeats;
  }, [totalSeats, availableSeats]);

  // Group seats by row
  const seatsByRow = useMemo(() => {
    const grouped: Record<string, Seat[]> = {};
    seats.forEach((seat) => {
      if (!grouped[seat.row]) {
        grouped[seat.row] = [];
      }
      grouped[seat.row].push(seat);
    });
    return grouped;
  }, [seats]);

  const handleSeatClick = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    if (selectedSeats.includes(seatId)) {
      onSeatsChange(selectedSeats.filter((id) => id !== seatId));
    } else {
      if (selectedSeats.length < maxSelectable) {
        onSeatsChange([...selectedSeats, seatId]);
      }
    }
  };

  const rows = Object.keys(seatsByRow).sort();

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="relative">
        <div className="w-full h-2 bg-primary/60 rounded-lg mb-2" />
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest">
          Screen
        </p>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center gap-2 py-4">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-1">
            <span className="w-6 text-xs font-medium text-muted-foreground text-center">
              {row}
            </span>
            <div className="flex gap-1">
              {seatsByRow[row].map((seat, index) => {
                const isSelected = selectedSeats.includes(seat.id);
                const isMiddleGap = index === Math.floor(SEATS_PER_ROW / 2) - 1;

                return (
                  <div key={seat.id} className={cn("flex", isMiddleGap && "mr-4")}>
                    <button
                      type="button"
                      disabled={!seat.isAvailable}
                      onClick={() => handleSeatClick(seat.id, seat.isAvailable)}
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-t-lg text-xs font-medium transition-all duration-200 flex items-center justify-center",
                        !seat.isAvailable && "bg-muted text-muted-foreground/50 cursor-not-allowed",
                        seat.isAvailable &&
                          !isSelected &&
                          "border-2 border-green-500 text-green-500 hover:bg-green-500/10 cursor-pointer",
                        isSelected &&
                          "bg-primary text-primary-foreground border-2 border-primary"
                      )}
                      title={seat.isAvailable ? `Seat ${seat.id}` : "Unavailable"}
                    >
                      {seat.number}
                    </button>
                  </div>
                );
              })}
            </div>
            <span className="w-6 text-xs font-medium text-muted-foreground text-center">
              {row}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg border-2 border-green-500" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg bg-primary" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg bg-muted" />
          <span className="text-muted-foreground">Filled</span>
        </div>
      </div>

      {/* Selection Status */}
      <div className="text-center">
        <p className="text-sm">
          Selected:{" "}
          <span className="font-semibold text-primary">
            {selectedSeats.length} / {maxSelectable}
          </span>
          {selectedSeats.length > 0 && (
            <span className="text-muted-foreground ml-2">
              ({selectedSeats.sort().join(", ")})
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default SeatLayout;
