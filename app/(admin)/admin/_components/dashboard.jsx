"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  GlassCard,
  Metric,
  SegmentedControl,
  StatusChip,
  AdminChartTooltip,
} from "./admin-primitives";

const RANGES = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
];

function pct(part, total) {
  if (!total) return "0.0";
  return ((part / total) * 100).toFixed(1);
}

function sumWindow(series, key, start, length) {
  return series
    .slice(start, start + length)
    .reduce((total, row) => total + (row[key] || 0), 0);
}

function displayedConversion(testDrives) {
  if (!testDrives || testDrives.completed === 0) return null;
  const raw = Number(testDrives.conversionRate);
  if (!Number.isFinite(raw)) return null;
  return Math.min(100, Math.max(0, raw));
}

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString?.slice(0, 10) || "—";
  }
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Clean Delta Text
 * Shows plain colored text only when non-zero.
 * At 0% or no history, shows muted "No change" or nothing.
 */
function DeltaMetric({ current, previous }) {
  if (previous == null || current == null) {
    return null;
  }
  const change =
    previous === 0
      ? current > 0
        ? 100
        : 0
      : Math.round(((current - previous) / previous) * 100);

  if (change === 0) {
    return <span className="text-xs text-[#6B625C]">No change</span>;
  }

  const up = change > 0;
  return (
    <span
      className={`text-xs font-medium font-sans tabular-nums ${
        up ? "text-[#4ADE80]" : "text-[#F87171]"
      }`}
    >
      {up ? "+" : ""}
      {change}% vs prior 7d
    </span>
  );
}

/**
 * Calm Empty Chart State
 */
function EmptyChartState({ title, subtitle, onAction, actionLabel }) {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center gap-2.5 rounded-2xl border border-white/[0.05] bg-white/[0.01] px-6 text-center">
      {/* Subtle baseline chart placeholder curve */}
      <svg
        className="h-10 w-44 text-white/[0.08]"
        viewBox="0 0 176 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M0 32 C 40 32, 60 20, 90 24 C 120 28, 140 12, 176 16" />
      </svg>
      <p className="text-sm font-medium text-[#F5F1EE]">{title}</p>
      {subtitle ? (
        <p className="max-w-xs text-xs text-[#A39A94]">{subtitle}</p>
      ) : null}

      {onAction && actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 cursor-pointer rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-[#F5F1EE] hover:bg-white/[0.08] transition-colors"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function Dashboard({ initialData, analytics, drives }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [range, setRange] = useState(30);

  const failed = !initialData?.success;
  const cars = initialData?.data?.cars;
  const testDrives = initialData?.data?.testDrives;

  const series = useMemo(
    () => (analytics?.success ? analytics.data.series : []),
    [analytics]
  );
  const driveSeries = useMemo(
    () => (drives?.success ? drives.data.series : []),
    [drives]
  );

  const windowed = useMemo(
    () => driveSeries.slice(-range),
    [driveSeries, range]
  );
  const bookingsNow = sumWindow(
    driveSeries,
    "booked",
    Math.max(driveSeries.length - 7, 0),
    7
  );
  const bookingsPrev = sumWindow(
    driveSeries,
    "booked",
    Math.max(driveSeries.length - 14, 0),
    7
  );
  const carsNow = sumWindow(
    series,
    "cars",
    Math.max(series.length - 7, 0),
    7
  );
  const carsPrev = sumWindow(
    series,
    "cars",
    Math.max(series.length - 14, 0),
    7
  );
  const conversion = displayedConversion(testDrives);

  // Horizontal sorted by Make data with single hue opacity ramp
  const barData = useMemo(() => {
    const raw = (analytics?.success ? analytics.data.byMake : [])
      .slice(0, 8)
      .sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...raw.map((r) => r.count), 1);
    return raw.map((item, idx) => ({
      ...item,
      percentage: Math.round((item.count / maxCount) * 100),
      // Single hue opacity ramp
      opacity: Math.max(1 - idx * 0.1, 0.35),
    }));
  }, [analytics]);

  // Inventory Status donut with semantic palette
  const statusData = useMemo(() => {
    const palette = {
      AVAILABLE: { color: "#4ADE80", label: "Available" },
      SOLD: { color: "#60A5FA", label: "Sold" },
      UNAVAILABLE: { color: "#F5A524", label: "Unavailable" },
    };
    return (analytics?.data?.byStatus || []).map((row) => ({
      name: row.name,
      label: palette[row.name]?.label || row.name,
      value: row.count,
      color: palette[row.name]?.color || "#A39A94",
    }));
  }, [analytics]);

  const utilization = cars?.total
    ? Math.round(
        (((cars.sold || 0) + (cars.unavailable || 0)) / cars.total) * 100
      )
    : 0;

  const drivesEmpty =
    windowed.length === 0 ||
    windowed.every((row) => row.booked === 0 && row.completed === 0);

  if (failed) {
    return (
      <GlassCard className="max-w-md mx-auto text-center py-10">
        <h2 className="text-lg font-semibold text-[#F5F1EE]">
          Dashboard unavailable
        </h2>
        <p className="mt-2 text-sm text-[#A39A94]">
          {initialData?.error || "Failed to load showroom data."}
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page Title: ONE line, ONE style, tight tracking + Segmented Tab Control */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-[38px] tracking-[-0.02em] text-[#F5F1EE]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#A39A94]">
            Showroom performance at a glance
          </p>
        </div>

        {/* Overview vs Test Drives View Selector */}
        <SegmentedControl
          items={[
            { label: "Overview", value: "overview" },
            { label: "Test Drives", value: "test-drives" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Main Tab Views */}
      {activeTab === "overview" ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.04 },
            },
          }}
          className="space-y-5"
        >
          {/* ROW 1: FOUR KPI CARDS (NO ICONS!) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Cars */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <GlassCard className="flex flex-col justify-between h-full">
                <div>
                  <p className="text-sm font-medium text-[#A39A94]">
                    Total Cars
                  </p>
                  <p className="mt-2 text-[46px] sm:text-[48px] font-semibold leading-none tracking-tight text-[#F5F1EE]">
                    <Metric value={cars.total} />
                  </p>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.04] pt-2 text-[13px]">
                  <span className="text-[#A39A94]">
                    {cars.available} available · {cars.sold} sold
                  </span>
                  <DeltaMetric
                    current={analytics?.success ? carsNow : null}
                    previous={analytics?.success ? carsPrev : null}
                  />
                </div>
              </GlassCard>
            </motion.div>

            {/* Test Drives */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <GlassCard className="flex flex-col justify-between h-full">
                <div>
                  <p className="text-sm font-medium text-[#A39A94]">
                    Test Drives
                  </p>
                  <p className="mt-2 text-[46px] sm:text-[48px] font-semibold leading-none tracking-tight text-[#F5F1EE]">
                    <Metric value={testDrives.total} />
                  </p>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.04] pt-2 text-[13px]">
                  <span className="text-[#A39A94]">
                    {testDrives.pending} pending · {testDrives.confirmed} confirmed
                  </span>
                  <DeltaMetric
                    current={drives?.success ? bookingsNow : null}
                    previous={drives?.success ? bookingsPrev : null}
                  />
                </div>
              </GlassCard>
            </motion.div>

            {/* Conversion Rate */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <GlassCard className="flex flex-col justify-between h-full">
                <div>
                  <p className="text-sm font-medium text-[#A39A94]">
                    Conversion Rate
                  </p>
                  <p className="mt-2 text-[46px] sm:text-[48px] font-semibold leading-none tracking-tight text-[#F5F1EE]">
                    {conversion == null ? (
                      <span className="text-3xl text-[#6B625C]">—</span>
                    ) : (
                      <Metric value={conversion} decimals={1} suffix="%" />
                    )}
                  </p>
                </div>
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[13px] text-[#A39A94] mb-1.5">
                    <span>Sold after completed drive</span>
                    <span className="font-sans tabular-nums text-xs font-medium text-[#F5F1EE]">
                      {conversion != null ? `${conversion.toFixed(1)}%` : "0%"}
                    </span>
                  </div>
                  {/* Subtle Gradient Progress Bar */}
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${conversion || 0}%`,
                        background: "linear-gradient(90deg, #FF6A1F 0%, #F5A524 100%)",
                      }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Cars Sold */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <GlassCard className="flex flex-col justify-between h-full">
                <div>
                  <p className="text-sm font-medium text-[#A39A94]">
                    Cars Sold
                  </p>
                  <p className="mt-2 text-[46px] sm:text-[48px] font-semibold leading-none tracking-tight text-[#F5F1EE]">
                    <Metric value={cars.sold} />
                  </p>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/[0.04] pt-2 text-[13px]">
                  <span className="text-[#A39A94]">
                    {pct(cars.sold, cars.total)}% of inventory
                  </span>
                  <span className="text-xs text-[#6B625C]">Overall</span>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* ROW 2: TEST DRIVES OVER TIME (8 COLS) + INVENTORY STATUS (4 COLS) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Test Drives Over Time (8 cols) - Elevated Hero Chart Card */}
            <motion.div
              className="lg:col-span-8"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <GlassCard hero className="h-full flex flex-col justify-between">
                {/* Header with Title + 7d/30d/90d Segmented Controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
                  <div>
                    <h2 className="text-base font-semibold text-[#F5F1EE]">
                      Test Drives Over Time
                    </h2>
                    <p className="text-xs text-[#A39A94] mt-0.5">
                      Daily bookings and completed showroom drives
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Series Legend */}
                    <div className="hidden sm:flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-[#A39A94]">
                        <span className="h-2 w-2 rounded-full bg-[#FF6A1F]" />
                        Booked
                      </span>
                      <span className="flex items-center gap-1.5 text-[#A39A94]">
                        <span className="h-2 w-2 rounded-full bg-[#F5F1EE]" />
                        Completed
                      </span>
                    </div>

                    {/* Range Pill Selector */}
                    <SegmentedControl
                      items={RANGES}
                      value={range}
                      onChange={(val) => setRange(Number(val))}
                    />
                  </div>
                </div>

                {/* Area Chart Content */}
                <div className="mt-2 min-h-[280px] w-full">
                  {drivesEmpty ? (
                    <EmptyChartState
                      title="No test drives in this range"
                      subtitle="There were no appointments recorded for this timeframe."
                      actionLabel={range !== 90 ? "View last 90 days" : null}
                      onAction={range !== 90 ? () => setRange(90) : null}
                    />
                  ) : (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={windowed}
                          margin={{ top: 12, right: 6, left: -20, bottom: 0 }}
                        >
                          <defs>
                            {/* Booked Gradient Fill (30% to transparent) */}
                            <linearGradient
                              id="bookedGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#FF6A1F"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="100%"
                                stopColor="#FF6A1F"
                                stopOpacity={0}
                              />
                            </linearGradient>

                            {/* Completed Gradient Fill (15% to transparent) */}
                            <linearGradient
                              id="completedGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#F5F1EE"
                                stopOpacity={0.18}
                              />
                              <stop
                                offset="100%"
                                stopColor="#F5F1EE"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          {/* Dashed Horizontal Gridlines only at 6% Opacity */}
                          <CartesianGrid
                            vertical={false}
                            stroke="rgba(255, 255, 255, 0.06)"
                            strokeDasharray="4 4"
                          />

                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#6B625C", fontSize: 11 }}
                            minTickGap={28}
                            tickFormatter={(str) => {
                              try {
                                const parts = str.split("-");
                                return `${parts[1]}/${parts[2]}`;
                              } catch {
                                return str;
                              }
                            }}
                          />

                          <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#6B625C", fontSize: 11 }}
                          />

                          <Tooltip content={<AdminChartTooltip />} />

                          {/* Completed Series: Soft White Line */}
                          <Area
                            type="monotone"
                            dataKey="completed"
                            name="Completed"
                            stroke="#F5F1EE"
                            strokeWidth={1.75}
                            fill="url(#completedGradient)"
                            dot={false}
                            isAnimationActive={false}
                            activeDot={{
                              r: 4,
                              fill: "#F5F1EE",
                              stroke: "#14100E",
                              strokeWidth: 2,
                            }}
                          />

                          {/* Booked Series: Accent Orange Line */}
                          <Area
                            type="monotone"
                            dataKey="booked"
                            name="Booked"
                            stroke="#FF6A1F"
                            strokeWidth={2}
                            fill="url(#bookedGradient)"
                            dot={false}
                            isAnimationActive={false}
                            activeDot={{
                              r: 4,
                              fill: "#FF6A1F",
                              stroke: "#14100E",
                              strokeWidth: 2,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            {/* Inventory Status (4 cols) - Thinner Donut with Semantic Palette */}
            <motion.div
              className="lg:col-span-4"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <GlassCard className="h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#F5F1EE]">
                    Inventory Status
                  </h2>
                  <p className="text-xs text-[#A39A94] mt-0.5">
                    Vehicle distribution by state
                  </p>
                </div>

                <div className="relative my-auto py-2">
                  {statusData.length === 0 ||
                  statusData.every((row) => row.value === 0) ? (
                    <EmptyChartState title="No cars in showroom" />
                  ) : (
                    <>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip content={<AdminChartTooltip />} />
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              dataKey="value"
                              nameKey="label"
                              innerRadius={58}
                              outerRadius={74}
                              paddingAngle={4}
                              stroke="transparent"
                              cornerRadius={4}
                              isAnimationActive={false}
                            >
                              {statusData.map((row) => (
                                <Cell key={row.name} fill={row.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Center Confident Numeral & Caption */}
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-sans text-[34px] font-semibold tracking-tight tabular-nums text-[#F5F1EE]">
                          {cars.total}
                        </span>
                        <span className="text-[11px] uppercase tracking-wider text-[#6B625C]">
                          cars
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Structured Semantic Legend */}
                <div className="mt-2 divide-y divide-white/[0.04] border-t border-white/[0.06] pt-2">
                  {statusData.map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between py-1.5 text-xs"
                    >
                      <span className="flex items-center gap-2 text-[#A39A94]">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        {row.label}
                      </span>
                      <span className="font-sans tabular-nums font-medium text-[#F5F1EE]">
                        {row.value}{" "}
                        <span className="text-[#6B625C]">
                          ({pct(row.value, cars.total)}%)
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* ROW 3: INVENTORY BY MAKE (5 COLS) + UTILIZATION (3 COLS) + RECENT TEST DRIVES (4 COLS) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Inventory by Make (5 cols) - Horizontal Bars */}
            <motion.div
              className="lg:col-span-5"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <GlassCard className="h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#F5F1EE]">
                    Inventory by Make
                  </h2>
                  <p className="text-xs text-[#A39A94] mt-0.5">
                    Top manufacturers represented
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {barData.length === 0 ? (
                    <EmptyChartState title="No vehicle inventory recorded" />
                  ) : (
                    barData.map((row) => (
                      <div key={row.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#F5F1EE]">
                            {row.name}
                          </span>
                          <span className="font-sans tabular-nums text-xs text-[#A39A94]">
                            {row.count} {row.count === 1 ? "car" : "cars"}
                          </span>
                        </div>
                        {/* Horizontal Bar with Accent Hue Opacity */}
                        <div className="h-2 w-full rounded-full bg-white/[0.04] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${row.percentage}%`,
                              backgroundColor: `rgba(255, 106, 31, ${row.opacity})`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <p className="mt-4 pt-3 border-t border-white/[0.04] text-[11px] text-[#6B625C] text-right">
                  Sorted by volume
                </p>
              </GlassCard>
            </motion.div>

            {/* Utilization (3 cols) - Radial Gauge with Gradient Arc */}
            <motion.div
              className="lg:col-span-3"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <GlassCard className="h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#F5F1EE]">
                    Utilization
                  </h2>
                  <p className="text-xs text-[#A39A94] mt-0.5">
                    Portfolio deployment
                  </p>
                </div>

                <div className="relative my-auto py-2">
                  {cars.total === 0 ? (
                    <EmptyChartState title="No inventory to calculate" />
                  ) : (
                    <>
                      <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="74%"
                            outerRadius="100%"
                            data={[{ utilization, fill: "#FF6A1F" }]}
                            startAngle={90}
                            endAngle={-270}
                          >
                            <PolarAngleAxis
                              type="number"
                              domain={[0, 100]}
                              tick={false}
                            />
                            <RadialBar
                              dataKey="utilization"
                              background={{ fill: "rgba(255, 255, 255, 0.06)" }}
                              cornerRadius={10}
                              isAnimationActive={false}
                            />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Centered Numeral */}
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-sans tabular-nums text-[34px] font-semibold tracking-tight text-[#F5F1EE]">
                          {utilization}%
                        </span>
                        <span className="text-[11px] text-[#A39A94]">
                          Sold or unavailable
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Footnote Formula */}
                <p className="mt-2 text-center text-[11px] text-[#6B625C] border-t border-white/[0.04] pt-2">
                  (Sold + Unavailable) / Total inventory
                </p>
              </GlassCard>
            </motion.div>

            {/* Recent Test Drives (4 cols) - Clean Table with View All link */}
            <motion.div
              className="lg:col-span-4"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <GlassCard className="h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-[#F5F1EE]">
                      Recent Test Drives
                    </h2>
                    <p className="text-xs text-[#A39A94] mt-0.5">
                      Latest bookings activity
                    </p>
                  </div>
                  <Link
                    href="/admin/test-drives"
                    className="text-xs font-medium text-[#FF6A1F] hover:underline transition-colors"
                  >
                    View all
                  </Link>
                </div>

                <div className="mt-4 divide-y divide-white/[0.06]">
                  {(analytics?.data?.recent || []).length === 0 ? (
                    <EmptyChartState title="No bookings recorded yet" />
                  ) : (
                    (analytics.data.recent.slice(0, 5)).map((row) => (
                      <div
                        key={row.id}
                        className="flex h-14 items-center justify-between gap-3 px-1 hover:bg-white/[0.02] transition-colors rounded-lg"
                      >
                        {/* Customer Avatar Initial + Car / Name Details */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-[10px] font-semibold text-[#F5F1EE]">
                            {getInitials(row.customer)}
                          </div>
                          <div className="min-w-0">
                            <p
                              title={row.car}
                              className="truncate text-xs font-medium text-[#F5F1EE]"
                            >
                              {row.car}
                            </p>
                            <p className="truncate text-[11px] text-[#A39A94]">
                              {row.customer}
                            </p>
                          </div>
                        </div>

                        {/* Status Chip + Right-Aligned Date */}
                        <div className="flex shrink-0 items-center gap-3 text-right">
                          <StatusChip status={row.status} />
                          <span className="hidden font-sans tabular-nums text-[11px] text-[#6B625C] sm:inline">
                            {formatDate(row.date)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-2 text-right">
                  <span className="text-[11px] text-[#6B625C]">
                    Showing latest 5 appointments
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* TEST DRIVES SUB-VIEW */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-5"
        >
          {/* Status Breakdown KPI Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { label: "Total Bookings", value: testDrives.total, status: null },
              { label: "Pending", value: testDrives.pending, status: "PENDING" },
              { label: "Confirmed", value: testDrives.confirmed, status: "CONFIRMED" },
              { label: "Completed", value: testDrives.completed, status: "COMPLETED" },
              { label: "Cancelled", value: testDrives.cancelled, status: "CANCELLED" },
            ].map((kpi) => (
              <GlassCard key={kpi.label} className="p-5">
                <p className="text-xs font-medium text-[#A39A94]">{kpi.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[#F5F1EE] font-sans tabular-nums">
                  <Metric value={kpi.value} />
                </p>
                <div className="mt-3">
                  {kpi.status ? (
                    <StatusChip
                      status={kpi.status}
                      label={`${pct(kpi.value, testDrives.total)}% of total`}
                    />
                  ) : (
                    <span className="text-xs text-[#6B625C]">All-time</span>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Deep-Dive Conversion & Completion Card */}
          <GlassCard className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-[#F5F1EE]">
                Booking Pipeline Distribution
              </h2>
              <p className="text-xs text-[#A39A94] mt-1 max-w-2xl leading-relaxed">
                Overall completion rate stands at{" "}
                <span className="text-[#F5F1EE] font-medium">
                  {pct(testDrives.completed, testDrives.total)}%
                </span>
                . Conversion rate counts sold cars that had a completed drive,
                divided by total completed drives.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Pending", count: testDrives.pending, status: "PENDING", color: "#F5A524" },
                { label: "Confirmed", count: testDrives.confirmed, status: "CONFIRMED", color: "#4ADE80" },
                { label: "Completed", count: testDrives.completed, status: "COMPLETED", color: "#60A5FA" },
                { label: "Cancelled", count: testDrives.cancelled, status: "CANCELLED", color: "#F87171" },
                { label: "No Show", count: testDrives.noShow, status: "NO_SHOW", color: "#6B625C" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F5F1EE]">{item.label}</span>
                    <span className="font-sans tabular-nums text-[#A39A94]">
                      {item.count} ({pct(item.count, testDrives.total)}%)
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${testDrives.total ? (item.count / testDrives.total) * 100 : 0}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
