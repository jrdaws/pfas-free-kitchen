/**
 * Cloudinary Integration with Lazy Initialization
 * 
 * Gracefully handles missing configuration.
 */

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Check if Cloudinary is configured
const isCloudinaryConfigured = 
  cloudName && 
  apiKey && 
  apiSecret && 
  !cloudName.includes("placeholder");

// Warn in development if not configured
if (!isCloudinaryConfigured && process.env.NODE_ENV === "development") {
  console.warn(`
⚠️  Cloudinary configuration missing

Required environment variables:
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  CLOUDINARY_API_KEY
  CLOUDINARY_API_SECRET

Get these from: https://cloudinary.com/console
  `);
}

/**
 * Check if Cloudinary is configured
 */
export function isImageServiceConfigured(): boolean {
  return isCloudinaryConfigured;
}

// Lazy-loaded cloudinary instance
let cloudinaryInstance: typeof import("cloudinary").v2 | null = null;

async function getCloudinary() {
  if (!isCloudinaryConfigured) {
    return null;
  }
  
  if (!cloudinaryInstance) {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    cloudinaryInstance = cloudinary;
  }
  
  return cloudinaryInstance;
}

// Synchronous version for backward compatibility (only works after first async call)
export const cloudinary = {
  get config() {
    return { cloud_name: cloudName };
  },
  
  url(publicId: string, options: Record<string, any> = {}) {
    if (!isCloudinaryConfigured) {
      console.warn("[Cloudinary] Not configured, returning placeholder URL");
      return `/api/placeholder/${options.width || 400}/${options.height || 300}`;
    }
    
    // Basic URL construction without SDK
    const transformations = [];
    if (options.transformation) {
      const t = options.transformation[0] || {};
      if (t.width) transformations.push(`w_${t.width}`);
      if (t.height) transformations.push(`h_${t.height}`);
      if (t.crop) transformations.push(`c_${t.crop}`);
      if (t.quality) transformations.push(`q_${t.quality}`);
      if (t.fetch_format) transformations.push(`f_${t.fetch_format}`);
    }
    
    const transformation = transformations.length > 0 
      ? `/${transformations.join(",")}` 
      : "";
    
    return `https://res.cloudinary.com/${cloudName}/image/upload${transformation}/${publicId}`;
  },
  
  utils: {
    api_sign_request(paramsToSign: Record<string, string>, secret: string): string {
      // This requires the SDK - return empty if not loaded
      if (!cloudinaryInstance) {
        console.warn("[Cloudinary] SDK not loaded, signature generation unavailable");
        return "";
      }
      return cloudinaryInstance.utils.api_sign_request(paramsToSign, secret);
    },
  },
  
  uploader: {
    async destroy(publicId: string) {
      const instance = await getCloudinary();
      if (!instance) {
        return { result: "not_configured" };
      }
      return instance.uploader.destroy(publicId);
    },
  },
};

/**
 * Generate a signature for client-side uploads
 */
export async function generateSignature(paramsToSign: Record<string, string>): Promise<string> {
  const instance = await getCloudinary();
  if (!instance) {
    console.warn("[Cloudinary] Not configured, cannot generate signature");
    return "";
  }
  return instance.utils.api_sign_request(paramsToSign, apiSecret || "");
}

/**
 * Get an optimized image URL
 */
export function getImageUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string; quality?: string | number } = {}
): string {
  const { width, height, crop = "fill", quality = "auto" } = options;
  
  if (!isCloudinaryConfigured) {
    // Return a placeholder image
    return `/api/placeholder/${width || 400}/${height || 300}`;
  }
  
  return cloudinary.url(publicId, {
    transformation: [{ width, height, crop, quality, fetch_format: "auto" }],
  });
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  const instance = await getCloudinary();
  if (!instance) {
    return false;
  }
  
  try {
    const result = await instance.uploader.destroy(publicId);
    return result.result === "ok";
  } catch {
    return false;
  }
}
