"use client";
import { deleteCar, getCars, updateCarStatus } from "@/actions/cars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import useFetch from "@/hooks/use-fetch";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/helper";
import {
  CarIcon,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  StarOff,
  Trash,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CarsList = () => {
  const [search, setSearch] = useState("");
  const [carToDelete, setCarToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(null);

  const router = useRouter();

  const {
    loading: loadingCars,
    fn: fetchCars,
    data: carsData,
    error: carsError,
  } = useFetch(getCars);

  useEffect(() => {
    fetchCars(search);
  }, [search]);

  const {
    loading: deletingCar,
    fn: deleteCarFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteCar);

  const {
    loading: updatingCar,
    fn: updateCarStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateCarStatus);

  // To prevent refresh every time you update the values
  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Car Deleted Successfully!");
      fetchCars(search);
    }

    if (updateResult?.success) {
      toast.success("Car Updated successfully");
      fetchCars(search);
    }
  }, [updateResult, deleteResult]);

  // Handle errors
  useEffect(() => {
    if (carsError) {
      toast.error("Failed to load cars");
    }

    if (deleteError) {
      toast.error("Failed to delete car");
    }

    if (updateError) {
      toast.error("Failed to update car");
    }
  }, [carsError, deleteError, updateError]);

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge className="border-emerald-400/40 bg-emerald-400/10 text-emerald-200">
            Available
          </Badge>
        );
      case "UNAVAILABLE":
        return (
          <Badge className="border-amber-400/40 bg-amber-400/10 text-amber-200">
            Unavailable
          </Badge>
        );
      case "SOLD":
        return (
          <Badge className="border-[#1a5cff]/40 bg-[#1a5cff]/10 text-[#8eb0ff]">
            Sold
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars(search);
  };

  // Handles Switcing of Featured Cars or Not
  const handleToggleFeaturedCar = async (car) => {
    await updateCarStatusFn(car.id, { featured: !car.featured });
  };

  // Handle status change
  const handleStatusUpdate = async (car, newStatus) => {
    await updateCarStatusFn(car.id, { status: newStatus });
  };

  // Handle delte car
  const handleDeleteCar = async () => {
    if (!carToDelete) return;

    await deleteCarFn(carToDelete.id);
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <form
          action=""
          onSubmit={handleSearchSubmit}
          className="flex w-full sm:w-auto"
        >
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/70" />
            <Input
              type="search"
              placeholder="Search cars"
              className="w-full border-white/20 bg-[#0b0b0c] pl-9 text-white sm:w-60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
        <Button
          onClick={() => router.push("/admin/cars/create")}
          className="bg-[#ff4d1a] text-white hover:bg-[#ff6a3d]"
        >
          <Plus className="h-4 w-4" /> Add car
        </Button>
      </div>
      {/* Cars Table */}
      <Card className="border-white/10 bg-[#0b0b0c] text-white">
        <CardContent className="p-0">
          {loadingCars && !carsData ? (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-28 text-white/70">Photo</TableHead>
                  <TableHead className="text-white/70">Car</TableHead>
                  <TableHead className="text-white/70">Year</TableHead>
                  <TableHead className="text-white/70">Price</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Featured</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {["a", "b", "c", "d", "e", "f"].map((key) => (
                  <TableRow key={key} className="border-white/10">
                    <TableCell><Skeleton className="h-14 w-24 rounded-md bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full bg-white/10" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8 bg-white/10" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : carsData?.success && carsData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-28 text-white/70">Photo</TableHead>
                    <TableHead className="text-white/70">Car</TableHead>
                    <TableHead className="text-white/70">Year</TableHead>
                    <TableHead className="text-white/70">Price</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Featured</TableHead>
                    <TableHead className="text-right text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carsData.data.map((car) => {
                    return (
                      <TableRow key={car.id} className="border-white/10">
                        <TableCell>
                          <div className="relative h-14 w-24 overflow-hidden rounded-md bg-[#111113]">
                            {car.images && car.images.length > 0 ? (
                              <Image
                                src={car.images[0]}
                                alt={`${car.make} ${car.model}`}
                                fill
                                sizes="96px"
                                quality={85}
                                decoding="async"
                                className="object-contain"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <CarIcon className="h-5 w-5 text-white/40" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          <div className="text-sm text-white/70">{car.make}</div>
                          {car.model.length > 20 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  {car.model.slice(0, 20) + "..."}
                                </TooltipTrigger>
                                <TooltipContent>{car.model}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            car.model
                          )}
                        </TableCell>
                        <TableCell className="text-white/80">{car.year}</TableCell>
                        <TableCell className="font-medium text-[#1a5cff]">{formatCurrency(car.price)}</TableCell>
                        <TableCell>{getStatusBadge(car.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 cursor-pointer p-0 text-white hover:bg-white/10 hover:text-white"
                            onClick={() => handleToggleFeaturedCar(car)}
                            disabled={updatingCar}
                          >
                            {car.featured ? (
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="h-5 w-5 text-white/50" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/cars/${car.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(car, "AVAILABLE")
                                }
                                disabled={
                                  car.status === "AVAILABLE" || updatingCar
                                }
                              >
                                Set Available
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(car, "UNAVAILABLE")
                                }
                                disabled={
                                  car.status === "UNAVAILABLE" || updatingCar
                                }
                              >
                                Set Unavailable
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(car, "SOLD")}
                                disabled={car.status === "SOLD" || updatingCar}
                              >
                                Mark as Sold
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className={`text-red-600`}
                                onClick={() => {
                                  setCarToDelete(car);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <CarIcon className="mb-4 h-12 w-12 text-white/30" />
              <h3 className="mb-1 text-lg font-medium text-white">
                No cars found
              </h3>
              <p className="mb-4 text-white/70">
                {search
                  ? "No cars match your search criteria"
                  : "Your inventory is empty. Add cars to get started."}
              </p>
              <Button
                onClick={() => router.push("/admin/cars/create")}
                className="bg-[#ff4d1a] text-white hover:bg-[#ff6a3d]"
              >
                Add car
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {carToDelete?.make}{" "}
              {carToDelete?.model} ({carToDelete?.year})? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingCar}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCar}
              disabled={deletingCar}
            >
              {deletingCar ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Car"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarsList;
