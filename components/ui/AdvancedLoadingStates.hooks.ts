import { useState } from 'react';
import type { 
  LoadingState, 
  LoadingStage, 
  UseLoadingStateReturn 
} from './AdvancedLoadingStates';

// Custom Hook for managing complex loading states
export const useLoadingState = (initialState: LoadingState = 'idle'): UseLoadingStateReturn => {
  const [loadingState, setLoadingState] = useState<LoadingState>(initialState);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const startLoading = (stages: LoadingStage[] = []) => {
    setLoadingState('loading');
    setProgress(0);
    setError(null);
    return { stages };
  };
  
  const updateProgress = (currentStage: number, totalStages: number) => {
    const percentage = Math.round((currentStage / totalStages) * 100);
    setProgress(percentage);
  };
  
  const completeLoading = () => {
    setLoadingState('success');
    setProgress(100);
  };
  
  const failLoading = (errorMessage: string) => {
    setLoadingState('error');
    setError(errorMessage);
  };
  
  const resetLoading = () => {
    setLoadingState('idle');
    setProgress(0);
    setError(null);
  };
  
  return {
    loadingState,
    progress,
    error,
    startLoading,
    updateProgress,
    completeLoading,
    failLoading,
    resetLoading,
    isLoading: loadingState === 'loading',
    isSuccess: loadingState === 'success',
    isError: loadingState === 'error',
    isIdle: loadingState === 'idle'
  };
};