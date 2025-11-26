// Custom image loader to bypass Vercel's image optimization
// This serves images directly from their source without optimization

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // For local images (starting with /), return as-is without width param
  // This avoids Next.js warnings about loader not implementing width
  if (src.startsWith('/')) {
    return src;
  }

  // For external images, we can optionally add width/quality params
  // but most CDNs serve the original image anyway
  // Return as-is for simplicity since we're bypassing optimization
  return src;
}