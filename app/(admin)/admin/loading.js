export default function AdminDashboardLoading() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-7 animate-pulse">
      {/* Title & Subtitle Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-xl border border-white/[0.06] bg-white/[0.04]" />
          <div className="h-4 w-60 rounded-lg bg-white/[0.02]" />
        </div>
        <div className="h-8 w-36 rounded-full border border-white/[0.06] bg-white/[0.03]" />
      </div>

      {/* Row 1: 4 Glass KPI Skeletons */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex h-36 flex-col justify-between rounded-[22px] border border-white/[0.07] bg-[#14100E]/70 p-6 backdrop-blur-[20px]"
          >
            <div className="space-y-3">
              <div className="h-3.5 w-20 rounded bg-white/[0.05]" />
              <div className="h-8 w-28 rounded-lg bg-white/[0.07]" />
            </div>
            <div className="h-3 w-36 rounded bg-white/[0.03]" />
          </div>
        ))}
      </div>

      {/* Row 2: Charts (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="h-[360px] rounded-[22px] border border-white/[0.07] bg-[#14100E]/70 p-6 backdrop-blur-[20px] lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-40 rounded bg-white/[0.06]" />
              <div className="h-3 w-56 rounded bg-white/[0.03]" />
            </div>
            <div className="h-7 w-28 rounded-full bg-white/[0.04]" />
          </div>
          <div className="h-[240px] w-full rounded-xl bg-white/[0.02]" />
        </div>

        <div className="h-[360px] rounded-[22px] border border-white/[0.07] bg-[#14100E]/70 p-6 backdrop-blur-[20px] lg:col-span-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-white/[0.06]" />
            <div className="h-3 w-40 rounded bg-white/[0.03]" />
          </div>
          <div className="mx-auto h-40 w-40 rounded-full border-8 border-white/[0.04] bg-transparent" />
          <div className="space-y-2 pt-2 border-t border-white/[0.04]">
            <div className="h-3 w-full rounded bg-white/[0.03]" />
            <div className="h-3 w-full rounded bg-white/[0.03]" />
          </div>
        </div>
      </div>

      {/* Row 3: 5 cols + 3 cols + 4 cols */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="h-[340px] rounded-[22px] border border-white/[0.07] bg-[#14100E]/70 p-6 backdrop-blur-[20px] lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="h-4 w-36 rounded bg-white/[0.06]" />
            <div className="h-3 w-48 rounded bg-white/[0.03]" />
          </div>
          <div className="space-y-3.5 my-auto">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-20 rounded bg-white/[0.05]" />
                  <div className="h-3 w-10 rounded bg-white/[0.03]" />
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.03]" />
              </div>
            ))}
          </div>
        </div>

        <div className="h-[340px] rounded-[22px] border border-white/[0.07] bg-[#14100E]/70 p-6 backdrop-blur-[20px] lg:col-span-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded bg-white/[0.06]" />
            <div className="h-3 w-36 rounded bg-white/[0.03]" />
          </div>
          <div className="mx-auto h-36 w-36 rounded-full border-8 border-white/[0.04] bg-transparent" />
          <div className="h-3 w-36 mx-auto rounded bg-white/[0.03]" />
        </div>

        <div className="h-[340px] rounded-[22px] border border-white/[0.07] bg-[#14100E]/70 p-6 backdrop-blur-[20px] lg:col-span-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-36 rounded bg-white/[0.06]" />
              <div className="h-3 w-44 rounded bg-white/[0.03]" />
            </div>
            <div className="h-3 w-14 rounded bg-white/[0.05]" />
          </div>
          <div className="space-y-3 my-auto">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-white/[0.05]" />
                  <div className="space-y-1">
                    <div className="h-3 w-28 rounded bg-white/[0.06]" />
                    <div className="h-2.5 w-16 rounded bg-white/[0.03]" />
                  </div>
                </div>
                <div className="h-5 w-16 rounded-full bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
