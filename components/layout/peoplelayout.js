// components/layout/PeopleLayout.js
import React from 'react';

const PeopleLayout = ({ children }) => (
  <div className="section-spacing-y-default px-2 md:px-6 bg-background min-h-screen text-foreground">
    {children}
  </div>
);

export default PeopleLayout;