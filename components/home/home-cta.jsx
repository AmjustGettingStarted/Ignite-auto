"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { carMakes } from "@/lib/data";
import SiteFooter from "@/components/home/site-footer";

function MakeMarquee() {
  const names = carMakes.map((make) => make.name);
  const loop = [...names, ...names];

  return (
    <div className="cta-marquee">
      <div className="cta-marquee-track">
        {loop.map((name, index) => (
          <span key={`${name}-${index}`} className="cta-marquee-word">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomeCta({ children }) {
  const containerRef = useRef(null);
  const footerRef = useRef(null);
  const reduce = useReducedMotion();

  // Track scroll progress across the entire multi-phase choreography:
  // 1. FAQ scrolls up (0.0 -> 0.34): Unveils the pinned hero car photo in place (content opacity: 0)
  // 2. Further scroll (0.34 -> 0.52): CTA content reveals smoothly (opacity 0 -> 1, y 40 -> 0)
  // 3. Dwell (0.52 -> 0.70): CTA content remains fully visible and interactive
  // 4. Scroll again (0.70 -> 0.85): CTA content fades out, slightly scales and shifts upward
  // 5. Footer appears (0.83 -> 1.0): Natural-height footer pulls up cleanly over the pinned background
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const ctaOpacity = useTransform(
    scrollYProgress,
    [0, 0.34, 0.52, 0.70, 0.85],
    [0, 0, 1, 1, 0]
  );

  const ctaY = useTransform(
    scrollYProgress,
    [0, 0.34, 0.52, 0.70, 0.85],
    [40, 40, 0, 0, -40]
  );

  const ctaScale = useTransform(
    scrollYProgress,
    [0, 0.34, 0.52, 0.70, 0.85],
    [0.95, 0.95, 1, 1, 0.95]
  );

  const pointerEvents = useTransform(
    scrollYProgress,
    (v) => (v >= 0.48 && v <= 0.73 ? "auto" : "none")
  );

  return (
    <div
      ref={containerRef}
      className="relative z-10 -mt-[100vh] w-full"
    >
      {/* Stationary Anchor CTA Section: pinned at top: 0 behind FAQ */}
      <section
        id="cta"
        aria-labelledby="cta-title"
        className="sticky top-0 z-0 h-screen w-full overflow-hidden bg-black"
      >
        {/* Background photo: always present at top: 0, unveiled as FAQ lifts like a curtain */}
        <div className="absolute inset-0">
          <Image
            src="/hero-last-frame.jpg"
            alt=""
            fill
            sizes="100vw"
            quality={90}
            decoding="async"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
        </div>

        {/* CTA Content: Revealed upon further scroll, dwells, then fades out */}
        <motion.div
          style={
            reduce
              ? {}
              : {
                  opacity: ctaOpacity,
                  scale: ctaScale,
                  y: ctaY,
                  pointerEvents,
                }
          }
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <h2
            id="cta-title"
            className="font-display text-[clamp(3.5rem,11vw,11rem)] uppercase leading-[0.86] text-white"
          >
            <span className="block">Find your</span>
            <span className="block">dream car</span>
          </h2>
          <p className="mt-8 text-base text-white/80 sm:text-lg md:whitespace-nowrap">
            Browse the inventory and book a test drive.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              asChild
              className="h-14 cursor-pointer bg-[#ff4d1a] px-8 text-base text-white hover:bg-[#ff4d1a]/90"
            >
              <Link href="/cars">View all cars</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-14 cursor-pointer border-white bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/sign-up">Sign up now</Link>
            </Button>
          </div>

          <div className="absolute inset-x-0 bottom-0">
            <MakeMarquee />
          </div>
        </motion.div>
      </section>

      {/* Scroll track spacer: allows FAQ lift, content reveal, dwell, and fade */}
      <div className="h-[240vh] pointer-events-none" aria-hidden="true" />

      {/* Footer Container & Sheet Overlay: slides up naturally over the pinned CTA */}
      <section
        id="footer"
        ref={footerRef}
        className="relative z-20 w-full h-auto bg-black rounded-t-3xl border-t border-white/10 shadow-2xl overflow-hidden"
      >
        {children || <SiteFooter className="border-0 bg-transparent rounded-none shadow-none" />}
      </section>
    </div>
  );
}
