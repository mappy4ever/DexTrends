// components/ui/ListContainer.js
import React from 'react';

interface ListContainerProps<T> {
  title: React.ReactNode;
  items: T[];
  isLoading: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

const ListContainer = <T,>({ title, items, isLoading, renderItem, className = '' }: ListContainerProps<T>) => (
    <div className={`card card-padding-default ${className}`}>
        <h2 className="text-section-heading mb-3">{title}</h2>
        {isLoading ? (
            <ul className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <li key={i} className="h-6 w-full bg-foreground-muted/20 animate-pulse rounded-app-sm"></li>
                ))}
            </ul>
        ) : items && items.length > 0 ? (
            <ul className="space-y-2 text-sm text-foreground">{items.map((item, index) => renderItem(item, index))}</ul>
        ) : (
            <p className="text-foreground-muted text-sm">No data available.</p>
        )}
    </div>
);

export default ListContainer;