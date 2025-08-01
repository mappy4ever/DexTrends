import { useMemo } from 'react';
import { typeColors } from '@/utils/pokemonTypeColors';

type ThemeContext = 'pokemon' | 'tcg' | 'ui' | 'ux' | 'default';

interface ContextualThemeOptions {
  pokemonType?: string;
  tcgType?: string;
  variant?: 'light' | 'medium' | 'dark';
}

interface TabTheme {
  activeClass: string;
  inactiveClass: string;
  borderClass: string;
  hoverClass: string;
}

interface ButtonTheme {
  primaryClass: string;
  secondaryClass: string;
  tertiaryClass: string;
}

interface ThemeConfig {
  tabs: TabTheme;
  buttons: ButtonTheme;
  background: string;
  accent: string;
}

export const useContextualTheme = (
  context: ThemeContext,
  options?: ContextualThemeOptions
): ThemeConfig => {
  return useMemo(() => {
    switch (context) {
      case 'pokemon': {
        const type = options?.pokemonType?.toLowerCase() || 'normal';
        const typeColor = typeColors[type] || typeColors.normal;
        
        // Extract color name from Tailwind class (e.g., "bg-red-500" -> "red")
        const colorName = typeColor.bg.match(/bg-(\w+)-/)?.[1] || 'gray';
        
        return {
          tabs: {
            activeClass: `bg-${colorName}-100 text-gray-700 border-[4px] border-${colorName}-400`,
            inactiveClass: `bg-white/50 text-gray-600 border-2 border-gray-200`,
            borderClass: `border-${colorName}-200`,
            hoverClass: `hover:bg-${colorName}-50`
          },
          buttons: {
            primaryClass: `bg-gradient-to-r from-${colorName}-400 to-${colorName}-500 text-white`,
            secondaryClass: `bg-white/10 backdrop-blur-md border-2 border-${colorName}-300`,
            tertiaryClass: `text-${colorName}-600 hover:text-${colorName}-700`
          },
          background: `bg-gradient-to-br from-${colorName}-50 to-white`,
          accent: typeColor.bg
        };
      }
      
      case 'tcg': {
        const tcgType = options?.tcgType?.toLowerCase() || 'colorless';
        const tcgColors: Record<string, string> = {
          grass: 'green',
          fire: 'red',
          water: 'blue',
          lightning: 'yellow',
          psychic: 'purple',
          fighting: 'orange',
          darkness: 'gray',
          metal: 'slate',
          dragon: 'indigo',
          colorless: 'gray'
        };
        
        const colorName = tcgColors[tcgType] || 'gray';
        
        return {
          tabs: {
            activeClass: `bg-${colorName}-100 text-gray-700 border-[4px] border-${colorName}-400`,
            inactiveClass: `bg-white/50 text-gray-600 border-2 border-gray-200`,
            borderClass: `border-${colorName}-200`,
            hoverClass: `hover:bg-${colorName}-50`
          },
          buttons: {
            primaryClass: `bg-gradient-to-r from-${colorName}-400 to-${colorName}-500 text-white`,
            secondaryClass: `bg-white/10 backdrop-blur-md border-2 border-${colorName}-300`,
            tertiaryClass: `text-${colorName}-600 hover:text-${colorName}-700`
          },
          background: `bg-gradient-to-br from-${colorName}-50 to-white`,
          accent: `bg-${colorName}-500`
        };
      }
      
      case 'ui': {
        return {
          tabs: {
            activeClass: 'bg-purple-100 text-gray-700 border-[4px] border-purple-400',
            inactiveClass: 'bg-white/50 text-gray-600 border-2 border-gray-200',
            borderClass: 'border-purple-200',
            hoverClass: 'hover:bg-purple-50'
          },
          buttons: {
            primaryClass: 'bg-gradient-to-r from-purple-400 to-purple-500 text-white',
            secondaryClass: 'bg-white/10 backdrop-blur-md border-2 border-purple-300',
            tertiaryClass: 'text-purple-600 hover:text-purple-700'
          },
          background: 'bg-gradient-to-br from-purple-50 to-white',
          accent: 'bg-purple-500'
        };
      }
      
      case 'ux': {
        return {
          tabs: {
            activeClass: 'bg-blue-100 text-gray-700 border-[4px] border-blue-400',
            inactiveClass: 'bg-white/50 text-gray-600 border-2 border-gray-200',
            borderClass: 'border-blue-200',
            hoverClass: 'hover:bg-blue-50'
          },
          buttons: {
            primaryClass: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white',
            secondaryClass: 'bg-white/10 backdrop-blur-md border-2 border-blue-300',
            tertiaryClass: 'text-blue-600 hover:text-blue-700'
          },
          background: 'bg-gradient-to-br from-blue-50 to-white',
          accent: 'bg-blue-500'
        };
      }
      
      default: {
        return {
          tabs: {
            activeClass: 'bg-gray-100 text-gray-700 border-[4px] border-gray-400',
            inactiveClass: 'bg-white/50 text-gray-600 border-2 border-gray-200',
            borderClass: 'border-gray-200',
            hoverClass: 'hover:bg-gray-50'
          },
          buttons: {
            primaryClass: 'bg-gradient-to-r from-gray-700 to-gray-800 text-white',
            secondaryClass: 'bg-white/10 backdrop-blur-md border-2 border-gray-300',
            tertiaryClass: 'text-gray-600 hover:text-gray-700'
          },
          background: 'bg-gradient-to-br from-gray-50 to-white',
          accent: 'bg-gray-500'
        };
      }
    }
  }, [context, options]);
};

// Helper function to safely apply theme classes
export const getContextualTabClass = (
  theme: ThemeConfig,
  isActive: boolean
): string => {
  return isActive ? theme.tabs.activeClass : theme.tabs.inactiveClass;
};

// Helper function for button classes
export const getContextualButtonClass = (
  theme: ThemeConfig,
  variant: 'primary' | 'secondary' | 'tertiary' = 'primary'
): string => {
  switch (variant) {
    case 'primary':
      return theme.buttons.primaryClass;
    case 'secondary':
      return theme.buttons.secondaryClass;
    case 'tertiary':
      return theme.buttons.tertiaryClass;
    default:
      return theme.buttons.primaryClass;
  }
};