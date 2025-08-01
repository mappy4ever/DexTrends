import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import { 
  PrinterIcon,
  DocumentArrowDownIcon,
  CogIcon,
  ViewColumnsIcon,
  PhotoIcon,
  ListBulletIcon,
  TableCellsIcon,
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Modal from './modals/Modal';
import { useNotifications } from '../../hooks/useNotifications';
import { TCGCard } from '../../types/api/cards';
import { PocketCard } from '../../types/api/pocket-cards';

// Types
type Card = TCGCard | PocketCard | {
  id?: string;
  name: string;
  images?: { small?: string; large?: string };
  currentPrice?: string | number;
  price?: string | number;
  set?: { name?: string };
  rarity?: string;
  types?: string[];
  description?: string;
  hp?: string | number;
};

type LayoutType = 'grid' | 'list' | 'table' | 'binder';
type TemplateType = 'modern' | 'classic' | 'minimal' | 'checklist' | 'catalog';
type PaperSize = 'A4' | 'Letter' | 'Legal';
type PageOrientation = 'portrait' | 'landscape';
type FontSize = 'small' | 'medium' | 'large';
type ColorMode = 'color' | 'bw';
type SortBy = 'name' | 'price' | 'rarity' | 'set';
type GroupBy = 'none' | 'rarity' | 'set' | 'type';

interface PrintOptions {
  includeImages: boolean;
  includePrices: boolean;
  includeDescription: boolean;
  includeStats: boolean;
  includeQRCodes: boolean;
  cardsPerPage: number;
  pageOrientation: PageOrientation;
  paperSize: PaperSize;
  showHeaders: boolean;
  showFooters: boolean;
  groupBy: GroupBy;
  sortBy: SortBy;
  fontSize: FontSize;
  colorMode: ColorMode;
}

interface Template {
  name: string;
  description: string;
  primaryColor: string;
  fontFamily: string;
}

interface Layout {
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PrintableCardListsProps {
  cards?: Card[];
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
}

/**
 * Printable Card Lists with Customizable Layouts
 * Professional printing options for card collections
 */
const PrintableCardLists: React.FC<PrintableCardListsProps> = ({ 
  cards = [], 
  isOpen = false, 
  onClose,
  title = "My Card Collection"
}) => {
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [template, setTemplate] = useState<TemplateType>('modern');
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    includeImages: true,
    includePrices: true,
    includeDescription: true,
    includeStats: true,
    includeQRCodes: false,
    cardsPerPage: 12,
    pageOrientation: 'portrait',
    paperSize: 'A4',
    showHeaders: true,
    showFooters: true,
    groupBy: 'none',
    sortBy: 'name',
    fontSize: 'medium',
    colorMode: 'color'
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { notify } = useNotifications();

  // Template configurations
  const templates: Record<TemplateType, Template> = {
    modern: {
      name: 'Modern',
      description: 'Clean, modern design with emphasis on imagery',
      primaryColor: '#3B82F6',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    classic: {
      name: 'Classic',
      description: 'Traditional layout with detailed information',
      primaryColor: '#059669',
      fontFamily: 'Georgia, serif'
    },
    minimal: {
      name: 'Minimal',
      description: 'Simple, text-focused layout',
      primaryColor: '#6B7280',
      fontFamily: 'Helvetica, Arial, sans-serif'
    },
    checklist: {
      name: 'Checklist',
      description: 'Checkbox format for tracking collection',
      primaryColor: '#DC2626',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    catalog: {
      name: 'Catalog',
      description: 'Detailed catalog with technical specifications',
      primaryColor: '#7C3AED',
      fontFamily: 'Monaco, monospace'
    }
  };

  const layouts: Record<LayoutType, Layout> = {
    grid: { name: 'Grid', icon: <ViewColumnsIcon className="h-4 w-4" />, description: 'Card grid layout' },
    list: { name: 'List', icon: <ListBulletIcon className="h-4 w-4" />, description: 'Detailed list view' },
    table: { name: 'Table', icon: <TableCellsIcon className="h-4 w-4" />, description: 'Spreadsheet-style table' },
    binder: { name: 'Binder', icon: <PhotoIcon className="h-4 w-4" />, description: 'Binder page simulation' }
  };

  // Helper function to get card image
  const getCardImage = (card: Card, size: 'small' | 'large' = 'small'): string => {
    // Check for PocketCard image property
    if ('image' in card && card.image) {
      return card.image;
    }
    
    // Check for TCGCard or generic card images property
    if ('images' in card && card.images) {
      return size === 'small' ? (card.images.small || card.images.large || '/back-card.png') 
                              : (card.images.large || card.images.small || '/back-card.png');
    }
    
    return '/back-card.png';
  };

  // Helper function to get card price
  const getCardPrice = (card: Card): number => {
    // Check for direct price properties
    if ('currentPrice' in card && card.currentPrice) {
      return parseFloat(String(card.currentPrice));
    }
    if ('price' in card && card.price) {
      return parseFloat(String(card.price));
    }
    
    // Check for TCGCard price structure
    if ('tcgplayer' in card && card.tcgplayer?.prices) {
      const prices = card.tcgplayer.prices;
      // Try to get market price first, then other prices
      if (prices.normal?.market) return prices.normal.market;
      if (prices.holofoil?.market) return prices.holofoil.market;
      if (prices.reverseHolofoil?.market) return prices.reverseHolofoil.market;
      if (prices.normal?.mid) return prices.normal.mid;
      if (prices.holofoil?.mid) return prices.holofoil.mid;
    }
    
    return 0;
  };

  // Sort and group cards
  const processedCards = React.useMemo(() => {
    let processed = [...cards];

    // Sort cards
    switch (printOptions.sortBy) {
      case 'name':
        processed.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        processed.sort((a, b) => getCardPrice(b) - getCardPrice(a));
        break;
      case 'rarity':
        const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Ultra Rare', 'Secret Rare'];
        processed.sort((a, b) => {
          const aIndex = a.rarity && rarityOrder.indexOf(a.rarity) !== -1 ? rarityOrder.indexOf(a.rarity) : 999;
          const bIndex = b.rarity && rarityOrder.indexOf(b.rarity) !== -1 ? rarityOrder.indexOf(b.rarity) : 999;
          return aIndex - bIndex;
        });
        break;
      case 'set':
        processed.sort((a, b) => {
          const aSetName = typeof a.set === 'string' ? a.set : a.set?.name || '';
          const bSetName = typeof b.set === 'string' ? b.set : b.set?.name || '';
          return aSetName.localeCompare(bSetName);
        });
        break;
    }

    // Group cards
    if (printOptions.groupBy !== 'none') {
      const grouped = processed.reduce<Record<string, Card[]>>((acc, card) => {
        let groupKey: string;
        switch (printOptions.groupBy) {
          case 'rarity':
            groupKey = card.rarity || 'Unknown';
            break;
          case 'set':
            groupKey = typeof card.set === 'string' ? card.set : card.set?.name || 'Unknown';
            break;
          case 'type':
            groupKey = card.types?.[0] || 'Unknown';
            break;
          default:
            groupKey = 'All Cards';
        }
        
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(card);
        return acc;
      }, {});
      
      return grouped;
    }

    return { 'All Cards': processed };
  }, [cards, printOptions.sortBy, printOptions.groupBy]);

  // Generate print styles
  const getPrintStyles = () => {
    const currentTemplate = templates[template];
    const fontSize = {
      small: '12px',
      medium: '14px',
      large: '16px'
    }[printOptions.fontSize];

    return `
      @page {
        size: ${printOptions.paperSize} ${printOptions.pageOrientation};
        margin: 1in;
      }
      
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content, .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
      }
      
      .print-content {
        font-family: ${currentTemplate.fontFamily};
        font-size: ${fontSize};
        color: ${printOptions.colorMode === 'bw' ? '#000' : '#333'};
        line-height: 1.4;
      }
      
      .print-header {
        border-bottom: 2px solid ${currentTemplate.primaryColor};
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
      }
      
      .print-footer {
        border-top: 1px solid #ccc;
        margin-top: 1rem;
        padding-top: 0.5rem;
        font-size: 0.8em;
        color: #666;
      }
      
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      
      .card-list {
        margin-bottom: 2rem;
      }
      
      .card-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 2rem;
      }
      
      .card-table th,
      .card-table td {
        border: 1px solid #ddd;
        padding: 0.5rem;
        text-align: left;
      }
      
      .card-table th {
        background-color: ${printOptions.colorMode === 'bw' ? '#f5f5f5' : currentTemplate.primaryColor};
        color: ${printOptions.colorMode === 'bw' ? '#000' : '#fff'};
        font-weight: bold;
      }
      
      .card-item {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        background: ${printOptions.colorMode === 'bw' ? '#fff' : '#fafafa'};
        page-break-inside: avoid;
      }
      
      .card-image {
        max-width: ${layout === 'grid' ? '120px' : '80px'};
        height: auto;
        border-radius: 4px;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .group-header {
        font-size: 1.2em;
        font-weight: bold;
        color: ${currentTemplate.primaryColor};
        margin: 1.5rem 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid ${currentTemplate.primaryColor};
      }
    `;
  };

  // Render card based on layout
  const renderCard = (card: Card, index: number) => {
    const currentPrice = getCardPrice(card);
    
    switch (layout) {
      case 'grid':
        return (
          <div key={card.id || index} className="card-item">
            {printOptions.includeImages && (
              <div className="text-center mb-2">
                <img 
                  src={getCardImage(card, 'small')} 
                  alt={card.name}
                  className="card-image mx-auto"  />
              </div>
            )}
            <h3 className="font-bold text-center mb-1">{card.name}</h3>
            {printOptions.includeStats && (
              <div className="text-sm text-center mb-2">
                {card.set && <div>{typeof card.set === 'string' ? card.set : card.set.name}</div>}
                {card.rarity && <div className="text-gray-600">{card.rarity}</div>}
              </div>
            )}
            {printOptions.includePrices && currentPrice > 0 && (
              <div className="text-center font-semibold text-green-600">
                ${currentPrice.toFixed(2)}
              </div>
            )}
            {template === 'checklist' && (
              <div className="mt-2 text-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Owned</span>
              </div>
            )}
          </div>
        );
        
      case 'list':
        return (
          <div key={card.id || index} className="card-item flex items-center space-x-4 mb-3">
            {printOptions.includeImages && (
              <img 
                src={getCardImage(card, 'small')} 
                alt={card.name}
                className="card-image flex-shrink-0"  />
            )}
            <div className="flex-1">
              <h3 className="font-bold">{card.name}</h3>
              {printOptions.includeStats && (
                <div className="text-sm text-gray-600">
                  {typeof card.set === 'string' ? card.set : card.set?.name} • {card.rarity}
                  {card.types && ` • ${card.types.join(', ')}`}
                </div>
              )}
              {printOptions.includeDescription && (
                ('description' in card && card.description) ? (
                  <p className="text-sm mt-1">{card.description}</p>
                ) : ('flavorText' in card && card.flavorText) ? (
                  <p className="text-sm mt-1">{card.flavorText}</p>
                ) : null
              )}
            </div>
            <div className="text-right">
              {printOptions.includePrices && currentPrice > 0 && (
                <div className="font-semibold text-green-600">
                  ${currentPrice.toFixed(2)}
                </div>
              )}
              {template === 'checklist' && (
                <input type="checkbox" className="mt-2" />
              )}
            </div>
          </div>
        );
        
      case 'table':
        return (
          <tr key={card.id || index}>
            <td>{card.name}</td>
            <td>{card.set ? (typeof card.set === 'string' ? card.set : card.set.name) : '-'}</td>
            <td>{card.rarity || '-'}</td>
            {printOptions.includePrices && (
              <td className="text-right">
                {currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : '-'}
              </td>
            )}
            {printOptions.includeStats && (
              <>
                <td>{card.hp || '-'}</td>
                <td>{card.types?.join(', ') || '-'}</td>
              </>
            )}
            {template === 'checklist' && (
              <td className="text-center">
                <input type="checkbox" />
              </td>
            )}
          </tr>
        );
        
      case 'binder':
        return (
          <div key={card.id || index} className="inline-block w-1/6 p-2 text-center">
            {printOptions.includeImages && (
              <img 
                src={getCardImage(card, 'small')} 
                alt={card.name}
                className="w-full max-w-20 mx-auto mb-1"  />
            )}
            <div className="text-xs">
              <div className="font-semibold truncate">{card.name}</div>
              {printOptions.includeStats && (
                <div className="text-gray-600 truncate">{card.set ? (typeof card.set === 'string' ? card.set : card.set.name) : ''}</div>
              )}
              {printOptions.includePrices && currentPrice > 0 && (
                <div className="text-green-600">${currentPrice.toFixed(2)}</div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Generate print content
  const generatePrintContent = () => {
    const currentTemplate = templates[template];
    
    return (
      <div className="print-content">
        <style dangerouslySetInnerHTML={{ __html: getPrintStyles() }} />
        
        {printOptions.showHeaders && (
          <div className="print-header">
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="text-sm text-gray-600">
              Generated on {new Date().toLocaleDateString()} • {cards.length} cards
              {printOptions.includePrices && ` • Total Value: $${cards.reduce((sum, card) => sum + getCardPrice(card), 0).toLocaleString()}`}
            </div>
          </div>
        )}
        
        {Object.entries(processedCards).map(([groupName, groupCards], groupIndex) => (
          <div key={groupName} className={groupIndex > 0 ? 'page-break' : ''}>
            {printOptions.groupBy !== 'none' && (
              <div className="group-header">{groupName} ({groupCards.length} cards)</div>
            )}
            
            {layout === 'table' ? (
              <table className="card-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Set</th>
                    <th>Rarity</th>
                    {printOptions.includePrices && <th>Price</th>}
                    {printOptions.includeStats && (
                      <>
                        <th>HP</th>
                        <th>Types</th>
                      </>
                    )}
                    {template === 'checklist' && <th>Owned</th>}
                  </tr>
                </thead>
                <tbody>
                  {groupCards.map((card, index) => renderCard(card, index))}
                </tbody>
              </table>
            ) : layout === 'grid' ? (
              <div className="card-grid">
                {groupCards.map((card, index) => renderCard(card, index))}
              </div>
            ) : layout === 'binder' ? (
              <div className="mb-4">
                {groupCards.map((card, index) => renderCard(card, index))}
              </div>
            ) : (
              <div className="card-list">
                {groupCards.map((card, index) => renderCard(card, index))}
              </div>
            )}
          </div>
        ))}
        
        {printOptions.showFooters && (
          <div className="print-footer text-center">
            <div>Generated by DexTrends • {window.location.origin}</div>
            <div className="text-xs mt-1">
              Layout: {layouts[layout].name} • Template: {currentTemplate.name} • 
              {printOptions.colorMode === 'bw' ? 'Black & White' : 'Color'} Mode
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle print
  const handlePrint = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
      notify.success('Print dialog opened');
    }, 500);
  };

  // Handle PDF export
  const handlePDFExport = async () => {
    setIsGenerating(true);
    try {
      // In a real implementation, you would use libraries like jsPDF with html2canvas
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create and download a mock PDF
      const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      notify.success('PDF exported successfully');
    } catch (error) {
      notify.error('Failed to export PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Card List" size="full">
      <div className="flex h-full">
        {/* Settings Panel */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Template
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {(Object.entries(templates) as [TemplateType, Template][]).map(([key, temp]) => (
                  <button
                    key={key}
                    onClick={() => setTemplate(key)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      template === key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {temp.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {temp.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Layout
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(layouts) as [LayoutType, Layout][]).map(([key, layoutOption]) => (
                  <button
                    key={key}
                    onClick={() => setLayout(key)}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                      layout === key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {layoutOption.icon}
                    <span className="text-sm font-medium">{layoutOption.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Print Options */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Content Options
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'includeImages' as const, label: 'Include card images' },
                  { key: 'includePrices' as const, label: 'Include prices' },
                  { key: 'includeStats' as const, label: 'Include card stats' },
                  { key: 'includeDescription' as const, label: 'Include descriptions' },
                  { key: 'showHeaders' as const, label: 'Show page headers' },
                  { key: 'showFooters' as const, label: 'Show page footers' }
                ].map(option => (
                  <label key={option.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={printOptions[option.key]}
                      onChange={(e) => setPrintOptions(prev => ({
                        ...prev,
                        [option.key]: e.target.checked
                      }))}
                      className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sorting & Grouping */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Organization
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort by
                  </label>
                  <select
                    value={printOptions.sortBy}
                    onChange={(e) => setPrintOptions(prev => ({ ...prev, sortBy: e.target.value as SortBy }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="rarity">Rarity</option>
                    <option value="set">Set</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group by
                  </label>
                  <select
                    value={printOptions.groupBy}
                    onChange={(e) => setPrintOptions(prev => ({ ...prev, groupBy: e.target.value as GroupBy }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                    <option value="none">No grouping</option>
                    <option value="rarity">Rarity</option>
                    <option value="set">Set</option>
                    <option value="type">Type</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Page Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Page Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Paper Size
                  </label>
                  <select
                    value={printOptions.paperSize}
                    onChange={(e) => setPrintOptions(prev => ({ ...prev, paperSize: e.target.value as PaperSize }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Orientation
                  </label>
                  <select
                    value={printOptions.pageOrientation}
                    onChange={(e) => setPrintOptions(prev => ({ ...prev, pageOrientation: e.target.value as PageOrientation }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color Mode
                  </label>
                  <select
                    value={printOptions.colorMode}
                    onChange={(e) => setPrintOptions(prev => ({ ...prev, colorMode: e.target.value as ColorMode }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                    <option value="color">Color</option>
                    <option value="bw">Black & White</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col">
          {/* Preview Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Preview
              </h3>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 py-1 text-sm rounded ${
                  previewMode 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <EyeIcon className="h-4 w-4 inline mr-1" />
                {previewMode ? 'Exit Preview' : 'Print Preview'}
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50">

                <PrinterIcon className="h-4 w-4" />
                <span>{isGenerating ? 'Preparing...' : 'Print'}</span>
              </button>
              
              <button
                onClick={handlePDFExport}
                disabled={isGenerating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50">

                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
            <div 
              ref={printRef}
              className={`mx-auto bg-white shadow-lg ${
                printOptions.pageOrientation === 'landscape' ? 'max-w-none w-full' : 'max-w-4xl'
              } ${previewMode ? 'print-preview' : ''}`}
              style={{ 
                minHeight: '297mm',
                transform: previewMode ? 'scale(0.8)' : 'scale(1)',
                transformOrigin: 'top center',
                transition: 'transform 0.3s ease'
              }}
            >
              {generatePrintContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white">
                Generating printable document...
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PrintableCardLists;