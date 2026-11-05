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

function Spec({ icon, value }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-white sm:text-xs">
            <span className="text-[#ff4d1a]">{icon}</span>
            {value}
        </span>
    );
}

export default function GridCarCard({
    car,
    index = 0,
    onSavedChange,
    priority = false,
    sizes = "(min-width: 768px) 45vw, 100vw",
}) {
    const image = car.images?.[0] || car.image;
    const make = car.make?.toUpperCase() || "";
    const model = car.model?.toUpperCase() || "";
    const { engine, power, transmission, mileage } = getCarSpecs(car);

    const price =
        car.price !== undefined && car.price !== null && car.price !== ""
            ? Number(car.price).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
            })
            : null;

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: (index % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group relative h-[30rem] w-full overflow-hidden rounded-[28px] bg-[#0c0c0e] ring-1 ring-white/10 transition-shadow duration-500 hover:ring-[#ff4d1a]/50 hover:shadow-[0_24px_70px_-24px_rgba(255,77,26,0.4)] sm:h-[34rem]"
        >
            <Link
                href={`/cars/${car.id}`}
                aria-label={`View ${car.make} ${car.model}`}
                className="absolute inset-0 z-10 cursor-pointer"
            />

            {/* Full-bleed image */}
            <div className="absolute inset-0 z-0">
                <CarImage
                    src={image}
                    alt={`${car.make} ${car.model}`}
                    sizes={sizes}
                    priority={priority}
                    className="h-full w-full object-cover brightness-[1.05] saturate-[1.1] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                />
            </div>

            {/* Gradients only where text sits */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-1/4 bg-gradient-to-b from-black/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[62%] bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

            {/* Content */}
            <div className="pointer-events-none relative z-20 flex h-full flex-col justify-between p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        {make}
                    </p>
                    <div className="pointer-events-auto">
                        <WishlistButton car={car} onSavedChange={onSavedChange} />
                    </div>
                </div>

                <div>
                    <h3 className="line-clamp-2 font-display text-[clamp(2rem,3.4vw,3.25rem)] font-black italic uppercase leading-[0.9] tracking-tight text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.7)]">
                        {model}
                        <span className="ml-2 text-[#ff4d1a] drop-shadow-[0_0_16px_rgba(255,77,26,0.6)]">
                            {"//"}
                        </span>
                    </h3>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <Spec icon={<EngineIcon className="h-4 w-4" />} value={engine} />
                        <span className="hidden h-3 w-px bg-white/25 sm:block" />
                        <Spec icon={<Gauge className="h-4 w-4" strokeWidth={1.8} />} value={power} />
                        <span className="hidden h-3 w-px bg-white/25 sm:block" />
                        <Spec icon={<TransmissionIcon className="h-4 w-4" />} value={transmission} />
                        <span className="hidden h-3 w-px bg-white/25 sm:block" />
                        <Spec icon={<RoadIcon className="h-4 w-4" />} value={mileage} />
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/15 pt-5">
                        <div className="min-w-0">
                            {price && (
                                <>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/55">Price</p>
                                    <p className="truncate font-display text-xl font-bold text-white sm:text-2xl">
                                        {price}
                                    </p>
                                </>
                            )}
                        </div>

                        <span className="pointer-events-auto relative z-30 flex h-11 shrink-0 -skew-x-[20deg] items-center rounded-lg bg-[#ff4d1a] px-6 text-white shadow-[0_4px_24px_rgba(255,77,26,0.4)] transition-all duration-300 group-hover:bg-[#ff5a2b] group-hover:shadow-[0_6px_32px_rgba(255,77,26,0.65)]">
                            <span className="flex skew-x-[20deg] items-center text-sm font-bold tracking-wide">
                                View car
                                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}