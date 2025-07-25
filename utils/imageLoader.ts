// Custom image loader to bypass Vercel's image optimization
// This serves images directly from their source without optimization

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Simply return the src without modification to avoid optimization
  // This prevents any URL changes that might cause re-renders
  return src;
}