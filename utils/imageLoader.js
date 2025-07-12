// Custom image loader to bypass Vercel's image optimization
// This serves images directly from their source without optimization
export default function imageLoader({ src, width, quality }) {
  // For external URLs, append width as a query parameter
  if (src.startsWith('http://') || src.startsWith('https://')) {
    const url = new URL(src);
    if (width) {
      url.searchParams.set('w', width);
    }
    if (quality) {
      url.searchParams.set('q', quality);
    }
    return url.toString();
  }
  
  // For local images, add width as query parameter
  if (src.startsWith('/')) {
    const separator = src.includes('?') ? '&' : '?';
    let url = src;
    if (width) {
      url += `${separator}w=${width}`;
    }
    if (quality && width) {
      url += `&q=${quality}`;
    }
    return url;
  }
  
  // Return the source with width for all other cases
  return width ? `${src}?w=${width}` : src;
}