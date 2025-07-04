# DeepLinking.ts TypeScript Type Fixes

## Summary of Changes

All TypeScript type errors in `utils/deepLinking.ts` have been successfully fixed. The following type annotations and interfaces were added:

### New Interfaces Created:

1. **ShareData** - Interface for share data objects
   ```typescript
   interface ShareData {
     title?: string | null;
     text?: string | null;
     url?: string | null;
   }
   ```

2. **DeepLinkData** - Interface for deep link data objects
   ```typescript
   interface DeepLinkData {
     type: 'card' | 'pokemon' | 'set' | 'search' | 'share' | 'hash';
     cardId?: string;
     pokeId?: string;
     setId?: string;
     query?: string;
     filters?: Record<string, string>;
     shareData?: ShareData;
     action?: string | null;
     collection?: string | null;
     route?: string;
     params?: string[];
     source?: string;
     cardName?: string;
     cardNumber?: string;
     setTotal?: string;
   }
   ```

3. **UTMParams** - Interface for UTM tracking parameters
   ```typescript
   interface UTMParams {
     source?: string;
     medium?: string;
     campaign?: string;
     term?: string;
     content?: string;
     [key: string]: string | undefined;
   }
   ```

4. **LinkOptions** - Interface for link generation options
   ```typescript
   interface LinkOptions {
     utm?: UTMParams;
     share?: boolean;
   }
   ```

5. **CardData** - Interface for card data objects
   ```typescript
   interface CardData {
     id: string;
     name: string;
     [key: string]: any;
   }
   ```

6. **Collection** - Interface for collection objects
   ```typescript
   interface Collection {
     id: string;
     name: string;
     [key: string]: any;
   }
   ```

### Type Annotations Added to Methods:

- `extractDeepLinkData(url: URL): DeepLinkData | null`
- `handleDeepLink(data: DeepLinkData): void`
- `navigateToDeepLink(data: DeepLinkData): void`
- `handleHashChange(event: HashChangeEvent): void`
- `handleShareTarget(shareData: ShareData): void`
- `extractCardInfoFromShare(shareData: ShareData): DeepLinkData | null`
- `registerHandler(type: string, handler: DeepLinkHandler): void`
- `generateCardLink(cardId: string, options: LinkOptions = {}): string`
- `generateSearchLink(query: string, filters: Record<string, string> = {}, options: LinkOptions = {}): string`
- `generatePokemonLink(pokeId: string, options: LinkOptions = {}): string`
- `generateSetLink(setId: string, options: LinkOptions = {}): string`
- `shareCard(cardData: CardData): Promise<boolean>`

### Other Changes:

1. Fixed Map generic types from `Map<string, any>` to properly typed Maps
2. Added global type declarations for `window.gtag`
3. Fixed event listener parameter types (PopStateEvent, HashChangeEvent)
4. Added proper return types to all methods
5. Used type assertions for browser API compatibility (navigator.registerProtocolHandler, navigator.getInstalledRelatedApps)

All methods now have proper type annotations and no longer use implicit 'any' types.