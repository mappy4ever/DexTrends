// utils/formatters.js

export const formatCurrency = (amount) => {
  const number = Number(amount) || 0;
  return number.toLocaleString(undefined, { // Uses browser's default locale
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};


export const formatDatePretty = (dateString) => {
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

export const toLowercaseUrl = (pathString) => {
  if (typeof pathString !== 'string') {
    return ''; // Or handle error as appropriate
  }
  return pathString.toLowerCase();
};