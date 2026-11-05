"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import FeaturedCarCard from "./featured-car-card";

const pad = (n) => String(n).padStart(2, "0");

function SectionHeading({ className = "" }) {
  return (
    <div className={`flex items-end justify-between gap-6 ${className}`}>
      <div className="min-w-0">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#ff4d1a]">
          Curated inventory
        </p>
        <h2 className="font-display text-[clamp(1.75rem,3.5vw,3.25rem)] font-semibold uppercase leading-[0.9] text-white">
          Featured Cars
        </h2>
      </div>
      <Link
        href="/cars"
        className="pointer-events-auto group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-[#ff4d1a]/60 bg-[#ff4d1a]/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-[#ff4d1a] hover:shadow-[0_0_30px_rgba(255,77,26,0.5)]"
      >
        View all
        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function FixedOverlay({ progress, count }) {
  const [active, setActive] = useState(0);
  const lineScale = useTransform(progress, [0, 1], [1 / Math.max(count, 1), 1]);

  useMotionValueEvent(progress, "change", (v) => {
    const next = Math.min(count - 1, Math.max(0, Math.round(v * (count - 1))));
    setActive((prev) => (prev === next ? prev : next));
  });

  return (
    <div className="pointer-events-none sticky top-0 z-30 h-svh">
      <div className="flex h-full flex-col justify-between px-[8vw] pb-8 pt-24">
        <SectionHeading />
        <div className="flex items-center gap-4">
          <div className="h-[2px] flex-1 overflow-hidden bg-white/15">
            <motion.div
              style={{ scaleX: lineScale }}
              className="h-full w-full origin-left bg-[#ff4d1a]"
            />
          </div>
          <p className="font-mono text-xs tabular-nums tracking-[0.25em] text-white">
            {pad(active + 1)} / {pad(count)}
          </p>
        </div>
      </div>
    </div>
  );
}

const FeaturedCars = ({ featuredCars = [] }) => {
  const wrapRef = useRef(null);
  const count = featuredCars.length;

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  if (!count) {
    return (
      <div className="px-[8vw] py-24">
        <SectionHeading className="mb-6" />
        <p className="text-white/70">No featured cars yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative bg-black">
      <FixedOverlay progress={scrollYProgress} count={count} />
      <div className="-mt-[100svh]">
        {featuredCars.map((car, index) => (
          <React.Fragment key={car.id}>
            <FeaturedCarCard
              car={car}
              index={index}
              count={count}
              progress={scrollYProgress}
              priority={index === 0}
            />
            {index < count - 1 && <div className="h-[60svh]" aria-hidden="true" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCars;