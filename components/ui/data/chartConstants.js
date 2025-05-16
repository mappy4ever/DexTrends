// components/ui/data/chartConstants.js
export const CHART_PALETTES = {
  LINE_PALETTE: ['#36a2db', '#66e1e3', '#feda5c', '#fb7293', '#e690d1'],
  PIE_PALETTE: ['#36a2db', '#33c4e9', '#66e1e3', '#9fe7b9', '#feda5c', '#ff9e7e', '#fb7293', '#e163ae', '#e690d1', '#e7bdf2', '#9c96f4', '#8279ea'],
  HEATMAP_PALETTE: ['#66e1e3', '#9fe7b9', '#feda5c', '#ff9e7e', '#fb7293', '#e163ae'],
  HEATMAP_PALETTE_DARK: ['#66e1e3', '#9fe7b9', '#feda5c', '#ff9e7e', '#fb7293', '#e163ae'],
};

export const SPENDING_SERIES_CONFIG = [
  { name: 'Airfare', dataKey: 'airfare' }, // 'dataKey' used for data like trips[{airfare: 100}, ...]
  { name: 'Lodging', dataKey: 'lodging' },
  { name: 'Meals', dataKey: 'meals' },
  { name: 'Other Transport', dataKey: 'other_transport' },
  { name: 'Other Expenses', dataKey: 'other_expenses' },
];

export const SPENDING_SERIES_DASHBOARD_CONFIG = [
  { name: 'Airfare', dataKey: 'total_airfare' }, // 'dataKey' used for data like trips[{airfare: 100}, ...]
  { name: 'Lodging', dataKey: 'total_lodging' },
  { name: 'Meals', dataKey: 'total_meals' },
  { name: 'Other Transport', dataKey: 'total_other_transport' },
  { name: 'Other Expenses', dataKey: 'total_other_expenses' },
];