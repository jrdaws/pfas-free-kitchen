"use client";

import { CldImage } from "next-cloudinary";

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  crop?: "fill" | "fit" | "crop" | "scale";
  className?: string;
}

export function CloudinaryImage({ publicId, alt, width, height, priority, crop = "fill", className }: CloudinaryImageProps) {
  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      crop={crop}
      className={className}
      sizes={`(max-width: 768px) 100vw, ${width}px`}
    />
  );
}

