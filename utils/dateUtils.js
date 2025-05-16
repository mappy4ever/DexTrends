// utils/dateUtils.js
import { getYearMonthString } from './filterUtils'; // Assuming filterUtils is in the same directory or adjust path

export function generateMonthsInRangeForCharts(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));
  const months = [];
  let current = new Date(start);
  while (current <= end) {
    months.push(getYearMonthString(current)); // Returns 'YYYY-MM'
    current.setUTCMonth(current.getUTCMonth() + 1);
  }
  return months;
}