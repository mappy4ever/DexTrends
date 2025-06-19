import React, { useState } from 'react';
import StickySidebar from '../ui/StickySidebar';

export default function SidebarLayout({ 
  children, 
  sidebarFilters = [], 
  onFilterChange,
  sidebarContent,
  className = ""
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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