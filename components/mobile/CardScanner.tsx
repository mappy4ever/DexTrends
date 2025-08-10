import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import logger from '../../utils/logger';
import type { DetectedCard } from '../../types/common';

// Type definitions

interface CardScannerProps {
  onCardDetected?: (card: DetectedCard, imageData: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
  autoCapture?: boolean;
  captureDelay?: number;
  maxImageSize?: number;
  jpegQuality?: number;
  overlayEnabled?: boolean;
}

const CardScanner: React.FC<CardScannerProps> = ({
  onCardDetected,
  onError,
  className = '',
  disabled = false,
  autoCapture = true,
  captureDelay = 2000,
  maxImageSize = 1920,
  jpegQuality = 0.8,
  overlayEnabled = true
}) => {
  const { utils, isMobile } = useMobileUtils();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedCards, setDetectedCards] = useState<DetectedCard[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastCapture, setLastCapture] = useState<string | null>(null);

  // Check for camera support
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        setIsSupported(hasCamera && !!navigator.mediaDevices.getUserMedia);
        
        if (!hasCamera) {
          setError('No camera found on this device');
        }
      } catch (err) {
        setIsSupported(false);
        setError('Camera access not available');
        logger.error('Camera support check failed:', err);
      }
    };
    
    checkSupport();
  }, []);

  // Simulate card image analysis (would use real ML/OCR in production)
  const analyzeCardImage = useCallback(async (imageData: string): Promise<DetectedCard | null> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock card detection - in real implementation this would:
    // 1. Use OCR to extract card text
    // 2. Use image recognition to identify the card
    // 3. Use image recognition to identify the card
    // 4. Match against card database
    // 5. Return card information
    
    const mockCards: DetectedCard[] = [
      {
        id: 'charizard-base-4',
        name: 'Charizard',
        set: 'Base Set',
        number: '4/102',
        rarity: 'Holo Rare',
        confidence: 0.85
      },
      {
        id: 'pikachu-base-58',
        name: 'Pikachu',
        set: 'Base Set',
        number: '58/102',
        rarity: 'Common',
        confidence: 0.92
      },
      {
        id: 'blastoise-base-2',
        name: 'Blastoise',
        set: 'Base Set',
        number: '2/102',
        rarity: 'Holo Rare',
        confidence: 0.78
      }
    ];
    
    // Randomly return a detected card (70% chance)
    if (Math.random() > 0.7) {
      return mockCards[Math.floor(Math.random() * mockCards.length)];
    }
    
    return null;
  }, []);

  // Capture frame and analyze
  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to image data for analysis
    const imageData = canvas.toDataURL('image/jpeg', jpegQuality);
    setLastCapture(imageData);
    
    // Simulate card detection progress
    setScanProgress(prev => (prev + 10) % 100);
    
    try {
      // Simulate card recognition (in real implementation, this would use ML/API)
      const detectedCard = await analyzeCardImage(imageData);
      
      if (detectedCard) {
        setDetectedCards(prev => {
          const existing = prev.find(card => card.id === detectedCard.id);
          if (!existing) {
            utils.hapticFeedback('medium');
            onCardDetected && onCardDetected(detectedCard, imageData);
            return [...prev, detectedCard];
          }
          return prev;
        });
      }
    } catch (err) {
      logger.error('Card analysis failed:', err);
    }
  }, [jpegQuality, utils, onCardDetected, analyzeCardImage]);

  // Auto capture functionality
  const startAutoCapture = useCallback(() => {
    if (!autoCapture) return;
    
    const capture = () => {
      if (isScanning) {
        captureFrame();
        captureTimeoutRef.current = setTimeout(capture, captureDelay);
      }
    };
    
    captureTimeoutRef.current = setTimeout(capture, captureDelay);
  }, [autoCapture, captureDelay, isScanning, captureFrame]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (!isSupported || disabled) return false;
    
    try {
      setError(null);
      
      // Prefer rear camera on mobile devices
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isMobile ? { ideal: 'environment' } : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });
        
        setIsScanning(true);
        utils.hapticFeedback('light');
        
        if (autoCapture) {
          startAutoCapture();
        }
        
        logger.debug('Camera started successfully');
        return true;
      }
    } catch (err: unknown) {
      const error = err as Error;
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Camera permission denied' 
        : error.name === 'NotFoundError'
        ? 'No camera found'
        : 'Failed to access camera';
        
      setError(errorMessage);
      onError && onError(error);
      logger.error('Failed to start camera:', { error: err });
      return false;
    }
    
    return false;
  }, [isSupported, disabled, isMobile, autoCapture, utils, onError, startAutoCapture]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
    
    setIsScanning(false);
    setScanProgress(0);
    utils.hapticFeedback('light');
    logger.debug('Camera stopped');
  }, [utils]);


  // Manual capture
  const manualCapture = useCallback(() => {
    if (isScanning) {
      captureFrame();
      utils.hapticFeedback('medium');
    }
  }, [isScanning, captureFrame, utils]);

  // Toggle scanning
  const toggleScanning = useCallback(() => {
    if (isScanning) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isScanning, startCamera, stopCamera]);

  // Clear detected cards
  const clearDetected = useCallback(() => {
    setDetectedCards([]);
    setScanProgress(0);
    utils.hapticFeedback('light');
  }, [utils]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isSupported) {
    return (
      <div className={`card-scanner-unsupported ${className}`}>
        <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
          <span className="text-4xl mb-4">📷</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Camera Not Available</h3>
          <p className="text-gray-500 text-center">
            Camera scanning requires camera access and is not supported in this browser or device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-scanner ${className} ${isScanning ? 'scanning' : ''}`}>
      {/* Camera View */}
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
          style={{
            display: isScanning ? 'block' : 'none'
          }}
        />
        
        {/* Camera Overlay */}
        {overlayEnabled && isScanning && (
          <div className="camera-overlay">
            {/* Card Detection Frame */}
            <div className="detection-frame">
              <div className="frame-corners">
                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
                <div className="corner bottom-right"></div>
              </div>
              
              <div className="detection-text">
                {scanProgress > 0 ? `Scanning... ${scanProgress}%` : 'Position card in frame'}
              </div>
            </div>
            
            {/* Scan Line Animation */}
            <div className="scan-line"></div>
          </div>
        )}
        
        {/* Controls Overlay */}
        <div className="camera-controls">
          <button
            onClick={manualCapture}
            disabled={!isScanning}
            className="capture-button">
            📸
          </button>
          
          <button
            onClick={toggleScanning}
            className={`toggle-button ${isScanning ? 'stop' : 'start'}`}
            aria-label={isScanning ? 'Stop scanning' : 'Start scanning'}
          >
            {isScanning ? '⏹️' : '▶️'}
          </button>
          
          {detectedCards.length > 0 && (
            <button
              onClick={clearDetected}
              className="clear-button">
              🗑️
            </button>
          )}
        </div>
      </div>
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Error Display */}
      {error && (
        <div className="error-display">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          {error.includes('permission') && (
            <button
              onClick={startCamera}
              className="retry-button">
              Grant Permission
            </button>
          )}
        </div>
      )}
      
      {/* Detected Cards */}
      {detectedCards.length > 0 && (
        <div className="detected-cards">
          <h3 className="text-lg font-semibold mb-3">Detected Cards ({detectedCards.length})</h3>
          <div className="cards-grid">
            {detectedCards.map((card, index) => (
              <div key={`${card.id}-${index}`} className="detected-card">
                <div className="card-info">
                  <h4 className="card-name">{card.name}</h4>
                  <p className="card-details">{card.set} • {card.number}</p>
                  <p className="card-rarity">{card.rarity}</p>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ width: `${card.confidence * 100}%` }}
                    ></div>
                    <span className="confidence-text">
                      {Math.round(card.confidence * 100)}% match
                    </span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="action-button favorite">❤️</button>
                  <button className="action-button collection">📚</button>
                  <button className="action-button details">👁️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Instructions */}
      {!isScanning && !error && (
        <div className="scanner-instructions">
          <div className="instruction-content">
            <span className="instruction-icon">📱</span>
            <h3 className="instruction-title">Card Scanner</h3>
            <p className="instruction-text">
              Point your camera at a Pokemon card to automatically detect and identify it.
            </p>
            <button
              onClick={startCamera}
              className="start-button"
              disabled={disabled}
            >
              Start Scanning
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .card-scanner {
          position: relative;
          width: 100%;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .camera-container {
          position: relative;
          width: 100%;
          min-height: 300px;
          background: #000;
        }
        
        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .camera-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        
        .detection-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 280px;
          height: 180px;
          border: 2px solid rgba(59, 130, 246, 0.8);
          border-radius: 12px;
          background: rgba(59, 130, 246, 0.1);
        }
        
        .frame-corners {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 3px solid #3b82f6;
        }
        
        .corner.top-left {
          top: -3px;
          left: -3px;
          border-right: none;
          border-bottom: none;
        }
        
        .corner.top-right {
          top: -3px;
          right: -3px;
          border-left: none;
          border-bottom: none;
        }
        
        .corner.bottom-left {
          bottom: -3px;
          left: -3px;
          border-right: none;
          border-top: none;
        }
        
        .corner.bottom-right {
          bottom: -3px;
          right: -3px;
          border-left: none;
          border-top: none;
        }
        
        .detection-text {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 14px;
          font-weight: 500;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
          white-space: nowrap;
        }
        
        .scan-line {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 280px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          animation: scanLine 2s ease-in-out infinite;
        }
        
        .camera-controls {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
          pointer-events: auto;
        }
        
        .capture-button,
        .toggle-button,
        .clear-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.9);
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }
        
        .capture-button:hover,
        .toggle-button:hover,
        .clear-button:hover {
          background: white;
          transform: scale(1.1);
        }
        
        .toggle-button.stop {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }
        
        .error-display {
          padding: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          margin: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .error-icon {
          font-size: 20px;
        }
        
        .error-text {
          flex: 1;
          color: #dc2626;
          font-size: 14px;
        }
        
        .retry-button {
          padding: 8px 16px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        
        .detected-cards {
          padding: 16px;
          background: white;
        }
        
        .cards-grid {
          display: grid;
          gap: 12px;
        }
        
        .detected-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .card-info {
          flex: 1;
        }
        
        .card-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .card-details {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 2px;
        }
        
        .card-rarity {
          font-size: 12px;
          color: #8b5cf6;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .confidence-bar {
          position: relative;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          transition: width 0.3s ease;
        }
        
        .confidence-text {
          position: absolute;
          top: -18px;
          right: 0;
          font-size: 10px;
          color: #6b7280;
        }
        
        .card-actions {
          display: flex;
          gap: 8px;
        }
        
        .action-button {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          background: #f1f5f9;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          background: #e2e8f0;
          transform: scale(1.1);
        }
        
        .scanner-instructions {
          padding: 40px 20px;
          text-align: center;
        }
        
        .instruction-content {
          max-width: 300px;
          margin: 0 auto;
        }
        
        .instruction-icon {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
        }
        
        .instruction-title {
          font-size: 20px;
          font-weight: 600;
          color: white;
          margin-bottom: 12px;
        }
        
        .instruction-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        
        .start-button {
          padding: 12px 32px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .start-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        
        .start-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        @keyframes scanLine {
          0%, 100% {
            transform: translate(-50%, -50%) scaleX(0);
          }
          50% {
            transform: translate(-50%, -50%) scaleX(1);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .scan-line {
            animation: none;
          }
          
          .action-button:hover,
          .capture-button:hover,
          .toggle-button:hover,
          .clear-button:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CardScanner;