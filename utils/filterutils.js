// utils/filterUtils.js

// --- Existing Date Utils ---
/**
 * Gets the default start date (e.g., first day of the month, 12 months ago).
 * @returns {Date}
 */
export const getDefaultInitialStartDate = () => {
  const date = new Date();
  // Set to 12 months ago
  date.setUTCFullYear(date.getUTCFullYear() - 1);
  // Set to the first day of that month
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

/**
 * Gets the default end date (e.g., first day of the current month).
 * Adjust to end of current month if preferred for API logic.
 * For 'YYYY-MM' selection, first day of month is common for DatePicker.
 * @returns {Date}
 */
export const getDefaultInitialEndDate = () => {
  const date = new Date();
  date.setUTCDate(1); // First day of the current month
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

/**
 * Converts a Date object to a 'YYYY-MM' string using UTC methods.
 * @param {Date | null} date - The date object.
 * @returns {string} - The formatted string 'YYYY-MM' or empty string if date is invalid.
 */
export const getYearMonthString = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Converts a 'YYYY-MM' string to a Date object (first day of the month, UTC).
 * @param {string | null} yearMonthStr - The 'YYYY-MM' string.
 * @returns {Date | null} - The Date object or null if string is invalid.
 */
export const parseYearMonthToDate = (yearMonthStr) => {
  if (!yearMonthStr || !/^\d{4}-\d{2}$/.test(yearMonthStr)) return null;
  const [year, month] = yearMonthStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return null;
  return new Date(Date.UTC(year, month - 1, 1)); // month is 0-indexed in Date constructor
};

// --- LocalStorage Keys ---
export const LOCAL_STORAGE_KEYS = {
  GLOBAL_DATE_FILTERS: 'appGlobalDateFilters',
  ORGS_PAGE_FILTERS: 'orgsPageFilters',
  PEOPLE_PAGE_FILTERS: 'peoplePageFilters',
  MAP_PAGE_FILTERS: 'mapPageFilters',
  // Add more keys as needed
};

/**
 * Loads data from localStorage.
 * @param {string} key - The localStorage key.
 * @param {T} defaultValue - The default value to return if key not found or parsing fails.
 * @returns {T} - The parsed data or the default value.
 * @template T
 */
export const loadFromLocalStorage = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue; // Prevent SSR errors
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Saves data to localStorage.
 * @param {string} key - The localStorage key.
 * @param {any} value - The value to save (will be JSON.stringified).
 */
export const saveToLocalStorage = (key, value) => {
  if (typeof window === 'undefined') return; // Prevent SSR errors
  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error);
  }
};

/**
 * Debounces a function.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    // @ts-ignore
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(context, args), delay);
  };
};