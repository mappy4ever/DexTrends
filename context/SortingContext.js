// /context/SortingContext.js
import React, { createContext, useState, useContext } from "react";

const SortingContext = createContext();

export function SortingProvider({ children }) {
  const [sortOrder, setSortOrder] = useState("id-asc"); // default sorting

  return (
    <SortingContext.Provider value={{ sortOrder, setSortOrder }}>
      {children}
    </SortingContext.Provider>
  );
}

// Custom hook for easy usage
export function useSorting() {
  return useContext(SortingContext);
}