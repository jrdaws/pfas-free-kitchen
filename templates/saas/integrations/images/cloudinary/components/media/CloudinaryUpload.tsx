"use client";

import { useState, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";

interface CloudinaryUploadProps {
  folder?: string;
  onUpload?: (result: { publicId: string; secureUrl: string }) => void;
  children?: React.ReactNode;
}

export function CloudinaryUpload({ folder, onUpload, children }: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleSuccess = useCallback((result: any) => {
    setIsUploading(false);
    if (onUpload && result.info) {
      onUpload({ publicId: result.info.public_id, secureUrl: result.info.secure_url });
    }
  }, [onUpload]);

  return (
    <CldUploadWidget
      uploadPreset="unsigned_preset"
      options={{ folder, maxFiles: 1, resourceType: "image", sources: ["local", "url", "camera"] }}
      onSuccess={handleSuccess}
      onOpen={() => setIsUploading(true)}
      onClose={() => setIsUploading(false)}
    >
      {({ open }) => (
        <>
          {children || (
            <button type="button" onClick={() => open()} disabled={isUploading}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50">
              {isUploading ? "Uploading..." : "Upload Image"}
            </button>
          )}
        </>
      )}
    </CldUploadWidget>
  );
}

