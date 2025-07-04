// Custom image loader to bypass Vercel's image optimization
// This serves images directly from their source without optimization
export default function imageLoader({ src, width, quality }) {
  // For external URLs, return them as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // For local images, prepend the base path if needed
  if (src.startsWith('/')) {
    return src;
  }
  
  // Return the source as-is for all other cases
  return src;
}