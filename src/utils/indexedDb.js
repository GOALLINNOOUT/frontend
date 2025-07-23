// Simple IndexedDB utility using idb-keyval for demo purposes
// Install idb-keyval: npm install idb-keyval
import { get, set } from 'idb-keyval';

export async function getCachedPerfumes(key = 'perfumes') {
  try {
    return await get(key);
  } catch (e) {
    return null;
  }
}

export async function setCachedPerfumes(data, key = 'perfumes') {
  try {
    await set(key, data);
  } catch (e) {
    // handle error
  }
}
