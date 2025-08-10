import React, { useEffect, useState } from 'react';
import { testSupabaseConnection, showdownQueries } from '@/utils/supabase';
import type { AnyObject } from '../types/common';

interface ConnectionStatus {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

interface TypeEffectivenessData {
  attacking: string;
  defending: string;
  multiplier: number;
}

interface LearnsetData {
  pokemon: string;
  moveCount: number;
  sampleMoves: string[];
}

export default function TestSupabase() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [typeEffectiveness, setTypeEffectiveness] = useState<TypeEffectivenessData | null>(null);
  const [learnsetData, setLearnsetData] = useState<LearnsetData | null>(null);
  const [tierData, setTierData] = useState<AnyObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function runTests() {
      const newErrors: string[] = [];
      
      // Test 1: Connection Test
      try {
        const result = await testSupabaseConnection();
        setConnectionStatus(result);
        if (!result.success) {
          newErrors.push(`Connection test failed: ${result.error}`);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        newErrors.push(`Connection test error: ${errorMessage}`);
      }

      // Test 2: Type Effectiveness
      try {
        const effectiveness = await showdownQueries.getTypeEffectiveness('fire', 'water');
        setTypeEffectiveness({ attacking: 'fire', defending: 'water', multiplier: effectiveness });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        newErrors.push(`Type effectiveness error: ${errorMessage}`);
      }

      // Test 3: Pokemon Learnset
      try {
        const learnset = await showdownQueries.getPokemonLearnset('pikachu', 9);
        setLearnsetData({ 
          pokemon: 'pikachu', 
          moveCount: learnset.length,
          sampleMoves: learnset.slice(0, 5)
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        newErrors.push(`Learnset error: ${errorMessage}`);
      }

      // Test 4: Competitive Tiers
      try {
        const tiers = await showdownQueries.getPokemonTiers('pikachu');
        setTierData(tiers);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        newErrors.push(`Tiers error: ${errorMessage}`);
      }

      setErrors(newErrors);
      setLoading(false);
    }

    runTests();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Integration Test</h1>
      
      {loading ? (
        <div className="text-lg">Running tests...</div>
      ) : (
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
            <pre className="bg-white p-2 rounded">
              {JSON.stringify(connectionStatus, null, 2)}
            </pre>
          </div>

          {/* Type Effectiveness */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Type Effectiveness Test</h2>
            <pre className="bg-white p-2 rounded">
              {JSON.stringify(typeEffectiveness, null, 2)}
            </pre>
          </div>

          {/* Learnset Data */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Pokemon Learnset Test</h2>
            <pre className="bg-white p-2 rounded">
              {JSON.stringify(learnsetData, null, 2)}
            </pre>
          </div>

          {/* Tier Data */}
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Competitive Tiers Test</h2>
            <pre className="bg-white p-2 rounded">
              {JSON.stringify(tierData, null, 2)}
            </pre>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-100 p-4 rounded">
              <h2 className="text-xl font-semibold mb-2 text-red-800">Errors</h2>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}