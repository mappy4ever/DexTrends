import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router'; // Automatically uses the mock from __mocks__
import PokeDex from './pokedex'; // Adjust path as necessary
import { FavoritesProvider } from '../context/favoritescontext';
import { SortingProvider } from '../context/sortingcontext';
import { ThemeProvider } from '../context/themecontext';
import { ViewSettingsProvider } from '../context/viewsettingscontext';

// Mock useSWRInfinite
jest.mock('swr/infinite', () => ({
  __esModule: true,
  default: jest.fn(),
}));
import useSWRInfinite from 'swr/infinite';

// Mock IntersectionObserver for LoadMoreTrigger
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
global.IntersectionObserver = mockIntersectionObserver;

describe('PokeDex Page', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    // Reset the useRouter mock to return our specific mockPush for each test
    useRouter.mockImplementation(() => ({
      push: mockPush,
      query: {},
      pathname: '/pokedex',
      asPath: '/pokedex',
      route: '/pokedex',
      isReady: true,
    }));

    // Reset SWR mock for each test
    useSWRInfinite.mockReturnValue({
      data: [
        {
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/', id: 1, types: ['grass', 'poison'] },
            { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/', id: 4, types: ['fire'] },
          ],
        },
      ],
      error: null,
      size: 1,
      setSize: jest.fn(),
      isValidating: false,
    });

    // Mock fetch for the detail calls inside PokeDex component's useEffect
    global.fetch = jest.fn((url) => {
      if (url.includes('bulbasaur')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, name: 'bulbasaur', types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }], sprites: { other: { 'official-artwork': { front_default: 'bulbasaur.png'}}}}),
        });
      }
      if (url.includes('charmander')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 4, name: 'charmander', types: [{ type: { name: 'fire' } }], sprites: { other: { 'official-artwork': { front_default: 'charmander.png'}}}})
        });
      }
      // Default fallback for other fetches if any
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('navigates to Pokemon detail page using Pokemon ID on card click', async () => {
    render(
      <ThemeProvider>
        <FavoritesProvider>
          <SortingProvider>
            <ViewSettingsProvider>
              <PokeDex />
            </ViewSettingsProvider>
          </SortingProvider>
        </FavoritesProvider>
      </ThemeProvider>
    );

    // Wait for the Pokemon data to be fetched and cards to render
    // Using name as part of the accessible name for the card link/button
    const bulbasaurCard = await screen.findByText(/bulbasaur/i, { selector: 'h3' });

    // The clickable element is the parent CardHover component
    // We need to find a way to target it. If it has role or testid, that's better.
    // For now, let's assume the h3 is inside the clickable card structure.
    const clickableCard = bulbasaurCard.closest('div[class*="group"]'); // This selector is a bit fragile

    expect(clickableCard).toBeInTheDocument();

    if (clickableCard) {
      fireEvent.click(clickableCard);
    } else {
      throw new Error("Clickable card for Bulbasaur not found. Adjust selector or component structure for testability.");
    }

    // Check if router.push was called with the ID
    // The component constructs pokeId from poke.id
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/pokedex/1');
    });
  });
});
