import logger from './logger';

export type ExportFormat = 'csv' | 'json' | 'txt';

interface ExportOptions {
  filename?: string;
  format: ExportFormat;
  columns?: string[];
  includeHeaders?: boolean;
}

/**
 * Export data to various formats (CSV, JSON, TXT)
 */
export const exportData = <T extends Record<string, unknown>>(data: T[], options: ExportOptions): void => {
  const {
    filename = `export-${Date.now()}`,
    format,
    columns,
    includeHeaders = true,
  } = options;

  try {
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'csv':
        content = convertToCSV(data, columns, includeHeaders);
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
        break;
      
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        extension = 'json';
        break;
      
      case 'txt':
        content = convertToText(data, columns);
        mimeType = 'text/plain;charset=utf-8;';
        extension = 'txt';
        break;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    downloadFile(content, `${filename}.${extension}`, mimeType);
    logger.info(`Data exported successfully as ${format}`, { 
      filename: `${filename}.${extension}`,
      recordCount: data.length 
    });
  } catch (error) {
    logger.error('Failed to export data', { error, format, filename });
    throw error;
  }
};

/**
 * Convert data array to CSV format
 */
const convertToCSV = <T extends Record<string, unknown>>(
  data: T[], 
  columns?: string[], 
  includeHeaders: boolean = true
): string => {
  if (!data || data.length === 0) {
    return '';
  }

  // Determine columns from first object if not specified
  const cols = columns || Object.keys(data[0]);
  
  const rows: string[] = [];
  
  // Add headers
  if (includeHeaders) {
    rows.push(cols.map(col => escapeCSVValue(col)).join(','));
  }
  
  // Add data rows
  data.forEach(item => {
    const row = cols.map(col => {
      const value = getNestedValue(item, col);
      return escapeCSVValue(value);
    });
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
};

/**
 * Convert data array to plain text format
 */
const convertToText = <T extends Record<string, unknown>>(data: T[], columns?: string[]): string => {
  if (!data || data.length === 0) {
    return '';
  }

  const cols = columns || Object.keys(data[0]);
  const lines: string[] = [];
  
  data.forEach((item, index) => {
    lines.push(`--- Record ${index + 1} ---`);
    cols.forEach(col => {
      const value = getNestedValue(item, col);
      lines.push(`${col}: ${value}`);
    });
    lines.push('');
  });
  
  return lines.join('\n');
};

/**
 * Escape CSV value to handle commas, quotes, and newlines
 */
const escapeCSVValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Check if value needs escaping
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  
  return stringValue;
};

/**
 * Get nested value from object using dot notation
 */
const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  const keys = path.split('.');
  let value: unknown = obj;
  
  for (const key of keys) {
    if (typeof value === 'object' && value !== null) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return '';
    }
    if (value === undefined) {
      return '';
    }
  }
  
  // Handle arrays and objects
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  
  return value;
};

/**
 * Download file using browser's download functionality
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Export Pokemon data with specific formatting
 */
export const exportPokemonData = (
  pokemon: any[], 
  format: ExportFormat = 'csv'
): void => {
  const columns = [
    'id',
    'name', 
    'types',
    'stats.hp',
    'stats.attack',
    'stats.defense',
    'stats.special-attack',
    'stats.special-defense',
    'stats.speed',
    'abilities',
    'generation',
  ];
  
  // Transform data for export
  const transformedData = pokemon.map(p => ({
    id: p.id,
    name: p.name,
    types: p.types?.map((t: any) => t.type?.name || t).join('/') || '',
    stats: {
      hp: p.stats?.find((s: any) => s.stat?.name === 'hp')?.base_stat || 0,
      attack: p.stats?.find((s: any) => s.stat?.name === 'attack')?.base_stat || 0,
      defense: p.stats?.find((s: any) => s.stat?.name === 'defense')?.base_stat || 0,
      'special-attack': p.stats?.find((s: any) => s.stat?.name === 'special-attack')?.base_stat || 0,
      'special-defense': p.stats?.find((s: any) => s.stat?.name === 'special-defense')?.base_stat || 0,
      speed: p.stats?.find((s: any) => s.stat?.name === 'speed')?.base_stat || 0,
    },
    abilities: p.abilities?.map((a: any) => a.ability?.name || a).join(', ') || '',
    generation: p.generation || 1,
  }));
  
  exportData(transformedData, {
    filename: `pokemon-data-${Date.now()}`,
    format,
    columns,
  });
};

/**
 * Export TCG card data with specific formatting
 */
export const exportCardData = (
  cards: any[], 
  format: ExportFormat = 'csv'
): void => {
  const columns = [
    'id',
    'name',
    'set.name',
    'number',
    'rarity',
    'types',
    'hp',
    'artist',
    'prices.market',
    'prices.low',
    'prices.high',
  ];
  
  // Transform data for export
  const transformedData = cards.map(card => ({
    id: card.id,
    name: card.name,
    set: {
      name: card.set?.name || '',
    },
    number: card.number,
    rarity: card.rarity,
    types: Array.isArray(card.types) ? card.types.join('/') : '',
    hp: card.hp || '',
    artist: card.artist || '',
    prices: {
      market: card.cardmarket?.prices?.averageSellPrice || 
              card.tcgplayer?.prices?.holofoil?.market ||
              card.tcgplayer?.prices?.normal?.market || 0,
      low: card.tcgplayer?.prices?.holofoil?.low ||
           card.tcgplayer?.prices?.normal?.low || 0,
      high: card.tcgplayer?.prices?.holofoil?.high ||
            card.tcgplayer?.prices?.normal?.high || 0,
    },
  }));
  
  exportData(transformedData, {
    filename: `tcg-cards-${Date.now()}`,
    format,
    columns,
  });
};

/**
 * Export moves data with specific formatting
 */
export const exportMovesData = (
  moves: any[], 
  format: ExportFormat = 'csv'
): void => {
  const columns = [
    'id',
    'name',
    'type',
    'category',
    'power',
    'accuracy',
    'pp',
    'priority',
    'effect',
  ];
  
  exportData(moves, {
    filename: `pokemon-moves-${Date.now()}`,
    format,
    columns,
  });
};

/**
 * Export items data with specific formatting
 */
export const exportItemsData = (
  items: any[], 
  format: ExportFormat = 'csv'
): void => {
  const columns = [
    'id',
    'name',
    'category',
    'cost',
    'effect',
    'fling_power',
    'fling_effect',
  ];
  
  exportData(items, {
    filename: `pokemon-items-${Date.now()}`,
    format,
    columns,
  });
};

/**
 * Export abilities data with specific formatting
 */
export const exportAbilitiesData = (
  abilities: any[], 
  format: ExportFormat = 'csv'
): void => {
  const columns = [
    'id',
    'name',
    'generation',
    'is_main_series',
    'effect',
    'pokemon_count',
  ];
  
  // Transform data for export
  const transformedData = abilities.map(ability => ({
    ...ability,
    pokemon_count: ability.pokemon?.length || 0,
  }));
  
  exportData(transformedData, {
    filename: `pokemon-abilities-${Date.now()}`,
    format,
    columns,
  });
};