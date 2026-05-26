/**
 * Image upload — uses Supabase Storage (product-images bucket)
 * Cloudinary is used only for URL optimization of already-hosted images.
 */
import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET = 'product-images';

/**
 * Upload a File object to Supabase Storage.
 * Returns the public URL of the uploaded image.
 * @param {File} file
 * @param {(percent: number) => void} onProgress  (best-effort, fires at 0 and 100)
 */
export const uploadToCloudinary = async (file, onProgress) => {
  if (!file) throw new Error('No file provided');

  // Build a unique file path: dresses/<timestamp>-<sanitised-name>
  const ext = file.name.split('.').pop().toLowerCase();
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 60);
  const path = `dresses/${Date.now()}-${safeName}`;

  onProgress && onProgress(10);

  console.log('[Storage] Uploading', file.name, '→', path, '|', file.size, 'bytes');

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error('[Storage] Upload error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }

  onProgress && onProgress(100);

  // Build the public URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${data.path}`;
  console.log('[Storage] Uploaded OK →', publicUrl);
  return publicUrl;
};

/**
 * Return an optimized version of a Cloudinary URL (legacy support).
 * For Supabase Storage URLs, returns as-is.
 */
export const getOptimizedUrl = (url, w = 800, h = 1067) => {
  if (!url) return '';
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,f_auto,q_auto/`);
  }
  return url; // Supabase Storage URL — no transform needed
};

export const getThumbnailUrl = (url) => getOptimizedUrl(url, 200, 267);
