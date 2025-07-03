import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations";
import { useTheme } from "../../context/themecontext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { InlineLoadingSpinner } from "../../components/ui/LoadingSpinner";
import { SetLoadingScreen } from "../../components/ui/UnifiedLoadingScreen";
import StyledBackButton from "../../components/ui/StyledBackButton";
import PocketCardList from "../../components/PocketCardList";
import BackToTop from "../../components/ui/BackToTop";
import { fetchPocketData } from "../../utils/pocketData";

export default function PocketExpansions() {
  const [allCards, setAllCards] = useState([]);
  const [expansions, setExpansions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedExpansionId, setSelectedExpansionId] = useState(null);
  const [selectedExpansion, setSelectedExpansion] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { theme } = useTheme();

  // Filter options
  const [filterSeries, setFilterSeries] = useState("");
  const [sortOption, setSortOption] = useState("releaseDate");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    async function fetchExpansions() {
      setLoading(true);
      setError(null);
      try {
        const cards = await fetchPocketData();
        setAllCards(cards || []);
        
        // Process cards into expansion structure
        const expansionData = processCardsIntoExpansions(cards || []);
        setExpansions(expansionData);
      } catch (err) {
        setError("Failed to load Pocket expansions. Please try again later.");
        setAllCards([]);
        setExpansions([]);
      }
      setLoading(false);
    }
    fetchExpansions();
  }, []);

  // Process cards into expansion structure similar to TCG Sets
  const processCardsIntoExpansions = (cards) => {
    if (!cards.length) return [];
    
    // Filter out promo cards and redistribute shared cards to individual packs
    const mainSetCards = cards.filter(card => {
      const packName = (card.pack || '').toLowerCase();
      return !packName.includes('promo') && 
             !packName.includes('promotional') && 
             !packName.includes('special') &&
             !packName.includes('shop') &&
             !packName.includes('campaign') &&
             !packName.includes('premium') &&
             !packName.includes('wonder') &&
             packName !== 'unknown' &&
             packName !== '';
    });
    
    // Redistribute shared cards to individual packs based on type
    const redistributedCards = mainSetCards.map(card => {
      if (card.pack === 'Shared(Genetic Apex)') {
        const cardType = (card.type || '').toLowerCase();
        
        if (['grass', 'psychic', 'darkness', 'dark'].includes(cardType)) {
          return { ...card, pack: 'Mewtwo' };
        } else if (['lightning', 'electric'].includes(cardType)) {
          return { ...card, pack: 'Pikachu' };
        } else if (['water', 'fighting', 'fire'].includes(cardType)) {
          return { ...card, pack: 'Charizard' };
        } else {
          const hash = card.name.charCodeAt(0) % 3;
          const packs = ['Mewtwo', 'Pikachu', 'Charizard'];
          return { ...card, pack: packs[hash] };
        }
      }
      return card;
    });
    
    // Group cards by expansion series
    const seriesGroups = {
      'Genetic Apex': { 
        code: 'A1', 
        packs: ['Mewtwo', 'Charizard', 'Pikachu'], 
        releaseDate: '2024-10-30',
        description: 'The first expansion set for Pokémon TCG Pocket featuring legendary Pokémon.'
      },
      'Mythical Island': { 
        code: 'A1a', 
        packs: ['Mythical Island'], 
        releaseDate: '2024-11-01',
        description: 'Discover mystical Pokémon from the legendary Mythical Island.'
      },
      'Space-Time Smackdown': { 
        code: 'A2', 
        packs: ['Dialga', 'Palkia'], 
        releaseDate: '2024-12-01',
        description: 'Master time and space with the legendary powers of Dialga and Palkia.'
      },
      'Triumphant Light': { 
        code: 'A2a', 
        packs: ['Triumphant Light'], 
        releaseDate: '2024-12-15',
        description: 'Illuminate your path to victory with brilliant light-type Pokémon.'
      },
      'Shining Revelry': { 
        code: 'A2b', 
        packs: ['Shining Revelry'], 
        releaseDate: '2024-12-30',
        description: 'Experience the ultimate rivalry with shining rare Pokémon cards.'
      },
      'Celestial Guardians': { 
        code: 'A3', 
        packs: ['Solgaleo', 'Lunala'], 
        releaseDate: '2025-01-15',
        description: 'Harness the celestial powers of the sun and moon guardians.'
      },
      'Extradimensional Crisis': { 
        code: 'A3a', 
        packs: ['Extradimensional Crisis'], 
        releaseDate: '2025-02-01',
        description: 'Battle across dimensions with ultra-rare interdimensional Pokémon.'
      },
      'Eevee Grove': { 
        code: 'A4', 
        packs: ['Eevee Grove'], 
        releaseDate: '2025-03-01',
        description: 'Celebrate the evolution possibilities with Eevee and all its evolutions in this special grove expansion.'
      }
    };
    
    // Build expansion data
    const expansions = [];
    
    Object.entries(seriesGroups).forEach(([seriesName, seriesInfo]) => {
      const seriesCards = redistributedCards.filter(card => 
        seriesInfo.packs.includes(card.pack)
      );
      
      // Skip minimum card check for Eevee Grove to ensure it's included
      if (seriesCards.length < 50 && seriesName !== 'Eevee Grove') return; // Only include series with significant card counts
      
      // Define expansion logos/images using generated SVGs since API doesn't have them
      const expansionImages = {
        'Genetic Apex': {
          logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJhcGV4R3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOUI1OUI2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2QzQxODM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjYXBleFdyYWQpIi8+CiAgPHRleHQgeD0iMTIwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPkdlbmV0aWMgQXBleDwvdGV4dD4KPC9zdmc+',
          symbol: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iIzlCNTlCNiIgc3Ryb2tlPSIjNkM0MTgzIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIzMCIgeT0iMzciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5HQTwvdGV4dD4KPC9zdmc+'
        },
        'Mythical Island': {
          logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJteXRoR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNTBCRkU2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzNjk5QzM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9InVybCgjbXl0aEdyYWQpIi8+CiAgPHRleHQgeD0iMTIwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPk15dGhpY2FsIElzbGFuZDwvdGV4dD4KPC9zdmc+', 
          symbol: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iIzUwQkZFNiIgc3Ryb2tlPSIjMzY5OUMzIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIzMCIgeT0iMzciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5NSTwvdGV4dD4KPC9zdmc+'
        },
        'Space-Time Smackdown': {
          logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJzcGFjZUdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzQ0NDRBQTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMjIyMjY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSI4MCIgcng9IjEwIiBmaWxsPSJ1cmwoI3NwYWNlR3JhZCkiLz4KICA8dGV4dCB4PSIxMjAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+U3BhY2UtVGltZTwvdGV4dD4KICA8dGV4dCB4PSIxMjAiIHk9IjU1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+U21hY2tkb3duPC90ZXh0Pgo8L3N2Zz4=',
          symbol: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iIzQ0NDRBQSIgc3Ryb2tlPSIjMjIyMjY2IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIzMCIgeT0iMzciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5TVDwvdGV4dD4KPC9zdmc+'
        },
        'Triumphant Light': {
          logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsaWdodEdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRDQ0NDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZBQTAwO3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSI4MCIgcng9IjEwIiBmaWxsPSJ1cmwoI2xpZ2h0R3JhZCkiLz4KICA8dGV4dCB4PSIxMjAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzMzIj5Ucml1bXBoYW50IExpZ2h0PC90ZXh0Pgo8L3N2Zz4=',
          symbol: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iI0ZGRDQ0NCIgc3Ryb2tlPSIjRkZBQTAwIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIzMCIgeT0iMzciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzMiPlRMPC90ZXh0Pgo8L3N2Zz4='
        },
        'Shining Revelry': {
          logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJzaGluZUdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGNjZBQTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojQ0M0NDc3O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSI4MCIgcng9IjEwIiBmaWxsPSJ1cmwoI3NoaW5lR3JhZCkiLz4KICA8dGV4dCB4PSIxMjAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+U2hpbmluZyBSZXZlbHJ5PC90ZXh0Pgo8L3N2Zz4=',
          symbol: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iI0ZGNjZBQSIgc3Ryb2tlPSIjQ0M0NDc3IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIzMCIgeT0iMzciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5TUjwvdGV4dD4KPC9zdmc+'
        },
        'Celestial Guardians': {
          logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJjZWxlc3RHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0NDRBN0Y7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzI4MjQ1NTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iODAiIHJ4PSIxMCIgZmlsbD0idXJsKCNjZWxlc3RHcmFkKSIvPgogIDx0ZXh0IHg9IjEyMCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5DZWxlc3RpYWw8L3RleHQ+CiAgPHRleHQgeD0iMTIwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPkd1YXJkaWFuczwvdGV4dD4KPC9zdmc+',
          symbol: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iIzQ0NEE3RiIgc3Ryb2tlPSIjMjgyNDU1IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIzMCIgeT0iMzciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5DRzwvdGV4dD4KPC9zdmc+'
        },
        'Extradimensional Crisis': {
          logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJleHRyYUdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzlBNDRGRjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNkEyMkNDO3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSI4MCIgcng9IjEwIiBmaWxsPSJ1cmwoI2V4dHJhR3JhZCkiLz4KICA8dGV4dCB4PSIxMjAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+RXh0cmFkaW1lbnNpb25hbDwvdGV4dD4KICA8dGV4dCB4PSIxMjAiIHk9IjU1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+Q3Jpc2lzPC90ZXh0Pgo8L3N2Zz4=',
          symbol: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iIzlBNDRGRiIgc3Ryb2tlPSIjNkEyMkNDIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIzMCIgeT0iMzciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5FQzwvdGV4dD4KPC9zdmc+'
        },
        'Eevee Grove': {
          logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJlZXZlZUdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjQ1MTM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRDJBODdEO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjQ1MTM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9IiNGNUYwRTYiLz4KICA8dGV4dCB4PSIxMjAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ1cmwoI2VldmVlR3JhZGllbnQpIj5FZXZlZSBHcm92ZTwvdGV4dD4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjQwIiByPSIxNSIgZmlsbD0iI0QyQTg3RCIgb3BhY2l0eT0iMC4zIi8+CiAgPGNpcmNsZSBjeD0iMjEwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjRDJBODdEIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+',
          symbol: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyOCIgZmlsbD0iI0YwRTRENiIgc3Ryb2tlPSIjOEI0NTEzIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cGF0aCBkPSJNIDMwIDEwIEMgMjAgMTAgMTUgMjAgMTUgMzAgQyAxNSA0MCAyMCA0NSAzMCA0NSBDIDQwIDQ1IDQ1IDQwIDQ1IDMwIEMgNDUgMjAgNDAgMTAgMzAgMTAgWiIgZmlsbD0iI0QyQTg3RCIvPgogIDx0ZXh0IHg9IjMwIiB5PSIzNyIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzVDMkUwMCI+RTwvdGV4dD4KPC9zdmc+'
        }
      };
      
      expansions.push({
        id: seriesName.toLowerCase().replace(/\s+/g, '-'),
        name: seriesName,
        images: expansionImages[seriesName] || {
          logo: 'https://images.pokemontcg.io/base1/logo.png',
          symbol: 'https://images.pokemontcg.io/base1/symbol.png'
        },
        code: seriesInfo.code,
        releaseDate: seriesInfo.releaseDate,
        description: seriesInfo.description,
        total: seriesCards.length,
        series: 'Pokémon TCG Pocket',
        cards: seriesCards
      });
    });
    
    return expansions;
  };

  // Helper functions for expansion metadata
  function getExpansionSymbol(name) {
    const symbols = {
      'Genetic Apex': '/images/PocketSymbols/genetic-apex.png',
      'Mythical Island': '/images/PocketSymbols/mythical-island.png',
      'Space-Time Smackdown': '/images/PocketSymbols/space-time-smackdown.png',
      'Triumphant Light': '/images/PocketSymbols/triumphant-light.png',
      'Shining Revelry': '/images/PocketSymbols/shining-revelry.png',
      'Celestial Guardians': '/images/PocketSymbols/celestial-guardians.png',
      'Extradimensional Crisis': '/images/PocketSymbols/extradimensional-crisis.png',
      'Eevee Grove': '/images/PocketSymbols/eevee-grove.png'
    };
    return symbols[name] || null;
  }

  function getExpansionLogo(name) {
    const logos = {
      'Genetic Apex': '/images/PocketLogos/genetic-apex-logo.png',
      'Mythical Island': '/images/PocketLogos/mythical-island-logo.png',
      'Space-Time Smackdown': '/images/PocketLogos/space-time-smackdown-logo.png',
      'Triumphant Light': '/images/PocketLogos/triumphant-light-logo.png',
      'Shining Revelry': '/images/PocketLogos/shining-revelry-logo.png',
      'Celestial Guardians': '/images/PocketLogos/celestial-guardians-logo.png',
      'Extradimensional Crisis': '/images/PocketLogos/extradimensional-crisis-logo.png',
      'Eevee Grove': '/images/PocketLogos/eevee-grove-logo.png'
    };
    return logos[name] || null;
  }

  // Extract unique series for filtering
  const uniqueSeries = useMemo(() => {
    const seriesSet = new Set();
    expansions.forEach(expansion => {
      if (expansion.series) {
        seriesSet.add(expansion.series);
      }
    });
    return Array.from(seriesSet).sort();
  }, [expansions]);

  // Filter expansions by search query and series
  const filteredExpansions = useMemo(() => {
    return expansions.filter((expansion) => {
      let matches = expansion.name.toLowerCase().includes(search.toLowerCase());
      
      if (filterSeries && expansion.series) {
        matches = matches && expansion.series === filterSeries;
      }
      
      return matches;
    });
  }, [expansions, search, filterSeries]);

  // Sort the filtered expansions
  const sortedExpansions = useMemo(() => {
    return [...filteredExpansions].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "releaseDate":
          comparison = new Date(a.releaseDate || "1970-01-01") - new Date(b.releaseDate || "1970-01-01");
          break;
        case "cardCount":
          comparison = (a.total || 0) - (b.total || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredExpansions, sortOption, sortDirection]);

  // Infinite scroll for expansions
  const { visibleItems: visibleExpansions, hasMore, isLoading: scrollLoading, sentinelRef } = useInfiniteScroll(
    sortedExpansions, 
    12, // Initial visible count
    6   // Load 6 more at a time
  );

  // Handle expansion click to show cards
  const handleExpansionClick = (expansion) => {
    setSelectedExpansion(expansion);
  };

  // If showing cards for a specific expansion, render the card list
  if (selectedExpansion) {
    return (
      <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
        <Head>
          <title>{selectedExpansion.name} Cards | Pokémon Pocket | DexTrends</title>
          <meta name="description" content={`Browse all cards from ${selectedExpansion.name} expansion in Pokémon TCG Pocket.`} />
        </Head>
        
        <FadeIn>
          <div className="mb-6 flex items-center gap-4">
            <StyledBackButton 
              variant="pocket" 
              text="Back to Expansions" 
              onClick={() => setSelectedExpansion(null)} 
            />
            <div>
              <h1 className="text-3xl font-bold">{selectedExpansion.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{selectedExpansion.description}</p>
            </div>
          </div>
          
          <PocketCardList 
            cards={selectedExpansion.cards}
            loading={false}
            error={null}
            emptyMessage={`No cards found in ${selectedExpansion.name}.`}
            showPack={true}
            showRarity={true}
            showHP={true}
            imageWidth={110}
            imageHeight={154}
          />
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <Head>
        <title>Pokémon Pocket Expansions | DexTrends</title>
        <meta name="description" content="Browse Pokémon TCG Pocket expansion sets and discover cards from each collection." />
      </Head>
      
      <FadeIn>
        <div className="mb-6">
          <StyledBackButton variant="pocket" text="Back to Pocket Mode" onClick={() => router.push('/pocketmode')} />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-8">Pokémon Pocket Expansions</h1>
        
        <div className={`p-6 rounded-xl shadow-md mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="searchInput" className="block text-sm font-medium mb-1">Search Expansions</label>
              <div className="relative">
                <input
                  id="searchInput"
                  type="text"
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Search for an expansion (e.g., Genetic Apex, Mythical Island)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="seriesFilter" className="block text-sm font-medium mb-1">Filter by Series</label>
              <select
                id="seriesFilter"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={filterSeries}
                onChange={(e) => setFilterSeries(e.target.value)}
              >
                <option value="">All Series</option>
                {uniqueSeries.map(series => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="sortOption" className="block text-sm font-medium mb-1">Sort By</label>
              <select
                id="sortOption"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="releaseDate">Release Date</option>
                <option value="name">Name</option>
                <option value="cardCount">Card Count</option>
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="sortDirection" className="block text-sm font-medium mb-1">Order</label>
              <select
                id="sortDirection"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            
            <button 
              className="w-full md:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
              onClick={() => {
                setSearch("");
                setFilterSeries("");
                setSortOption("releaseDate");
                setSortDirection("desc");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </FadeIn>
      
      {loading ? (
        <SetLoadingScreen 
          message="Loading Pocket expansions..."
          preventFlash={true}
        />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      ) : (
        <StaggeredChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {visibleExpansions.map((expansion) => (
            <CardHover
              key={expansion.id}
              className="animate-fadeIn"
              onClick={() => handleExpansionClick(expansion)}
            >
              <div 
                className={`relative flex flex-col h-full rounded-xl overflow-hidden shadow-md border cursor-pointer ${
                  selectedExpansionId === expansion.id 
                    ? 'border-purple-500 ring-2 ring-purple-500' 
                    : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
              >
                {/* Expansion Image Background */}
                {expansion.images?.logo && (
                  <div className="relative h-32 w-full bg-gradient-to-b from-purple-100 to-purple-200 flex items-center justify-center p-4 overflow-hidden">
                    {expansion.images.symbol && (
                      <div className="absolute opacity-10 w-full h-full flex items-center justify-center">
                        <img
                          src={expansion.images.symbol}
                          alt=""
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                    )}
                    <img
                      src={expansion.images.logo}
                      alt={expansion.name}
                      className="max-h-20 max-w-[80%] object-contain z-10"
                      draggable="false"
                    />
                  </div>
                )}
                
                {/* Expansion Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="font-bold text-lg">{expansion.name}</h2>
                  
                  {expansion.series && (
                    <p className="text-sm text-gray-500 mb-2">{expansion.series}</p>
                  )}
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {expansion.description}
                  </p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Released</p>
                      <p className="font-medium">{expansion.releaseDate || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cards</p>
                      <p className="font-medium">{expansion.total || "?"}</p>
                    </div>
                  </div>
                  
                  {/* View Cards Button */}
                  <div className="mt-4">
                    <button 
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors text-sm"
                    >
                      View Cards
                    </button>
                  </div>
                </div>
              </div>
            </CardHover>
          ))}
        </StaggeredChildren>
      )}

      {/* Infinite scroll loading indicator */}
      {hasMore && (
        <div ref={sentinelRef} className="h-4 w-full flex items-center justify-center">
          {scrollLoading && (
            <InlineLoadingSpinner 
              text="Loading more expansions..." 
              className="mt-8"
            />
          )}
        </div>
      )}

      {/* Show scroll hint */}
      {!loading && !error && hasMore && (
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {visibleExpansions.length} of {sortedExpansions.length} expansions
          <div className="text-xs text-primary mt-1">
            Scroll down to load more...
          </div>
        </div>
      )}

      {!loading && !scrollLoading && !hasMore && sortedExpansions.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          All {sortedExpansions.length} expansions loaded
        </div>
      )}
      
      {!loading && !error && sortedExpansions.length === 0 && (
        <div className="text-center py-16">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h9a2 2 0 002-2V6a2 2 0 00-2-2h-1.064M12 20v-2m0 0c-2.761 0-5-2.239-5-5a5 5 0 0110 0c0 2.761-2.239 5-5 5z" />
          </svg>
          <h3 className="text-xl font-bold mt-4">No Expansions Found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          <button 
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
            onClick={() => {
              setSearch("");
              setFilterSeries("");
              setSortOption("releaseDate");
              setSortDirection("desc");
            }}
          >
            Show All Expansions
          </button>
        </div>
      )}
      
      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}