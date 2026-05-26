const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Return an optimized URL.
 * - For Cloudinary URLs (legacy existing products): applies transformations.
 * - For Supabase Storage URLs (new products): returns as-is.
 * - For anything else: returns as-is.
 */
export const getOptimizedUrl = (url, width = 800, height = 1067) => {
  if (!url) return '';
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,f_auto,q_auto/`);
  }
  return url;
};

export const getThumbnailUrl = (url) => getOptimizedUrl(url, 200, 267);

// Kept for backward compatibility — not used for new uploads
export const uploadToCloudinary = async (file) => {
  throw new Error('Direct Cloudinary upload is disabled. Use Supabase Storage via the admin panel.');
};
