/**
 * Deck Sharing Page
 *
 * Simple, clean deck sharing tool with:
 * - Create and share deck lists
 * - Import from text/JSON
 * - Export in multiple formats
 * - Visual deck preview
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, ContainerHeader, ContainerTitle, ContainerDescription } from '@/components/ui/Container';
import Button, { ButtonGroup } from '@/components/ui/Button';
import { Modal, useModalState } from '@/components/ui/Modal';
import { EnergyIcon } from '@/components/ui/EnergyIcon';
import { cn } from '@/utils/cn';
import {
  BsPlus,
  BsShare,
  BsDownload,
  BsUpload,
  BsClipboard,
  BsClipboardCheck,
  BsTrash,
  BsSearch,
  BsX,
} from 'react-icons/bs';
import logger from '@/utils/logger';

// Simplified card type for deck building
interface DeckCard {
  id: string;
  name: string;
  image: string;
  type?: string;
  set?: string;
  number?: string;
  category: 'pokemon' | 'trainer' | 'energy';
  count: number;
}

interface SavedDeck {
  id: string;
  name: string;
  format: 'standard' | 'expanded' | 'unlimited';
  cards: DeckCard[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'dextrends_saved_decks';

export default function DeckSharingPage() {
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<SavedDeck | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const newDeckModal = useModalState();
  const importModal = useModalState();
  const shareModal = useModalState();
  const addCardModal = useModalState();

  // Load decks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setDecks(data);
        if (data.length > 0) {
          setActiveDeck(data[0]);
        }
      }
    } catch (error) {
      logger.error('Failed to load decks', { error });
    }
    setIsLoaded(true);
  }, []);

  // Save decks to localStorage
  const saveDecks = useCallback((newDecks: SavedDeck[]) => {
    setDecks(newDecks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDecks));
  }, []);

  // Create new deck
  const handleCreateDeck = useCallback((name: string, format: SavedDeck['format']) => {
    const newDeck: SavedDeck = {
      id: `deck-${Date.now()}`,
      name,
      format,
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newDecks = [...decks, newDeck];
    saveDecks(newDecks);
    setActiveDeck(newDeck);
    newDeckModal.close();
  }, [decks, saveDecks, newDeckModal]);

  // Delete deck
  const handleDeleteDeck = useCallback((deckId: string) => {
    const newDecks = decks.filter(d => d.id !== deckId);
    saveDecks(newDecks);
    if (activeDeck?.id === deckId) {
      setActiveDeck(newDecks[0] || null);
    }
  }, [decks, activeDeck, saveDecks]);

  // Add card to deck
  const handleAddCard = useCallback((card: Omit<DeckCard, 'count'>) => {
    if (!activeDeck) return;

    const existingIndex = activeDeck.cards.findIndex(c => c.id === card.id);
    let newCards: DeckCard[];

    if (existingIndex >= 0) {
      // Increment count if card exists
      newCards = activeDeck.cards.map((c, i) =>
        i === existingIndex ? { ...c, count: Math.min(c.count + 1, 4) } : c
      );
    } else {
      // Add new card
      newCards = [...activeDeck.cards, { ...card, count: 1 }];
    }

    const updatedDeck = { ...activeDeck, cards: newCards, updatedAt: new Date().toISOString() };
    setActiveDeck(updatedDeck);
    saveDecks(decks.map(d => d.id === activeDeck.id ? updatedDeck : d));
  }, [activeDeck, decks, saveDecks]);

  // Remove card from deck
  const handleRemoveCard = useCallback((cardId: string) => {
    if (!activeDeck) return;

    const card = activeDeck.cards.find(c => c.id === cardId);
    if (!card) return;

    let newCards: DeckCard[];
    if (card.count > 1) {
      newCards = activeDeck.cards.map(c =>
        c.id === cardId ? { ...c, count: c.count - 1 } : c
      );
    } else {
      newCards = activeDeck.cards.filter(c => c.id !== cardId);
    }

    const updatedDeck = { ...activeDeck, cards: newCards, updatedAt: new Date().toISOString() };
    setActiveDeck(updatedDeck);
    saveDecks(decks.map(d => d.id === activeDeck.id ? updatedDeck : d));
  }, [activeDeck, decks, saveDecks]);

  // Deck stats
  const deckStats = useMemo(() => {
    if (!activeDeck) return { total: 0, pokemon: 0, trainer: 0, energy: 0 };

    return activeDeck.cards.reduce((acc, card) => ({
      total: acc.total + card.count,
      pokemon: acc.pokemon + (card.category === 'pokemon' ? card.count : 0),
      trainer: acc.trainer + (card.category === 'trainer' ? card.count : 0),
      energy: acc.energy + (card.category === 'energy' ? card.count : 0),
    }), { total: 0, pokemon: 0, trainer: 0, energy: 0 });
  }, [activeDeck]);

  // Export as text
  const handleExportText = useCallback(() => {
    if (!activeDeck) return;

    const lines = [
      `# ${activeDeck.name}`,
      `Format: ${activeDeck.format}`,
      '',
      '## Pokemon',
      ...activeDeck.cards.filter(c => c.category === 'pokemon').map(c => `${c.count}x ${c.name}`),
      '',
      '## Trainer',
      ...activeDeck.cards.filter(c => c.category === 'trainer').map(c => `${c.count}x ${c.name}`),
      '',
      '## Energy',
      ...activeDeck.cards.filter(c => c.category === 'energy').map(c => `${c.count}x ${c.name}`),
    ];

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDeck.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeDeck]);

  // Copy share link
  const handleCopyLink = useCallback(() => {
    if (!activeDeck) return;

    const data = btoa(JSON.stringify({
      n: activeDeck.name,
      f: activeDeck.format,
      c: activeDeck.cards.map(c => ({ i: c.id, n: c.name, t: c.category, c: c.count }))
    }));
    const url = `${window.location.origin}/deck-sharing?d=${data.slice(0, 100)}`;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeDeck]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Deck Sharing | DexTrends</title>
        <meta name="description" content="Create, share, and import Pokemon TCG deck lists." />
      </Head>

      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        {/* Header */}
        <div className="bg-gradient-to-b from-indigo-50 to-stone-50 dark:from-stone-800 dark:to-stone-900 border-b border-stone-200 dark:border-stone-700">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <nav className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              <Link href="/" className="hover:text-amber-600">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-stone-800 dark:text-white">Deck Sharing</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-stone-800 dark:text-white">
                  Deck Sharing
                </h1>
                <p className="text-stone-600 dark:text-stone-300 mt-1">
                  Build, share, and import deck lists
                </p>
              </div>
              <ButtonGroup spacing="sm">
                <Button
                  variant="secondary"
                  icon={<BsUpload className="w-4 h-4" />}
                  onClick={importModal.open}
                >
                  Import
                </Button>
                <Button
                  variant="primary"
                  icon={<BsPlus className="w-4 h-4" />}
                  onClick={newDeckModal.open}
                >
                  New Deck
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Deck List Sidebar */}
            <div className="lg:col-span-1">
              <Container variant="elevated" padding="md">
                <ContainerHeader>
                  <ContainerTitle size="sm">Your Decks</ContainerTitle>
                </ContainerHeader>

                {decks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">
                      No decks yet
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<BsPlus className="w-4 h-4" />}
                      onClick={newDeckModal.open}
                    >
                      Create Deck
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {decks.map(deck => (
                      <button
                        key={deck.id}
                        onClick={() => setActiveDeck(deck)}
                        className={cn(
                          'w-full text-left p-3 rounded-lg transition-colors',
                          activeDeck?.id === deck.id
                            ? 'bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700'
                            : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700'
                        )}
                      >
                        <div className="font-medium text-stone-800 dark:text-white truncate">
                          {deck.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-stone-500 dark:text-stone-400">
                            {deck.format}
                          </span>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-500 dark:text-stone-400">
                            {deck.cards.reduce((sum, c) => sum + c.count, 0)} cards
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Container>
            </div>

            {/* Main Deck Editor */}
            <div className="lg:col-span-3">
              {activeDeck ? (
                <div className="space-y-4">
                  {/* Deck Header */}
                  <Container variant="elevated" padding="md">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-stone-800 dark:text-white">
                          {activeDeck.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            activeDeck.format === 'standard' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            activeDeck.format === 'expanded' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          )}>
                            {activeDeck.format}
                          </span>
                          <span className={cn(
                            'text-sm font-medium',
                            deckStats.total === 60 ? 'text-green-600 dark:text-green-400' :
                            deckStats.total < 60 ? 'text-amber-600 dark:text-amber-400' :
                            'text-red-600 dark:text-red-400'
                          )}>
                            {deckStats.total}/60 cards
                          </span>
                        </div>
                      </div>
                      <ButtonGroup spacing="sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<BsTrash className="w-4 h-4" />}
                          onClick={() => handleDeleteDeck(activeDeck.id)}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<BsDownload className="w-4 h-4" />}
                          onClick={handleExportText}
                        >
                          Export
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={copied ? <BsClipboardCheck className="w-4 h-4" /> : <BsShare className="w-4 h-4" />}
                          onClick={handleCopyLink}
                        >
                          {copied ? 'Copied!' : 'Share'}
                        </Button>
                      </ButtonGroup>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{deckStats.pokemon}</div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">Pokemon</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{deckStats.trainer}</div>
                        <div className="text-xs text-purple-700 dark:text-purple-300">Trainers</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{deckStats.energy}</div>
                        <div className="text-xs text-amber-700 dark:text-amber-300">Energy</div>
                      </div>
                    </div>
                  </Container>

                  {/* Card List */}
                  <Container variant="elevated" padding="md">
                    <div className="flex items-center justify-between mb-4">
                      <ContainerTitle size="sm">Cards</ContainerTitle>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<BsPlus className="w-4 h-4" />}
                        onClick={addCardModal.open}
                      >
                        Add Card
                      </Button>
                    </div>

                    {activeDeck.cards.length === 0 ? (
                      <div className="text-center py-12">
                        <BsSearch className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-4" />
                        <h3 className="text-lg font-medium text-stone-800 dark:text-white mb-2">
                          No cards yet
                        </h3>
                        <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">
                          Start building your deck by adding cards
                        </p>
                        <Button
                          variant="primary"
                          icon={<BsPlus className="w-4 h-4" />}
                          onClick={addCardModal.open}
                        >
                          Add Your First Card
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Pokemon */}
                        {activeDeck.cards.filter(c => c.category === 'pokemon').length > 0 && (
                          <CardSection
                            title="Pokemon"
                            cards={activeDeck.cards.filter(c => c.category === 'pokemon')}
                            onRemove={handleRemoveCard}
                          />
                        )}

                        {/* Trainer */}
                        {activeDeck.cards.filter(c => c.category === 'trainer').length > 0 && (
                          <CardSection
                            title="Trainer"
                            cards={activeDeck.cards.filter(c => c.category === 'trainer')}
                            onRemove={handleRemoveCard}
                          />
                        )}

                        {/* Energy */}
                        {activeDeck.cards.filter(c => c.category === 'energy').length > 0 && (
                          <CardSection
                            title="Energy"
                            cards={activeDeck.cards.filter(c => c.category === 'energy')}
                            onRemove={handleRemoveCard}
                          />
                        )}
                      </div>
                    )}
                  </Container>
                </div>
              ) : (
                <Container variant="elevated" padding="lg" className="text-center">
                  <BsSearch className="w-16 h-16 mx-auto text-stone-300 dark:text-stone-600 mb-4" />
                  <h3 className="text-xl font-medium text-stone-800 dark:text-white mb-2">
                    No Deck Selected
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 mb-6">
                    Create a new deck or select an existing one to get started
                  </p>
                  <Button
                    variant="primary"
                    icon={<BsPlus className="w-4 h-4" />}
                    onClick={newDeckModal.open}
                  >
                    Create Your First Deck
                  </Button>
                </Container>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Deck Modal */}
      <NewDeckModal
        isOpen={newDeckModal.isOpen}
        onClose={newDeckModal.close}
        onCreate={handleCreateDeck}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={importModal.isOpen}
        onClose={importModal.close}
        onImport={(deck) => {
          const newDecks = [...decks, deck];
          saveDecks(newDecks);
          setActiveDeck(deck);
          importModal.close();
        }}
      />

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={addCardModal.isOpen}
        onClose={addCardModal.close}
        onAdd={handleAddCard}
      />
    </>
  );
}

// Card Section Component
const CardSection: React.FC<{
  title: string;
  cards: DeckCard[];
  onRemove: (id: string) => void;
}> = ({ title, cards, onRemove }) => (
  <div>
    <h4 className="text-sm font-semibold text-stone-600 dark:text-stone-300 mb-2">
      {title} ({cards.reduce((sum, c) => sum + c.count, 0)})
    </h4>
    <div className="space-y-1">
      {cards.map(card => (
        <div
          key={card.id}
          className="flex items-center gap-3 p-2 rounded-lg bg-stone-50 dark:bg-stone-800/50 group"
        >
          <span className="w-6 text-center text-sm font-medium text-stone-600 dark:text-stone-300">
            {card.count}x
          </span>
          {card.image && (
            <div className="w-8 h-10 rounded overflow-hidden flex-shrink-0">
              <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-stone-800 dark:text-white truncate">
              {card.name}
            </div>
            {card.set && (
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {card.set} {card.number && `#${card.number}`}
              </div>
            )}
          </div>
          {card.type && <EnergyIcon type={card.type} size="sm" />}
          <button
            onClick={() => onRemove(card.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-opacity"
          >
            <BsX className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// New Deck Modal
const NewDeckModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, format: SavedDeck['format']) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [format, setFormat] = useState<SavedDeck['format']>('standard');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), format);
      setName('');
      setFormat('standard');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Deck" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Deck Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="My Awesome Deck"
            className={cn(
              'w-full px-4 py-2 rounded-lg',
              'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
              'text-stone-800 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-amber-500'
            )}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['standard', 'expanded', 'unlimited'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
                  format === f
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth disabled={!name.trim()}>
          Create Deck
        </Button>
      </form>
    </Modal>
  );
};

// Import Modal
const ImportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onImport: (deck: SavedDeck) => void;
}> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      // Try JSON
      const data = JSON.parse(text);
      if (data.name && data.cards) {
        onImport({
          id: `deck-${Date.now()}`,
          name: data.name,
          format: data.format || 'standard',
          cards: data.cards,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setText('');
        setError(null);
        return;
      }
    } catch {
      // Try text format parsing
      const lines = text.split('\n');
      const name = lines[0]?.replace('#', '').trim() || 'Imported Deck';
      const cards: DeckCard[] = [];

      lines.forEach(line => {
        const match = line.match(/^(\d+)x?\s+(.+)$/);
        if (match) {
          cards.push({
            id: `card-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: match[2].trim(),
            image: '',
            category: 'pokemon', // Default, would need smarter parsing
            count: parseInt(match[1]),
          });
        }
      });

      if (cards.length > 0) {
        onImport({
          id: `deck-${Date.now()}`,
          name,
          format: 'standard',
          cards,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setText('');
        setError(null);
        return;
      }
    }

    setError('Could not parse deck. Please check the format.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Deck" size="md">
      <div className="space-y-4">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Paste your deck list in JSON or text format.
        </p>

        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setError(null); }}
          placeholder={`# My Deck\n4x Charizard ex\n4x Charmander\n...`}
          rows={10}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
            'text-stone-800 dark:text-white font-mono text-sm',
            'focus:outline-none focus:ring-2 focus:ring-amber-500',
            'resize-none'
          )}
        />

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <Button
          variant="primary"
          fullWidth
          onClick={handleImport}
          disabled={!text.trim()}
          icon={<BsUpload className="w-4 h-4" />}
        >
          Import
        </Button>
      </div>
    </Modal>
  );
};

// Add Card Modal
const AddCardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (card: Omit<DeckCard, 'count'>) => void;
}> = ({ isOpen, onClose, onAdd }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Omit<DeckCard, 'count'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<'pokemon' | 'trainer' | 'energy'>('pokemon');

  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tcg-cards?name=${encodeURIComponent(search)}&pageSize=10`);
      if (response.ok) {
        const data = await response.json();
        setResults((data.data || []).map((card: Record<string, unknown>) => ({
          id: card.id as string,
          name: card.name as string,
          image: (card.images as { small?: string })?.small || '',
          type: (card.types as string[])?.[0],
          set: (card.set as { name?: string })?.name,
          number: card.number as string,
          category: ((card.supertype as string) === 'Pokémon' ? 'pokemon' :
                    (card.supertype as string) === 'Energy' ? 'energy' : 'trainer') as DeckCard['category'],
        })));
      }
    } catch (error) {
      logger.error('Card search failed', { error });
    }
    setLoading(false);
  };

  // Quick add for common cards
  const quickAddCards: Omit<DeckCard, 'count'>[] = [
    { id: 'basic-fire', name: 'Fire Energy', image: '', category: 'energy', type: 'fire' },
    { id: 'basic-water', name: 'Water Energy', image: '', category: 'energy', type: 'water' },
    { id: 'basic-grass', name: 'Grass Energy', image: '', category: 'energy', type: 'grass' },
    { id: 'basic-lightning', name: 'Lightning Energy', image: '', category: 'energy', type: 'electric' },
    { id: 'basic-psychic', name: 'Psychic Energy', image: '', category: 'energy', type: 'psychic' },
    { id: 'basic-fighting', name: 'Fighting Energy', image: '', category: 'energy', type: 'fighting' },
    { id: 'basic-dark', name: 'Dark Energy', image: '', category: 'energy', type: 'dark' },
    { id: 'basic-metal', name: 'Metal Energy', image: '', category: 'energy', type: 'steel' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Card" size="md">
      <div className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search for a card..."
            className={cn(
              'flex-1 px-4 py-2 rounded-lg',
              'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
              'text-stone-800 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-amber-500'
            )}
          />
          <Button variant="primary" onClick={handleSearch} loading={loading}>
            Search
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map(card => (
              <button
                key={card.id}
                onClick={() => { onAdd(card); onClose(); }}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-lg text-left',
                  'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700',
                  'transition-colors'
                )}
              >
                {card.image && (
                  <img src={card.image} alt={card.name} className="w-8 h-11 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-800 dark:text-white truncate">{card.name}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">{card.set}</div>
                </div>
                {card.type && <EnergyIcon type={card.type} size="sm" />}
              </button>
            ))}
          </div>
        )}

        {/* Quick Add Energy */}
        <div>
          <h4 className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Quick Add: Basic Energy</h4>
          <div className="grid grid-cols-4 gap-2">
            {quickAddCards.map(card => (
              <button
                key={card.id}
                onClick={() => onAdd(card)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg',
                  'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700',
                  'transition-colors'
                )}
              >
                <EnergyIcon type={card.type || 'colorless'} size="md" />
                <span className="text-xs text-stone-600 dark:text-stone-300 truncate w-full text-center">
                  {card.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Add */}
        <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
          <h4 className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Add Manually</h4>
          <ManualCardForm onAdd={onAdd} />
        </div>
      </div>
    </Modal>
  );
};

// Manual Card Form
const ManualCardForm: React.FC<{
  onAdd: (card: Omit<DeckCard, 'count'>) => void;
}> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DeckCard['category']>('pokemon');

  const handleAdd = () => {
    if (name.trim()) {
      onAdd({
        id: `manual-${Date.now()}`,
        name: name.trim(),
        image: '',
        category,
      });
      setName('');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Card name"
        className={cn(
          'flex-1 px-3 py-2 rounded-lg text-sm',
          'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
          'text-stone-800 dark:text-white',
          'focus:outline-none focus:ring-2 focus:ring-amber-500'
        )}
      />
      <select
        value={category}
        onChange={e => setCategory(e.target.value as DeckCard['category'])}
        className={cn(
          'px-3 py-2 rounded-lg text-sm',
          'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
          'text-stone-800 dark:text-white',
          'focus:outline-none focus:ring-2 focus:ring-amber-500'
        )}
      >
        <option value="pokemon">Pokemon</option>
        <option value="trainer">Trainer</option>
        <option value="energy">Energy</option>
      </select>
      <Button variant="secondary" onClick={handleAdd} disabled={!name.trim()}>
        Add
      </Button>
    </div>
  );
};
