"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import CarImage from "@/components/car-image";
import { faqItems } from "@/lib/data";

const MARQUEE_ITEMS = Array.from({ length: 12 }, () => "FAQ");

export default function FaqSection() {
  const sectionRef = useRef(null);
  const [openItem, setOpenItem] = useState("item-0");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // L0: Background glow blobs
  const blobAYDesktop = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const blobBYDesktop = useTransform(scrollYProgress, [0, 1], ["10%", "-20%"]);
  const blobBXDesktop = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const blobAYMobile = useTransform(scrollYProgress, [0, 1], ["-7.5%", "7.5%"]);
  const blobBYMobile = useTransform(scrollYProgress, [0, 1], ["5%", "-10%"]);
  const blobBXMobile = useTransform(scrollYProgress, [0, 1], ["-2.5%", "2.5%"]);

  // L1: Outline marquee bands
  const topMarqueeXDesktop = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const bottomMarqueeXDesktop = useTransform(scrollYProgress, [0, 1], ["-25%", "0%"]);

  const topMarqueeXMobile = useTransform(scrollYProgress, [0, 1], ["0%", "-12.5%"]);
  const bottomMarqueeXMobile = useTransform(scrollYProgress, [0, 1], ["-12.5%", "0%"]);

  // L2: Car photo
  const carPhotoY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // L3: Left column "answered." drift
  const answeredX = useTransform(scrollYProgress, [0, 1], [-12, 12]);

  // L4: Right column list wrapper
  const listWrapperY = useTransform(scrollYProgress, [0, 1], [70, -50]);

  // L5: Numbers drift inside rows
  const numberYDesktop = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const numberYMobile = useTransform(scrollYProgress, [0, 1], [5, -5]);

  // L6: Contact card
  const cardY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const cardRotate = useTransform(scrollYProgress, [0, 1], [-1.5, 1.5]);

  // Motion resolutions based on reduced motion & viewport
  const effectiveBlobAY = shouldReduceMotion ? "0%" : isMobile ? blobAYMobile : blobAYDesktop;
  const effectiveBlobBY = shouldReduceMotion ? "0%" : isMobile ? blobBYMobile : blobBYDesktop;
  const effectiveBlobBX = shouldReduceMotion ? "0%" : isMobile ? blobBXMobile : blobBXDesktop;

  const effectiveTopMarqueeX = shouldReduceMotion ? "0%" : isMobile ? topMarqueeXMobile : topMarqueeXDesktop;
  const effectiveBottomMarqueeX = shouldReduceMotion ? "0%" : isMobile ? bottomMarqueeXMobile : bottomMarqueeXDesktop;

  const effectiveCarPhotoY = shouldReduceMotion ? "0%" : carPhotoY;
  const effectiveAnsweredX = shouldReduceMotion || isMobile ? 0 : answeredX;
  const effectiveListWrapperY = shouldReduceMotion || isMobile ? 0 : listWrapperY;
  const effectiveNumberY = shouldReduceMotion ? 0 : isMobile ? numberYMobile : numberYDesktop;
  const effectiveCardY = shouldReduceMotion || isMobile ? 0 : cardY;
  const effectiveCardRotate = shouldReduceMotion || isMobile ? 0 : cardRotate;

  const activeIndex = openItem && openItem.startsWith("item-")
    ? parseInt(openItem.replace("item-", ""), 10)
    : -1;
  const counterCurrent = activeIndex >= 0 ? String(activeIndex + 1).padStart(2, "0") : "--";

  const handleListMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      aria-labelledby="faq-title"
      className="relative z-20 overflow-hidden rounded-b-[32px] border-b border-white/10 bg-black md:rounded-b-[56px]"
    >
      {/* L0: Background Glow Blobs */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
        <motion.div
          style={{ y: effectiveBlobAY }}
          className="absolute -top-[10%] -left-[10%] h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle,rgba(255,77,26,0.15)_0%,transparent_70%)] blur-3xl"
        />
        <motion.div
          style={{ y: effectiveBlobBY, x: effectiveBlobBX }}
          className="absolute -bottom-[10%] -right-[10%] h-[42vw] w-[42vw] rounded-full bg-[radial-gradient(circle,rgba(255,77,26,0.15)_0%,transparent_70%)] blur-3xl"
        />
      </div>

      {/* L1: Top Outline Marquee Band */}
      <div className="w-full overflow-hidden py-10 md:py-16 select-none pointer-events-none" aria-hidden="true">
        <motion.div
          style={{ x: effectiveTopMarqueeX }}
          className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform"
        >
          {MARQUEE_ITEMS.map((item, idx) => (
            <span
              key={`top-${idx}`}
              className="font-display text-[clamp(5rem,14vw,13rem)] leading-none text-transparent"
              style={{
                WebkitTextStroke: "1px rgba(255,255,255,0.10)",
              }}
            >
              {item} &nbsp;—&nbsp;
            </span>
          ))}
        </motion.div>
      </div>

      {/* Main Grid: Left Column + Right Column */}
      <div className="relative px-[8vw] pb-10 md:pb-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* LEFT COLUMN: Sticky */}
          <div className="h-fit lg:sticky lg:top-28">
            <div className="flex flex-col gap-6 md:gap-8">
              {/* Eyebrow - Rule 1: Explicit font size text-xs, uppercase, tracking-[0.3em], text-[#ff4d1a], one line */}
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff4d1a] leading-none whitespace-nowrap">
                FAQ
              </p>

              {/* Title: Questions, answered. */}
              <h2
                id="faq-title"
                className="font-display text-[clamp(2.75rem,5.5vw,5rem)] leading-[0.9] text-white"
              >
                <span className="block overflow-hidden py-0.5">
                  <motion.span
                    initial={{ y: "100%" }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="block"
                  >
                    Questions,
                  </motion.span>
                </span>
                <span className="block overflow-hidden py-0.5">
                  <motion.span
                    initial={{ y: "100%" }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="block"
                  >
                    {/* L3: answered. drifts */}
                    <motion.span
                      style={{ x: effectiveAnsweredX, display: "inline-block" }}
                      className="italic text-[#ff4d1a]"
                    >
                      answered.
                    </motion.span>
                  </motion.span>
                </span>
              </h2>

              {/* Subtext unchanged */}
              <p className="max-w-sm text-base leading-relaxed text-white/60">
                Booking, photo search, saving a car, and what happens after you
                reserve a drive.
              </p>

              {/* Counter: "01 / 08" */}
              <div
                className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-white/50"
                aria-label={`Question ${counterCurrent} of 08`}
              >
                <span className="font-semibold text-[#ff4d1a]">{counterCurrent}</span>
                <span>/</span>
                <span>08</span>
              </div>

              {/* L6: Contact Card */}
              <motion.div
                style={{ y: effectiveCardY, rotate: effectiveCardRotate }}
                className="relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-[0_20px_50px_rgba(255,77,26,0.12)] backdrop-blur-md"
              >
                {/* Rule 1: Card label text-[11px], uppercase, tracking-[0.25em], text-[#ff4d1a], one line */}
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#ff4d1a] leading-none whitespace-nowrap">
                  Still have questions?
                </span>

                {/* One line of copy */}
                <p className="text-sm leading-normal text-white/65">
                  Book a drive and we&apos;ll walk you through it in person.
                </p>

                {/* Two buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/cars"
                    className="group/btn relative inline-flex h-11 shrink-0 -skew-x-[20deg] items-center justify-center rounded-lg bg-[#ff4d1a] px-5 text-white shadow-[0_4px_24px_rgba(255,77,26,0.4)] transition-all duration-300 hover:bg-[#ff5a2b] hover:shadow-[0_6px_32px_rgba(255,77,26,0.65)] active:scale-95"
                  >
                    <span className="inline-flex skew-x-[20deg] items-center text-xs font-bold tracking-wide sm:text-sm">
                      Book a test drive
                    </span>
                  </Link>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-white/20 bg-transparent px-5 text-xs font-medium text-white/85 hover:border-white/40 hover:bg-white/10 hover:text-white sm:text-sm"
                  >
                    <Link href="/cars">Browse cars</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN: L4 List Wrapper */}
          <motion.div
            style={{ y: effectiveListWrapperY }}
            onMouseMove={handleListMouseMove}
            className="group/list relative rounded-3xl"
          >
            {/* Spotlight overlay following mouse */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 hidden rounded-3xl opacity-0 transition-opacity duration-300 group-hover/list:opacity-100 md:block"
              style={{
                background:
                  "radial-gradient(400px circle at var(--mx, -500px) var(--my, -500px), rgba(255,77,26,0.08), transparent 70%)",
              }}
            />

            {/* L2: Car photo background */}
            <motion.div
              style={{ y: effectiveCarPhotoY }}
              className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-[0.10] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"
              aria-hidden="true"
            >
              <CarImage
                src="/hero-last-frame.jpg"
                alt=""
                fill
                quality={90}
                className="object-cover object-center"
              />
            </motion.div>

            {/* shadcn Accordion */}
            <Accordion
              type="single"
              collapsible
              value={openItem}
              onValueChange={setOpenItem}
              className="w-full"
            >
              {faqItems.map((item, index) => {
                const itemValue = `item-${index}`;
                return (
                  <motion.div
                    key={item.question}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <AccordionItem
                      value={itemValue}
                      className="group relative rounded-2xl border-b border-white/10 px-3 transition-all duration-200 sm:px-6 group-data-[state=closed]:hover:translate-x-1.5 md:group-data-[state=closed]:hover:translate-x-2"
                    >
                      {/* Open State: 2px Orange Left Rail */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 top-3 bottom-3 w-[2.5px] rounded-full bg-[#ff4d1a] origin-top transition-transform duration-300 scale-y-0 group-data-[state=open]:scale-y-100"
                      />

                      {/* Open State: Subtle Orange Horizontal Gradient Background */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-[#ff4d1a]/15 via-[#ff4d1a]/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-data-[state=open]:opacity-100"
                      />

                      {/* Trigger: Fixed Columns [Number Question Icon] */}
                      <AccordionTrigger className="cursor-pointer py-6 text-left hover:no-underline focus-visible:ring-2 focus-visible:ring-[#ff4d1a]/70 rounded-xl [&[data-slot=accordion-trigger]>svg:last-child]:hidden">
                        <div className="grid w-full grid-cols-[3rem_1fr_2.75rem] items-center gap-4 lg:grid-cols-[4.5rem_1fr_2.75rem]">
                          {/* L5: Number Column */}
                          <motion.span
                            style={{
                              y: effectiveNumberY,
                              WebkitTextStroke: "1px rgba(255,255,255,0.35)",
                            }}
                            className="font-display text-4xl lg:text-5xl tabular-nums text-transparent transition-all duration-300 group-data-[state=open]:text-[#ff4d1a] group-data-[state=open]:[text-shadow:0_0_24px_rgba(255,77,26,0.55)] group-data-[state=open]:[-webkit-text-stroke:0px] group-hover:[-webkit-text-stroke-color:#ff4d1a]"
                          >
                            {String(index + 1).padStart(2, "0")}
                          </motion.span>

                          {/* Question Text */}
                          <span className="font-display text-lg sm:text-xl lg:text-2xl leading-tight text-white/85 transition-colors duration-200 group-hover:text-white group-data-[state=open]:text-white">
                            {item.question}
                          </span>

                          {/* 44px Icon Circle */}
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 transition-all duration-300 group-hover:border-[#ff4d1a]/60 group-data-[state=open]:border-[#ff4d1a] group-data-[state=open]:bg-[#ff4d1a] group-data-[state=open]:shadow-[0_0_18px_rgba(255,77,26,0.6)]">
                            <Plus className="size-5 text-white/70 transition-transform duration-300 group-hover:text-white group-data-[state=open]:rotate-45 group-data-[state=open]:text-white" />
                          </div>
                        </div>
                      </AccordionTrigger>

                      {/* Answer Content */}
                      <AccordionContent className="pb-8 pl-[4rem] pr-4 text-base sm:pr-8 sm:text-lg lg:pl-[5.5rem] lg:pr-12 leading-relaxed text-white/65 max-w-xl transition-opacity duration-300">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>
          </motion.div>
        </div>
      </div>

      {/* L1: Bottom Outline Marquee Band */}
      <div className="w-full overflow-hidden py-10 md:py-16 select-none pointer-events-none" aria-hidden="true">
        <motion.div
          style={{ x: effectiveBottomMarqueeX }}
          className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform"
        >
          {MARQUEE_ITEMS.map((item, idx) => (
            <span
              key={`bottom-${idx}`}
              className="font-display text-[clamp(5rem,14vw,13rem)] leading-none text-transparent"
              style={{
                WebkitTextStroke: "1px rgba(255,255,255,0.10)",
              }}
            >
              {item} &nbsp;—&nbsp;
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
