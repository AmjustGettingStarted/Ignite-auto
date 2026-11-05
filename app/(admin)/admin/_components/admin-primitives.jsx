"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Premium Glass Card Primitive
 * - Backdrop blur + saturation
 * - Subtle inner highlight gradient along top edge
 * - Soft dark depth shadow with subtle ambient hover
 * - 22px border radius
 */
export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  hero = false,
  highlight = true,
  ...props
}) {
  return (
    <div
      className={cn(
        "group relative rounded-[22px] p-6 text-[#F5F1EE] backdrop-blur-[24px] backdrop-saturate-[140%]",
        hero
          ? "border border-[#FF6A1F]/35 bg-gradient-to-br from-[#1E1714]/90 via-[#161210]/90 to-[#110D0C]/90 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7),0_0_40px_rgba(255,106,31,0.08)]"
          : "border border-white/[0.08] bg-[#14100E]/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.65)]",
        hover &&
          "transition-all duration-300 ease-out hover:-translate-y-[2px] hover:border-white/[0.14] hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7),0_0_30px_rgba(255,106,31,0.06)]",
        glow &&
          "border-[#FF6A1F]/30 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6),0_0_30px_rgba(255,106,31,0.12)]",
        className
      )}
      {...props}
    >
      {/* Top-edge luxury hairline highlight */}
      {highlight && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-[1px] rounded-t-[22px] bg-gradient-to-r from-transparent to-transparent",
            hero ? "via-[#FF6A1F]/40" : "via-white/20"
          )}
        />
      )}
      {children}
    </div>
  );
}

/**
 * Animated Metric Display
 * - Big confident numeral
 * - Tabular numbers with optional smooth count-up
 */
export function Metric({ value, decimals = 0, suffix = "", className }) {
  const [shown, setShown] = useState(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return typeof value === "number" && !isNaN(value) ? value : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (typeof value !== "number" || isNaN(value)) {
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      const id = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(id);
    }

    const start = performance.now();
    let frame = 0;
    const duration = 750;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      // Clean easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(value * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  if (typeof value !== "number" || isNaN(value)) {
    return (
      <span className={cn("tabular-nums font-sans font-semibold tracking-tight", className)}>
        {value ?? "—"}
      </span>
    );
  }

  return (
    <span className={cn("tabular-nums font-sans font-semibold tracking-tight", className)}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/**
 * Segmented Pill Control
 * - Filled accent for active item
 * - Soft glass hover for inactive
 */
export function SegmentedControl({ items, value, onChange, className }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-md",
        className
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A1F]",
              active
                ? "bg-[#FF6A1F] text-white shadow-[0_2px_12px_rgba(255,106,31,0.35)]"
                : "text-[#A39A94] hover:bg-white/[0.04] hover:text-[#F5F1EE]"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Semantic Status Chip
 * - Muted semantic palette (never loud or decorative)
 */
export function StatusChip({ status, label, className }) {
  const norm = (status || "").toUpperCase();

  const styles = {
    AVAILABLE:
      "bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20",
    CONFIRMED:
      "bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20",
    SOLD:
      "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20",
    COMPLETED:
      "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20",
    PENDING:
      "bg-[#F5A524]/10 text-[#F5A524] border-[#F5A524]/20",
    UNAVAILABLE:
      "bg-[#F5A524]/10 text-[#F5A524] border-[#F5A524]/20",
    CANCELLED:
      "bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20",
    NO_SHOW:
      "bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20",
  };

  const currentStyle =
    styles[norm] || "bg-white/[0.05] text-[#A39A94] border-white/[0.08]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        currentStyle,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label || (status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace("_", " ") : "—")}
    </span>
  );
}

/**
 * Custom Recharts Tooltip Card
 */
export function AdminChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-white/[0.12] bg-[#14100E]/95 px-3.5 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      {label && (
        <p className="mb-1 text-[11px] font-medium tracking-wider text-[#A39A94]">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#A39A94]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.stroke || "#FF6A1F" }}
              />
              {entry.name || "Value"}
            </span>
            <span className="font-mono font-medium text-[#F5F1EE]">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
