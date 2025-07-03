/**
 * GraphQL Schema Definition
 * Provides flexible data queries and real-time subscriptions
 */

import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  scalar JSON
  scalar DateTime

  type Query {
    # Card queries
    card(id: ID!): Card
    cards(
      search: String
      filters: CardFilters
      sort: SortInput
      pagination: PaginationInput
    ): CardConnection
    
    # Pokemon queries
    pokemon(id: ID!): Pokemon
    pokemons(
      search: String
      filters: PokemonFilters
      pagination: PaginationInput
    ): PokemonConnection
    
    # Price queries
    priceHistory(
      cardId: ID!
      variantType: String = "holofoil"
      daysBack: Int = 30
    ): [PriceHistoryEntry]
    
    priceStats(
      cardId: ID!
      variantType: String = "holofoil"
      daysBack: Int = 30
    ): PriceStats
    
    trendingCards(limit: Int = 10): [TrendingCard]
    
    # Analytics queries
    analytics(
      type: AnalyticsType!
      cardId: ID
      daysBack: Int = 30
    ): AnalyticsData
    
    # Search suggestions
    searchSuggestions(query: String!, limit: Int = 10): [SearchSuggestion]
    
    # Market data
    marketOverview(daysBack: Int = 7): MarketOverview
  }

  type Mutation {
    # Favorites
    addFavorite(input: FavoriteInput!): FavoriteResult
    removeFavorite(input: FavoriteInput!): FavoriteResult
    
    # Price alerts
    createPriceAlert(input: PriceAlertInput!): PriceAlert
    updatePriceAlert(id: ID!, input: PriceAlertInput!): PriceAlert
    deletePriceAlert(id: ID!): Boolean
    
    # Collection management
    addToCollection(input: CollectionItemInput!): CollectionItem
    removeFromCollection(id: ID!): Boolean
    
    # Analytics events
    trackEvent(input: EventInput!): Boolean
    
    # Data operations
    triggerPriceCollection(input: PriceCollectionInput): PriceCollectionJob
    refreshCache(type: CacheType!): Boolean
  }

  type Subscription {
    # Real-time price updates
    priceUpdates(cardIds: [ID!]): PriceUpdate
    
    # Market trend updates
    marketTrends: MarketTrendUpdate
    
    # Collection updates
    collectionUpdates(userId: ID!): CollectionUpdate
    
    # Price alert notifications
    priceAlerts(userId: ID!): PriceAlertNotification
  }

  # Card Types
  type Card {
    id: ID!
    name: String!
    set: CardSet!
    rarity: String
    artist: String
    imageUrl: String
    imageUrlHiRes: String
    types: [String]
    supertype: String
    subtypes: [String]
    hp: Int
    number: String
    prices: CardPrices
    tcgplayerUrl: String
    marketData: MarketData
    analytics: CardAnalytics
  }

  type CardSet {
    id: ID!
    name: String!
    series: String
    releaseDate: String
    total: Int
    logoUrl: String
    symbolUrl: String
  }

  type CardPrices {
    normal: PriceVariant
    holofoil: PriceVariant
    reverseHolofoil: PriceVariant
    unlimited: PriceVariant
    firstEdition: PriceVariant
  }

  type PriceVariant {
    low: Float
    mid: Float
    high: Float
    market: Float
    directLow: Float
  }

  type MarketData {
    volatility: Float
    spread: Float
    stabilityScore: Float
    liquidityIndicator: Float
    trendDirection: String
    priceChangePercent24h: Float
    priceChangePercent7d: Float
    priceChangePercent30d: Float
  }

  type CardAnalytics {
    views: Int
    favorites: Int
    searches: Int
    popularityScore: Float
    engagementScore: Float
  }

  # Pokemon Types
  type Pokemon {
    id: ID!
    name: String!
    nationalPokedexNumber: Int
    types: [String]
    height: String
    weight: String
    description: String
    imageUrl: String
    cards: [Card]
    stats: PokemonStats
  }

  type PokemonStats {
    hp: Int
    attack: Int
    defense: Int
    specialAttack: Int
    specialDefense: Int
    speed: Int
  }

  # Price History Types
  type PriceHistoryEntry {
    date: DateTime!
    price: Float!
    volume: Int
    marketCap: Float
    source: String
  }

  type PriceStats {
    current: Float
    average: Float
    min: Float
    max: Float
    volatility: Float
    trend: String
    changePercent: Float
    lastUpdated: DateTime
  }

  type TrendingCard {
    card: Card!
    priceChange: Float!
    priceChangePercent: Float!
    volume: Int
    rank: Int
  }

  # Analytics Types
  enum AnalyticsType {
    OVERVIEW
    USER_BEHAVIOR
    SEARCH
    CARD_PERFORMANCE
  }

  type AnalyticsData {
    type: AnalyticsType!
    period: AnalyticsPeriod!
    data: JSON!
    insights: [AnalyticsInsight]
  }

  type AnalyticsPeriod {
    startDate: DateTime!
    endDate: DateTime!
    daysBack: Int!
  }

  type AnalyticsInsight {
    type: String!
    message: String!
    impact: String!
    suggestion: String
  }

  # Search Types
  type SearchSuggestion {
    text: String!
    type: String!
    category: String
    popularity: Int
  }

  # Market Overview
  type MarketOverview {
    totalCards: Int!
    averagePrice: Float!
    totalVolume: Float!
    topGainers: [TrendingCard]
    topLosers: [TrendingCard]
    mostVolatile: [TrendingCard]
    marketSentiment: String
    lastUpdated: DateTime!
  }

  # Connection Types (for pagination)
  type CardConnection {
    edges: [CardEdge]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type CardEdge {
    node: Card!
    cursor: String!
  }

  type PokemonConnection {
    edges: [PokemonEdge]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PokemonEdge {
    node: Pokemon!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # Input Types
  input CardFilters {
    setIds: [ID]
    rarities: [String]
    types: [String]
    supertypes: [String]
    priceMin: Float
    priceMax: Float
    artist: String
    dateAdded: DateFilter
  }

  input PokemonFilters {
    types: [String]
    generation: Int
    hasCards: Boolean
  }

  input DateFilter {
    from: DateTime
    to: DateTime
  }

  input SortInput {
    field: String!
    direction: SortDirection!
  }

  enum SortDirection {
    ASC
    DESC
  }

  input PaginationInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  input FavoriteInput {
    itemType: String!
    itemId: ID!
    itemData: JSON
  }

  input PriceAlertInput {
    cardId: ID!
    cardName: String!
    alertType: String!
    targetPrice: Float
    percentageChange: Float
    isActive: Boolean = true
  }

  input CollectionItemInput {
    cardId: ID!
    quantity: Int = 1
    condition: String = "near_mint"
    notes: String
  }

  input EventInput {
    eventType: String!
    eventData: JSON!
  }

  input PriceCollectionInput {
    jobType: String = "manual"
    limit: Int = 100
    specificCards: [ID]
  }

  enum CacheType {
    CARDS
    POKEMON
    PRICES
    ALL
  }

  # Mutation Result Types
  type FavoriteResult {
    success: Boolean!
    message: String
    item: JSON
  }

  type PriceAlert {
    id: ID!
    cardId: ID!
    cardName: String!
    alertType: String!
    targetPrice: Float
    percentageChange: Float
    isActive: Boolean!
    createdAt: DateTime!
    triggeredAt: DateTime
  }

  type CollectionItem {
    id: ID!
    cardId: ID!
    card: Card!
    quantity: Int!
    condition: String!
    notes: String
    addedAt: DateTime!
    estimatedValue: Float
  }

  type PriceCollectionJob {
    id: ID!
    status: String!
    progress: Float
    cardsProcessed: Int
    cardsUpdated: Int
    cardsFailed: Int
    startedAt: DateTime!
    completedAt: DateTime
  }

  # Subscription Types
  type PriceUpdate {
    cardId: ID!
    variantType: String!
    oldPrice: Float
    newPrice: Float
    changePercent: Float
    updatedAt: DateTime!
  }

  type MarketTrendUpdate {
    type: String!
    data: JSON!
    updatedAt: DateTime!
  }

  type CollectionUpdate {
    type: String!
    item: CollectionItem
    updatedAt: DateTime!
  }

  type PriceAlertNotification {
    alert: PriceAlert!
    currentPrice: Float!
    triggeredAt: DateTime!
  }
`;

export default typeDefs;