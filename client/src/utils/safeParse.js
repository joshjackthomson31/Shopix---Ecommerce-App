/**
 * Safely parse JSON from localStorage.
 * Returns fallback if the key is missing, empty, or contains corrupted data.
 * Removes the corrupted key to prevent repeated crashes.
 */
const safeParse = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

export default safeParse;
