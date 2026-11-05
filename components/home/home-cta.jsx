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
  const footerRef = useRef(null);
  const reduce = useReducedMotion();

  // Track the scroll progress of the footer entering and reaching its resting point
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  // Fade, slightly scale, and translate CTA text/buttons upward as the footer slides in
  const ctaOpacity = useTransform(scrollYProgress, (v) => Math.max(0, 1 - v / 0.6));
  const ctaScale = useTransform(scrollYProgress, (v) => 1 - Math.min(1, v / 0.6) * 0.05);
  const ctaY = useTransform(scrollYProgress, (v) => -Math.min(1, v / 0.6) * 40);
  const pointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.6 ? "none" : "auto"));

  return (
    <>
      {/* Stationary Anchor CTA Section */}
      <section
        id="cta"
        aria-labelledby="cta-title"
        className="sticky top-0 z-0 h-screen w-full overflow-hidden bg-black"
      >
        {/* Background photo remains visible */}
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

        {/* CTA Content: Heading, buttons, marquee fade out cleanly as the footer pulls up */}
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

      {/* Footer Container & Sheet Overlay */}
      <section
        id="footer"
        ref={footerRef}
        className="relative z-10 w-full h-auto bg-black rounded-t-3xl border-t border-white/10 shadow-2xl overflow-hidden"
      >
        {children || <SiteFooter className="border-0 bg-transparent rounded-none shadow-none" />}
      </section>
    </>
  );
}
