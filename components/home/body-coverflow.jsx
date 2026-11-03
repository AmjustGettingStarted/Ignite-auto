"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  animate,
  motion,
  MotionConfig,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { stiffness: 120, damping: 28, restDelta: 0.001 };

const DEFAULT_BODY_STYLES = [
  { name: "Hatchback", fallbackCount: 2, image: "/body/hatchback-fullbleed-v1.webp" },
  { name: "Sedan", fallbackCount: 1, image: "/body/sedan-cinematic.webp" },
  {
    name: "Supercar / Hypercar",
    filterName: "Supercar",
    fallbackCount: 4,
    image: "/body/supercar-cinematic.webp",
  },
  { name: "SUV", fallbackCount: 1, image: "/body/suv-cinematic.webp" },
  { name: "Convertible", fallbackCount: 4, image: "/body/convertible-cinematic.webp" },
  { name: "Coupe", fallbackCount: 14, image: "/body/coupe-cinematic.webp" },
];

function getCtaLabel(name) {
  const lower = name.toLowerCase();
  if (lower.includes("hatchback")) return "EXPLORE HATCHBACKS";
  if (lower.includes("sedan")) return "EXPLORE SEDANS";
  if (lower.includes("supercar")) return "EXPLORE SUPERCARS";
  if (lower.includes("suv")) return "EXPLORE SUVS";
  if (lower.includes("convertible")) return "EXPLORE CONVERTIBLES";
  if (lower.includes("coupe")) return "EXPLORE COUPES";
  return `EXPLORE ${name.toUpperCase()}S`;
}

function wrapDistance(index, active, count) {
  if (count <= 1) return 0;
  const raw = index - active + count / 2;
  const wrapped = ((raw % count) + count) % count;
  return wrapped - count / 2;
}

function withCinematics(types) {
  const countMap = new Map();
  if (Array.isArray(types)) {
    for (const t of types) {
      if (t?.name) {
        countMap.set(t.name.trim().toLowerCase(), t.count);
      }
    }
  }

  return DEFAULT_BODY_STYLES.map((style, idx) => {
    const key = style.name.toLowerCase();
    let count = style.fallbackCount;
    for (const [dbKey, dbCount] of countMap.entries()) {
      if (key.includes(dbKey) || dbKey.includes(key)) {
        if (dbCount > 0) count = dbCount;
        break;
      }
    }
    return {
      number: String(idx + 1).padStart(2, "0"),
      name: style.name,
      filterName: style.filterName || style.name,
      count,
      image: style.image,
    };
  });
}

function useCoverStep() {
  const step = useMotionValue(290);

  useEffect(() => {
    const measure = () => {
      step.set(Math.min(300, Math.max(180, (window.innerWidth - 60) / 4.6)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [step]);

  return step;
}

function CoverHeader({ active, count, id }) {
  const [current, setCurrent] = useState(0);

  useMotionValueEvent(active, "change", (value) => {
    const next = ((Math.round(value) % count) + count) % count;
    setCurrent((c) => (c === next ? c : next));
  });

  const label = String(current + 1).padStart(2, "0");
  const total = String(count).padStart(2, "0");

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-8 sm:px-14 lg:px-20 select-none">
      <div>
        <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.28em] text-[#ff4d1a]">
          Body styles
        </p>
        <h2
          id={id}
          className="font-sans text-[clamp(2.2rem,4.8vw,4.5rem)] font-normal uppercase leading-[0.95] tracking-tight text-white"
        >
          Browse by Body Type
        </h2>
      </div>

      {/* Top-Right Progress Counter & Segmented Track matching mockup */}
      <div className="flex flex-col items-start md:items-end gap-2.5 pb-1">
        <p className="font-mono text-sm tracking-[0.25em] text-zinc-400">
          {label} / {total}
        </p>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: count }).map((_, i) => {
            const isActive = i === current;
            return (
              <div
                key={i}
                className={`h-[2px] transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-8 bg-[#ff551f] shadow-[0_0_8px_rgba(255,85,31,0.9)]"
                    : "w-6 bg-white/20"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CoverCard({ type, index, count, active, step, onSelect }) {
  const router = useRouter();
  const distance = useTransform([active, step], ([value]) => wrapDistance(index, value, count));
  const x = useTransform([active, step], ([value, stride]) => wrapDistance(index, value, count) * stride);
  const scale = useTransform(distance, (val) => 1.08 - Math.min(Math.abs(val), 3) * 0.1);
  const opacity = useTransform(distance, (val) => {
    const amount = Math.abs(val);
    if (amount > 3.2) return 0;
    return 1 - Math.min(amount, 3) * 0.15;
  });
  const rotateY = useTransform(distance, (val) => val * -2);
  const zIndex = useTransform(distance, (val) => Math.round(100 - Math.abs(val) * 10));

  // Thin orange accent border on active card, clean subtle border on inactive cards
  const borderColor = useTransform(distance, (val) =>
    Math.abs(val) < 0.5 ? "rgba(255, 85, 31, 0.85)" : "rgba(255, 255, 255, 0.12)"
  );
  const boxShadow = useTransform(distance, (val) =>
    Math.abs(val) < 0.5
      ? "0 0 22px rgba(255, 85, 31, 0.22), 0 16px 36px rgba(0, 0, 0, 0.75)"
      : "0 10px 25px rgba(0, 0, 0, 0.6)"
  );
  const dimOpacity = useTransform(distance, (val) => Math.min(0.35, Math.abs(val) * 0.25));
  const pointerEvents = useTransform(distance, (val) => (Math.abs(val) > 3.2 ? "none" : "auto"));

  // Opacity crossfade between active (top) and inactive (bottom) content
  const activeContentOpacity = useTransform(distance, (val) => {
    const d = Math.abs(val);
    if (d > 0.5) return 0;
    return Math.max(0, 1 - d / 0.5);
  });
  const inactiveContentOpacity = useTransform(distance, (val) => {
    const d = Math.abs(val);
    if (d < 0.35) return 0;
    return Math.min(1, (d - 0.35) / 0.35);
  });

  const number = type.number || String(index + 1).padStart(2, "0");

  function handleClick() {
    const dist = Math.abs(wrapDistance(index, active.get(), count));
    if (dist < 0.5) {
      router.push(`/cars?bodyType=${encodeURIComponent(type.filterName || type.name)}`);
    } else if (onSelect) {
      onSelect(index);
    }
  }

  const isSupercar = type.name.includes(" / ");

  const cardContent = (
    <>
      {/* Full-bleed background vehicle photograph */}
      <Image
        src={type.image}
        alt={type.name}
        fill
        sizes="320px"
        className="pointer-events-none object-cover object-center select-none"
        priority={index <= 4}
      />

      {/* Dim wash for side cards */}
      <motion.div
        style={{ opacity: dimOpacity }}
        className="pointer-events-none absolute inset-0 bg-black/40"
      />

      {/* Continuous full-bleed subtle vignette for text contrast with zero hard edges */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent via-40% to-black/70" />

      {/* ACTIVE LAYOUT: Displayed when card is in center focus */}
      <motion.div
        style={{ opacity: activeContentOpacity }}
        className="absolute inset-0 z-20 flex flex-col justify-between p-7 pointer-events-none"
      >
        {/* TOP: Category number, Title, Count with strong hierarchy */}
        <div>
          <span className="font-sans text-xl sm:text-2xl font-medium tracking-tight text-[#ff551f]">
            {number}
          </span>
          <h3 className="mt-1 font-sans text-[28px] sm:text-[32px] font-bold uppercase leading-[1.05] tracking-tight text-white">
            {isSupercar ? (
              <span className="block text-[21px] sm:text-[24px] leading-[1.1]">
                {type.name.split(" / ")[0]} /
                <br />
                {type.name.split(" / ")[1]}
              </span>
            ) : (
              type.name
            )}
          </h3>
          <p className="mt-2 text-sm sm:text-base font-normal text-zinc-400">
            {type.count} available
          </p>
        </div>

        {/* BOTTOM: Orange accent line & CTA (completely clear of the vehicle) */}
        <div className="group">
          {/* Thin solid orange accent line */}
          <div className="mb-3.5 h-[2px] w-12 rounded-full bg-[#ff551f]" />

          {/* CTA Link */}
          <Link
            href={`/cars?bodyType=${encodeURIComponent(type.filterName || type.name)}`}
            className="pointer-events-auto inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-medium tracking-[0.2em] text-white uppercase transition-colors hover:text-[#ff551f]"
            onClick={(e) => e.stopPropagation()}
            aria-label={getCtaLabel(type.name)}
          >
            <span>{getCtaLabel(type.name)}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff551f"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </motion.div>

      {/* INACTIVE LAYOUT (Bottom-Left): Displayed when card is on sides */}
      <motion.div
        style={{ opacity: inactiveContentOpacity }}
        className="absolute inset-0 z-20 flex flex-col justify-end p-7 pointer-events-none"
      >
        <span className="font-sans text-sm font-normal text-zinc-400">
          {number}
        </span>
        <h3
          className={`mt-1 font-sans font-semibold text-white tracking-tight ${
            isSupercar ? "text-[22px] leading-[1.1]" : "text-[26px] leading-[1.1]"
          }`}
        >
          {isSupercar ? (
            <>
              {type.name.split(" / ")[0]} /
              <br />
              {type.name.split(" / ")[1]}
            </>
          ) : (
            type.name
          )}
        </h3>
        <p className="mt-1.5 text-xs font-normal text-zinc-400">
          {type.count} available
        </p>

        {/* Circular white action button */}
        <div className="mt-4">
          <button
            type="button"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white/90 transition-all hover:border-white hover:text-white active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            aria-label={`Select ${type.name}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </motion.div>
    </>
  );

  const className =
    "absolute left-1/2 top-1/2 -ml-[140px] -mt-[245px] h-[490px] w-[280px] overflow-hidden rounded-[28px] border-[1.5px] bg-[#0d0d10] text-left cursor-pointer select-none";

  return (
    <motion.div
      style={{
        x,
        scale,
        opacity,
        rotateY,
        zIndex,
        borderColor,
        boxShadow,
        pointerEvents,
      }}
      className={className}
      onClick={handleClick}
    >
      {cardContent}
    </motion.div>
  );
}

function CoverStage({ deck, active, step, onSelect, dragLayer }) {
  return (
    <div className="relative h-[520px] w-full" style={{ perspective: 1400 }}>
      {/* Background warm radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[10%] h-[80%] bg-[radial-gradient(ellipse_50%_60%_at_50%_55%,rgba(255,85,31,0.18),transparent_70%)]"
      />
      {deck.map((type, index) => (
        <CoverCard
          key={`${type.name}-${index}`}
          type={type}
          index={index}
          count={deck.length}
          active={active}
          step={step}
          onSelect={onSelect}
        />
      ))}
      {dragLayer}
    </div>
  );
}

function PinnedCoverflow({ deck }) {
  const ref = useRef(null);
  const step = useCoverStep();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Map scroll progress through deck
  const raw = useTransform(scrollYProgress, [0, 1], [0, deck.length]);
  const active = useSpring(raw, SPRING);

  function onSelect(index) {
    const node = ref.current;
    if (!node) return;
    const start = window.scrollY + node.getBoundingClientRect().top;
    const travel = Math.max(node.offsetHeight - window.innerHeight, 1);
    window.scrollTo({
      top: start + (index / deck.length) * travel,
      behavior: "smooth",
    });
  }

  return (
    <section
      ref={ref}
      aria-labelledby="body-type-pinned"
      className="relative z-30 hidden h-[420vh] bg-[#050505] md:motion-safe:block"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-between overflow-hidden bg-[#050505] pt-12 pb-8 sm:pt-16 sm:pb-12">
        {/* Header */}
        <CoverHeader active={active} count={deck.length} id="body-type-pinned" />

        {/* Full-bleed coverflow stage with guaranteed height */}
        <div className="relative flex-1 flex items-center justify-center w-full min-h-[520px]">
          <CoverStage deck={deck} active={active} step={step} onSelect={onSelect} />
        </div>
      </div>
    </section>
  );
}

function SwipeCoverflow({ deck }) {
  const active = useMotionValue(0);
  const step = useCoverStep();
  const origin = useRef(0);

  return (
    <section
      aria-labelledby="body-type-swipe"
      className="relative z-30 bg-[#050505] py-14 md:motion-safe:hidden"
    >
      <CoverHeader active={active} count={deck.length} id="body-type-swipe" />

      <div className="relative mt-10 h-[520px]">
        <CoverStage
          deck={deck}
          active={active}
          step={step}
          dragLayer={
            <motion.div
              className="absolute inset-0 z-[110] cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0}
              dragMomentum={false}
              onDragStart={() => {
                origin.current = active.get();
              }}
              onDrag={(_event, info) => {
                const stride = step.get() || 300;
                active.set(origin.current - info.offset.x / stride);
              }}
              onDragEnd={(event, info) => {
                const stride = step.get() || 300;
                const moved = Math.abs(info.offset.x) >= 10;
                const shift = moved
                  ? -info.offset.x / stride
                  : Math.round(
                      (event.clientX -
                        event.currentTarget.getBoundingClientRect().left -
                        event.currentTarget.getBoundingClientRect().width / 2) /
                        stride
                    );
                animate(active, Math.round(origin.current + shift), {
                  duration: 0.45,
                  ease: EASE,
                });
              }}
            />
          }
        />
      </div>
    </section>
  );
}

export default function BodyCoverflow({ types }) {
  const deck = withCinematics(types);
  if (!deck.length) return null;

  return (
    <MotionConfig reducedMotion="user">
      <PinnedCoverflow deck={deck} />
      <SwipeCoverflow deck={deck} />
    </MotionConfig>
  );
}
