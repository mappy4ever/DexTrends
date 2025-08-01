import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import logger from '../utils/logger';



export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);
  
  // Throw error in effect to trigger error boundary
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return { resetError, throwError };
}
