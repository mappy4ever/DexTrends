import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/router'; // Automatically uses the mock from __mocks__
import PokemonDetail from './[pokeid]'; // Adjust path as necessary
import { FavoritesProvider } from '../../context/favoritescontext';
import { ThemeProvider } from '../../context/themecontext';

// Mock fetch globally
const mockFetch = jest.spyOn(global, 'fetch');

// Mock IntersectionObserver if any component uses it (e.g., for infinite scrolling, though not directly tested here)
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
global.IntersectionObserver = mockIntersectionObserver;

describe('PokemonDetail Page - Related Pokemon Section', () => {
  let mockPush;

  const mockPokemonDetails = {
    id: 1,
    name: 'bulbasaur',
    sprites: { other: { 'official-artwork': { front_default: 'bulbasaur.png' } } },
    types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
    height: 7,
    weight: 69,
    base_experience: 64,
    abilities: [{ ability: { name: 'overgrow' }, is_hidden: false }],
    stats: [{ stat: { name: 'hp' }, base_stat: 45, effort: 0 }],
    species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
  };

  const mockPokemonSpecies = {
    id: 1,
    name: 'bulbasaur',
    flavor_text_entries: [{ flavor_text: 'A strange seed was planted on its back at birth.', language: { name: 'en' } }],
    genera: [{ genus: 'Seed Pokémon', language: { name: 'en' } }],
    habitat: { name: 'grassland' },
    shape: { name: 'quadruped' },
    growth_rate: { name: 'medium-slow' },
    base_happiness: 70,
    capture_rate: 45,
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
    generation: { name: 'generation-i', url: 'https://pokeapi.co/api/v2/generation/1/' },
  };

  const mockGenerationDetails = {
    id: 1,
    name: 'generation-i',
    pokemon_species: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' }, // Current Pokemon
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },   // Related
      { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' },  // Related
    ],
  };

  const mockEvolutionChain = {
    id: 1,
    chain: {
      species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
      evolves_to: [{
        species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
        evolves_to: [{
          species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' },
          evolves_to: [],
        }],
      }],
    },
  };

  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockImplementation(() => ({
      push: mockPush,
      query: { pokeid: '1' }, // Default pokeid for tests
      pathname: '/pokedex/[pokeid]',
      asPath: '/pokedex/1',
      route: '/pokedex/[pokeid]',
      isReady: true,
    }));
    mockFetch.mockReset(); // Reset fetch mock before each test
  });

  const renderComponent = () => {
    render(
      <ThemeProvider>
        <FavoritesProvider>
          <PokemonDetail />
        </FavoritesProvider>
      </ThemeProvider>
    );
  };

  test('successfully displays related Pokemon and navigates on click', async () => {
    mockFetch
      .mockResolvedValueOnce({ // Pokemon Details
        ok: true,
        json: async () => mockPokemonDetails,
      })
      .mockResolvedValueOnce({ // Species Details
        ok: true,
        json: async () => mockPokemonSpecies,
      })
      .mockResolvedValueOnce({ // Generation Details
        ok: true,
        json: async () => mockGenerationDetails,
      })
      .mockResolvedValueOnce({ // Evolution Chain (called but not directly part of this test's assertions)
        ok: true,
        json: async () => mockEvolutionChain,
      })
      .mockResolvedValueOnce({ // TCG Cards (also called)
        ok: true,
        json: async () => ({ data: [] }),
      });

    renderComponent();

    // Wait for related Pokemon to appear
    await screen.findByText(/Other Pokémon in Gen I/i); // Heading uses "Gen I" after replace

    const relatedPokemonLink = await screen.findByText(/ivysaur/i); // Find by name
    expect(relatedPokemonLink).toBeInTheDocument();

    // Check navigation for related Pokemon (Ivysaur, ID 2)
    fireEvent.click(relatedPokemonLink);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/pokedex/2');
    });
  });

  test('shows loading state for related Pokemon', async () => {
    let resolveGeneration;
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockPokemonDetails })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPokemonSpecies })
      .mockImplementationOnce(() => { // Generation Details - delayed
        return new Promise(resolve => {
          resolveGeneration = () => resolve({ ok: true, json: async () => mockGenerationDetails });
        });
      })
      .mockResolvedValueOnce({ ok: true, json: async () => mockEvolutionChain })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });

    renderComponent();

    // Wait for main Pokemon details to load first
    await screen.findByText(mockPokemonDetails.name, {}, { timeout: 2000 });

    // Check for related Pokemon loading state
    // The loading state might be subtle, ensure your component shows one.
    // Here, we assume the "Other Pokemon in..." heading might not appear yet, or a specific loading text.
    // The implementation shows a spinner if relatedLoading && !relatedPokemonList.length
    expect(await screen.findByText(/Loading related Pokémon.../i)).toBeInTheDocument();

    // Resolve the generation fetch to finish the test
    await act(async () => {
      resolveGeneration();
    });
    await screen.findByText(/Other Pokémon in Gen I/i); // Ensure it loads after resolving
  });

  test('shows error state for related Pokemon if generation fetch fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockPokemonDetails })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPokemonSpecies })
      .mockRejectedValueOnce(new Error('Failed to fetch generation')) // Generation Details - fails
      .mockResolvedValueOnce({ ok: true, json: async () => mockEvolutionChain })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });

    renderComponent();

    // Wait for main Pokemon details to load first
    await screen.findByText(mockPokemonDetails.name, {}, { timeout: 2000 });

    // Check for related Pokemon error state
    expect(await screen.findByText(/Error: Failed to load related Pokemon./i)).toBeInTheDocument();
  });
});
