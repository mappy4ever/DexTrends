// utils/formatters.ts

/**
 * Formats a number as currency with 2 decimal places
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
  const number = Number(amount) || 0;
  return number.toLocaleString(undefined, { // Uses browser's default locale
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Formats a date string into a pretty display format
 * @param dateString - ISO date string or any parseable date string
 * @returns Formatted date string or 'N/A' if invalid
 */
export const formatDatePretty = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString); // Assumes dateString is ISO-like and can be parsed
    if (isNaN(date.getTime())) {
      return dateString; // Fallback for invalid dates
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Important if your input dates are UTC to prevent timezone shifts
    });
  } catch (e) {
    return dateString;
  }
};

/**
 * Converts a path string to lowercase URL format
 * @param pathString - The path to convert
 * @returns Lowercase path string
 */
export const toLowercaseUrl = (pathString: string | null | undefined): string => {
  if (typeof pathString !== 'string') {
    return ''; // Or handle error as appropriate
  }
  return pathString.toLowerCase();
};