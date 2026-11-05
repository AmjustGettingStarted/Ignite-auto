"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CarIcon } from "lucide-react";

export default function CarImage({
  src,
  alt = "Vehicle photo",
  sizes = "100vw",
  priority = false,
  loading,
  quality = 90,
  className = "",
  foregroundClassName = "",
  unoptimized = false,
  fill = true,
  onLoad,
  onError,
  wrapperClassName = "",
  ...props
}) {
  // 0 = normal optimized, 1 = retry unoptimized, 2 = failed (show fallback placeholder)
  const [failedAttempt, setFailedAttempt] = useState(0);

  useEffect(() => {
    setFailedAttempt(0);
  }, [src]);

  if (!src || failedAttempt >= 2) {
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center bg-[#0c0c0e] ${wrapperClassName} ${className}`.trim()}
        aria-hidden="true"
      >
        <CarIcon className="h-12 w-12 text-white/20" aria-hidden="true" />
      </div>
    );
  }

  const handleError = (e) => {
    if (failedAttempt === 0) {
      // Retry once with unoptimized raw URL
      setFailedAttempt(1);
    } else {
      // If raw URL also fails, show neutral dark placeholder
      setFailedAttempt(2);
    }
    onError?.(e);
  };

  const isEager = priority || loading === "eager";

  return (
    <div className={`relative h-full w-full overflow-hidden ${wrapperClassName}`.trim()}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={isEager ? "eager" : loading || "lazy"}
        decoding="async"
        unoptimized={unoptimized || failedAttempt === 1}
        onError={handleError}
        onLoad={onLoad}
        className={`object-cover ${className} ${foregroundClassName}`.trim()}
        {...props}
      />
    </div>
  );
}
