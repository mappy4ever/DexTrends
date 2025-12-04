/**
 * TCG Pocket Deck Builder - Refactored Version
 *
 * A fluid, production-ready deck building experience with:
 * - Sticky deck panel with mini thumbnails
 * - Smart filtering with EnergyIcon symbols
 * - Integrated sharing and screenshot export
 * - Virtual scrolling for performance
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { fetchPocketData } from '../../utils/pocketData';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import { FullBleedWrapper } from '../../components/ui/FullBleedWrapper';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import BackToTop from '../../components/ui/BaseBackToTop';
import { DeckBuilderShell } from '../../components/pocket';
import type { ExtendedPocketCard } from '../../hooks/useDeckBuilder';

function DeckBuilder() {
  // Card data state
  const [allCards, setAllCards] = useState<ExtendedPocketCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load cards on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPocketData();
        setAllCards(data as ExtendedPocketCard[] || []);
      } catch (err) {
        setError('Failed to load cards. Please try again.');
        console.error('Error loading pocket cards:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, []);

  // SEO and page metadata
  const pageTitle = 'Pocket Deck Builder | Pokemon TCG Pocket | DexTrends';
  const pageDescription = 'Build and share Pokemon TCG Pocket decks. Easy-to-use deck builder with card filtering, type distribution, and one-tap sharing.';

  return (
    <FullBleedWrapper>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      {/* Page Header */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
        <div className="max-w-7xl mx-auto px-4">
          <PageHeader
            title="Pocket Deck Builder"
            description="Build your perfect 20-card Pokemon TCG Pocket deck"
            breadcrumbs={[
              { title: 'Home', href: '/', icon: 'home' },
              { title: 'Pocket', href: '/pocketmode', icon: 'pocket' },
              { title: 'Deck Builder', href: null, icon: 'deck', isActive: true }
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex-1">
          <PageLoader />
        </div>
      ) : (
        <DeckBuilderShell
          cards={allCards}
          loading={loading}
          error={error}
        />
      )}

      <BackToTop />
    </FullBleedWrapper>
  );
}

// Mark this page as full bleed to remove Layout padding
(DeckBuilder as any).fullBleed = true;

export default DeckBuilder;
