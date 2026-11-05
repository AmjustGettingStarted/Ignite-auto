"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { carMakes } from "@/lib/data";

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

export default function HomeCta() {
  const ctaRef = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ctaRef,
    offset: ["start start", "end end"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.45, 0.6, 0.7], [0, 0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.3, 0.45], [40, 0]);

  return (
    <section
      id="cta"
      ref={ctaRef}
      aria-labelledby="cta-title"
      className="relative z-10 -mt-[100svh] h-[340svh] md:h-[380svh]"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
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
        <motion.div
          style={reduce ? { opacity: 1, y: 0 } : { opacity, y }}
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
      </div>
    </section>
  );
}
