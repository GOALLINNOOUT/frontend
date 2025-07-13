// Utility to construct backend image URLs robustly (always use /api prefix for uploads)
const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jcserver.onrender.com').replace(/\/?api\/?$/, '');
export default function getImageUrl(imgPath) {
  if (!imgPath) return imgPath;
  if (/^https?:\/\//.test(imgPath)) return imgPath;
  // Always ensure /api prefix for uploads endpoints
  if (imgPath.startsWith('/uploads/')) {
    return BACKEND_URL + '/api' + imgPath;
  }
  if (imgPath.startsWith('/designs/uploads/')) {
    return BACKEND_URL + '/api' + imgPath;
  }
  if (imgPath.startsWith('/api/uploads/') || imgPath.startsWith('/api/designs/uploads/')) {
    return BACKEND_URL + imgPath;
  }
  // If it's just a filename (no slashes), treat as /api/uploads/filename
  if (!imgPath.includes('/')) {
    return BACKEND_URL + '/api/uploads/' + imgPath;
  }
  return imgPath;
}
