"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gauge } from "lucide-react";
import CarImage from "@/components/car-image";
import {
  EngineIcon,
  TransmissionIcon,
  RoadIcon,
  getCarSpecs,
  WishlistButton,
} from "@/components/car-parts";

const CarCard = React.forwardRef(function CarCard(
  {
    car,
    scale,
    opacity,
    skew = true,
    style = {},
    className = "",
    priority = false,
    sizes = "(min-width: 1024px) 80vw, 88vw",
    onSavedChange,
  },
  ref
) {
  const image = car.images?.[0] || car.image;
  const make = car.make?.toUpperCase() || "CHEVROLET";
  const model = car.model?.toUpperCase() || "CAMARO";
  const { engine, power, transmission, mileage } = getCarSpecs(car);
  const skewAngle = skew ? -5.5 : 0;
  const counterSkew = skew ? 5.5 : 0;

  return (
    <motion.article
      ref={ref}
      style={{
        skewX: skewAngle,
        scale,
        opacity,
        ...style,
      }}
      className={`group relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0c0e] shadow-[0_25px_60px_rgba(0,0,0,0.85)] transition-colors duration-300 hover:border-white/20 md:rounded-[36px] ${className}`}
    >
      {/* Clickable Card Link covering the entire card */}
      <Link
        href={`/cars/${car.id}`}
        aria-label={`View ${car.make} ${car.model}`}
        className="absolute inset-0 z-10 cursor-pointer"
      />

      {/* Background Car Image Layer (bleeds past edges to fully fill skewed corners) */}
      <div
        className="absolute -inset-x-14 -inset-y-4 z-0 overflow-hidden"
        style={{ transform: `skewX(${counterSkew}deg)` }}
      >
        <CarImage
          src={image}
          alt={`${car.make} ${car.model}`}
          sizes={sizes}
          priority={priority}
          quality={90}
          className="h-full w-full scale-110 object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-115"
        />

        {/* Cinematic lighting gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/30 to-black/90" />
        <div className="absolute inset-0 bg-radial-[at_center] from-transparent via-black/20 to-black/70 pointer-events-none" />
      </div>

      {/* Inner Content Layer (pointer-events-none so card link works, interactive elements re-enable pointer-events) */}
      <motion.div
        style={{ skewX: counterSkew }}
        className="pointer-events-none relative z-20 flex h-full w-full flex-col justify-between px-8 py-7 sm:px-14 sm:py-8 md:px-16 md:py-9"
      >
        {/* Top Header Row */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 pr-6">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
              {make}
            </p>

            <div className="relative flex max-w-full items-center overflow-hidden">
              <Link
                href={`/cars/${car.id}`}
                className="pointer-events-auto flex shrink-0 items-center cursor-pointer hover:opacity-90 transition-opacity"
              >
                <h3 className="font-display text-3xl font-black italic uppercase tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] sm:text-4xl md:text-5xl">
                  {model}
                </h3>
                <span className="ml-2 font-display text-3xl font-black italic text-[#ff4d1a] drop-shadow-[0_0_12px_rgba(255,77,26,0.6)] sm:text-4xl md:text-5xl select-none">
                  {"//"}
                </span>
              </Link>

              {/* Watermark outline stroked text trailing horizontally */}
              <div
                aria-hidden="true"
                className="pointer-events-none ml-4 hidden shrink-0 select-none font-display text-3xl font-black italic uppercase tracking-tight text-transparent opacity-35 [-webkit-text-stroke:1px_rgba(255,255,255,0.4)] sm:block sm:text-4xl md:text-5xl"
              >
                {model}
              </div>
            </div>
          </div>

          {/* Top-Right Wishlist Button */}
          <div className="pointer-events-auto">
            <WishlistButton car={car} onSavedChange={onSavedChange} />
          </div>
        </div>

        {/* Bottom Specs & Action Bar */}
        <div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Specs row with icons and vertical dividers */}
            <div className="flex flex-wrap items-center gap-y-3">
              {/* Engine Spec */}
              <div className="flex items-center gap-2.5">
                <EngineIcon className="h-5 w-5 shrink-0 text-white/90" />
                <div className="leading-tight">
                  <p className="text-sm font-bold text-white tracking-wide">{engine}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                    Engine
                  </p>
                </div>
              </div>

              <div className="mx-3.5 h-6 w-px bg-white/15 sm:mx-4 md:mx-5" />

              {/* Power Spec */}
              <div className="flex items-center gap-2.5">
                <Gauge className="h-5 w-5 shrink-0 text-white/90" strokeWidth={1.8} />
                <div className="leading-tight">
                  <p className="text-sm font-bold text-white tracking-wide">{power}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                    Power
                  </p>
                </div>
              </div>

              <div className="mx-3.5 h-6 w-px bg-white/15 sm:mx-4 md:mx-5" />

              {/* Transmission Spec */}
              <div className="flex items-center gap-2.5">
                <TransmissionIcon className="h-5 w-5 shrink-0 text-white/90" />
                <div className="leading-tight">
                  <p className="text-sm font-bold text-white tracking-wide">{transmission}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                    Transmission
                  </p>
                </div>
              </div>

              <div className="mx-3.5 h-6 w-px bg-white/15 sm:mx-4 md:mx-5" />

              {/* Mileage Spec */}
              <div className="flex items-center gap-2.5">
                <RoadIcon className="h-5 w-5 shrink-0 text-white/90" />
                <div className="leading-tight">
                  <p className="text-sm font-bold text-white tracking-wide">{mileage}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                    Mileage
                  </p>
                </div>
              </div>
            </div>

            {/* View car Action Button with racing skewed geometry */}
            <Link
              href={`/cars/${car.id}`}
              className="group/btn pointer-events-auto relative z-30 flex shrink-0 cursor-pointer items-center self-end transition-transform duration-200 active:scale-95 sm:self-auto"
            >
              {/* Slanted dark accent bar */}
              <span
                aria-hidden="true"
                className="mr-2 hidden h-11 w-3.5 -skew-x-[20deg] rounded-[4px] border border-[#ff4d1a]/25 bg-[#ff4d1a]/15 transition-colors group-hover/btn:bg-[#ff4d1a]/30 sm:inline-block"
              />

              {/* Main orange skewed button */}
              <span className="relative flex h-11 items-center justify-center -skew-x-[20deg] rounded-lg bg-[#ff4d1a] px-6 text-white shadow-[0_4px_24px_rgba(255,77,26,0.35)] transition-all duration-300 group-hover/btn:bg-[#ff5a2b] group-hover/btn:shadow-[0_6px_32px_rgba(255,77,26,0.6)]">
                <span className="flex items-center skew-x-[20deg] font-sans text-sm font-bold tracking-wide text-white">
                  View car
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
});

export default CarCard;
