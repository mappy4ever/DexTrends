import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

interface PokemonForm {
  name: string;
  displayName: string;
  url: string;
  isDefault: boolean;
}

interface PokemonFormSelectorProps {
  forms: PokemonForm[];
  selectedForm: string;
  onFormChange: (formName: string) => void;
  typeColors?: {
    accent: string;
    animationAccent: string;
  };
}

const formatFormName = (formName: string, basePokemonName: string): string => {
  // Extract the base name without any numeric suffixes
  const baseNameMatch = formName.match(/^([a-z]+)/);
  const actualBaseName = baseNameMatch ? baseNameMatch[1] : basePokemonName;
  
  // For default form, always return "Normal"
  if (formName === actualBaseName || formName === basePokemonName) return 'Normal';
  
  // Remove the base pokemon name to get the suffix
  let suffix = formName;
  if (formName.startsWith(actualBaseName + '-')) {
    suffix = formName.substring(actualBaseName.length + 1);
  } else if (formName.startsWith(basePokemonName + '-')) {
    suffix = formName.substring(basePokemonName.length + 1);
  }
  
  // Special form mappings
  const formMappings: Record<string, string> = {
    'mega': 'Mega',
    'mega-x': 'Mega X',
    'mega-y': 'Mega Y',
    'alola': 'Alolan',
    'galar': 'Galarian', 
    'hisui': 'Hisuian',
    'paldea': 'Paldean',
    'normal': 'Normal',
    // Rotom forms
    'heat': 'Heat',
    'wash': 'Wash',
    'frost': 'Frost',
    'fan': 'Fan',
    'mow': 'Mow',
    // Castform forms
    'sunny': 'Sunny',
    'rainy': 'Rainy',
    'snowy': 'Snowy',
    // Deoxys forms
    'attack': 'Attack',
    'defense': 'Defense',
    'speed': 'Speed',
    // Wormadam forms
    'plant': 'Plant',
    'sandy': 'Sandy',
    'trash': 'Trash',
    // Basculin forms
    'red-striped': 'Red',
    'blue-striped': 'Blue',
    'white-striped': 'White'
  };
  
  // Check if we have a direct mapping
  if (formMappings[suffix]) {
    return formMappings[suffix];
  }
  
  // Default: capitalize first letter of each part
  return suffix
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const PokemonFormSelector: React.FC<PokemonFormSelectorProps> = ({
  forms,
  selectedForm,
  onFormChange,
  typeColors
}) => {
  // Don't show selector if only one form
  if (forms.length <= 1) return null;
  
  // Get base name from default form or extract from first form
  const defaultForm = forms.find(f => f.isDefault);
  const basePokemonName = defaultForm?.name || forms[0]?.name.match(/^([a-z]+)/)?.[1] || '';
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Form:
      </span>
      <div className="flex gap-2 flex-wrap">
        {forms.map((form) => {
          const isSelected = selectedForm === form.name;
          const displayName = formatFormName(form.name, basePokemonName);
          
          return (
            <motion.button
              key={form.name}
              onClick={() => onFormChange(form.name)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                "backdrop-blur-md border",
                isSelected
                  ? "bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 text-gray-900 dark:text-white shadow-lg"
                  : "bg-white/10 dark:bg-gray-800/30 border-gray-200/30 dark:border-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-white/15 dark:hover:bg-gray-800/40"
              )}
              style={{
                ...(isSelected && typeColors ? {
                  borderColor: typeColors.accent,
                  boxShadow: `0 0 12px ${typeColors.animationAccent}40`
                } : {})
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {displayName}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PokemonFormSelector;