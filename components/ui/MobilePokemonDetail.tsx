import React from 'react';
import { TypeBadge } from './TypeBadge';

// Types
interface Sprite {
  front_default?: string;
  other?: {
    'official-artwork'?: {
      front_default?: string;
    };
  };
}

interface TypeInfo {
  type: {
    name: string;
  };
}

interface Stat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface Pokemon {
  id: number;
  name: string;
  sprites?: Sprite;
  types: TypeInfo[];
  height: number;
  weight: number;
  stats: Stat[];
}

interface Genus {
  genus: string;
  language: {
    name: string;
  };
}

interface Species {
  genera?: Genus[];
  capture_rate?: number;
}

interface Tab {
  id: string;
  name: string;
}

interface TypeEffectivenessData {
  weakTo?: string[];
  resistantTo?: string[];
  immuneTo?: string[];
}

interface TypeEffectiveness {
  [key: string]: TypeEffectivenessData;
}

interface DamageRelation {
  type: string;
  multiplier?: number;
}

// Component Props
interface MobilePokemonHeaderProps {
  onBack: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

interface MobilePokemonHeroProps {
  pokemon: Pokemon;
}

interface MobilePokemonDetailsProps {
  pokemon: Pokemon;
  species?: Species;
}

interface MobileTabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

interface MobileStatDisplayProps {
  stats: Stat[];
}

interface MobileTypeEffectivenessProps {
  pokemon: Pokemon;
  typeEffectiveness: TypeEffectiveness;
}

interface MobileBottomNavigationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

interface MobileFABProps {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}

// Mobile-optimized header with sticky behavior
export const MobilePokemonHeader: React.FC<MobilePokemonHeaderProps> = ({ onBack, onToggleFavorite, isFavorite }) => (
  <div className="pokemon-header safe-area-top">
    <div className="header-actions">
      <button onClick={onBack} className="back-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
        </svg>
        <span>Pokédex</span>
      </button>
      <button onClick={onToggleFavorite} className="favorite-button">
        {isFavorite ? '❤️ Saved' : '🤍 Save'}
      </button>
    </div>
  </div>
);

// Hero section with Pokemon image
export const MobilePokemonHero: React.FC<MobilePokemonHeroProps> = ({ pokemon }) => (
  <div className="pokemon-hero">
    <div className="pokemon-image-container">
      <div className="pokemon-image-wrapper">
        <img
          src={pokemon.sprites?.other?.["official-artwork"]?.front_default || pokemon.sprites?.front_default || "/dextrendslogo.png"}
          alt={pokemon.name}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  </div>
);

// Pokemon details card
export const MobilePokemonDetails: React.FC<MobilePokemonDetailsProps> = ({ pokemon, species }) => {
  const formatName = (name: string): string => {
    const baseName = name.split('-')[0];
    return baseName.charAt(0).toUpperCase() + baseName.slice(1);
  };

  return (
    <div className="pokemon-details">
      <div className="pokemon-title">
        <h1 className="pokemon-name">{formatName(pokemon.name)}</h1>
        <span className="pokemon-number">#{pokemon.id.toString().padStart(3, '0')}</span>
      </div>

      <div className="type-badges-container">
        {pokemon.types.map((typeInfo) => (
          <TypeBadge key={typeInfo.type.name} type={typeInfo.type.name} size="sm" />
        ))}
      </div>

      <div className="info-grid">
        <div className="info-card">
          <div className="info-label">Height</div>
          <div className="info-value">{(pokemon.height / 10).toFixed(1)} m</div>
          <div className="info-subvalue">{((pokemon.height / 10) * 3.281).toFixed(1)} ft</div>
        </div>
        <div className="info-card">
          <div className="info-label">Weight</div>
          <div className="info-value">{(pokemon.weight / 10).toFixed(1)} kg</div>
          <div className="info-subvalue">{((pokemon.weight / 10) * 2.205).toFixed(1)} lbs</div>
        </div>
        {species && (
          <>
            <div className="info-card">
              <div className="info-label">Species</div>
              <div className="info-value">
                {species.genera?.find(g => g.language.name === 'en')?.genus?.replace(' Pokémon', '') || 'Unknown'}
              </div>
            </div>
            <div className="info-card">
              <div className="info-label">Catch Rate</div>
              <div className="info-value">{((species.capture_rate || 0) / 255 * 100).toFixed(1)}%</div>
              <div className="info-subvalue">
                {(species.capture_rate || 0) > 200 ? 'Easy' : 
                 (species.capture_rate || 0) > 100 ? 'Medium' : 'Hard'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Tab navigation
export const MobileTabNavigation: React.FC<MobileTabNavigationProps> = ({ tabs, activeTab, onTabChange }) => (
  <div className="tab-navigation">
    <div className="tab-list">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  </div>
);

// Mobile-optimized stat display
export const MobileStatDisplay: React.FC<MobileStatDisplayProps> = ({ stats }) => {
  const getStatColor = (value: number): string => {
    if (value >= 150) return '#10b981';
    if (value >= 100) return '#3b82f6';
    if (value >= 80) return '#f59e0b';
    if (value >= 60) return '#ef4444';
    return '#6b7280';
  };

  return (
    <div className="stat-bars">
      {stats.map((stat) => {
        const percentage = (stat.base_stat / 255) * 100;
        const color = getStatColor(stat.base_stat);
        
        return (
          <div key={stat.stat.name} className="stat-item">
            <div className="stat-header">
              <span className="stat-name">
                {stat.stat.name === 'hp' ? 'HP' :
                 stat.stat.name === 'special-attack' ? 'Sp. Attack' :
                 stat.stat.name === 'special-defense' ? 'Sp. Defense' :
                 stat.stat.name.replace('-', ' ')}
              </span>
              <span className="stat-value">{stat.base_stat}</span>
            </div>
            <div className="stat-bar-container">
              <div 
                className="stat-bar" 
                style={{ 
                  width: `${percentage}%`,
                  background: color
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Type effectiveness display
export const MobileTypeEffectiveness: React.FC<MobileTypeEffectivenessProps> = ({ pokemon, typeEffectiveness }) => {
  // Calculate type effectiveness
  const damageRelations: { [key: string]: number } = {};
  const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
  
  allTypes.forEach(type => {
    damageRelations[type] = 1;
  });
  
  pokemon.types.forEach(typeInfo => {
    const effectiveness = typeEffectiveness[typeInfo.type.name];
    if (effectiveness) {
      effectiveness.weakTo?.forEach(t => {
        damageRelations[t] = (damageRelations[t] || 1) * 2;
      });
      effectiveness.resistantTo?.forEach(t => {
        damageRelations[t] = (damageRelations[t] || 1) * 0.5;
      });
      effectiveness.immuneTo?.forEach(t => {
        damageRelations[t] = 0;
      });
    }
  });

  const grouped: {
    weak: DamageRelation[];
    resistant: DamageRelation[];
    immune: DamageRelation[];
  } = {
    weak: [],
    resistant: [],
    immune: []
  };

  Object.entries(damageRelations).forEach(([type, multiplier]) => {
    if (multiplier >= 2) grouped.weak.push({ type, multiplier });
    else if (multiplier > 0 && multiplier < 1) grouped.resistant.push({ type, multiplier });
    else if (multiplier === 0) grouped.immune.push({ type });
  });

  return (
    <div className="type-effectiveness-section">
      {grouped.weak.length > 0 && (
        <div className="effectiveness-group">
          <div className="effectiveness-label">Weak to</div>
          <div className="effectiveness-badges">
            {grouped.weak.map(({ type }) => (
              <TypeBadge key={type} type={type} size="xs" />
            ))}
          </div>
        </div>
      )}
      
      {grouped.resistant.length > 0 && (
        <div className="effectiveness-group">
          <div className="effectiveness-label">Resistant to</div>
          <div className="effectiveness-badges">
            {grouped.resistant.map(({ type }) => (
              <TypeBadge key={type} type={type} size="xs" />
            ))}
          </div>
        </div>
      )}
      
      {grouped.immune.length > 0 && (
        <div className="effectiveness-group">
          <div className="effectiveness-label">Immune to</div>
          <div className="effectiveness-badges">
            {grouped.immune.map(({ type }) => (
              <TypeBadge key={type} type={type} size="xs" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Bottom navigation
export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({ hasPrevious, hasNext, onPrevious, onNext }) => (
  <div className="bottom-navigation safe-area-bottom">
    <button 
      onClick={onPrevious} 
      disabled={!hasPrevious}
      className="nav-button"
      style={{ opacity: hasPrevious ? 1 : 0.5 }}
    >
      ← Previous
    </button>
    <button 
      onClick={onNext} 
      disabled={!hasNext}
      className="nav-button"
      style={{ opacity: hasNext ? 1 : 0.5 }}
    >
      Next →
    </button>
  </div>
);

// Floating action button for additional actions
export const MobileFAB: React.FC<MobileFABProps> = ({ icon, onClick, label }) => (
  <button
    onClick={onClick}
    className="fixed bottom-20 right-4 z-50 bg-pokemon-red text-white rounded-full p-4 shadow-lg active:scale-95 transition-transform"
    aria-label={label}
  >
    {icon}
  </button>
);

export default {
  MobilePokemonHeader,
  MobilePokemonHero,
  MobilePokemonDetails,
  MobileTabNavigation,
  MobileStatDisplay,
  MobileTypeEffectiveness,
  MobileBottomNavigation,
  MobileFAB
};