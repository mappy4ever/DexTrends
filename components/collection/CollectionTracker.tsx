/**
 * CollectionTracker - Card Collection Management
 *
 * Features:
 * - Track owned cards by set
 * - Completion percentage per set
 * - Wishlist management
 * - Trade list management
 * - Collection value estimation
 * - Import/export collection data
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, ContainerHeader, ContainerTitle, ContainerDescription, ContainerFooter } from '@/components/ui/Container';
import Button, { ButtonGroup, IconButton } from '@/components/ui/Button';
import { Modal, useModalState } from '@/components/ui/Modal';
import { EnergyIcon, EnergyBadge } from '@/components/ui/EnergyIcon';
import { Pagination, PageInfo } from '@/components/ui/Pagination';
import { cn } from '@/utils/cn';
import { TRANSITION } from '@/components/ui/design-system/glass-constants';
import {
  BsCollection,
  BsHeart,
  BsHeartFill,
  BsArrowLeftRight,
  BsPlus,
  BsX,
  BsDownload,
  BsUpload,
  BsSearch,
  BsFilter,
  BsGrid,
  BsList,
  BsCheckCircle,
  BsCircle,
  BsCurrencyDollar,
  BsStarFill,
  BsStar,
  BsTrash,
  BsPencil,
  BsChevronDown,
  BsChevronUp,
  BsGraphUp,
  BsExclamationCircle,
} from 'react-icons/bs';
import logger from '@/utils/logger';

// Collection card types
export interface CollectionCard {
  cardId: string;
  name: string;
  setId: string;
  setName: string;
  number: string;
  rarity: string;
  image: string;
  types?: string[];
  quantity: number;
  condition: 'NM' | 'LP' | 'MP' | 'HP' | 'D';
  isFirstEdition?: boolean;
  isFoil?: boolean;
  purchasePrice?: number;
  currentPrice?: number;
  dateAdded: string;
  notes?: string;
  inWishlist?: boolean;
  inTradeList?: boolean;
}

export interface SetProgress {
  setId: string;
  setName: string;
  setLogo?: string;
  totalCards: number;
  ownedCards: number;
  completionPercent: number;
  estimatedValue: number;
}

interface CollectionTrackerProps {
  initialCollection?: CollectionCard[];
  onCollectionChange?: (collection: CollectionCard[]) => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'wishlist' | 'tradelist';
type SortOption = 'name' | 'set' | 'rarity' | 'value' | 'dateAdded';

const CONDITION_LABELS: Record<CollectionCard['condition'], { label: string; color: string }> = {
  NM: { label: 'Near Mint', color: 'text-green-600 dark:text-green-400' },
  LP: { label: 'Lightly Played', color: 'text-blue-600 dark:text-blue-400' },
  MP: { label: 'Moderately Played', color: 'text-amber-600 dark:text-amber-400' },
  HP: { label: 'Heavily Played', color: 'text-orange-600 dark:text-orange-400' },
  D: { label: 'Damaged', color: 'text-red-600 dark:text-red-400' },
};

const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Holo EX', 'Rare Holo V', 'Rare Ultra', 'Rare Secret'];

export const CollectionTracker: React.FC<CollectionTrackerProps> = ({
  initialCollection = [],
  onCollectionChange,
  className,
}) => {
  const [collection, setCollection] = useState<CollectionCard[]>(initialCollection);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dateAdded');
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null);

  const addCardModal = useModalState();
  const cardDetailModal = useModalState();
  const importExportModal = useModalState();

  const ITEMS_PER_PAGE = 20;

  // Calculate set progress
  const setProgress = useMemo((): SetProgress[] => {
    const setMap = new Map<string, SetProgress>();

    collection.forEach(card => {
      if (!setMap.has(card.setId)) {
        setMap.set(card.setId, {
          setId: card.setId,
          setName: card.setName,
          totalCards: 0, // Would need API data for actual total
          ownedCards: 0,
          completionPercent: 0,
          estimatedValue: 0,
        });
      }

      const progress = setMap.get(card.setId)!;
      progress.ownedCards += card.quantity;
      progress.estimatedValue += (card.currentPrice || 0) * card.quantity;
    });

    return Array.from(setMap.values());
  }, [collection]);

  // Collection statistics
  const stats = useMemo(() => {
    const totalCards = collection.reduce((sum, card) => sum + card.quantity, 0);
    const uniqueCards = collection.length;
    const totalValue = collection.reduce((sum, card) => sum + (card.currentPrice || 0) * card.quantity, 0);
    const wishlistCount = collection.filter(c => c.inWishlist).length;
    const tradeListCount = collection.filter(c => c.inTradeList).length;

    return {
      totalCards,
      uniqueCards,
      totalValue,
      wishlistCount,
      tradeListCount,
    };
  }, [collection]);

  // Filter and sort collection
  const filteredCollection = useMemo(() => {
    let result = [...collection];

    // Filter by tab
    if (filterTab === 'wishlist') {
      result = result.filter(card => card.inWishlist);
    } else if (filterTab === 'tradelist') {
      result = result.filter(card => card.inTradeList);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card =>
        card.name.toLowerCase().includes(query) ||
        card.setName.toLowerCase().includes(query) ||
        card.number.includes(query)
      );
    }

    // Filter by set
    if (selectedSet) {
      result = result.filter(card => card.setId === selectedSet);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'set':
          comparison = a.setName.localeCompare(b.setName);
          break;
        case 'rarity':
          comparison = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
          break;
        case 'value':
          comparison = (b.currentPrice || 0) - (a.currentPrice || 0);
          break;
        case 'dateAdded':
          comparison = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [collection, filterTab, searchQuery, selectedSet, sortBy, sortAsc]);

  // Paginated collection
  const paginatedCollection = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCollection.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCollection, currentPage]);

  const totalPages = Math.ceil(filteredCollection.length / ITEMS_PER_PAGE);

  // Handlers
  const handleAddCard = useCallback((card: CollectionCard) => {
    const existingIndex = collection.findIndex(c => c.cardId === card.cardId);
    let newCollection: CollectionCard[];

    if (existingIndex >= 0) {
      // Update quantity if card exists
      newCollection = [...collection];
      newCollection[existingIndex] = {
        ...newCollection[existingIndex],
        quantity: newCollection[existingIndex].quantity + 1,
      };
    } else {
      // Add new card
      newCollection = [...collection, { ...card, dateAdded: new Date().toISOString() }];
    }

    setCollection(newCollection);
    onCollectionChange?.(newCollection);
    addCardModal.close();
    logger.info('Card added to collection', { cardId: card.cardId });
  }, [collection, onCollectionChange, addCardModal]);

  const handleUpdateCard = useCallback((cardId: string, updates: Partial<CollectionCard>) => {
    const newCollection = collection.map(card =>
      card.cardId === cardId ? { ...card, ...updates } : card
    );
    setCollection(newCollection);
    onCollectionChange?.(newCollection);
  }, [collection, onCollectionChange]);

  const handleRemoveCard = useCallback((cardId: string) => {
    const newCollection = collection.filter(card => card.cardId !== cardId);
    setCollection(newCollection);
    onCollectionChange?.(newCollection);
    cardDetailModal.close();
    logger.info('Card removed from collection', { cardId });
  }, [collection, onCollectionChange, cardDetailModal]);

  const handleToggleWishlist = useCallback((cardId: string) => {
    handleUpdateCard(cardId, {
      inWishlist: !collection.find(c => c.cardId === cardId)?.inWishlist,
    });
  }, [collection, handleUpdateCard]);

  const handleToggleTradeList = useCallback((cardId: string) => {
    handleUpdateCard(cardId, {
      inTradeList: !collection.find(c => c.cardId === cardId)?.inTradeList,
    });
  }, [collection, handleUpdateCard]);

  const handleExport = useCallback(() => {
    const exportData = {
      collection,
      stats,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `card-collection-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logger.info('Collection exported', { cardCount: collection.length });
  }, [collection, stats]);

  const handleImport = useCallback((data: { collection: CollectionCard[] }) => {
    if (data.collection && Array.isArray(data.collection)) {
      setCollection(data.collection);
      onCollectionChange?.(data.collection);
      importExportModal.close();
      logger.info('Collection imported', { cardCount: data.collection.length });
    }
  }, [onCollectionChange, importExportModal]);

  // Get unique sets for filter
  const uniqueSets = useMemo(() => {
    const sets = new Map<string, string>();
    collection.forEach(card => {
      sets.set(card.setId, card.setName);
    });
    return Array.from(sets.entries()).map(([id, name]) => ({ id, name }));
  }, [collection]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Cards"
          value={stats.totalCards}
          icon={<BsCollection className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          label="Unique Cards"
          value={stats.uniqueCards}
          icon={<BsGrid className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Est. Value"
          value={`$${stats.totalValue.toFixed(2)}`}
          icon={<BsCurrencyDollar className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Wishlist"
          value={stats.wishlistCount}
          icon={<BsHeart className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          label="For Trade"
          value={stats.tradeListCount}
          icon={<BsArrowLeftRight className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Set Progress (Collapsible) */}
      {setProgress.length > 0 && (
        <SetProgressSection progress={setProgress} />
      )}

      {/* Controls */}
      <Container variant="elevated" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Cards', icon: BsCollection },
              { id: 'wishlist', label: 'Wishlist', icon: BsHeart },
              { id: 'tradelist', label: 'For Trade', icon: BsArrowLeftRight },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterTab(tab.id as FilterTab);
                  setCurrentPage(1);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                  TRANSITION.default,
                  filterTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search cards..."
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg',
                'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                'text-stone-800 dark:text-white placeholder:text-stone-400',
                'focus:outline-none focus:ring-2 focus:ring-amber-500'
              )}
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              )}
            >
              <BsGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded',
                viewMode === 'list'
                  ? 'bg-white dark:bg-stone-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              )}
            >
              <BsList className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <ButtonGroup spacing="sm">
            <Button
              variant="secondary"
              size="sm"
              icon={<BsUpload className="w-4 h-4" />}
              onClick={importExportModal.open}
            >
              Import/Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<BsPlus className="w-4 h-4" />}
              onClick={addCardModal.open}
            >
              Add Card
            </Button>
          </ButtonGroup>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Set Filter */}
          <select
            value={selectedSet || ''}
            onChange={e => {
              setSelectedSet(e.target.value || null);
              setCurrentPage(1);
            }}
            className={cn(
              'px-3 py-2 rounded-lg text-sm',
              'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
              'text-stone-800 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-amber-500'
            )}
          >
            <option value="">All Sets</option>
            {uniqueSets.map(set => (
              <option key={set.id} value={set.id}>{set.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm',
              'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
              'text-stone-800 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-amber-500'
            )}
          >
            <option value="dateAdded">Date Added</option>
            <option value="name">Name</option>
            <option value="set">Set</option>
            <option value="rarity">Rarity</option>
            <option value="value">Value</option>
          </select>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className={cn(
              'p-2 rounded-lg',
              'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
              'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700',
              TRANSITION.default
            )}
          >
            {sortAsc ? <BsChevronUp className="w-4 h-4" /> : <BsChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </Container>

      {/* Collection Grid/List */}
      <Container variant="elevated" padding="md">
        {paginatedCollection.length === 0 ? (
          <div className="text-center py-12">
            <BsCollection className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-4" />
            <h3 className="text-lg font-medium text-stone-800 dark:text-white mb-2">
              {filterTab === 'wishlist'
                ? 'No cards in wishlist'
                : filterTab === 'tradelist'
                ? 'No cards for trade'
                : 'No cards in collection'}
            </h3>
            <p className="text-stone-500 dark:text-stone-400 mb-4">
              {filterTab === 'all'
                ? 'Start adding cards to build your collection!'
                : 'Add cards to your ' + filterTab + ' by clicking the heart or trade icon.'}
            </p>
            {filterTab === 'all' && (
              <Button variant="primary" onClick={addCardModal.open}>
                Add Your First Card
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {paginatedCollection.map(card => (
                <motion.div
                  key={card.cardId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <CardGridItem
                    card={card}
                    onClick={() => {
                      setSelectedCard(card);
                      cardDetailModal.open();
                    }}
                    onToggleWishlist={() => handleToggleWishlist(card.cardId)}
                    onToggleTradeList={() => handleToggleTradeList(card.cardId)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {paginatedCollection.map(card => (
                <motion.div
                  key={card.cardId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <CardListItem
                    card={card}
                    onClick={() => {
                      setSelectedCard(card);
                      cardDetailModal.open();
                    }}
                    onToggleWishlist={() => handleToggleWishlist(card.cardId)}
                    onToggleTradeList={() => handleToggleTradeList(card.cardId)}
                    onUpdateQuantity={(qty) => handleUpdateCard(card.cardId, { quantity: qty })}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <PageInfo
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCollection.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Container>

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={addCardModal.isOpen}
        onClose={addCardModal.close}
        onAdd={handleAddCard}
        existingCards={collection}
      />

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          isOpen={cardDetailModal.isOpen}
          onClose={cardDetailModal.close}
          card={selectedCard}
          onUpdate={(updates) => handleUpdateCard(selectedCard.cardId, updates)}
          onRemove={() => handleRemoveCard(selectedCard.cardId)}
        />
      )}

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={importExportModal.isOpen}
        onClose={importExportModal.close}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'amber' | 'blue' | 'green' | 'red' | 'purple';
}> = ({ label, value, icon, color }) => {
  const colorClasses = {
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <Container variant="elevated" padding="sm" className="text-center">
      <div className={cn('w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2', colorClasses[color])}>
        {icon}
      </div>
      <div className="text-xl font-bold text-stone-800 dark:text-white">{value}</div>
      <div className="text-xs text-stone-500 dark:text-stone-400">{label}</div>
    </Container>
  );
};

// Set Progress Section
const SetProgressSection: React.FC<{ progress: SetProgress[] }> = ({ progress }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Container variant="elevated" padding="md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <BsGraphUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <ContainerTitle size="sm">Set Progress</ContainerTitle>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <BsChevronDown className="w-5 h-5 text-stone-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-3 overflow-hidden"
          >
            {progress.map(set => (
              <div key={set.setId} className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-stone-800 dark:text-white">{set.setName}</span>
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    {set.ownedCards} cards
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${set.completionPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                    ${set.estimatedValue.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

// Card Grid Item
const CardGridItem: React.FC<{
  card: CollectionCard;
  onClick: () => void;
  onToggleWishlist: () => void;
  onToggleTradeList: () => void;
}> = ({ card, onClick, onToggleWishlist, onToggleTradeList }) => {
  return (
    <div
      className={cn(
        'relative group rounded-xl overflow-hidden bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
        'hover:shadow-lg hover:-translate-y-1',
        TRANSITION.default,
        'cursor-pointer'
      )}
    >
      {/* Card Image */}
      <div className="aspect-[2.5/3.5] bg-stone-100 dark:bg-stone-700 relative" onClick={onClick}>
        <img
          src={card.image}
          alt={card.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Quantity Badge */}
        {card.quantity > 1 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
            ×{card.quantity}
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className={cn(
              'p-1.5 rounded-full',
              card.inWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/90 dark:bg-stone-800/90 text-stone-500 hover:text-red-500'
            )}
          >
            {card.inWishlist ? <BsHeartFill className="w-3 h-3" /> : <BsHeart className="w-3 h-3" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleTradeList();
            }}
            className={cn(
              'p-1.5 rounded-full',
              card.inTradeList
                ? 'bg-purple-500 text-white'
                : 'bg-white/90 dark:bg-stone-800/90 text-stone-500 hover:text-purple-500'
            )}
          >
            <BsArrowLeftRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-2" onClick={onClick}>
        <h4 className="text-sm font-medium text-stone-800 dark:text-white truncate">
          {card.name}
        </h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-stone-500 dark:text-stone-400">{card.setName}</span>
          {card.currentPrice && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              ${card.currentPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Card List Item
const CardListItem: React.FC<{
  card: CollectionCard;
  onClick: () => void;
  onToggleWishlist: () => void;
  onToggleTradeList: () => void;
  onUpdateQuantity: (qty: number) => void;
}> = ({ card, onClick, onToggleWishlist, onToggleTradeList, onUpdateQuantity }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50',
        'hover:bg-stone-100 dark:hover:bg-stone-700/50',
        TRANSITION.default
      )}
    >
      {/* Card Image */}
      <div
        className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={onClick}
      >
        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
      </div>

      {/* Card Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <h4 className="font-medium text-stone-800 dark:text-white">{card.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-stone-500 dark:text-stone-400">{card.setName}</span>
          <span className="text-xs text-stone-400">•</span>
          <span className="text-xs text-stone-500 dark:text-stone-400">#{card.number}</span>
          <span className={cn('text-xs', CONDITION_LABELS[card.condition].color)}>
            {card.condition}
          </span>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQuantity(Math.max(1, card.quantity - 1))}
          className="w-6 h-6 rounded bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600"
        >
          -
        </button>
        <span className="w-8 text-center text-sm font-medium text-stone-800 dark:text-white">
          {card.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(card.quantity + 1)}
          className="w-6 h-6 rounded bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600"
        >
          +
        </button>
      </div>

      {/* Price */}
      {card.currentPrice && (
        <div className="text-right w-20">
          <div className="text-sm font-medium text-green-600 dark:text-green-400">
            ${(card.currentPrice * card.quantity).toFixed(2)}
          </div>
          <div className="text-xs text-stone-400">${card.currentPrice.toFixed(2)} ea</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1">
        <button
          onClick={onToggleWishlist}
          className={cn(
            'p-2 rounded-lg',
            card.inWishlist
              ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
              : 'text-stone-400 hover:text-red-500 hover:bg-stone-200 dark:hover:bg-stone-700'
          )}
        >
          {card.inWishlist ? <BsHeartFill className="w-4 h-4" /> : <BsHeart className="w-4 h-4" />}
        </button>
        <button
          onClick={onToggleTradeList}
          className={cn(
            'p-2 rounded-lg',
            card.inTradeList
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
              : 'text-stone-400 hover:text-purple-500 hover:bg-stone-200 dark:hover:bg-stone-700'
          )}
        >
          <BsArrowLeftRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Add Card Modal (simplified - would integrate with card search API)
const AddCardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (card: CollectionCard) => void;
  existingCards: CollectionCard[];
}> = ({ isOpen, onClose, onAdd, existingCards }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CollectionCard[]>([]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // This would call your actual card search API
      const response = await fetch(`/api/tcg-cards?name=${encodeURIComponent(searchQuery)}&pageSize=12`);
      if (response.ok) {
        const data = await response.json();
        const cards = (data.data || []).map((card: Record<string, unknown>) => ({
          cardId: card.id as string,
          name: card.name as string,
          setId: (card.set as { id: string })?.id || '',
          setName: (card.set as { name: string })?.name || '',
          number: card.number as string || '',
          rarity: card.rarity as string || 'Common',
          image: (card.images as { small: string })?.small || '',
          types: card.types as string[] || [],
          quantity: 1,
          condition: 'NM' as const,
          dateAdded: new Date().toISOString(),
          currentPrice: (card.tcgplayer as { prices?: { normal?: { market?: number } } })?.prices?.normal?.market,
        }));
        setSearchResults(cards);
      }
    } catch (error) {
      logger.error('Failed to search cards', { error });
    }
    setIsSearching(false);
  }, [searchQuery]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Card to Collection"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by card name..."
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-lg',
                'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                'text-stone-800 dark:text-white placeholder:text-stone-400',
                'focus:outline-none focus:ring-2 focus:ring-amber-500'
              )}
            />
          </div>
          <Button variant="primary" onClick={handleSearch} loading={isSearching}>
            Search
          </Button>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
            {searchResults.map(card => {
              const alreadyOwned = existingCards.some(c => c.cardId === card.cardId);
              return (
                <button
                  key={card.cardId}
                  onClick={() => onAdd(card)}
                  disabled={alreadyOwned}
                  className={cn(
                    'relative rounded-lg overflow-hidden',
                    'hover:ring-2 hover:ring-amber-500',
                    TRANSITION.default,
                    alreadyOwned && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <img src={card.image} alt={card.name} className="w-full aspect-[2.5/3.5] object-cover" />
                  {alreadyOwned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <BsCheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !isSearching && (
          <div className="text-center py-8 text-stone-500 dark:text-stone-400">
            No cards found. Try a different search term.
          </div>
        )}
      </div>
    </Modal>
  );
};

// Card Detail Modal
const CardDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  card: CollectionCard;
  onUpdate: (updates: Partial<CollectionCard>) => void;
  onRemove: () => void;
}> = ({ isOpen, onClose, card, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState(card);

  useEffect(() => {
    setEditedCard(card);
  }, [card]);

  const handleSave = () => {
    onUpdate(editedCard);
    setIsEditing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={card.name}
      size="lg"
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card Image */}
        <div className="aspect-[2.5/3.5] rounded-xl overflow-hidden">
          <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
        </div>

        {/* Card Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-stone-800 dark:text-white">{card.name}</h3>
            <p className="text-stone-500 dark:text-stone-400">{card.setName} #{card.number}</p>
          </div>

          {/* Rarity & Types */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
              {card.rarity}
            </span>
            {card.types?.map(type => (
              <EnergyBadge key={type} type={type} size="xs" />
            ))}
          </div>

          {/* Editable Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-stone-600 dark:text-stone-300">Quantity</label>
              <input
                type="number"
                value={editedCard.quantity}
                onChange={e => setEditedCard({ ...editedCard, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                disabled={!isEditing}
                min={1}
                className={cn(
                  'w-full mt-1 px-3 py-2 rounded-lg',
                  'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                  'text-stone-800 dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-amber-500',
                  !isEditing && 'cursor-not-allowed opacity-60'
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-600 dark:text-stone-300">Condition</label>
              <select
                value={editedCard.condition}
                onChange={e => setEditedCard({ ...editedCard, condition: e.target.value as CollectionCard['condition'] })}
                disabled={!isEditing}
                className={cn(
                  'w-full mt-1 px-3 py-2 rounded-lg',
                  'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                  'text-stone-800 dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-amber-500',
                  !isEditing && 'cursor-not-allowed opacity-60'
                )}
              >
                {Object.entries(CONDITION_LABELS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-600 dark:text-stone-300">Notes</label>
              <textarea
                value={editedCard.notes || ''}
                onChange={e => setEditedCard({ ...editedCard, notes: e.target.value })}
                disabled={!isEditing}
                rows={2}
                className={cn(
                  'w-full mt-1 px-3 py-2 rounded-lg',
                  'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                  'text-stone-800 dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-amber-500',
                  !isEditing && 'cursor-not-allowed opacity-60'
                )}
              />
            </div>
          </div>

          {/* Price Info */}
          {card.currentPrice && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-sm text-green-600 dark:text-green-400">Current Value</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                ${(card.currentPrice * card.quantity).toFixed(2)}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                ${card.currentPrice.toFixed(2)} per card
              </div>
            </div>
          )}

          {/* Actions */}
          <ContainerFooter separator align="between">
            <Button
              variant="danger"
              size="sm"
              icon={<BsTrash className="w-4 h-4" />}
              onClick={onRemove}
            >
              Remove
            </Button>
            <ButtonGroup spacing="sm">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSave}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<BsPencil className="w-4 h-4" />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </ButtonGroup>
          </ContainerFooter>
        </div>
      </div>
    </Modal>
  );
};

// Import/Export Modal
const ImportExportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (data: { collection: CollectionCard[] }) => void;
}> = ({ isOpen, onClose, onExport, onImport }) => {
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.collection && Array.isArray(data.collection)) {
          onImport(data);
          setImportError(null);
        } else {
          setImportError('Invalid collection file format');
        }
      } catch {
        setImportError('Failed to parse file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import / Export Collection"
      size="md"
    >
      <div className="space-y-6">
        {/* Export */}
        <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800/50">
          <h4 className="font-medium text-stone-800 dark:text-white mb-2">Export Collection</h4>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
            Download your collection as a JSON file to back up or share.
          </p>
          <Button
            variant="primary"
            fullWidth
            icon={<BsDownload className="w-4 h-4" />}
            onClick={onExport}
          >
            Download Collection
          </Button>
        </div>

        {/* Import */}
        <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800/50">
          <h4 className="font-medium text-stone-800 dark:text-white mb-2">Import Collection</h4>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
            Upload a previously exported collection file.
          </p>
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className={cn(
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
              'border-2 border-dashed border-stone-300 dark:border-stone-600',
              'text-stone-600 dark:text-stone-300',
              'hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400',
              'cursor-pointer transition-colors'
            )}>
              <BsUpload className="w-5 h-5" />
              <span>Choose File</span>
            </div>
          </label>
          {importError && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400">
              <BsExclamationCircle className="w-4 h-4" />
              {importError}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CollectionTracker;
