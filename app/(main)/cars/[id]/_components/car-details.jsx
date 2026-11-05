"use client";
import { toggleSavedCar } from "@/actions/car-listings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/helper";
import { useAuth } from "@clerk/nextjs";
import {
  Calendar,
  Car,
  Currency,
  Fuel,
  Gauge,
  Heart,
  LocateFixed,
  MessageSquare,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { toast } from "sonner";
import { BRAND_NAME } from "@/lib/brand";
import EmiCalculator from "./emi-calculator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

function CarGallery({ car, currentImageIndex, setCurrentImageIndex }) {
  const frameRef = useRef(null);
  const [locked, setLocked] = useState(false);
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], locked ? [0, 0] : [-40, 40]);

  useEffect(() => {
    setLocked(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const image = car.images?.[currentImageIndex];

  return (
    <div>
      <div
        ref={frameRef}
        className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 bg-[#111113] sm:aspect-video"
      >
        {image ? (
          <motion.div style={{ y }} className="absolute inset-[-12%]">
            <Image
              src={image}
              alt={`${car.year} ${car.make} ${car.model}`}
              fill
              sizes="(min-width: 1024px) 75vw, 120vw"
              quality={90}
              priority
              decoding="async"
              className="object-cover"
            />
          </motion.div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Car className="h-24 w-24 text-white/20" />
          </div>
        )}
      </div>
      {car.images && car.images.length > 1 && (
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
          {car.images.map((thumb, index) => (
            <button
              key={`${thumb}-${index}`}
              type="button"
              aria-label={`Show image ${index + 1}`}
              aria-pressed={index === currentImageIndex}
              className={`relative h-20 w-24 shrink-0 cursor-pointer overflow-hidden rounded-md ${
                index === currentImageIndex
                  ? "ring-2 ring-[#ff4d1a]"
                  : "opacity-60 hover:opacity-100"
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={thumb}
                alt=""
                fill
                sizes="96px"
                quality={85}
                decoding="async"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const CarDetails = ({ car, testDriveInfo }) => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(
    car.wishListed ?? car.wishlisted ?? false
  );

  const {
    loading: savingCar,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  // Handle toggle result with useEffect
  useEffect(() => {
    if (toggleResult?.success) {
      setIsWishlisted(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult]); // removed isWishlisted to fix the double toast notification

  // Handle errors with useEffect
  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  // Handle save car
  const handleSaveCar = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    if (savingCar) return;

    // Use the toggleSavedCarFn from useFetch hook
    await toggleSavedCarFn(car.id);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${car.year} ${car.make} ${car.model}`,
          text: `Check out this ${car.year} ${car.make} ${car.model} on ${BRAND_NAME}!`,
          url: window.location.href,
        })
        .catch((error) => {
          console.log("Error sharing", error);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

  // Handle book test drive
  const handleBookTestDrive = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to book a test drive");
      router.push("/sign-in");
      return;
    }
    router.push(`/test-drive/${car.id}`);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-7/12">
          <CarGallery
            car={car}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
          />
          {/* Secondary Actions */}
          <div className="flex mt-4 gap-4">
            <Button
              variant="outline"
              className={`flex flex-1 cursor-pointer items-center gap-2 border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white ${
                isWishlisted ? "text-[#ff4d1a]" : ""
              }`}
              onClick={handleSaveCar}
              disabled={savingCar}
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? "fill-[#ff4d1a] text-[#ff4d1a]" : ""}`}
              />
              {isWishlisted ? "Saved" : "Save"}
            </Button>
            <Button
              variant="outline"
              className="flex flex-1 cursor-pointer items-center gap-2 border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              Share
            </Button>
          </div>
        </div>

        {/* Car Details */}
        <div className="w-full lg:w-5/12">
          <div className="flex items-center justify-between">
            <Badge className="mb-2">{car.bodyType}</Badge>
          </div>
          <h1 className="mb-1 font-[family-name:var(--font-clash)] text-4xl font-semibold uppercase tracking-tight sm:text-5xl">
            {car.year} {car.make} {car.model}
          </h1>
          <div className="text-2xl font-semibold text-[#1a5cff]">
            {formatCurrency(car.price)}
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-[#ff4d1a]" />
              <span>{car.mileage.toLocaleString()} miles</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-[#ff4d1a]" />
              <span>{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-[#ff4d1a]" />
              <span>{car.transmission}</span>
            </div>
          </div>
          {/* Emi part */}
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="w-full cursor-pointer text-left">
                <Card className="border-white/10 bg-[#0b0b0c] transition-shadow hover:shadow-[0_0_36px_-16px_rgba(255,77,26,0.7)]">
                  <CardContent>
                    <div className="mb-2 flex items-center gap-2 text-lg font-medium">
                      <Currency className="h-5 w-5 text-[#ff4d1a]" />
                      <h3>EMI Calculator</h3>
                    </div>
                    <div className="text-sm text-white/60">
                      Estimated Monthly Payment:{" "}
                      <span className="font-semibold text-[#1a5cff]">
                        {formatCurrency(car.price / 60)}
                      </span>{" "}
                      for 60 months
                    </div>
                    <div className="mt-1 text-xs text-white/40">
                      Based on $0 down payment and 4.5% interest rate
                    </div>
                  </CardContent>
                </Card>
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[85svh] overflow-y-auto border-white/10 bg-[#0b0b0c] text-white sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-clash)] uppercase tracking-tight">
                  EMI Calculator
                </DialogTitle>
                <DialogDescription className="text-white/50">
                  Estimate a monthly payment for this car.
                </DialogDescription>
              </DialogHeader>
              <EmiCalculator price={Number(car.price)} />
            </DialogContent>
          </Dialog>
          {/* Request More Info */}
          <Card className="my-6 border-white/10 bg-[#0b0b0c]">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2 text-lg font-medium">
                <MessageSquare className="h-5 w-5 text-[#ff4d1a]" />
                <h3>Have Questions?</h3>
              </div>
              <p className="mb-3 text-sm text-white/60">
                A dealership representative can answer questions about this
                vehicle.
              </p>
              <Button asChild variant="outline" className="w-full cursor-pointer border-white/15">
                <a href="mailto:gamerhmv2050@gmail.com">Request Info</a>
              </Button>
            </CardContent>
          </Card>

          {/* Check the status of the car */}
          {(car.status === "SOLD" || car.status === "UNAVAILABLE") && (
            <Alert variant="destructive">
              <AlertTitle className="capitalize">
                This car is {car.status.toLowerCase()}
              </AlertTitle>
              <AlertDescription>Please check again later.</AlertDescription>
            </Alert>
          )}

          {/* Book Test Drive Button */}
          {car.status !== "SOLD" && car.status !== "UNAVAILABLE" && (
            <Button
              className="w-full cursor-pointer bg-[#ff4d1a] py-6 text-lg text-white hover:bg-[#ff6a3d]"
              onClick={handleBookTestDrive}
              disabled={Boolean(testDriveInfo?.userTestDrive)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {testDriveInfo?.userTestDrive
                ? `Booked for ${format(
                    new Date(testDriveInfo.userTestDrive.bookingDate),
                    "EEEE, MMMM d, yyyy"
                  )}`
                : "Book Test Drive"}
            </Button>
          )}
        </div>
      </div>
      {/* More Information */}
      <div className="mt-12 rounded-[2rem] border border-white/10 bg-[#0b0b0c] p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <h3 className="mb-6 font-[family-name:var(--font-clash)] text-2xl font-semibold uppercase tracking-tight">
              Description
            </h3>
            <p className="whitespace-pre-line text-white/70">
              {car.description}
            </p>
          </div>
          <div className="flex-1">
            <h3 className="mb-6 font-[family-name:var(--font-clash)] text-2xl font-semibold uppercase tracking-tight">
              Features
            </h3>
            <ul className="grid grid-cols-1 gap-2">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ff4d1a]"></span>
                {car.transmission} Transmission
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ff4d1a]"></span>
                {car.fuelType} Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ff4d1a]"></span>
                {car.bodyType} Body Style
              </li>
              {car.seats && (
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#ff4d1a]"></span>
                  {car.seats} Seats
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ff4d1a]"></span>
                {car.color} Exterior
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="mt-8 rounded-[2rem] border border-white/10 bg-[#0b0b0c] p-6">
        <h2 className="mb-6 font-[family-name:var(--font-clash)] text-2xl font-semibold uppercase tracking-tight">
          Specifications
        </h2>
        <div className="rounded-2xl bg-[#111113] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex justify-between border-b border-white/10 py-2">
              <span className="text-white/50">Make</span>
              <span className="font-medium">{car.make}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-2">
              <span className="text-white/50">Model</span>
              <span className="font-medium">{car.model}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-2">
              <span className="text-white/50">Year</span>
              <span className="font-medium">{car.year}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-2">
              <span className="text-white/50">Body Type</span>
              <span className="font-medium">{car.bodyType}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-2">
              <span className="text-white/50">Fuel Type</span>
              <span className="font-medium">{car.fuelType}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-2">
              <span className="text-white/50">Transmission</span>
              <span className="font-medium">{car.transmission}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-2">
              <span className="text-white/50">Mileage</span>
              <span className="font-medium">
                {car.mileage.toLocaleString()} miles
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 py-2">
              <span className="text-white/50">Color</span>
              <span className="font-medium">{car.color}</span>
            </div>
            {car.seats && (
              <div className="flex justify-between border-b border-white/10 py-2">
                <span className="text-white/50">Seats</span>
                <span className="font-medium">{car.seats}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dealership Location Section */}
      <div className="mt-8 rounded-[2rem] border border-white/10 bg-[#0b0b0c] p-6">
        <h2 className="mb-6 font-[family-name:var(--font-clash)] text-2xl font-semibold uppercase tracking-tight">
          Dealership Location
        </h2>
        <div className="rounded-2xl bg-[#111113] p-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            {/* Dealership Name and Address */}
            <div className="flex items-start gap-3">
              <LocateFixed className="mt-1 h-5 w-5 shrink-0 text-[#ff4d1a]" />
              <div>
                <h4 className="font-medium">
                  {testDriveInfo.dealership?.name || "Not Available"}
                </h4>
                <p className="text-white/50">
                  {testDriveInfo.dealership?.address || "Not Available"}
                </p>
                <p className="text-white/50 mt-1">
                  Phone: {testDriveInfo.dealership?.phone || "Not Available"}
                </p>
                <p className="text-white/50">
                  Email: {testDriveInfo.dealership?.email || "Not Available"}
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="md:w-1/2 lg:w-1/3">
              <h4 className="font-medium mb-2">Working Hours</h4>
              <div className="space-y-2">
                {testDriveInfo.dealership?.workingHours
                  ? testDriveInfo.dealership.workingHours
                      .sort((a, b) => {
                        const days = [
                          "MONDAY",
                          "TUESDAY",
                          "WEDNESDAY",
                          "THURSDAY",
                          "FRIDAY",
                          "SATURDAY",
                          "SUNDAY",
                        ];
                        return (
                          days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek)
                        );
                      })
                      .map((day) => (
                        <div
                          key={day.dayOfWeek}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-white/50">
                            {day.dayOfWeek.charAt(0) +
                              day.dayOfWeek.slice(1).toLowerCase()}
                          </span>
                          <span>
                            {day.isOpen
                              ? `${day.openTime} - ${day.closeTime}`
                              : "Closed"}
                          </span>
                        </div>
                      ))
                  : // Default hours if none provided
                    [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day, index) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-white/50">{day}</span>
                        <span>
                          {index < 5
                            ? "9:00 - 18:00"
                            : index === 5
                            ? "10:00 - 16:00"
                            : "Closed"}
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
