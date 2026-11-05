"use client";

import React from "react";
import Link from "next/link";
import { motion, useTransform } from "framer-motion";
import { ArrowRight, Gauge } from "lucide-react";
import CarImage from "@/components/car-image";
import {
    EngineIcon,
    TransmissionIcon,
    RoadIcon,
    getCarSpecs,
    WishlistButton,
} from "@/components/car-parts";

// Each card owns 160svh of scroll: 100svh to slide in + 60svh hold.
// A card is "entering" over 0.625 of a unit and "covered" starting 0.375 after it lands.
const HOLD = 0.375;

const FeaturedCarCard = React.forwardRef(function FeaturedCarCard(
    { car, index = 0, count = 1, progress, priority = false, onSavedChange },
    ref
) {
    const image = car.images?.[0] || car.image;
    const make = car.make?.toUpperCase() || "CHEVROLET";
    const model = car.model?.toUpperCase() || "CAMARO";
    const { engine, power, transmission, mileage } = getCarSpecs(car);

    const span = Math.max(count - 1, 1);
    const covered = useTransform(progress, (v) =>
        Math.min(1, Math.max(0, (v * span - index - HOLD) / (1 - HOLD)))
    );
    const entered = useTransform(progress, (v) =>
        Math.min(1, Math.max(0, (v * span - (index - 1) - HOLD) / (1 - HOLD)))
    );

    const scale = useTransform(covered, [0, 1], [1, 0.94]);
    const dim = useTransform(covered, [0, 1], [0, 0.45]);
    const imgScale = useTransform(entered, [0, 1], [1.15, 1]);
    const textY = useTransform(entered, [0, 1], [60, 0]);
    const textOpacity = useTransform(entered, [0.3, 1], [0, 1]);

    const specs = [
        { icon: <EngineIcon className="h-5 w-5" />, value: engine, label: "Engine" },
        { icon: <Gauge className="h-5 w-5" strokeWidth={1.8} />, value: power, label: "Power" },
        { icon: <TransmissionIcon className="h-5 w-5" />, value: transmission, label: "Gearbox" },
        { icon: <RoadIcon className="h-5 w-5" />, value: mileage, label: "Mileage" },
    ];

    return (
        <div ref={ref} className="sticky top-0 h-svh">
            <motion.article
                style={{ scale }}
                className="relative h-full w-full origin-top overflow-hidden rounded-t-[32px] border-t border-white/10 bg-[#0c0c0e] md:rounded-t-[48px]"
            >
                {/* Full-card link */}
                <Link
                    href={`/cars/${car.id}`}
                    aria-label={`View ${car.make} ${car.model}`}
                    className="absolute inset-0 z-10 cursor-pointer"
                />

                {/* Full-bleed image */}
                <motion.div style={{ scale: imgScale }} className="absolute inset-0 z-0">
                    <CarImage
                        src={image}
                        alt={`${car.make} ${car.model}`}
                        sizes="100vw"
                        priority={priority}
                        quality={90}
                        loading={priority ? undefined : "eager"}
                        className="h-full w-full object-cover"
                    />
                </motion.div>

                {/* Light gradients, only behind text */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[35%] bg-gradient-to-b from-black/55 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[55%] bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Ghost index number */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-[6vw] top-1/2 z-[2] -translate-y-1/2 select-none font-display text-[clamp(7rem,20vw,20rem)] font-black italic leading-none text-transparent opacity-30 [-webkit-text-stroke:1px_rgba(255,255,255,0.5)]"
                >
                    {String(index + 1).padStart(2, "0")}
                </span>

                {/* Content */}
                <div className="pointer-events-none relative z-20 flex h-full flex-col justify-end px-[8vw] pb-24 pt-52 md:pb-28">
                    <motion.div style={{ y: textY, opacity: textOpacity }}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                            {make}
                        </p>
                        <h3 className="line-clamp-2 max-w-[80vw] font-display text-[clamp(2.25rem,6.5vw,6rem)] font-black italic uppercase leading-[0.9] tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)]">
                            {model}
                            <span className="ml-3 text-[#ff4d1a] drop-shadow-[0_0_20px_rgba(255,77,26,0.6)]">
                                {"//"}
                            </span>
                        </h3>

                        <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
                            <div className="flex flex-wrap items-center gap-y-3 rounded-2xl border border-white/10 bg-black/45 px-5 py-3.5 backdrop-blur-md">
                                {specs.map((s, i) => (
                                    <React.Fragment key={s.label}>
                                        {i > 0 && <div className="mx-3.5 h-6 w-px bg-white/15 md:mx-5" />}
                                        <div className="flex items-center gap-2.5">
                                            <span className="shrink-0 text-[#ff4d1a]">{s.icon}</span>
                                            <div className="leading-tight">
                                                <p className="text-sm font-bold tracking-wide text-white">{s.value}</p>
                                                <p className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                                                    {s.label}
                                                </p>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className="pointer-events-auto flex items-center gap-3">
                                <Link
                                    href={`/cars/${car.id}`}
                                    className="group/btn relative z-30 flex h-12 cursor-pointer items-center -skew-x-[20deg] rounded-lg bg-[#ff4d1a] px-7 text-white shadow-[0_4px_24px_rgba(255,77,26,0.4)] transition-all duration-300 hover:bg-[#ff5a2b] hover:shadow-[0_6px_36px_rgba(255,77,26,0.65)] active:scale-95"
                                >
                                    <span className="flex skew-x-[20deg] items-center text-sm font-bold tracking-wide">
                                        View car
                                        <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                    </span>
                                </Link>
                                <WishlistButton car={car} onSavedChange={onSavedChange} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Dim only while the next card covers this one */}
                <motion.div
                    style={{ opacity: dim }}
                    className="pointer-events-none absolute inset-0 z-[25] bg-black"
                />
            </motion.article>
        </div>
    );
});

export default FeaturedCarCard;

