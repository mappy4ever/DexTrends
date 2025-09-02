// components/ui/ChartContainer.js
import React from 'react';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

const ChartContainer = ({ title, children, isLoading = false, className = '' }: ChartContainerProps) => (
  <div className={`card card-padding-default ${className}`}>
    <h2 className="text-section-heading mb-4">{title}</h2>
    {isLoading ? (
      <div className="h-[400px] w-full bg-foreground-muted/20 animate-pulse rounded-app-md"></div>
    ) : (
      <div className="h-[400px] w-full">{children}</div>
    )}
  </div>
);

export default ChartContainer;