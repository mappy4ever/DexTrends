import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';



export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return setError;
};
