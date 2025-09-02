import React, { useState, useRef, useEffect } from 'react';
import { 
  FaShare, 
  FaDownload, 
  FaQrcode, 
  FaLink,
  FaImage,
  FaClipboard,
  FaCheck
} from 'react-icons/fa';
import Modal from '@/components/ui/Modal';
import { useNotifications } from '../../hooks/useNotifications';
// Type definitions for dynamic imports
interface Html2CanvasStatic {
  (element: HTMLElement, options?: object): Promise<HTMLCanvasElement>;
}

interface JsPDFInstance {
  addImage(image: string, format: string, x: number, y: number, width: number, height: number): void;
  save(filename: string): void;
  text(text: string, x: number, y: number, options?: { align?: string }): void;
  setFontSize(size: number): void;
  setFont(font: string, style?: string): void;
  addPage(): void;
  internal: {
    pageSize: {
      getWidth(): number;
      getHeight(): number;
    };
  };
}

interface JsPDFStatic {
  new (format?: string, unit?: string, orientation?: string): JsPDFInstance;
}

// Lazy load heavy libraries
let html2canvas: Html2CanvasStatic | null = null;
let jsPDF: JsPDFStatic | null = null;

const loadHtml2Canvas = async (): Promise<Html2CanvasStatic> => {
  if (!html2canvas) {
    const mod = await import('html2canvas');
    html2canvas = mod.default as Html2CanvasStatic;
  }
  return html2canvas;
};

const loadJsPDF = async () => {
  if (!jsPDF) {
    const mod = await import('jspdf');
    jsPDF = mod.default;
  }
  return jsPDF;
};
import { TCGCard } from '../../types/api/cards';
import { PocketCard } from '../../types/api/pocket-cards';
import { Pokemon } from "../../types/pokemon";

type Card = TCGCard | PocketCard | Pokemon;

interface ExportOptions {
  includeImages: boolean;
  includePrices: boolean;
  includeDescription: boolean;
  includeStats: boolean;
  templateStyle: 'modern' | 'classic' | 'minimal';
}

interface CardSharingSystemProps {
  cards?: Card[];
  isOpen?: boolean;
  onClose?: () => void;
  shareMode?: 'single' | 'collection';
}

/**
 * Comprehensive Card Sharing and Export System
 * Multiple formats and sharing options for enhanced user experience
 */
const CardSharingSystem: React.FC<CardSharingSystemProps> = ({ 
  cards = [], 
  isOpen = false, 
  onClose,
  shareMode = 'single'
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'export'>('share');
  const [shareFormat, setShareFormat] = useState<'link' | 'qr' | 'image' | 'social'>('link');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf' | 'image'>('json');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeImages: true,
    includePrices: true,
    includeDescription: true,
    includeStats: true,
    templateStyle: 'modern'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [copied, setCopied] = useState(false);
  
  const cardPreviewRef = useRef<HTMLDivElement>(null);
  const { notify } = useNotifications();

  // Generate shareable link
  const generateShareLink = (): string => {
    const cardIds = cards.map(card => card.id).join(',');
    const baseUrl = window.location.origin;
    
    if (shareMode === 'single') {
      return `${baseUrl}/cards/${cards[0]?.id}?share=true`;
    } else {
      return `${baseUrl}/shared-collection?cards=${encodeURIComponent(cardIds)}`;
    }
  };

  // Generate QR code for sharing
  const generateQRCode = async (data: string) => {
    try {
      // In a real implementation, you'd use a QR code library like qrcode
      // For now, we'll use a placeholder service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
      setGeneratedQR(qrUrl);
    } catch (error) {
      notify.error('Failed to generate QR code');
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      notify.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      notify.error('Failed to copy to clipboard');
    }
  };

  // Helper to get card properties safely
  const getCardProperty = (card: Card, property: string): unknown => {
    return (card as unknown as Record<string, unknown>)[property];
  };

  // Type-safe helper to get card images
  const getCardImages = (card: Card): { small?: string; large?: string } => {
    const images = getCardProperty(card, 'images');
    if (images && typeof images === 'object' && images !== null) {
      return images as { small?: string; large?: string };
    }
    return {};
  };

  // Type-safe helper to get card set
  const getCardSet = (card: Card): { name?: string; id?: string } => {
    const set = getCardProperty(card, 'set');
    if (set && typeof set === 'object' && set !== null) {
      return set as { name?: string; id?: string };
    }
    return {};
  };

  // Export as JSON
  const exportAsJSON = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      app: 'DexTrends',
      version: '1.0',
      format: 'json',
      cards: cards.map(card => ({
        id: card.id,
        name: card.name,
        ...(exportOptions.includePrices && { 
          price: getCardProperty(card, 'currentPrice') || getCardProperty(card, 'price'),
          priceHistory: getCardProperty(card, 'priceHistory')
        }),
        ...(exportOptions.includeDescription && { 
          description: getCardProperty(card, 'description'),
          artist: getCardProperty(card, 'artist')
        }),
        ...(exportOptions.includeStats && { 
          hp: getCardProperty(card, 'hp'),
          types: getCardProperty(card, 'types'),
          rarity: getCardProperty(card, 'rarity'),
          set: getCardProperty(card, 'set')
        }),
        ...(exportOptions.includeImages && { 
          images: getCardProperty(card, 'images')
        })
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    downloadFile(blob, `dextrends-cards-${Date.now()}.json`);
  };

  // Export as CSV
  const exportAsCSV = () => {
    const headers = ['ID', 'Name'];
    if (exportOptions.includePrices) headers.push('Price');
    if (exportOptions.includeStats) headers.push('HP', 'Types', 'Rarity', 'Set');
    if (exportOptions.includeDescription) headers.push('Artist');

    const rows = cards.map(card => {
      const row = [card.id, card.name];
      if (exportOptions.includePrices) {
        row.push(String(getCardProperty(card, 'currentPrice') || getCardProperty(card, 'price') || ''));
      }
      if (exportOptions.includeStats) {
        const types = getCardProperty(card, 'types');
        const typesStr = Array.isArray(types) ? (types as string[]).join(';') : String(types || '');
        row.push(
          String(getCardProperty(card, 'hp') || ''),
          typesStr,
          String(getCardProperty(card, 'rarity') || ''),
          String(getCardSet(card).name || '')
        );
      }
      if (exportOptions.includeDescription) {
        row.push(String(getCardProperty(card, 'artist') || ''));
      }
      return row;
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadFile(blob, `dextrends-cards-${Date.now()}.csv`);
  };

  // Export as PDF
  const exportAsPDF = async () => {
    setIsGenerating(true);
    try {
      const jsPDFClass = await loadJsPDF();
      const pdf = new jsPDFClass();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Title
      pdf.setFontSize(20);
      pdf.text('DexTrends Card Collection', pageWidth / 2, 20, { align: 'center' });
      
      // Date
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      
      let yPosition = 50;
      const lineHeight = 8;
      const cardsPerPage = Math.floor((pageHeight - 60) / (lineHeight * 4));
      
      for (let i = 0; i < cards.length; i++) {
        if (i > 0 && i % cardsPerPage === 0) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const card = cards[i];
        
        // Card name
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(card.name, 20, yPosition);
        
        // Card details
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPosition += lineHeight;
        
        if (exportOptions.includeStats) {
          pdf.text(`Set: ${getCardSet(card).name || 'Unknown'}`, 20, yPosition);
          yPosition += lineHeight;
          pdf.text(`Rarity: ${getCardProperty(card, 'rarity') || 'Unknown'}`, 20, yPosition);
          yPosition += lineHeight;
        }
        
        if (exportOptions.includePrices) {
          const price = getCardProperty(card, 'currentPrice') || getCardProperty(card, 'price');
          if (price) {
            pdf.text(`Price: $${price}`, 20, yPosition);
            yPosition += lineHeight;
          }
        }
        
        yPosition += lineHeight; // Extra space between cards
      }
      
      pdf.save(`dextrends-cards-${Date.now()}.pdf`);
    } catch (error) {
      notify.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export as image
  const exportAsImage = async () => {
    if (!cardPreviewRef.current) return;
    
    setIsGenerating(true);
    try {
      const html2canvasLib = await loadHtml2Canvas();
      const canvas = await html2canvasLib(cardPreviewRef.current!);
      
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          downloadFile(blob, `dextrends-cards-${Date.now()}.png`);
        }
      }, 'image/png');
    } catch (error) {
      notify.error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate collection image for sharing
  const generateCollectionImage = (): React.ReactElement => {
    const template = exportOptions.templateStyle;
    const maxCards = 6; // Show up to 6 cards in preview
    const displayCards = cards.slice(0, maxCards);
    
    return (
      <div 
        ref={cardPreviewRef}
        className={`collection-preview ${template === 'modern' ? 'modern-template' : 'classic-template'}`}
        style={{ width: '800px', padding: '40px', backgroundColor: '#ffffff' }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            My Pokemon Card Collection
          </h2>
          <p className="text-gray-600">
            {cards.length} cards • Shared from DexTrends
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {displayCards.map((card, index) => (
            <div key={card.id} className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-3">
                {getCardImages(card).small ? (
                  <img 
                    src={getCardImages(card).small} 
                    alt={card.name}
                    className="w-full h-32 object-contain mx-auto"  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                    <FaImage className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-sm text-gray-900">{card.name}</h3>
              <p className="text-xs text-gray-600">{getCardSet(card).name}</p>
              {exportOptions.includePrices && (
                <p className="text-xs font-medium text-green-600">
                  ${String(getCardProperty(card, 'currentPrice') || getCardProperty(card, 'price') || 'N/A')}
                </p>
              )}
            </div>
          ))}
        </div>
        
        {cards.length > maxCards && (
          <div className="text-center mt-6">
            <p className="text-gray-600">
              +{cards.length - maxCards} more cards
            </p>
          </div>
        )}
        
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Powered by DexTrends • {window.location.origin}
          </p>
        </div>
      </div>
    );
  };

  // Download file helper
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify.success(`Downloaded ${filename}`);
  };

  // Generate share content based on format
  const handleShare = async () => {
    setIsGenerating(true);
    try {
      switch (shareFormat) {
        case 'link':
          const link = generateShareLink();
          setGeneratedLink(link);
          break;
        case 'qr':
          const qrLink = generateShareLink();
          await generateQRCode(qrLink);
          break;
        case 'image':
          await exportAsImage();
          break;
        case 'social':
          // Generate social media friendly content
          const socialText = `Check out my ${cards.length} Pokemon cards on DexTrends! ${generateShareLink()}`;
          if (navigator.share) {
            await navigator.share({
              title: 'My Pokemon Card Collection',
              text: socialText,
              url: generateShareLink()
            });
          } else {
            await copyToClipboard(socialText);
          }
          break;
      }
    } catch (error) {
      notify.error('Failed to generate share content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    setIsGenerating(true);
    try {
      switch (exportFormat) {
        case 'json':
          exportAsJSON();
          break;
        case 'csv':
          exportAsCSV();
          break;
        case 'pdf':
          await exportAsPDF();
          break;
        case 'image':
          await exportAsImage();
          break;
      }
    } catch (error) {
      notify.error('Failed to export cards');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'share' as const, name: 'Share', icon: <FaShare className="h-5 w-5" /> },
    { id: 'export' as const, name: 'Export', icon: <FaDownload className="h-5 w-5" /> }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose || (() => {})} title="Share & Export Cards" size="xl">
      <div className="space-y-6">
        {/* Tab navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Share tab */}
        {activeTab === 'share' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Share your {shareMode === 'single' ? 'card' : 'collection'}
              </h3>
              
              {/* Share format selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <button
                  onClick={() => setShareFormat('link')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    shareFormat === 'link'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaLink className="h-6 w-6" />
                  <span className="text-sm font-medium">Link</span>
                </button>
                
                <button
                  onClick={() => setShareFormat('qr')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    shareFormat === 'qr'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaQrcode className="h-6 w-6" />
                  <span className="text-sm font-medium">QR Code</span>
                </button>
                
                <button
                  onClick={() => setShareFormat('image')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    shareFormat === 'image'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaImage className="h-6 w-6" />
                  <span className="text-sm font-medium">Image</span>
                </button>
                
                <button
                  onClick={() => setShareFormat('social')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    shareFormat === 'social'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaShare className="h-6 w-6" />
                  <span className="text-sm font-medium">Social</span>
                </button>
              </div>

              {/* Generated content */}
              {generatedLink && shareFormat === 'link' && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Share Link</p>
                      <p className="text-sm font-mono bg-white dark:bg-gray-700 p-2 rounded border break-all">
                        {generatedLink}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedLink)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">

                      {copied ? <FaCheck className="h-4 w-4" /> : <FaClipboard className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {generatedQR && shareFormat === 'qr' && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">QR Code</p>
                  <img src={generatedQR} alt="QR Code" className="mx-auto" />
                  <p className="text-xs text-gray-500 mt-2">
                    Scan with any QR code scanner to view the cards
                  </p>
                </div>
              )}

              {/* Share options */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Share Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includePrices}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includePrices: e.target.checked }))}
                      className="mr-2" />
                    Include card prices
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeStats}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                      className="mr-2" />
                    Include card statistics
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeImages}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                      className="mr-2" />
                    Include card images
                  </label>
                </div>
              </div>

              <button
                onClick={handleShare}
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

                {isGenerating ? 'Generating...' : `Generate ${shareFormat === 'link' ? 'Share Link' : shareFormat === 'qr' ? 'QR Code' : shareFormat === 'image' ? 'Image' : 'Social Share'}`}
              </button>
            </div>
          </div>
        )}

        {/* Export tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Export your cards
              </h3>
              
              {/* Export format selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <button
                  onClick={() => setExportFormat('json')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    exportFormat === 'json'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaDownload className="h-6 w-6" />
                  <span className="text-sm font-medium">JSON</span>
                </button>
                
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    exportFormat === 'csv'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaDownload className="h-6 w-6" />
                  <span className="text-sm font-medium">CSV</span>
                </button>
                
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    exportFormat === 'pdf'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaDownload className="h-6 w-6" />
                  <span className="text-sm font-medium">PDF</span>
                </button>
                
                <button
                  onClick={() => setExportFormat('image')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    exportFormat === 'image'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaImage className="h-6 w-6" />
                  <span className="text-sm font-medium">Image</span>
                </button>
              </div>

              {/* Export options */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Export Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeImages}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                        className="mr-2" />
                      Include card images
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includePrices}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includePrices: e.target.checked }))}
                        className="mr-2" />
                      Include pricing data
                    </label>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeDescription}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeDescription: e.target.checked }))}
                        className="mr-2" />
                      Include descriptions
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeStats}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                        className="mr-2" />
                      Include card statistics
                    </label>
                  </div>
                </div>

                {(exportFormat === 'image' || exportFormat === 'pdf') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template Style
                    </label>
                    <select
                      value={exportOptions.templateStyle}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, templateStyle: e.target.value as ExportOptions['templateStyle'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={handleExport}
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

                {isGenerating ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
              </button>
            </div>
          </div>
        )}

        {/* Hidden preview for image generation */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          {shareFormat === 'image' || exportFormat === 'image' ? generateCollectionImage() : null}
        </div>

        {/* Loading overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-900 dark:text-white">
                  {activeTab === 'share' ? 'Generating share content...' : 'Exporting cards...'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CardSharingSystem;