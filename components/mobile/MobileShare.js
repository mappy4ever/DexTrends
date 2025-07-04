import React, { useState, useCallback } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import logger from '../../utils/logger';

const MobileShare = ({
  title,
  text,
  url,
  image,
  cardData,
  onShareComplete,
  onShareError,
  className = '',
  disabled = false,
  showFallbackOptions = true
}) => {
  const { utils } = useMobileUtils();
  const [isSharing, setIsSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSupported, setIsSupported] = useState(() => {
    return typeof navigator !== 'undefined' && !!navigator.share;
  });

  // Share options for fallback
  const shareOptions = [
    {
      name: 'Copy Link',
      icon: '🔗',
      color: '#6b7280',
      action: 'copy',
      available: true
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: '#1da1f2',
      action: 'twitter',
      available: true
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: '#1877f2',
      action: 'facebook',
      available: true
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: '#25d366',
      action: 'whatsapp',
      available: true
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: '#0088cc',
      action: 'telegram',
      available: true
    },
    {
      name: 'Email',
      icon: '📧',
      color: '#ea4335',
      action: 'email',
      available: true
    },
    {
      name: 'Reddit',
      icon: '🤖',
      color: '#ff4500',
      action: 'reddit',
      available: true
    }
  ];

  // Format share data based on card information
  const formatShareData = useCallback(() => {
    if (cardData) {
      const cardTitle = `${cardData.name} - ${cardData.set || 'Pokemon Card'}`;
      const cardText = `Check out this ${cardData.rarity || 'Pokemon'} card${cardData.price ? ` - Current price: $${cardData.price}` : ''}! #PokemonTCG #DexTrends`;
      const cardUrl = url || `${window.location.origin}/cards/${cardData.id}`;
      
      return {
        title: title || cardTitle,
        text: text || cardText,
        url: cardUrl,
        image: image || cardData.image
      };
    }
    
    return {
      title: title || 'Check out DexTrends',
      text: text || 'Discover Pokemon card prices and trends with DexTrends!',
      url: url || window.location.href,
      image
    };
  }, [cardData, title, text, url, image]);

  // Native share function
  const shareNative = useCallback(async () => {
    if (!isSupported || disabled) return false;
    
    setIsSharing(true);
    const shareData = formatShareData();
    
    try {
      // Check if we can share the data
      if (navigator.canShare && !navigator.canShare(shareData)) {
        throw new Error('Cannot share this data');
      }
      
      await navigator.share(shareData);
      
      utils.hapticFeedback('medium');
      onShareComplete && onShareComplete('native', shareData);
      logger.debug('Native share completed', shareData);
      
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        logger.error('Native share failed:', error);
        onShareError && onShareError(error);
      }
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [isSupported, disabled, formatShareData, utils, onShareComplete, onShareError]);

  // Fallback share functions
  const shareFallback = useCallback(async (method) => {
    const shareData = formatShareData();
    setIsSharing(true);
    
    try {
      let success = false;
      
      switch (method) {
        case 'copy':
          success = await utils.copyToClipboard(shareData.url);
          if (success) {
            showTemporaryMessage('Link copied to clipboard!');
          }
          break;
          
        case 'twitter':
          const twitterText = encodeURIComponent(`${shareData.text} ${shareData.url}`);
          window.open(`https://twitter.com/intent/tweet?text=${twitterText}`, '_blank', 'width=550,height=420');
          success = true;
          break;
          
        case 'facebook':
          const fbUrl = encodeURIComponent(shareData.url);
          const fbQuote = encodeURIComponent(shareData.text);
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${fbUrl}&quote=${fbQuote}`, '_blank', 'width=550,height=420');
          success = true;
          break;
          
        case 'whatsapp':
          const waText = encodeURIComponent(`${shareData.text} ${shareData.url}`);
          window.open(`https://wa.me/?text=${waText}`, '_blank');
          success = true;
          break;
          
        case 'telegram':
          const tgText = encodeURIComponent(shareData.text);
          const tgUrl = encodeURIComponent(shareData.url);
          window.open(`https://t.me/share/url?url=${tgUrl}&text=${tgText}`, '_blank');
          success = true;
          break;
          
        case 'email':
          const emailSubject = encodeURIComponent(shareData.title);
          const emailBody = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
          window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
          success = true;
          break;
          
        case 'reddit':
          const redditTitle = encodeURIComponent(shareData.title);
          const redditUrl = encodeURIComponent(shareData.url);
          window.open(`https://reddit.com/submit?title=${redditTitle}&url=${redditUrl}`, '_blank');
          success = true;
          break;
          
        default:
          throw new Error(`Unsupported share method: ${method}`);
      }
      
      if (success) {
        utils.hapticFeedback('light');
        onShareComplete && onShareComplete(method, shareData);
        logger.debug('Fallback share completed', { method, shareData });
      }
      
      return success;
    } catch (error) {
      logger.error('Fallback share failed:', error);
      onShareError && onShareError(error);
      return false;
    } finally {
      setIsSharing(false);
      setShowShareMenu(false);
    }
  }, [formatShareData, utils, onShareComplete, onShareError]);

  // Show temporary message
  const showTemporaryMessage = (message) => {
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      pointer-events: none;
      backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      document.body.removeChild(messageEl);
    }, 2000);
  };

  // Handle share click
  const handleShare = useCallback(async () => {
    if (disabled || isSharing) return;
    
    if (isSupported) {
      const success = await shareNative();
      if (!success && showFallbackOptions) {
        setShowShareMenu(true);
      }
    } else if (showFallbackOptions) {
      setShowShareMenu(true);
    }
  }, [disabled, isSharing, isSupported, shareNative, showFallbackOptions]);

  // Generate share content preview
  const getSharePreview = () => {
    const shareData = formatShareData();
    return (
      <div className="share-preview">
        <div className="preview-content">
          {shareData.image && (
            <div className="preview-image">
              <img src={shareData.image} alt="Share preview" />
            </div>
          )}
          <div className="preview-text">
            <h4 className="preview-title">{shareData.title}</h4>
            <p className="preview-description">{shareData.text}</p>
            <span className="preview-url">{shareData.url}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`mobile-share ${className}`}>
      {/* Main Share Button */}
      <button
        onClick={handleShare}
        disabled={disabled || isSharing}
        className={`share-button ${isSharing ? 'sharing' : ''}`}
        aria-label="Share"
      >
        <span className="share-icon">
          {isSharing ? '⏳' : '📤'}
        </span>
        <span className="share-text">
          {isSharing ? 'Sharing...' : 'Share'}
        </span>
      </button>

      {/* Share Menu Overlay */}
      {showShareMenu && (
        <div className="share-menu-overlay" onClick={() => setShowShareMenu(false)}>
          <div className="share-menu" onClick={(e) => e.stopPropagation()}>
            {/* Share Preview */}
            {getSharePreview()}
            
            {/* Share Options */}
            <div className="share-options">
              <h3 className="share-options-title">Share via</h3>
              <div className="share-options-grid">
                {shareOptions.filter(option => option.available).map((option) => (
                  <button
                    key={option.action}
                    onClick={() => shareFallback(option.action)}
                    className="share-option"
                    style={{ '--option-color': option.color }}
                    disabled={isSharing}
                  >
                    <span className="option-icon">{option.icon}</span>
                    <span className="option-name">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setShowShareMenu(false)}
              className="share-menu-close">

              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .mobile-share {
          position: relative;
        }
        
        .share-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
        }
        
        .share-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .share-button:active {
          transform: translateY(0);
        }
        
        .share-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .share-button.sharing {
          background: linear-gradient(135deg, #6b7280, #4b5563);
        }
        
        .share-icon {
          font-size: 16px;
        }
        
        .share-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 16px;
        }
        
        .share-menu {
          background: white;
          border-radius: 16px 16px 0 0;
          width: 100%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }
        
        .share-preview {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .preview-content {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        
        .preview-image {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          background: #f3f4f6;
        }
        
        .preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .preview-text {
          flex: 1;
          min-width: 0;
        }
        
        .preview-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        
        .preview-description {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 6px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .preview-url {
          font-size: 12px;
          color: #9ca3af;
          word-break: break-all;
        }
        
        .share-options {
          padding: 20px;
        }
        
        .share-options-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          text-align: center;
        }
        
        .share-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .share-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 8px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          font-weight: 500;
          color: #374151;
        }
        
        .share-option:hover {
          background: var(--option-color, #3b82f6);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .share-option:active {
          transform: translateY(0);
        }
        
        .share-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .option-icon {
          font-size: 24px;
        }
        
        .option-name {
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        
        .share-menu-close {
          width: 100%;
          padding: 16px;
          background: #f9fafb;
          color: #374151;
          border: none;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .share-menu-close:hover {
          background: #f3f4f6;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .share-button:hover,
          .share-option:hover {
            transform: none;
          }
          
          .share-menu {
            animation: none;
          }
        }
        
        @media (min-width: 640px) {
          .share-options-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default MobileShare;