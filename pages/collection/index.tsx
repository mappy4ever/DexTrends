/**
 * Collection Tracker Page
 *
 * Card collection management with:
 * - Track owned cards by set
 * - Completion tracking
 * - Wishlist and trade lists
 * - Collection value estimation
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { CollectionTracker, CollectionCard } from '@/components/collection/CollectionTracker';
import { Container } from '@/components/ui/Container';
import logger from '@/utils/logger';

// LocalStorage key for collection data
const COLLECTION_STORAGE_KEY = 'dextrends_card_collection';

export default function CollectionPage() {
  const [initialCollection, setInitialCollection] = useState<CollectionCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load collection from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLLECTION_STORAGE_KEY);
      if (saved) {
        const collection = JSON.parse(saved);
        setInitialCollection(collection);
        logger.info('Collection loaded', { cardCount: collection.length });
      }
    } catch (error) {
      logger.error('Failed to load collection', { error });
    }
    setIsLoaded(true);
  }, []);

  // Save collection to localStorage when it changes
  const handleCollectionChange = (collection: CollectionCard[]) => {
    try {
      localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collection));
      logger.info('Collection saved', { cardCount: collection.length });
    } catch (error) {
      logger.error('Failed to save collection', { error });
    }
  };

  return (
    <>
      <Head>
        <title>Card Collection Tracker | DexTrends</title>
        <meta name="description" content="Track your Pokemon TCG card collection, manage wishlists, and monitor collection value." />
        <meta property="og:title" content="Card Collection Tracker | DexTrends" />
        <meta property="og:description" content="Comprehensive Pokemon TCG card collection management with value tracking." />
      </Head>

      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        {/* Page Header */}
        <div className="bg-gradient-to-b from-purple-50 to-stone-50 dark:from-stone-800 dark:to-stone-900 border-b border-stone-200 dark:border-stone-700">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <nav className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              <Link href="/" className="hover:text-amber-600">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-stone-800 dark:text-white">Collection</span>
            </nav>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-white">
              Card Collection
            </h1>
            <p className="text-stone-600 dark:text-stone-300 mt-2">
              Track your cards, manage wishlists, and see your collection's value
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {isLoaded ? (
            <CollectionTracker
              initialCollection={initialCollection}
              onCollectionChange={handleCollectionChange}
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
