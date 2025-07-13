// Utility to construct backend image URLs robustly (copied from Perfumes page logic)
const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'https://jcserver.onrender.com').replace(/\/?api\/?$/, '');
export default function getImageUrl(imgPath) {
  if (!imgPath) return imgPath;
  if (/^https?:\/\//.test(imgPath)) return imgPath;
  // If starts with /uploads/ or /designs/uploads/, prefix backend
  if (imgPath.startsWith('/uploads/') || imgPath.startsWith('/designs/uploads/')) {
    return BACKEND_URL + imgPath;
  }
  // If starts with /api/uploads/ or /api/designs/uploads/, strip /api and prefix backend
  if (imgPath.startsWith('/api/uploads/')) {
    return BACKEND_URL + imgPath.replace('/api', '');
  }
  if (imgPath.startsWith('/api/designs/uploads/')) {
    return BACKEND_URL + imgPath.replace('/api', '');
  }
  // If it's just a filename (no slashes), treat as /uploads/filename
  if (!imgPath.includes('/')) {
    return BACKEND_URL + '/uploads/' + imgPath;
  }
  return imgPath;
}
