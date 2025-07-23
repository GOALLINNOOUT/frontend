// Simple IndexedDB utility using idb-keyval for demo purposes
// Install idb-keyval: npm install idb-keyval
import { get, set, del } from 'idb-keyval';

// Get cached perfumes for a specific page (default page 1), with expiration (1 hour)
export async function getCachedPerfumes(page = 1) {
  try {
    const cache = await get(`perfumes_page_${page}`);
    if (!cache) return null;
    const { data, timestamp } = cache;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    if (!timestamp || now - timestamp > oneHour) {
      // Cache expired, remove it
      await del(`perfumes_page_${page}`);
      return null;
    }
    return cache;
  } catch (e) {
    return null;
  }
}

// Set cached perfumes for a specific page (default page 1), with timestamp
export async function setCachedPerfumes(data, page = 1) {
  try {
    await set(`perfumes_page_${page}`, { data, timestamp: Date.now() });
  } catch (e) {
    // handle error
  }
}
