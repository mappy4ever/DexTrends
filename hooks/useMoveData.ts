import { useState, useEffect, useCallback } from 'react';
import { showdownQueries, MoveCompetitiveDataRecord } from '@/utils/supabase';

interface UseMoveDataReturn {
  getMoveData: (moveName: string) => Promise<MoveCompetitiveDataRecord | null>;
  getMovesByType: (type: string) => Promise<MoveCompetitiveDataRecord[]>;
  getMovesByCategory: (category: 'physical' | 'special' | 'status') => Promise<MoveCompetitiveDataRecord[]>;
  searchMoves: (searchTerm: string) => Promise<MoveCompetitiveDataRecord[]>;
  moveCache: Map<string, MoveCompetitiveDataRecord>;
  isLoading: boolean;
}

export function useMoveData(): UseMoveDataReturn {
  const [moveCache] = useState(new Map<string, MoveCompetitiveDataRecord>());
  const [isLoading, setIsLoading] = useState(false);

  const getMoveData = useCallback(async (moveName: string): Promise<MoveCompetitiveDataRecord | null> => {
    const normalizedName = moveName.toLowerCase();
    
    // Check cache first
    if (moveCache.has(normalizedName)) {
      return moveCache.get(normalizedName)!;
    }

    setIsLoading(true);
    try {
      const data = await showdownQueries.getMoveData(moveName);
      if (data) {
        moveCache.set(normalizedName, data);
      }
      return data;
    } catch (error) {
      console.error('Error fetching move data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [moveCache]);

  const getMovesByType = useCallback(async (type: string): Promise<MoveCompetitiveDataRecord[]> => {
    setIsLoading(true);
    try {
      const moves = await showdownQueries.getMovesByType(type);
      // Cache individual moves
      moves.forEach(move => {
        moveCache.set(move.move_name, move);
      });
      return moves;
    } catch (error) {
      console.error('Error fetching moves by type:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [moveCache]);

  const getMovesByCategory = useCallback(async (category: 'physical' | 'special' | 'status'): Promise<MoveCompetitiveDataRecord[]> => {
    setIsLoading(true);
    try {
      const moves = await showdownQueries.getMovesByCategory(category);
      // Cache individual moves
      moves.forEach(move => {
        moveCache.set(move.move_name, move);
      });
      return moves;
    } catch (error) {
      console.error('Error fetching moves by category:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [moveCache]);

  const searchMoves = useCallback(async (searchTerm: string): Promise<MoveCompetitiveDataRecord[]> => {
    if (!searchTerm.trim()) return [];
    
    setIsLoading(true);
    try {
      const moves = await showdownQueries.searchMoves(searchTerm);
      // Cache individual moves
      moves.forEach(move => {
        moveCache.set(move.move_name, move);
      });
      return moves;
    } catch (error) {
      console.error('Error searching moves:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [moveCache]);

  return {
    getMoveData,
    getMovesByType,
    getMovesByCategory,
    searchMoves,
    moveCache,
    isLoading
  };
}