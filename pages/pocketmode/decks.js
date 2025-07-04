import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { TypeBadge } from '../../components/ui/TypeBadge';
import { 
  GlassCard, 
  PremiumButton, 
  PremiumBadge,
  PremiumModal 
} from '../../components/ui/PremiumComponents';
import { 
  PageTransition, 
  StaggerContainer, 
  StaggerItem, 
  HoverCard,
  RevealElement 
} from '../../components/ui/AnimationSystem';
import logger from '../../utils/logger';

export default function SavedDecks() {
  const router = useRouter();
  
  // State
  const [savedDecks, setSavedDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Load saved decks from localStorage
  useEffect(() => {
    try {
      const decks = JSON.parse(localStorage.getItem('pocketDecks') || '[]');
      setSavedDecks(decks);
    } catch (error) {
      logger.error('Error loading saved decks:', { error });
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete deck
  const deleteDeck = (deckId) => {
    try {
      const updatedDecks = savedDecks.filter(deck => deck.id !== deckId);
      localStorage.setItem('pocketDecks', JSON.stringify(updatedDecks));
      setSavedDecks(updatedDecks);
      setShowDeleteConfirm(null);
    } catch (error) {
      logger.error('Error deleting deck:', { error });
      alert('Failed to delete deck');
    }
  };

  // Duplicate deck
  const duplicateDeck = (deck) => {
    try {
      const newDeck = {
        ...deck,
        id: `deck_${Date.now()}`,
        name: `${deck.name} (Copy)`,
        createdAt: new Date().toISOString()
      };
      
      const updatedDecks = [...savedDecks, newDeck];
      localStorage.setItem('pocketDecks', JSON.stringify(updatedDecks));
      setSavedDecks(updatedDecks);
    } catch (error) {
      logger.error('Error duplicating deck:', { error });
      alert('Failed to duplicate deck');
    }
  };

  // Export deck as text
  const exportDeck = (deck) => {
    let exportText = `${deck.name}\n`;
    exportText += `Created: ${new Date(deck.createdAt).toLocaleDateString()}\n`;
    if (deck.description) {
      exportText += `Description: ${deck.description}\n`;
    }
    exportText += `\nCards (${deck.stats.totalCards}):\n`;
    exportText += '─'.repeat(30) + '\n';
    
    deck.cards.forEach(entry => {
      exportText += `${entry.count}x ${entry.card.name} (${entry.card.type}, ${entry.card.rarity})\n`;
    });
    
    exportText += '\n' + '─'.repeat(30) + '\n';
    exportText += 'Type Distribution:\n';
    Object.entries(deck.stats.typeDistribution).forEach(([type, count]) => {
      exportText += `${type}: ${count}\n`;
    });

    // Create downloadable file
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deck.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // View deck details
  const viewDeck = (deck) => {
    setSelectedDeck(deck);
    setShowDeckModal(true);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="container max-w-6xl mx-auto py-12 text-center min-h-screen flex items-center justify-center">
          <Head>
            <title>Saved Decks | Pokemon Pocket | DexTrends</title>
          </Head>
          <GlassCard className="max-w-md mx-auto" elevated>
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
              <h3 className="text-xl font-bold">Loading Decks...</h3>
            </div>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Head>
          <title>Saved Decks | Pokemon Pocket | DexTrends</title>
          <meta name="description" content="View and manage your saved Pokemon Pocket decks" />
        </Head>

        {/* Header */}
        <RevealElement className="text-center">
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-4">
              <Link 
                href="/pocketmode">
                className="text-primary hover:text-primary-hover font-medium flex items-center gap-2"
              >
                ← Back to Pocket Mode
              </Link>
              <h1 className="font-display text-4xl md:text-5xl font-black gradient-text">
                💾 Saved Decks
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Manage your Pokemon Pocket deck collection
            </p>
            <div className="flex items-center justify-center gap-2">
              <PremiumBadge variant="glass" glow>
                🃏 {savedDecks.length} Saved Decks
              </PremiumBadge>
              <PremiumBadge variant="glass" glow>
                📤 Export & Share
              </PremiumBadge>
              <Link href="/pocketmode/deckbuilder">
                <PremiumButton variant="success" glow>
                  ➕ Build New Deck
                </PremiumButton>
              </Link>
            </div>
          </div>
        </RevealElement>

        {/* Empty State */}
        {savedDecks.length === 0 ? (
          <RevealElement>
            <GlassCard className="text-center py-16" elevated>
              <div className="space-y-6">
                <div className="text-6xl mb-4">🃏</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">No Saved Decks</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start building your first deck to see it here
                  </p>
                  <Link href="/pocketmode/deckbuilder">
                    <PremiumButton variant="primary" glow>
                      🛠️ Create Your First Deck
                    </PremiumButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </RevealElement>
        ) : (
          /* Decks Grid */
          (<StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDecks.map((deck, index) => (
              <StaggerItem key={deck.id}>
                <HoverCard scale={1.02} y={-6}>
                  <GlassCard 
                    className="p-6 hover-lift interactive"
                    elevated
                  >
                    <div className="space-y-4">
                      {/* Deck Header */}
                      <div>
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">{deck.name}</h3>
                        {deck.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                            {deck.description}
                          </p>
                        )}
                      </div>

                      {/* Deck Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                          <div className="font-bold text-lg text-primary">
                            {deck.stats.totalCards}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">Total Cards</div>
                        </div>
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                          <div className="font-bold text-lg text-primary">
                            {deck.cards.length}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">Unique Cards</div>
                        </div>
                      </div>

                      {/* Type Distribution */}
                      <div>
                        <div className="text-sm font-semibold mb-2">Types</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(deck.stats.typeDistribution).map(([type, count]) => (
                            <div key={type} className="flex items-center gap-1">
                              <TypeBadge type={type} size="sm" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {count}x
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sample Cards */}
                      <div>
                        <div className="text-sm font-semibold mb-2">Featured Cards</div>
                        <div className="flex gap-2 overflow-x-auto">
                          {deck.cards.slice(0, 4).map((entry) => (
                            <div key={entry.card.id} className="flex-shrink-0 relative">
                              <div className="w-12 h-16 relative bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                                <Image
                                  src={entry.card.image || "/dextrendslogo.png"}
                                  alt={entry.card.name}
                                  fill
                                  className="object-contain"
                                  sizes="48px"
                                />
                              </div>
                              {entry.count > 1 && (
                                <div className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {entry.count}
                                </div>
                              )}
                            </div>
                          ))}
                          {deck.cards.length > 4 && (
                            <div className="flex-shrink-0 w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                              +{deck.cards.length - 4}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created: {new Date(deck.createdAt).toLocaleDateString()}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <PremiumButton
                          onClick={() => viewDeck(deck)}
                          variant="primary"
                          size="sm"
                          className="text-xs"
                        >
                          👁️ View
                        </PremiumButton>
                        <PremiumButton
                          onClick={() => exportDeck(deck)}
                          variant="glass"
                          size="sm"
                          className="text-xs"
                        >
                          📤 Export
                        </PremiumButton>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <PremiumButton
                          onClick={() => duplicateDeck(deck)}
                          variant="glass"
                          size="sm"
                          className="text-xs"
                        >
                          📋 Copy
                        </PremiumButton>
                        <PremiumButton
                          onClick={() => setShowDeleteConfirm(deck.id)}
                          variant="error"
                          size="sm"
                          className="text-xs"
                        >
                          🗑️ Delete
                        </PremiumButton>
                      </div>
                    </div>
                  </GlassCard>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>)
        )}

        {/* Deck Details Modal */}
        {selectedDeck && (
          <PremiumModal 
            isOpen={showDeckModal} 
            onClose={() => setShowDeckModal(false)}
            size="xl"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">{selectedDeck.name}</h3>
                <PremiumBadge variant="primary">
                  {selectedDeck.stats.totalCards} cards
                </PremiumBadge>
              </div>

              {selectedDeck.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedDeck.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="font-bold text-xl text-primary">
                    {selectedDeck.stats.totalCards}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="font-bold text-xl text-primary">
                    {selectedDeck.cards.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unique Cards</div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="font-bold text-xl text-primary">
                    {Object.keys(selectedDeck.stats.typeDistribution).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Different Types</div>
                </div>
              </div>

              {/* Type Distribution */}
              <div>
                <h4 className="font-semibold mb-3">Type Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(selectedDeck.stats.typeDistribution).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <TypeBadge type={type} size="sm" />
                        <span className="text-sm">{type}</span>
                      </div>
                      <span className="font-mono text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card List */}
              <div>
                <h4 className="font-semibold mb-3">All Cards</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {selectedDeck.cards.map((entry) => (
                    <div 
                      key={entry.card.id} 
                      className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3"
                    >
                      <div className="w-12 h-16 relative bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={entry.card.image || "/dextrendslogo.png"}
                          alt={entry.card.name}
                          fill
                          className="object-contain"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">{entry.card.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <TypeBadge type={entry.card.type} size="sm" />
                          <span className="text-xs text-gray-500">{entry.card.rarity}</span>
                          {entry.card.health && (
                            <span className="text-xs text-gray-500">HP: {entry.card.health}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <PremiumBadge variant="primary" size="sm">
                          {entry.count}x
                        </PremiumBadge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <PremiumButton
                  onClick={() => exportDeck(selectedDeck)}
                  variant="glass"
                  className="flex-1"
                >
                  📤 Export Deck
                </PremiumButton>
                <PremiumButton
                  onClick={() => duplicateDeck(selectedDeck)}
                  variant="glass"
                  className="flex-1"
                >
                  📋 Duplicate Deck
                </PremiumButton>
              </div>
            </div>
          </PremiumModal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <PremiumModal 
            isOpen={!!showDeleteConfirm} 
            onClose={() => setShowDeleteConfirm(null)}
            size="sm"
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold mb-2">Delete Deck?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This action cannot be undone. The deck will be permanently deleted.
                </p>
              </div>
              
              <div className="flex gap-4">
                <PremiumButton
                  onClick={() => setShowDeleteConfirm(null)}
                  variant="glass"
                  className="flex-1"
                >
                  Cancel
                </PremiumButton>
                <PremiumButton
                  onClick={() => deleteDeck(showDeleteConfirm)}
                  variant="error"
                  className="flex-1"
                >
                  Delete
                </PremiumButton>
              </div>
            </div>
          </PremiumModal>
        )}
      </div>
    </PageTransition>
  );
}