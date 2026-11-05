"use client";

import React, { useState, useEffect, useRef } from "react";
import HomeSearch from "@/components/home-search";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const HERO_POSTER = "/hero-last-frame.jpg";
const HERO_VIDEO = "/hero/car_reveal.mp4";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function prefersStaticHero() {
  if (typeof window === "undefined") return false;
  const reducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  )?.matches;
  const saveData =
    navigator.connection?.saveData === true ||
    navigator.connection?.effectiveType === "2g" ||
    navigator.connection?.effectiveType === "slow-2g";
  return Boolean(reducedMotion || saveData);
}

export default function HeroSection({ children }) {
  const [isMounted, setIsMounted] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(800);
  const videoRef = useRef(null);
  const endedRef = useRef(false);

  const { scrollY } = useScroll();
  // The next section slides over the pinned hero during the first viewport of scroll.
  const contentY = useTransform(scrollY, [0, viewportHeight], [0, -90]);
  const overlayOpacity = useTransform(scrollY, [0, viewportHeight], [0, 0.6]);

  useEffect(() => {
    setIsMounted(true);

    const measure = () => setViewportHeight(window.innerHeight || 800);
    measure();
    window.addEventListener("resize", measure);

    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem("hero_intro_played") === "true";
    } catch {}

    if (alreadyPlayed || prefersStaticHero()) {
      endedRef.current = true;
      setUseVideo(false);
      setVideoEnded(true);
      setHasCheckedSession(true);
      window.dispatchEvent(new CustomEvent("hero-video-ended"));
    } else {
      setHasCheckedSession(true);
    }

    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!isMounted || !useVideo) return;
    const video = videoRef.current;
    if (!video) return;
    const start = () => {
      if (endedRef.current) return;
      video.load();
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 400);
    return () => window.clearTimeout(id);
  }, [isMounted, useVideo]);

  const finishIntro = ({ failed = false } = {}) => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (failed) setVideoFailed(true);
    setVideoEnded(true);
    try {
      sessionStorage.setItem("hero_intro_played", "true");
    } catch {}
    window.dispatchEvent(new CustomEvent("hero-video-ended"));
  };

  const skipIntro = () => {
    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
        if (Number.isFinite(video.duration)) {
          video.currentTime = Math.max(video.duration - 0.05, 0);
        }
      } catch {}
    }
    finishIntro();
  };

  const handleVideoCanPlay = () => {
    if (endedRef.current) return;
    videoRef.current?.play().catch(() => finishIntro({ failed: true }));
  };

  const handleVideoEnded = () => {
    // Leave the element mounted and paused on its last frame so nothing flashes.
    videoRef.current?.pause();
    finishIntro();
  };

  return (
    <section
      className="sticky top-0 z-0 flex h-[100svh] w-full flex-col items-center justify-end overflow-hidden pb-10 sm:pb-14"
      aria-label="Hero"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={HERO_POSTER}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={90}
          decoding="async"
          className="object-cover object-center"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

        {isMounted && useVideo && (
          <video
            ref={videoRef}
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            muted
            playsInline
            controls={false}
            loop={false}
            preload="none"
            onCanPlay={handleVideoCanPlay}
            onEnded={handleVideoEnded}
            onError={() => finishIntro({ failed: true })}
            className={`absolute inset-0 h-full w-full object-cover object-center ${
              videoFailed ? "opacity-0" : "opacity-100"
            }`}
          />
        )}

        <motion.div
          aria-hidden="true"
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-[#050505]"
        />
      </div>

      {!videoEnded && hasCheckedSession && (
        <button
          type="button"
          onClick={skipIntro}
          className="absolute right-6 top-6 z-30 cursor-pointer rounded-full border border-[#ff4d1a]/30 bg-black/50 px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md transition-all duration-200 hover:bg-black/80 hover:text-white"
        >
          Skip Intro &rarr;
        </button>
      )}

      <motion.div style={{ y: contentY }} className="relative z-10 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={videoEnded ? "visible" : "hidden"}
          className="mx-auto w-full max-w-6xl px-4 text-center"
        >
          {children ? (
            children
          ) : (
            <>
              <motion.h1
                variants={itemVariants}
                className="relative mb-16 flex select-none flex-col items-center justify-center gap-4 text-center font-[family-name:var(--font-trento)] font-normal uppercase tracking-normal text-white"
              >
                <span className="block -translate-y-[10px] text-[6px] sm:-translate-y-[14px] sm:text-[8px] md:text-[10px] lg:text-[12px]">
                  WHERE LUXURY MEETS
                </span>
                <span className="block translate-y-[10px] text-[6px] sm:translate-y-[14px] sm:text-[8px] md:text-[10px] lg:text-[12px]">
                  PERFORMANCE
                </span>
              </motion.h1>

              <motion.div
                variants={itemVariants}
                className="mx-auto mb-6 max-w-2xl"
              >
                <HomeSearch />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center gap-6 text-xs text-slate-50/50 sm:text-sm"
              >
                <Link
                  href="/cars"
                  className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest underline-offset-4 transition-colors duration-200 hover:text-[#ff4d1a] hover:underline"
                >
                  Browse full inventory <MoveRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
