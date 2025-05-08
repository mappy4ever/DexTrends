// components/ThemeProvider.js
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({ children }) {
  // No custom 'mounted' state needed here.
  // next-themes handles its own client-side initialization.
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light" // Or "system" if you want the system preference to take precedence on first load without a stored theme
      enableSystem
      themes={['light', 'dark']} // Ensures 'light' and 'dark' are the only options
    >
      {children}
    </NextThemesProvider>
  );
}