import React, { useState, useEffect } from 'react';
import { fetchData } from '../../utils/apiutils';

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

export default function PokemonFormSelector({ pokemon, species, onFormChange }) {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForms = async () => {
      if (!species?.varieties) {
        setLoading(false);
        return;
      }

      try {
        const validForms = [];
        
        for (const variety of species.varieties) {
          const formName = variety.pokemon.name;
          
          // Check if this is a valid form
          if (!isValidForm(formName) && variety.is_default) {
            // Always include the default form
            validForms.push({
              name: formName,
              displayName: 'Base',
              url: variety.pokemon.url,
              isDefault: true
            });
          } else if (isValidForm(formName)) {
            const displayName = getFormDisplayName(formName, pokemon.name);
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
        console.error('Error loading forms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, [pokemon, species]);

  const isValidForm = (formName) => {
    // Check if it contains any excluded patterns
    if (EXCLUDED_FORM_PATTERNS.some(pattern => formName.includes(pattern))) {
      return false;
    }
    
    // Check if it contains any valid patterns
    return VALID_FORM_PATTERNS.some(pattern => formName.includes(pattern));
  };

  const getFormDisplayName = (formName, baseName) => {
    const capitalizedBaseName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    
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
    
    // Special cases
    if (formName === baseName) return 'Base';
    
    // Format the remaining part
    const suffix = formName.replace(baseName + '-', '');
    return suffix.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleFormChange = async (form) => {
    if (form.name === selectedForm?.name) return;
    
    setSelectedForm(form);
    
    try {
      // Load the form's data
      const formData = await fetchData(form.url);
      onFormChange(formData);
    } catch (error) {
      console.error('Error loading form data:', error);
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
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedForm?.name === form.name
                ? 'bg-pokemon-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {form.displayName}
          </button>
        ))}
      </div>
    </div>
  );
}