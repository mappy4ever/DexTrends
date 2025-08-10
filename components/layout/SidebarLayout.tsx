import React, { useState, useCallback, ReactNode } from 'react';
import StickySidebar from '../ui/navigation/StickySidebar';

interface SidebarFilter {
  id: string;
  label: string;
  type: string;
  options?: Array<{ value: string; label: string }>;
  value?: string | string[] | number;
}

interface SidebarLayoutProps {
  children: ReactNode;
  sidebarFilters?: SidebarFilter[];
  onFilterChange?: (filterId: string, value: string | string[] | number) => void;
  sidebarContent?: ReactNode;
  className?: string;
}

export default function SidebarLayout({ 
  children, 
  sidebarFilters = [], 
  onFilterChange,
  sidebarContent,
  className = ""
}: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className={`flex min-h-screen ${className}`}>
      {/* Sidebar */}
      <StickySidebar
        filters={sidebarFilters}
        onFilterChange={onFilterChange}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      >
        {sidebarContent}
      </StickySidebar>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-0 md:ml-0' : ''}`}>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}