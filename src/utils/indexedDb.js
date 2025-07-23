// Simple IndexedDB utility using idb-keyval for demo purposes
// Install idb-keyval: npm install idb-keyval
import { get, set } from 'idb-keyval';

// Get cached perfumes for a specific page (default page 1)
export async function getCachedPerfumes(page = 1) {
  try {
    return await get(`perfumes_page_${page}`);
  } catch (e) {
    return null;
  }
}

// Set cached perfumes for a specific page (default page 1)
export async function setCachedPerfumes(data, page = 1) {
  try {
    await set(`perfumes_page_${page}`, data);
  } catch (e) {
    // handle error
  }
}
