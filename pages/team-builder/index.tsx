/**
 * Team Builder Page
 *
 * Comprehensive Pokemon team building tool with:
 * - Drag-and-drop team composition
 * - Type coverage analysis
 * - Synergy scoring
 * - Export/share functionality
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { TeamBuilderPanel, TeamPokemon } from '@/components/team-builder/TeamBuilderPanel';
import { Container } from '@/components/ui/Container';
import { cn } from '@/utils/cn';
import logger from '@/utils/logger';

// LocalStorage key for saving teams
const TEAM_STORAGE_KEY = 'dextrends_saved_team';

export default function TeamBuilderPage() {
  const router = useRouter();
  const [initialTeam, setInitialTeam] = useState<TeamPokemon[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved team or team from URL
  useEffect(() => {
    const loadTeam = async () => {
      // Check for team in URL query
      const { team: teamParam } = router.query;

      if (teamParam && typeof teamParam === 'string') {
        // Parse team IDs from URL
        const pokemonIds = teamParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

        if (pokemonIds.length > 0) {
          try {
            // Fetch Pokemon data for each ID
            const pokemonPromises = pokemonIds.slice(0, 6).map(async (id) => {
              const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
              if (response.ok) {
                const data = await response.json();
                return {
                  id: `p-${data.id}`,
                  pokedexId: data.id,
                  name: data.name,
                  types: data.types.map((t: { type: { name: string } }) => t.type.name),
                  sprite: data.sprites.front_default,
                  stats: {
                    hp: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'hp')?.base_stat || 0,
                    attack: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'attack')?.base_stat || 0,
                    defense: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'defense')?.base_stat || 0,
                    specialAttack: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'special-attack')?.base_stat || 0,
                    specialDefense: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'special-defense')?.base_stat || 0,
                    speed: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'speed')?.base_stat || 0,
                  },
                } as TeamPokemon;
              }
              return null;
            });

            const team = (await Promise.all(pokemonPromises)).filter(Boolean) as TeamPokemon[];
            setInitialTeam(team);
            logger.info('Team loaded from URL', { teamSize: team.length });
          } catch (error) {
            logger.error('Failed to load team from URL', { error });
          }
        }
      } else {
        // Load from localStorage
        try {
          const saved = localStorage.getItem(TEAM_STORAGE_KEY);
          if (saved) {
            const team = JSON.parse(saved);
            setInitialTeam(team);
            logger.info('Team loaded from localStorage', { teamSize: team.length });
          }
        } catch (error) {
          logger.error('Failed to load saved team', { error });
        }
      }

      setIsLoaded(true);
    };

    if (router.isReady) {
      loadTeam();
    }
  }, [router.isReady, router.query]);

  // Save team to localStorage when it changes
  const handleTeamChange = (team: TeamPokemon[]) => {
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
    } catch (error) {
      logger.error('Failed to save team', { error });
    }
  };

  const handleShare = (team: TeamPokemon[]) => {
    const teamIds = team.map(p => p.pokedexId).join(',');
    const shareUrl = `${window.location.origin}/team-builder?team=${teamIds}`;

    // Update URL without navigation
    router.replace(`/team-builder?team=${teamIds}`, undefined, { shallow: true });

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl);
    logger.info('Team share URL copied', { url: shareUrl });
  };

  return (
    <>
      <Head>
        <title>Pokemon Team Builder | DexTrends</title>
        <meta name="description" content="Build your perfect Pokemon team with type coverage analysis, synergy scoring, and sharing features." />
        <meta property="og:title" content="Pokemon Team Builder | DexTrends" />
        <meta property="og:description" content="Build and analyze your Pokemon team with comprehensive type coverage tools." />
      </Head>

      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        {/* Page Header */}
        <div className="bg-gradient-to-b from-blue-50 to-stone-50 dark:from-stone-800 dark:to-stone-900 border-b border-stone-200 dark:border-stone-700">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <nav className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              <Link href="/" className="hover:text-amber-600">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-stone-800 dark:text-white">Team Builder</span>
            </nav>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-white">
              Pokemon Team Builder
            </h1>
            <p className="text-stone-600 dark:text-stone-300 mt-2">
              Create balanced teams with type coverage analysis and synergy scoring
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {isLoaded ? (
            <TeamBuilderPanel
              initialTeam={initialTeam}
              onTeamChange={handleTeamChange}
              onShare={handleShare}
            />
          ) : (
            <Container variant="elevated" padding="lg" className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
            </Container>
          )}
        </div>
      </div>
    </>
  );
}
