import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  // Pokemon-specific
  pokemon?: {
    name: string;
    id: number;
    types: string[];
    image?: string;
  };
  // Card-specific
  card?: {
    name: string;
    set: string;
    rarity?: string;
    price?: number;
    image?: string;
  };
  // JSON-LD structured data
  structuredData?: Record<string, unknown>;
}

const SITE_NAME = 'DexTrends';
const DEFAULT_DESCRIPTION = 'Your ultimate Pokemon companion - explore the Pokedex, browse TCG cards, track prices, and build your collection.';
const DEFAULT_IMAGE = '/dextrendslogo.png';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dextrends.com';

/**
 * SEO Component - Provides dynamic meta tags, Open Graph, Twitter Cards, and JSON-LD
 *
 * Usage:
 * <SEO title="Pikachu" description="..." pokemon={{ name: 'Pikachu', id: 25, types: ['Electric'] }} />
 * <SEO title="Charizard VMAX" card={{ name: 'Charizard VMAX', set: 'Darkness Ablaze', price: 250 }} />
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = 'website',
  noindex = false,
  pokemon,
  card,
  structuredData,
}) => {
  const router = useRouter();

  // Build full title
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  // Build canonical URL
  const canonicalUrl = url || `${SITE_URL}${router.asPath.split('?')[0]}`;

  // Determine image URL
  let ogImage = image || DEFAULT_IMAGE;
  if (pokemon?.image) ogImage = pokemon.image;
  if (card?.image) ogImage = card.image;

  // Ensure absolute URL for images
  if (ogImage && !ogImage.startsWith('http')) {
    ogImage = `${SITE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
  }

  // Build description
  let finalDescription = description;
  if (pokemon) {
    finalDescription = `${pokemon.name} (#${pokemon.id}) - ${pokemon.types.join('/')} type Pokemon. View stats, moves, evolutions, and more on DexTrends.`;
  }
  if (card) {
    finalDescription = `${card.name} from ${card.set}${card.rarity ? ` (${card.rarity})` : ''}${card.price ? ` - Market price: $${card.price.toFixed(2)}` : ''}. Browse and track Pokemon TCG cards on DexTrends.`;
  }

  // Generate JSON-LD structured data
  const generateStructuredData = () => {
    if (structuredData) return structuredData;

    // Base organization schema
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    // Pokemon schema
    if (pokemon) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: pokemon.name,
        description: finalDescription,
        image: ogImage,
        identifier: pokemon.id,
        additionalType: 'Pokemon',
        category: pokemon.types.join(', ')
      };
    }

    // Card/Product schema
    if (card) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: card.name,
        description: finalDescription,
        image: ogImage,
        brand: {
          '@type': 'Brand',
          name: 'Pokemon TCG'
        },
        category: card.set,
        ...(card.price && {
          offers: {
            '@type': 'Offer',
            price: card.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          }
        })
      };
    }

    return baseSchema;
  };

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Card-specific meta */}
      {card?.price && (
        <>
          <meta property="product:price:amount" content={card.price.toString()} />
          <meta property="product:price:currency" content="USD" />
        </>
      )}

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData())
        }}
      />
    </Head>
  );
};

/**
 * Quick SEO presets for common pages
 */
export const SEOPresets = {
  home: () => (
    <SEO
      title="Pokemon TCG & Pokedex"
      description="Your ultimate Pokemon companion - explore the complete Pokedex, browse TCG cards, track market prices, and build your collection."
    />
  ),

  pokedex: () => (
    <SEO
      title="Pokedex"
      description="Browse the complete Pokemon database. Find stats, types, evolutions, moves, and more for all Pokemon."
      type="website"
    />
  ),

  tcgSets: () => (
    <SEO
      title="Pokemon TCG Sets"
      description="Browse all Pokemon Trading Card Game sets. View cards, track prices, and discover rare finds from every expansion."
      type="website"
    />
  ),

  favorites: () => (
    <SEO
      title="My Favorites"
      description="View and manage your favorite Pokemon and TCG cards."
      noindex={true}
    />
  ),

  search: (query?: string) => (
    <SEO
      title={query ? `Search: ${query}` : 'Search'}
      description={query ? `Search results for "${query}" on DexTrends.` : 'Search for Pokemon, cards, sets, and more.'}
      noindex={!query}
    />
  )
};

export default SEO;
