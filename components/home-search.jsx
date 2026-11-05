"use client";

import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { processImageSearch } from "@/actions/home";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);

  const router = useRouter();

  const {
    loading: isProcessing,
    fn: processImageFn,
    data: processResult,
    error: processError,
  } = useFetch(processImageSearch);

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    router.push(`/cars?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!searchImage) {
      toast.error("Please upload an image first");
      return;
    }
    await processImageFn(searchImage);
  };

  useEffect(() => {
    if (processResult?.success) {
      const params = new URLSearchParams();
      if (processResult.data.make) params.set("make", processResult.data.make);
      if (processResult.data.bodyType)
        params.set("bodyType", processResult.data.bodyType);
      if (processResult.data.color)
        params.set("color", processResult.data.color);

      setIsModalOpen(false);
      router.push(`/cars?${params.toString()}`);
    }
  }, [processResult, router]);

  useEffect(() => {
    if (processError) {
      toast.error(
        "Failed to analyze image: " + (processError.message || "Unknown error")
      );
    }
  }, [processError]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB");
        return;
      }
      setSearchImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        toast.success("Image uploaded successfully");
      };
      reader.onerror = () => {
        toast.error("Failed to read the image");
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".png", ".jpg"],
      },
      maxFiles: 1,
    });

  const handleOpenChange = (open) => {
    setIsModalOpen(open);
    if (!open) {
      setSearchImage(null);
      setImagePreview("");
    }
  };

  return (
    <div className="w-full relative">
      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        {/* Unified Search Bar Component Container */}
        <form onSubmit={handleTextSubmit}>
          <div className="group relative flex items-center rounded-full border border-white/10 bg-black/60 backdrop-blur-xl transition-all duration-300 ease-out hover:border-[#FF5F1F]/40 hover:shadow-[0_0_40px_rgba(255,95,31,0.08)] hover:-translate-y-0.5 focus-within:border-[#FF5F1F]/70 focus-within:shadow-[0_0_45px_rgba(255,95,31,0.15)] focus-within:-translate-y-0.5">
            {/* Main Input - Desktop */}
            <Input
              type="text"
              placeholder="Search your dream car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hidden sm:inline pl-7 pr-36 py-7 w-full border-none bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
            {/* Main Input - Mobile */}
            <Input
              type="text"
              placeholder="Search your dream car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:hidden pl-5 pr-32 py-6 w-full border-none bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm"
            />

            {/* Glowing Border Beam */}
            <BorderBeam
              size={120}
              duration={8}
              delay={0}
              borderWidth={1.5}
              colorFrom="#FF5F1F"
              colorTo="#FF5F1F"
              reverse={false}
            />

            {/* Action Group (Camera Button + Saved Cars Styled Search Button) */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {/* AI Vision Camera Button Trigger */}
              <DialogTrigger asChild>
                <button
                  type="button"
                  title="AI Reverse Image Search"
                  className="p-2.5 rounded-full text-[#FF5F1F] bg-black/40 hover:bg-[#FF5F1F]/10 border border-[#FF5F1F]/35 hover:border-[#FF5F1F]/80 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
                >
                  <Camera
                    size={18}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                </button>
              </DialogTrigger>

              {/* Search Button Styled Exactly like Saved Cars */}
              <Button
                type="submit"
                variant="outline"
                className="
                  group
                  cursor-pointer
                  rounded-full
                  px-6
                  py-5
                  border border-[#FF5F1F]/35
                  bg-black/40
                  hover:bg-[#FF5F1F]/10
                  hover:border-[#FF5F1F]/80
                  text-white
                  hover:text-white
                  backdrop-blur-md
                  font-medium
                  text-sm
                  transition-all
                  duration-300
                  ease-out
                  hover:-translate-y-0.5
                  hover:shadow-[0_8px_30px_rgba(255,95,31,0.15)]
                  active:translate-y-0
                  active:scale-[0.98]
                "
              >
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Sleek AI Vision Search Modal Dialog */}
        <DialogContent
          showCloseButton={false}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 overflow-hidden sm:max-w-lg w-[92vw] p-7 sm:p-8 rounded-3xl bg-black/95 backdrop-blur-xl border border-[#FF5F1F]/40 text-white shadow-[0_0_50px_rgba(255,95,31,0.22)] gap-0 outline-none"
        >
          {/* Animated Glowing Shine on the Border */}
          <BorderBeam
            size={180}
            duration={7}
            delay={0}
            borderWidth={1.5}
            colorFrom="#FF5F1F"
            colorTo="#FF9F5A"
            reverse={false}
          />

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-normal tracking-tight text-white flex items-center">
                AI Vision Search
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF5F1F] ml-2 shrink-0 shadow-[0_0_8px_rgba(255,95,31,0.8)]" />
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-[13px] text-gray-400 font-normal mt-1.5 tracking-normal">
                Upload a vehicle photo and find visually similar cars instantly.
              </DialogDescription>
            </div>
            <DialogClose className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer outline-none">
              <X className="w-4 h-4 stroke-[1.75]" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          {/* Form & Upload Area */}
          <form onSubmit={handleImageSearch} className="relative z-10 mt-6">
            {imagePreview ? (
              <div className="rounded-2xl border border-white/10 p-5 text-center bg-black/40">
                <div className="relative w-full max-h-56 rounded-xl overflow-hidden border border-white/10 bg-black/60 mb-3 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Vehicle preview"
                    className="h-44 sm:h-52 w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-black text-neutral-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-gray-400 truncate max-w-[220px]">
                    {searchImage?.name || "Vehicle photo selected"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                    }}
                    className="text-xs text-[#FF5F1F] hover:text-[#FF5F1F]/80 transition-colors cursor-pointer font-medium"
                  >
                    Change photo
                  </button>
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={cn(
                  "cursor-pointer rounded-2xl border py-14 px-6 text-center transition-all duration-300 outline-none select-none flex flex-col items-center justify-center",
                  isDragActive
                    ? "border-[#FF5F1F] bg-white/[0.04] shadow-[0_0_25px_rgba(255,95,31,0.15)]"
                    : "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]"
                )}
              >
                <input {...getInputProps()} />

                <p className="text-white font-medium text-[15px] sm:text-base tracking-tight mb-1">
                  {isDragActive && !isDragReject
                    ? "Drop your vehicle photo here"
                    : "Drag & drop a vehicle photo here"}
                </p>
                <p className="text-gray-400 text-xs sm:text-[13px] mb-6 font-normal">
                  or click to browse
                </p>
                {isDragReject && (
                  <p className="text-xs text-red-400 mb-3">
                    Invalid image type (JPG, PNG only)
                  </p>
                )}
                <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-gray-400 text-xs font-normal">
                  Supports: JPG, PNG (max 5MB)
                </span>
              </div>
            )}

            {/* Submit Action */}
            {imagePreview && (
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-4 cursor-pointer rounded-xl border border-[#FF5F1F]/40 bg-[#FF5F1F] hover:bg-[#FF5F1F]/90 text-white py-5 text-sm font-medium transition-all duration-200 hover:shadow-[0_0_25px_rgba(255,95,31,0.25)] active:scale-[0.99] disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-white" />
                    Analyzing Vehicle Intelligence...
                  </span>
                ) : (
                  "Find Visually Similar Cars"
                )}
              </Button>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeSearch;