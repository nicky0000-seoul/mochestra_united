export function getItem(key, fallback = '') {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode, disabled cookies, etc.) — ignore
  }
}
