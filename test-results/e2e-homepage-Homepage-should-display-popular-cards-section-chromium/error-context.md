# Page snapshot

```yaml
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- link "Next.js 15.3.5 (stale) Webpack":
  - /url: https://nextjs.org/docs/messages/version-staleness
  - img
  - text: Next.js 15.3.5 (stale) Webpack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Stack Trace":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools":
    - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
    - img
  - paragraph: "Error: x Merge conflict marker encountered."
  - img
  - text: ./pages/battle-simulator.tsx
  - button "Open in editor":
    - img
  - text: "Error: x Merge conflict marker encountered. ,-[/Users/moazzam/GitHub/Mappy/DexTrends/pages/battle-simulator.tsx:673:1] 670 | return Math.floor(damage); 671 | }; 672 | 673 | <<<<<<< HEAD : ^^^^^^^ 674 | // Start battle 675 | const startBattle = () => { 676 | if (!selectedPokemon1 || !selectedPokemon2) return; `---- x Merge conflict marker encountered. ,-[/Users/moazzam/GitHub/Mappy/DexTrends/pages/battle-simulator.tsx:923:1] 920 | // Due to size constraints, I need to continue the file conversion in the next message 921 | // This is a partial conversion showing the structure and approach 922 | 923 | ======= : ^^^^^^^ 924 | const runBattle = async () => { 925 | setBattleActive(true); 926 | setBattleLog([]); `---- x Merge conflict marker encountered. ,-[/Users/moazzam/GitHub/Mappy/DexTrends/pages/battle-simulator.tsx:1212:1] 1209 | setAvailableMoves2([]); 1210 | }; 1211 | 1212 | >>>>>>> 3d30fa7ca99c01ec45709b1f42ad8bad9bca3f92 : ^^^^^^^ 1213 | return ( 1214 | <PageErrorBoundary pageName=\"Battle Simulator\"> 1215 | <Head> `---- x Unexpected token `PageErrorBoundary`. Expected jsx identifier ,-[/Users/moazzam/GitHub/Mappy/DexTrends/pages/battle-simulator.tsx:1214:1] 1211 | 1212 | >>>>>>> 3d30fa7ca99c01ec45709b1f42ad8bad9bca3f92 1213 | return ( 1214 | <PageErrorBoundary pageName=\"Battle Simulator\"> : ^^^^^^^^^^^^^^^^^ 1215 | <Head> 1216 | <title>Pokemon Battle Simulator - DexTrends</title> 1217 | <meta name=\"description\" content=\"Battle Pokemon with real damage calculations and type effectiveness\" /> `---- Caused by: Syntax Error"
- contentinfo:
  - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
```