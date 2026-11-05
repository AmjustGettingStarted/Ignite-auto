"use client";

import Image from "next/image";
import {
  cubicBezier,
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { BRAND_NAME } from "@/lib/brand";

const EASE = [0.22, 1, 0.36, 1];
const ease = cubicBezier(0.22, 1, 0.36, 1);

const ENTER = [
  { x: -1500, y: -700, r: -35 },
  { x: 1400, y: -800, r: 30 },
  { x: -1300, y: 800, r: 25 },
  { x: 1500, y: 700, r: -30 },
  { x: 0, y: -1000, r: 12 },
];

const SETTLED = [
  { x: -510, y: 65, r: -7 },
  { x: -255, y: 22, r: -3.5 },
  { x: 0, y: 0, r: 0 },
  { x: 255, y: 22, r: 3.5 },
  { x: 510, y: 65, r: 7 },
];

const EXIT_X = [-14, -7, 0, 7, 14];
const EXIT_R = [-4, -2, 0, 2, 4];

// Fraction of the exit window the cards spend travelling down.
// The remaining part they sit stacked while the section finishes scrolling away.
const EXIT_TRAVEL = 0.8;

const CARDS = [
  {
    number: "01",
    title: "Wide Selection",
    copy: "Filter this dealership's stock by make, body style, price, and mileage.",
    image: "/why/wide-selection.webp",
  },
  {
    number: "02",
    title: "Easy Test Drive",
    copy: "Book a slot on a car that is actually on the lot, without calling the floor.",
    image: "/why/easy-test-drive.webp",
  },
  {
    number: "03",
    title: "Secure Process",
    copy: "Reservations stay on your account, and the car's status updates from the desk.",
    image: "/why/secure-process.webp",
    featured: true,
  },
  {
    number: "04",
    title: "AI Image Search",
    copy: "Upload a photo and match it to cars in this dealership's inventory.",
    image: "/why/ai-image-search.webp",
  },
  {
    number: "05",
    title: "Verified Dealer Inventory",
    copy: "Every listing is stock this dealership holds, with price and photos from the floor.",
    image: "/why/verified-dealer-inventory.webp",
  },
];

function clamp01(value) {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function segment(progress, start, end) {
  return ease(clamp01((progress - start) / (end - start)));
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

/**
 * Splits the raw scroll progress (0 -> 1 over the whole section, ending when the
 * section has fully left the top of the viewport) into two phases:
 *  - pinned: 0 -> 1 while the stage is stuck to the viewport (cards fly in and settle)
 *  - exit:   0 -> 1 while the stage is already scrolling up (cards fall + section leaves)
 * `unpin` is the raw progress at which the sticky stage lets go.
 */
function phases(progress, unpin) {
  const u = Math.min(0.99, Math.max(0.01, unpin));
  return {
    pinned: clamp01(progress / u),
    exit: clamp01((progress - u) / (1 - u)),
  };
}

function pose(progress, index, fit, exitY, unpin) {
  const { pinned, exit } = phases(progress, unpin);

  // Enter timings are relative to the pinned phase only.
  const enterStart = 0.06 + index * 0.1;
  const enterEnd = enterStart + 0.24;
  const enterT = segment(pinned, enterStart, enterEnd);

  const from = ENTER[index];
  const settled = SETTLED[index];
  const x = settled.x * fit;
  const y = settled.y;
  const rotation = settled.r;

  if (exit > 0) {
    const exitT = segment(exit, 0, EXIT_TRAVEL);
    return {
      x: lerp(x, EXIT_X[index], exitT),
      y: lerp(y, exitY, exitT),
      r: lerp(rotation, EXIT_R[index], exitT),
      scale: lerp(fit, fit * 0.4, exitT),
      opacity: lerp(1, 0.9, exitT),
      line: 1,
      z: 40 + index,
    };
  }

  return {
    x: lerp(from.x, x, enterT),
    y: lerp(from.y, y, enterT),
    r: lerp(from.r, rotation, enterT),
    scale: lerp(fit * 0.6, fit, enterT),
    opacity: enterT,
    line: segment(pinned, enterEnd - 0.05, enterEnd + 0.04),
    z: 20 - Math.abs(index - 2),
  };
}

function useStageFit(sectionRef) {
  const fit = useMotionValue(1);
  const exitY = useMotionValue(360);
  const unpin = useMotionValue(0.7);

  useEffect(() => {
    const measure = () => {
      // 510px offset + 136px half card + rotation slack, kept 32px inside the viewport.
      const room = window.innerWidth / 2 - 32;
      fit.set(Math.min(1, Math.max(0.42, room / 675)));
      // How far the cards fall inside the stage (stack lands near the stage bottom).
      exitY.set(window.innerHeight * 0.38);

      // The sticky stage lets go when the scroll distance reaches (sectionHeight - viewport).
      // With the scroll range ending when the section fully leaves, that is a fraction of:
      const el = sectionRef.current;
      if (el && el.offsetHeight > 0) {
        unpin.set((el.offsetHeight - window.innerHeight) / el.offsetHeight);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [fit, exitY, unpin, sectionRef]);

  return { fit, exitY, unpin };
}

function CardFace({ card, index, line, idle = false }) {
  const number = card.number || String(index + 1).padStart(2, "0");

  return (
    <div
      className={`${idle ? "why-idle " : ""
        }relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#0c0c0e] select-none [backface-visibility:hidden] [transform:translateZ(0)] antialiased`}
    >
      {/* Top Number */}
      <span className="absolute left-6 top-5 z-20 font-sans text-[22px] font-normal tracking-tight text-white/90">
        {number}
      </span>

      {/* Visual Artwork Container */}
      <div className="relative h-[210px] w-full overflow-hidden">
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(min-width: 768px) 560px, 320px"
          quality={90}
          decoding="async"
          className="pointer-events-none object-cover object-center"
          priority
        />
        {/* Soft bottom vignette into card body */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0c0c0e] to-transparent" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 pb-6 pt-1">
        <div>
          <h3 className="font-sans text-[22px] font-medium leading-[1.18] tracking-tight text-white">
            {card.title}
          </h3>
          <p className="mt-2 text-[13.5px] font-normal leading-[1.55] text-zinc-400">
            {card.copy}
          </p>
        </div>

        {/* Bottom Accent Bar */}
        <div className="mt-4">
          <div className="h-[2.5px] w-10 overflow-hidden rounded-full">
            {line ? (
              <motion.div
                style={{ scaleX: line }}
                className="h-full w-full origin-left bg-gradient-to-r from-[#ff551f] via-[#ff551f]/90 to-transparent"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-[#ff551f] via-[#ff551f]/90 to-transparent" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ id }) {
  return (
    <>
      <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.28em] text-[#ff4d1a]">
        Why {BRAND_NAME}
      </p>
      <h2
        id={id}
        className="font-sans text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal leading-[1.02] tracking-tight text-white"
      >
        Built around the drive.
      </h2>
    </>
  );
}

function ScatterCard({ card, index, progress, fit, exitY, unpin }) {
  const deps = [progress, fit, exitY, unpin];
  const x = useTransform(deps, ([p, f, ey, u]) => pose(p, index, f, ey, u).x);
  const y = useTransform(deps, ([p, f, ey, u]) => pose(p, index, f, ey, u).y);
  const rotate = useTransform(deps, ([p, f, ey, u]) => pose(p, index, f, ey, u).r);
  const scale = useTransform(deps, ([p, f, ey, u]) => pose(p, index, f, ey, u).scale);
  const opacity = useTransform(deps, ([p, f, ey, u]) => pose(p, index, f, ey, u).opacity);
  const line = useTransform(deps, ([p, f, ey, u]) => pose(p, index, f, ey, u).line);
  const zIndex = useTransform(deps, ([p, f, ey, u]) => pose(p, index, f, ey, u).z);

  const isFeatured = card.featured;

  return (
    <motion.article
      style={{
        x,
        y,
        rotate,
        scale,
        opacity,
        zIndex,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
      className={`absolute left-1/2 top-1/2 h-[425px] w-[272px] -ml-[136px] -mt-[212.5px] overflow-hidden rounded-[22px] transition-[box-shadow,border-color] duration-300 [backface-visibility:hidden] [transform:translateZ(0)] antialiased ${isFeatured
          ? "border-[1.5px] border-[#ff551f] shadow-[0_0_30px_rgba(255,85,31,0.35),0_20px_45px_rgba(0,0,0,0.85)]"
          : "border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_18px_36px_rgba(0,0,0,0.7)]"
        }`}
    >
      <CardFace card={card} index={index} line={line} idle />
    </motion.article>
  );
}

function PinnedWhy() {
  const ref = useRef(null);
  // "end start": progress runs until the section has completely left the viewport,
  // so the exit can overlap with the stage scrolling up.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const { fit, exitY, unpin } = useStageFit(ref);

  // Title: slides in at the start of the pinned phase, fades early in the exit.
  const titleOpacity = useTransform([scrollYProgress, unpin], ([p, u]) => {
    const { exit } = phases(p, u);
    return 1 - clamp01(exit / 0.35);
  });
  const titleY = useTransform([scrollYProgress, unpin], ([p, u]) => {
    const { pinned, exit } = phases(p, u);
    return lerp(24, 0, clamp01(pinned / 0.12)) - 30 * clamp01(exit / 0.35);
  });

  return (
    <section
      ref={ref}
      aria-labelledby="why-choose-pinned"
      className="relative z-20 hidden h-[340vh] rounded-t-[2.5rem] bg-[#050505] md:motion-safe:block"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="pointer-events-none absolute inset-x-0 top-[9%] z-30 px-6 text-center"
        >
          <SectionTitle id="why-choose-pinned" />
        </motion.div>

        {/* Ambient floor glow under Card 03 */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[215px] z-10 h-[120px] w-[360px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,85,31,0.48)_0%,rgba(255,85,31,0.18)_42%,transparent_72%)] blur-2xl"
          aria-hidden="true"
        />

        {CARDS.map((card, index) => (
          <ScatterCard
            key={card.title}
            card={card}
            index={index}
            progress={scrollYProgress}
            fit={fit}
            exitY={exitY}
            unpin={unpin}
          />
        ))}
      </div>
    </section>
  );
}

function StackedWhy() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="why-choose-stack"
      className="relative z-20 rounded-t-[2.5rem] bg-[#050505] px-4 py-20 md:motion-safe:hidden"
    >
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <SectionTitle id="why-choose-stack" />
      </div>
      <div className="mx-auto flex w-full max-w-[340px] flex-col gap-6">
        {CARDS.map((card, index) => (
          <motion.article
            key={card.title}
            initial={reduce ? false : { opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.05, ease: EASE }}
            className={`relative h-[425px] w-full overflow-hidden rounded-[22px] ${card.featured
                ? "border-[1.5px] border-[#ff551f] shadow-[0_0_30px_rgba(255,85,31,0.35),0_20px_45px_rgba(0,0,0,0.85)]"
                : "border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_18px_36px_rgba(0,0,0,0.7)]"
              }`}
          >
            <CardFace card={card} index={index} />
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default function WhyChoose() {
  return (
    <MotionConfig reducedMotion="user">
      <PinnedWhy />
      <StackedWhy />
    </MotionConfig>
  );
}