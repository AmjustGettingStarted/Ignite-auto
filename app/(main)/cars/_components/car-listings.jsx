"use client";
import { getCars } from "@/actions/car-listings";
import useFetch from "@/hooks/use-fetch";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CarListingsLoading from "./car-listings-loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import Link from "next/link";
import PremiumCarCard from "@/components/premium-car-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

const CarListings = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  // Extract filter values from searchParams
  const search = searchParams.get("search") || "";
  const make = searchParams.get("make") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const transmission = searchParams.get("transmission") || "";
  const minPrice = searchParams.get("minPrice") || 0;
  const maxPrice = searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER;
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  // Use the useFetch hook
  const { loading, fn: fetchCars, data: result, error } = useFetch(getCars);

  // Fetch cars when filters change
  useEffect(() => {
    fetchCars({
      search,
      make,
      bodyType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });
  }, [
    search,
    make,
    bodyType,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  // Update URL when page changes
  useEffect(() => {
    if (currentPage !== page) {
      const params = new URLSearchParams(searchParams);
      params.set("page", currentPage.toString());
      router.push(`?${params.toString()}`);
    }
  }, [currentPage, router, searchParams, page]);

  // Show loading state
  if (loading && !result) {
    return <CarListingsLoading />;
  }

  // Handle error
  if (error || (!result && !result?.success)) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load cars. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // If no results yet, return empty placeholder
  if (!result || !result.data) {
    return null;
  }

  const { data: cars, pagination } = result;

  // No results
  if (cars.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-[#0b0b0c] p-8 text-center">
        <div className="mb-4 rounded-full border border-white/10 bg-white/5 p-4">
          <Info className="h-8 w-8 text-white/50" />
        </div>
        <h3 className="font-[family-name:var(--font-clash)] text-2xl font-semibold uppercase tracking-tight">
          No cars found
        </h3>
        <p className="mb-6 mt-3 max-w-md text-sm text-white/60">
          No cars match this search. Adjust the filters or clear them and look
          through the full inventory.
        </p>
        <Button variant="outline" asChild>
          <Link href="/cars">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  // Handle pagination clicks
  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  // Generate pagination URL
  const getPaginationUrl = (pageNum) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNum.toString());
    return `?${params.toString()}`;
  };

  // Generate pagination items
  const paginationItems = [];

  // Calculate which page numbers to show (first, last, and around current page)
  const visiblePageNumbers = [];

  // Always show page 1
  visiblePageNumbers.push(1);

  // Show pages around current page
  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(pagination.pages - 1, page + 1);
    i++
  ) {
    visiblePageNumbers.push(i);
  }

  // Always show last page if there's more than 1 page
  if (pagination.pages > 1) {
    visiblePageNumbers.push(pagination.pages);
  }

  // Sort and deduplicate
  const uniquePageNumbers = [...new Set(visiblePageNumbers)].sort(
    (a, b) => a - b
  );

  // Create pagination items with ellipses
  let lastPageNumber = 0;
  uniquePageNumbers.forEach((pageNumber) => {
    if (pageNumber - lastPageNumber > 1) {
      // Add ellipsis
      paginationItems.push(
        <PaginationItem key={`ellipsis-${pageNumber}`}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    paginationItems.push(
      <PaginationItem key={pageNumber}>
        <PaginationLink
          href={getPaginationUrl(pageNumber)}
          isActive={pageNumber === page}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(pageNumber);
          }}
        >
          {pageNumber}
        </PaginationLink>
      </PaginationItem>
    );

    lastPageNumber = pageNumber;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-white/60">
          Showing{" "}
          <span className="font-medium text-white">
            {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)}
          </span>{" "}
          of <span className="font-medium text-white">{pagination.total}</span>{" "}
          cars
        </p>
      </div>

      {/* Full-bleed car grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {cars.map((car, index) => (
          <PremiumCarCard
            key={car.id}
            car={car}
            index={index}
            priority={index < 2}
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        ))}
      </div>

      {/* shadcn Pagination */}
      {pagination.pages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={getPaginationUrl(page - 1)}
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) {
                    handlePageChange(page - 1);
                  }
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {paginationItems}

            <PaginationItem>
              <PaginationNext
                href={getPaginationUrl(page + 1)}
                onClick={(e) => {
                  e.preventDefault();
                  if (page < pagination.pages) {
                    handlePageChange(page + 1);
                  }
                }}
                className={
                  page >= pagination.pages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default CarListings;