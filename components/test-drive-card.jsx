import React, { useState } from "react";
import { Badge } from "./ui/badge";
import { format, parseISO } from "date-fns";
import { Card } from "./ui/card";
import Image from "next/image";
import { ArrowRight, Calendar, Car, Clock, Loader2, User } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

// Helper function to format time
const formatTime = (timeString) => {
  try {
    return format(parseISO(`2022-01-01T${timeString}`), "h:mm a");
  } catch (error) {
    return timeString;
  }
};

// Helper function for status badge
const getStatusBadge = (status) => {
  switch (status) {
    case "PENDING":
      return <Badge className="border-amber-400/40 bg-amber-400/10 text-amber-200">Pending</Badge>;
    case "CONFIRMED":
      return <Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-200">Confirmed</Badge>;
    case "COMPLETED":
      return <Badge className="border-[#1a5cff]/40 bg-[#1a5cff]/10 text-[#8eb0ff]">Completed</Badge>;
    case "CANCELLED":
      return <Badge className="border-white/15 bg-white/5 text-white/70">Cancelled</Badge>;
    case "NO_SHOW":
      return <Badge className="border-rose-400/40 bg-rose-400/10 text-rose-200">No Show</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const TestDriveCard = ({
  booking,
  onCancel,
  showActions = true,
  isPast = false,
  isAdmin = false,
  isCancelling = false,
  renderStatusSelector = () => null,
}) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Handle cancel
  const handleCancel = async () => {
    if (!onCancel) return;

    await onCancel(booking.id);
    setCancelDialogOpen(false);
  };

  return (
    <>
      <Card
        className={`overflow-hidden border-white/10 bg-[#0b0b0c] ${
          isPast ? "opacity-80 hover:opacity-100 transition-opacity" : ""
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Car Image - Left */}
          <div className="sm:w-1/4 relative h-40 sm:h-auto">
            {booking.car.images && booking.car.images.length > 0 ? (
              <div className="relative h-full w-full bg-[#111113]">
                <Image
                  src={booking.car.images[0]}
                  alt={`${booking.car.make} ${booking.car.model}`}
                  fill
                  sizes="(min-width: 640px) 25vw, 100vw"
                  quality={90}
                  decoding="async"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#111113]">
                <Car className="h-12 w-12 text-white/30" />
              </div>
            )}
            <div className="absolute top-2 right-2 sm:hidden">
              {getStatusBadge(booking.status)}
            </div>
          </div>

          <div className="p-4 sm:w-1/2 sm:flex-1">
            <div className="hidden sm:block mb-2">
              {getStatusBadge(booking.status)}
            </div>
            <h3 className="mb-1 font-[family-name:var(--font-clash)] text-lg font-semibold uppercase tracking-tight">
              {booking.car.year} {booking.car.make} {booking.car.model}{" "}
            </h3>
            {renderStatusSelector()}

            <div className="space-y-2 my-2">
              <div className="flex items-center text-white/70">
                <Calendar className="mr-2 h-4 w-4 text-[#ff4d1a]" />
                {format(new Date(booking.bookingDate), "EEEE, MMMM d, yyyy")}
              </div>
              <div className="flex items-center text-white/70">
                <Clock className="mr-2 h-4 w-4 text-[#ff4d1a]" />
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </div>
              {/* Show customer info in admin view */}
              {isAdmin && booking.user && (
                <div className="flex items-center text-white/70">
                  <User className="mr-2 h-4 w-4 text-[#ff4d1a]" />
                  {booking.user.name || booking.user.email}
                </div>
              )}
            </div>
          </div>
          {/* Action Buttons - Right */}
          {showActions && (
            <div className="flex flex-col border-t border-white/10 p-4 sm:w-1/4 sm:items-center sm:justify-center sm:space-y-2 sm:border-l sm:border-t-0">
              {/* Show notes if any */}
              {booking.notes && (
                <div className="w-full rounded bg-white/5 p-2 text-sm">
                  <p className="font-medium">Notes:</p>
                  <p className="text-white/70">{booking.notes}</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="my-2 w-full cursor-pointer border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link
                  href={`/cars/${booking.carId}`}
                  className="flex items-center justify-center"
                >
                  View Car
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {(booking.status === "PENDING" ||
                booking.status === "CONFIRMED") && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full cursor-pointer"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Cancel"
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Cancel Confirmation Dialog */}
      {onCancel && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Test Drive</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your test drive for the{" "}
                {booking.car.year} {booking.car.make} {booking.car.model}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>
                    {format(
                      new Date(booking.bookingDate),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time:</span>
                  <span>
                    {formatTime(booking.startTime)} -{" "}
                    {formatTime(booking.endTime)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                disabled={isCancelling}
                className={`cursor-pointer`}
              >
                Keep Reservation
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
                className={`cursor-pointer`}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Reservation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TestDriveCard;
