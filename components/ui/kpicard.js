// components/ui/KPICard.js
import React from 'react';
import { formatCurrency } from '../../utils/formatters'; // Adjust path as needed

const KPICard = ({ title, value, isLoading, className = "" }) => (
  <div className={`card card-padding-default ${className}`}>
    <h3 className="text-sm font-medium text-foreground-muted mb-1">{title}</h3>
    {isLoading ? (
      <div className="h-8 w-2/3 bg-foreground-muted/20 animate-pulse mt-1 rounded-app-sm"></div>
    ) : (
      <p className="text-2xl font-bold text-text-heading mt-1">
        {typeof value === 'number' && typeof title === 'string' && !title.toLowerCase().includes("total trips") ? `$${formatCurrency(value)}` : (typeof value === 'number' ? value.toLocaleString() : value)}
      </p>
    )}
  </div>
);
// Note: The check for `title !== "Total Trips"` is a bit brittle.
// Consider passing a `isCurrency` prop or checking value type more robustly.
// For now, kept as is from your code. Changed to check if title is string before toLowerCase().

export default KPICard;