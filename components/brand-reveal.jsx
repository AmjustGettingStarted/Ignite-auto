"use client";

import React, { Suspense, useState, useMemo } from "react";
import Image from "next/image";
import CarImage from "@/components/car-image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { carMakes } from "@/lib/data";

// Verified, authentic manufacturer photography from the dealership inventory
const BRAND_VEHICLE_IMAGES = {
  Maserati:
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/a6c6bf18-517c-48f6-80dc-6aedeae40210/image-1748064389579-0.jpeg", // MC20
  Bugatti:
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/6f3e5166-e168-497c-83e1-8a2828375f2a/image-1747813435025-0.jpeg", // Chiron Super Sport
  "Rolls-Royce":
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/aff19bf7-13e9-4887-bd37-fe84b9c5dd29/image-1748405390062-0.jpeg", // Spectre
  Hyundai:
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/e81ab7a9-99ee-406a-aa0b-590ba7fe97dc/image-1748339014230-0.jpeg", // N Vision 74
  Honda:
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/e92af99e-c5b0-4618-928d-21e6d80dccc4/image-1748492468753-0.jpeg", // Acura NSX
  BMW:
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/96144b72-bca5-4df7-8553-3a40a2a9c41e/image-1747981674926-0.webp", // Z4
  Tata:
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/480f028e-77a9-485b-873c-0d5e69853f58/image-1748492765654-0.jpeg", // Tamo Racemo
  Mahindra:
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/69de088a-ee15-49dd-846a-cbfe2e88d8e4/image-1748493328442-0.jpeg", // Scorpio
  Ford:
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/d1856053-8464-4a0d-8a24-1583ab7d04f3/image-1748493691650-0.webp", // Ford GT
  McLaren:
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/c887d1ed-cb5b-484f-871f-350ecf080476/image-1748065703315-0.jpeg", // Artura
  Lamborghini:
    "https://dhbljsytzmtiwoassnym.supabase.co/storage/v1/object/public/car-images/cars/ed96c630-1ddc-4a4e-8814-0813882cec6e/image-1748064112315-0.jpeg", // Sián
};

// Explicit verified logo assets with transparent backgrounds and sharp emblem details
const BRAND_LOGOS = {
  Maserati: "/make/maserati.png",
  Bugatti: "/make/bugatti.png",
  "Rolls-Royce": "/make/rollsroyce.png",
  Hyundai: "/make/hyundai.png",
  Honda: "/make/honda.png",
  BMW: "/make/bmw.png",
  Tata: "/make/tata.png",
  Mahindra: "/make/mahindra.png",
  Ford: "/make/ford.png",
  McLaren: "/make/mclaren.png",
  Lamborghini: "/make/Lamborghini.png",
};

function BrandCard({ make, isSelected, clone = false }) {
  const imageUrl = BRAND_VEHICLE_IMAGES[make.name] || "/studio-bg.jpg";
  const logoUrl = BRAND_LOGOS[make.name] || make.image;

  return (
    <Link
      href={`/cars?make=${encodeURIComponent(make.name)}`}
      aria-hidden={clone ? "true" : undefined}
      tabIndex={clone ? -1 : 0}
      style={{ flexShrink: 0 }}
      className={`group relative flex h-[180px] w-[285px] shrink-0 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[18px] bg-[#0c0c0e] transition-all duration-300 ease-out sm:h-[188px] sm:w-[298px] lg:h-[196px] lg:w-[312px] hover:z-20 hover:-translate-y-1 hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.85)] focus-visible:outline-none ${
        isSelected
          ? "border border-[#ff4d1a] shadow-[0_0_24px_rgba(255,77,26,0.28)]"
          : "border border-white/[0.08] hover:border-[#ff4d1a]/70"
      }`}
    >
      {/* Full-bleed authentic automotive photography with unified cinematic grading */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <CarImage
          src={imageUrl}
          alt=""
          sizes="(min-width: 1024px) 640px, 400px"
          quality={90}
          loading={clone ? "lazy" : "eager"}
          priority={!clone}
          className={`object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 ${
            isSelected
              ? "brightness-[0.88]"
              : "brightness-[0.78] group-hover:brightness-[0.88]"
          }`}
        />

        {/* Center vignette ensuring high contrast behind the logo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.65)_100%)]" />

        {/* Subtle bottom gradient for visual grounding */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Delicate top-edge specular line */}
        <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
      </div>

      {/* Primary Brand Identity — Centered official logo with natural proportions and zero destructive filters */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
        <div className="relative flex h-16 w-36 items-center justify-center sm:h-20 sm:w-44 lg:h-20 lg:w-48">
          <Image
            src={logoUrl}
            alt={clone ? "" : `${make.name} logo`}
            fill
            sizes="(min-width: 1024px) 384px, 320px"
            quality={90}
            priority={!clone}
            loading={!clone ? "eager" : "lazy"}
            decoding="async"
            className="object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Subtle corner navigation arrow indicator, gracefully revealed on hover */}
      <div className="pointer-events-none absolute right-3.5 top-3.5 z-20 flex h-7 w-7 -translate-x-1 translate-y-1 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/40 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:text-[#ff4d1a]">
        <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

function BrandRevealInner() {
  const searchParams = useSearchParams();
  const rawActiveMake = searchParams?.get("make");

  // Highlight Maserati by default if no make is in query (matching the design intent)
  const activeMake = rawActiveMake || "Maserati";

  const [nudge, setNudge] = useState(0);

  const handlePrev = () => {
    setNudge((prev) => prev + 320);
  };

  const handleNext = () => {
    setNudge((prev) => prev - 320);
  };

  // Row 1: Maserati, Bugatti, Rolls-Royce, Hyundai, Honda, BMW (6 makes)
  const row1Makes = useMemo(() => {
    const sequenceNames = [
      "Maserati",
      "Bugatti",
      "Rolls-Royce",
      "Hyundai",
      "Honda",
      "BMW",
    ];
    const ordered = sequenceNames
      .map((name) => carMakes.find((m) => m.name.toLowerCase() === name.toLowerCase()))
      .filter(Boolean);

    // Quad-duplicate for a 100% seamless infinite loop with zero visual jumps
    return [...ordered, ...ordered, ...ordered, ...ordered];
  }, []);

  // Row 2: Tata, Mahindra, Ford, McLaren, Lamborghini (5 makes)
  const row2Makes = useMemo(() => {
    const sequenceNames = [
      "Tata",
      "Mahindra",
      "Ford",
      "McLaren",
      "Lamborghini",
    ];
    const ordered = sequenceNames
      .map((name) => carMakes.find((m) => m.name.toLowerCase() === name.toLowerCase()))
      .filter(Boolean);

    // Quad-duplicate for a 100% seamless infinite loop with zero visual jumps
    return [...ordered, ...ordered, ...ordered, ...ordered];
  }, []);

  return (
    <section
      aria-labelledby="browse-by-make"
      className="relative z-20 overflow-hidden bg-[#080808] py-20 sm:py-24 lg:py-28"
    >
      {/* Minimal, restrained ambient warmth without excessive decorative gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,77,26,0.06)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* Editorial Section Heading & Circular Navigation Controls with robust vertical spacing */}
      <div className="container mx-auto mb-10 px-4 sm:mb-14 sm:px-6 lg:mb-16 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col">
            {/* Small uppercase eyebrow */}
            <span className="font-[family-name:var(--font-label)] text-xs font-semibold uppercase tracking-[0.28em] text-[#ff4d1a]">
              Shop by brand
            </span>

            {/* Dominant main heading with clean line-height to prevent overlap */}
            <h2
              id="browse-by-make"
              className="mt-3.5 font-[family-name:var(--font-clash)] text-4xl font-semibold uppercase leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Browse by Make
            </h2>

            {/* Muted count below */}
            <p className="mt-3 text-xs font-medium tracking-wide text-white/50 sm:text-sm">
              {carMakes.length} makes
            </p>
          </div>

          {/* Minimal circular navigation controls on the right */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-end">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Scroll brands left"
              className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition-all duration-300 hover:border-white/30 hover:bg-white/[0.08] hover:text-white active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Scroll brands right"
              className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#ff4d1a]/50 bg-[#ff4d1a]/10 text-[#ff4d1a] transition-all duration-300 hover:border-[#ff4d1a] hover:bg-[#ff4d1a]/20 active:scale-95"
            >
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two-Row Luxury Editorial Marquee */}
      <div className="relative w-full overflow-hidden select-none" style={{ overflow: "hidden" }}>
        {/* Soft edge gradient fades for continuous infinite flow */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-16 bg-gradient-to-r from-[#080808] via-[#080808]/85 to-transparent sm:w-28 md:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-16 bg-gradient-to-l from-[#080808] via-[#080808]/85 to-transparent sm:w-28 md:w-40" />

        {/* Row 1: Left to Right Marquee */}
        <div className="brand-marquee-container w-full overflow-hidden py-1" style={{ overflow: "hidden" }}>
          <div
            className="flex w-max shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              width: "max-content",
              transform: `translate3d(${nudge}px, 0, 0)`,
            }}
          >
            <div
              className="brand-marquee-lane-right flex flex-row flex-nowrap items-center shrink-0 w-max gap-5 sm:gap-6 lg:gap-7"
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                width: "max-content",
                flexShrink: 0,
              }}
            >
              {row1Makes.map((make, index) => (
                <BrandCard
                  key={`r1-${make.id}-${index}`}
                  make={make}
                  isSelected={activeMake?.toLowerCase() === make.name.toLowerCase()}
                  clone={index >= 6}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Subtle, restrained horizontal divider between rows with ambient warm center glow */}
        <div className="my-5 flex w-full items-center justify-center sm:my-7">
          <div className="h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-[#ff4d1a]/25 to-transparent" />
        </div>

        {/* Row 2: Right to Left Marquee */}
        <div className="brand-marquee-container w-full overflow-hidden py-1" style={{ overflow: "hidden" }}>
          <div
            className="flex w-max shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              width: "max-content",
              transform: `translate3d(${nudge}px, 0, 0)`,
            }}
          >
            <div
              className="brand-marquee-lane-left flex flex-row flex-nowrap items-center shrink-0 w-max gap-5 sm:gap-6 lg:gap-7"
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                width: "max-content",
                flexShrink: 0,
              }}
            >
              {row2Makes.map((make, index) => (
                <BrandCard
                  key={`r2-${make.id}-${index}`}
                  make={make}
                  isSelected={activeMake?.toLowerCase() === make.name.toLowerCase()}
                  clone={index >= 5}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandRevealSkeleton() {
  return (
    <section className="relative z-20 min-h-[500px] overflow-hidden bg-[#080808] py-20">
      <div className="container mx-auto px-4">
        <div className="h-4 w-32 animate-pulse rounded bg-white/10 mb-4" />
        <div className="h-14 w-80 animate-pulse rounded bg-white/10 mb-2" />
        <div className="h-4 w-24 animate-pulse rounded bg-white/10 mb-12" />
        <div className="h-40 w-full animate-pulse rounded-2xl bg-white/5" />
      </div>
    </section>
  );
}

export default function BrandReveal() {
  return (
    <Suspense fallback={<BrandRevealSkeleton />}>
      <BrandRevealInner />
    </Suspense>
  );
}
