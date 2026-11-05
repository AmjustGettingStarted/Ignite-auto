"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { toggleSavedCar } from "@/actions/car-listings";

export function EngineIcon({ className = "w-5 h-5" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M9 5h6v3H9z" />
            <path d="M5 8h14l2 3v7h-3v2H6v-2H3v-7l2-3z" />
            <circle cx="12" cy="13.5" r="2.5" />
            <path d="M1 11h2M21 11h2M1 15h2M21 15h2" />
        </svg>
    );
}

export function TransmissionIcon({ className = "w-5 h-5" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <circle cx="5" cy="6" r="1.75" />
            <circle cx="12" cy="6" r="1.75" />
            <circle cx="19" cy="6" r="1.75" />
            <circle cx="12" cy="19" r="1.75" />
            <path d="M5 8v5h14V8" />
            <path d="M12 6v11" />
        </svg>
    );
}

export function RoadIcon({ className = "w-5 h-5" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M4 19L8 5h3L7.5 19H4z" />
            <path d="M20 19L16 5h-3l3.5 14h3.5z" />
            <line x1="12" y1="6" x2="12" y2="9" />
            <line x1="12" y1="12" x2="12" y2="15" />
            <line x1="12" y1="18" x2="12" y2="20" />
        </svg>
    );
}

export function getCarSpecs(car) {
    const engine =
        car.engine ||
        (car.fuelType?.toLowerCase().includes("electric")
            ? "ELECTRIC"
            : car.model?.toLowerCase().includes("wraith") || car.make?.toLowerCase().includes("rolls")
                ? "V12"
                : car.model?.toLowerCase().includes("camaro")
                    ? "V8"
                    : car.bodyType?.toLowerCase().includes("supercar")
                        ? "V10"
                        : car.bodyType?.toLowerCase().includes("coupe")
                            ? "V8"
                            : car.bodyType?.toLowerCase().includes("suv")
                                ? "V6"
                                : "V8");

    const power =
        car.power ||
        (car.model?.toLowerCase().includes("camaro")
            ? "455 HP"
            : car.model?.toLowerCase().includes("wraith")
                ? "624 HP"
                : car.bodyType?.toLowerCase().includes("supercar")
                    ? "640 HP"
                    : car.bodyType?.toLowerCase().includes("coupe")
                        ? "450 HP"
                        : car.bodyType?.toLowerCase().includes("suv")
                            ? "380 HP"
                            : Number(car.price) > 100000
                                ? "520 HP"
                                : "320 HP");

    const transmission = (car.transmission || "Automatic").toUpperCase();

    const mileage =
        car.mileage !== undefined && car.mileage !== null
            ? `${Number(car.mileage).toLocaleString()} MI`
            : "23 MI";

    return { engine, power, transmission, mileage };
}

export function WishlistButton({ car, onSavedChange }) {
    const [isSaved, setIsSaved] = useState(Boolean(car.wishlisted ?? car.wishListed));
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const handled = React.useRef(null);
    const pending = React.useRef(null);
    const toastedError = React.useRef(null);

    const {
        loading: isToggling,
        fn: toggleSavedCarFn,
        data: toggleResult,
        error: toggleError,
    } = useFetch(toggleSavedCar);

    useEffect(() => {
        if (!toggleResult || handled.current === toggleResult) return;
        handled.current = toggleResult;

        if (!toggleResult.success) {
            if (pending.current !== null) {
                const previous = pending.current;
                pending.current = null;
                setIsSaved(previous);
                onSavedChange?.(previous);
                toast.error(toggleResult.error || "Failed to update favorites");
            }
            return;
        }

        pending.current = null;
        if (toggleResult.saved !== isSaved) {
            setIsSaved(toggleResult.saved);
        }
        onSavedChange?.(toggleResult.saved);
        toast.success(toggleResult.message);
    }, [toggleResult, isSaved, onSavedChange]);

    useEffect(() => {
        if (!toggleError || toastedError.current === toggleError) return;
        toastedError.current = toggleError;
        if (pending.current !== null) {
            const previous = pending.current;
            pending.current = null;
            setIsSaved(previous);
            onSavedChange?.(previous);
        }
        toast.error("Failed to update favorites");
    }, [toggleError, onSavedChange]);

    const handleToggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn) {
            toast.error("Please sign in to save cars");
            router.push("/sign-in");
            return;
        }

        if (isToggling) return;

        pending.current = isSaved;
        setIsSaved(!isSaved);

        await toggleSavedCarFn(car.id);
    };

    return (
        <button
            type="button"
            aria-label={isSaved ? "Remove from saved cars" : "Save car"}
            onClick={handleToggleSave}
            disabled={isToggling}
            className={`relative z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md transition-all hover:scale-105 hover:border-white/40 hover:bg-black/60 ${isSaved ? "border-[#ff4d1a]/50 text-[#ff4d1a]" : "text-white"
                }`}
        >
            {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
                <Heart className={isSaved ? "fill-[#ff4d1a]" : ""} size={18} />
            )}
        </button>
    );
}