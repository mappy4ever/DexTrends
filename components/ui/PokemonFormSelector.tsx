import React, { useState, useEffect } from 'react';
import { fetchJSON } from '../../utils/unifiedFetch';
import type { Pokemon } from '../../types/api/pokemon';

interface PokemonVariety {
  is_default: boolean;
  pokemon: {
    name: string;
    url: string;
  };
}

interface Species {
  name: string;
  varieties?: PokemonVariety[];
}

// Using the Pokemon type from types/api/pokemon.d.ts

interface Form {
  name: string;
  displayName: string;
  url: string;
  isDefault: boolean;
}

interface PokemonFormSelectorProps {
  pokemon: Pokemon;
  species: Species;
  onFormChange?: (formData: Pokemon) => Promise<void>;
}

// List of valid regional and battle-relevant forms
const VALID_FORM_PATTERNS = [
  'alola', 'galar', 'hisui', 'paldea', // Regional forms
  'mega', 'primal', // Mega evolutions
  'gmax', 'dmax', 'dynamax', 'gigantamax', 'eternamax', // Dynamax forms
  'origin', 'altered', 'sky', 'land', // Giratina, Shaymin
  'therian', 'incarnate', // Forces of Nature
  'unbound', 'confined', // Hoopa
  'blade', 'shield', // Aegislash
  'sunshine', 'rainy', 'snowy', // Castform
  'heat', 'wash', 'frost', 'fan', 'mow', // Rotom
  'dusk', 'midnight', 'dawn', // Lycanroc
  'ice', 'shadow', // Calyrex
  'single-strike', 'rapid-strike', // Urshifu
  'zen', 'standard', // Darmanitan
  'white', 'black', // Kyurem
  'resolute', 'ordinary', // Keldeo
  'pirouette', 'aria', // Meloetta
  '50', '10', 'complete', // Zygarde
  'school', 'solo', // Wishiwashi
  'meteor', 'core', // Minior
  'crowned', 'hero', // Zacian/Zamazenta
  'low-key', 'amped', // Toxtricity
  'noice', 'ice-face', // Eiscue
  'full-belly', 'hangry', // Morpeko
  'blue-striped', 'white-striped', // Basculin
  'male', 'female', // For Pokemon with significant gender differences
];

// Forms to exclude (cosmetic only)
const EXCLUDED_FORM_PATTERNS = [
  'totem', 'cosplay', 'cap', 'starter', 'own-tempo',
  'belle', 'libre', 'phd', 'pop-star', 'rock-star',
  'original-cap', 'hoenn-cap', 'sinnoh-cap', 'unova-cap',
  'kalos-cap', 'alola-cap', 'partner-cap', 'world-cap'
];

export default function PokemonFormSelector({ 
  pokemon, 
  species, 
  onFormChange 
}: PokemonFormSelectorProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChangingForm, setIsChangingForm] = useState(false);

  useEffect(() => {
    const loadForms = async () => {
      if (!species?.varieties) {
        setLoading(false);
        return;
      }

      try {
        const validForms: Form[] = [];
        
        // Use the species name as the base name for consistent form naming
        const baseName = species.name;
        
        for (const variety of species.varieties) {
          const formName = variety.pokemon.name;
          
          // Always include the default form, but check if it's actually a base form
          if (variety.is_default) {
            const displayName = getFormDisplayName(formName, baseName);
            validForms.push({
              name: formName,
              displayName,
              url: variety.pokemon.url,
              isDefault: true
            });
          } else if (isValidForm(formName)) {
            // Only include non-default forms if they're valid
            const displayName = getFormDisplayName(formName, baseName);
            validForms.push({
              name: formName,
              displayName,
              url: variety.pokemon.url,
              isDefault: variety.is_default
            });
          }
        }

        setForms(validForms);
        
        // Set the current form as selected
        const currentForm = validForms.find(f => f.name === pokemon.name) || validForms[0];
        setSelectedForm(currentForm);
        
      } catch (error) {
        logger.error('Error loading forms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, [pokemon, species]);

  const isValidForm = (formName: string): boolean => {
    // Check if it contains any excluded patterns
    if (EXCLUDED_FORM_PATTERNS.some(pattern => formName.includes(pattern))) {
      return false;
    }
    
    // Check if it contains any valid patterns
    return VALID_FORM_PATTERNS.some(pattern => formName.includes(pattern));
  };

  const getFormDisplayName = (formName: string, baseName: string): string => {
    // Get the base Pokemon name (first part before any hyphens)
    const baseSpeciesName = baseName.includes('-') ? baseName.split('-')[0] : baseName;
    const capitalizedBaseName = baseSpeciesName.charAt(0).toUpperCase() + baseSpeciesName.slice(1);
    
    // If the form name is the same as base species name (no suffixes), it's the base form
    if (formName === baseSpeciesName) return 'Base';
    
    // Regional forms
    if (formName.includes('-alola')) return `Alolan ${capitalizedBaseName}`;
    if (formName.includes('-galar')) return `Galarian ${capitalizedBaseName}`;
    if (formName.includes('-hisui')) return `Hisuian ${capitalizedBaseName}`;
    if (formName.includes('-paldea')) return `Paldean ${capitalizedBaseName}`;
    
    // Mega evolutions
    if (formName.includes('-mega')) {
      if (formName.includes('-x')) return `Mega ${capitalizedBaseName} X`;
      if (formName.includes('-y')) return `Mega ${capitalizedBaseName} Y`;
      return `Mega ${capitalizedBaseName}`;
    }
    
    // Primal forms
    if (formName.includes('-primal')) return `Primal ${capitalizedBaseName}`;
    
    // Dynamax forms
    if (formName.includes('-gmax') || formName.includes('-gigantamax')) return `Gigantamax ${capitalizedBaseName}`;
    if (formName.includes('-eternamax')) return `Eternamax ${capitalizedBaseName}`;
    if (formName.includes('-dmax') || formName.includes('-dynamax')) return `Dynamax ${capitalizedBaseName}`;
    
    // Try to extract the form suffix
    let suffix = '';
    if (formName.includes(baseSpeciesName + '-')) {
      suffix = formName.replace(baseSpeciesName + '-', '');
    } else {
      // Handle cases where the form name structure is different
      const parts = formName.split('-');
      if (parts.length > 1) {
        suffix = parts.slice(1).join('-');
      }
    }
    
    // If we couldn't extract a suffix, return a fallback
    if (!suffix) {
      return formName.charAt(0).toUpperCase() + formName.slice(1);
    }
    
    // Format the suffix
    return suffix.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleFormChange = async (form: Form): Promise<void> => {
    if (form.name === selectedForm?.name || isChangingForm) return;
    
    logger.debug('Switching to form:', form.name, 'from:', selectedForm?.name);
    setIsChangingForm(true);
    
    try {
      // Load the form's data
      const formData = await fetchJSON<Pokemon>(form.url);
      if (!formData) throw new Error('No form data received');
      logger.debug('Form data loaded:', formData.name);
      
      // Validate the form data has required fields
      if (!formData || !formData.name) {
        throw new Error('Invalid form data received');
      }
      
      // Ensure formData has an id field (required by Pokemon type)
      if (!formData.id && formData.name) {
        // Extract ID from the URL if not present
        const urlParts = form.url.split('/');
        const possibleId = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
        formData.id = parseInt(possibleId) || formData.name;
      }
      
      // Update the selected form only after successful data load
      setSelectedForm(form);
      
      // Call the parent callback with the form data
      if (onFormChange) {
        await onFormChange(formData);
      }
    } catch (error) {
      logger.error('Error loading form data:', error);
      // Show error to user with more detail
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to load form data: ${errorMessage}`);
    } finally {
      setIsChangingForm(false);
    }
  };

  if (loading) return null;
  if (forms.length <= 1) return null; // Don't show selector if only one form

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Forms</h4>
      <div className="flex flex-wrap gap-2">
        {forms.map((form) => (
          <button
            key={form.name}
            onClick={() => handleFormChange(form)}
            disabled={isChangingForm}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedForm?.name === form.name
                ? 'bg-pokemon-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isChangingForm ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isChangingForm && selectedForm?.name !== form.name ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin h-3 w-3 border-2 border-gray-500 border-t-transparent rounded-full inline-block"></span>
                Loading...
              </span>
            ) : (
              form.displayName
            )}
          </button>
        ))}
      </div>
    </div>
  );
}