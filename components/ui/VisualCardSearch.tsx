import React, { useState, useRef, useCallback } from 'react';
import { FaCamera, FaUpload, FaSpinner, FaEye, FaSearch } from 'react-icons/fa';
import { BsCardImage } from 'react-icons/bs';
import { BiTargetLock } from 'react-icons/bi';

// Types
interface CardImage {
  small: string;
  large: string;
}

interface CardSet {
  name: string;
  id: string;
}

interface RecognitionResult {
  id: string;
  name: string;
  set: CardSet;
  images: CardImage;
  rarity: string;
  types: string[];
  hp?: string;
  confidence: number;
  matchType: 'exact' | 'similar';
  detectedFeatures: string[];
}

interface VisualCardSearchProps {
  onSearchResults?: (results: RecognitionResult[]) => void;
  onImageProcessed?: (file: File | Blob, results: RecognitionResult[]) => void;
}

interface ConfidenceBarProps {
  confidence: number;
}

const VisualCardSearch: React.FC<VisualCardSearchProps> = ({ 
  onSearchResults, 
  onImageProcessed 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [results, setResults] = useState<RecognitionResult[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera for live scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setError(null);
    } catch (err) {
      setError('Could not access camera. Please upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        processImageFile(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image file too large. Please select a file under 10MB.');
      return;
    }

    processImageFile(file);
  };

  const processImageFile = async (file: File | Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setPreviewImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);

      // Process image for card recognition
      const recognitionResults = await recognizeCard(file);
      
      setResults(recognitionResults);
      onSearchResults?.(recognitionResults);
      onImageProcessed?.(file, recognitionResults);
      
    } catch (err) {
      setError('Failed to process image. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const recognizeCard = async (imageFile: File | Blob): Promise<RecognitionResult[]> => {
    // Simulate AI-powered card recognition
    // In a real implementation, this would call a machine learning API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock recognition results based on common Pokemon cards
    const mockResults: RecognitionResult[] = [
      {
        id: 'base1-4',
        name: 'Charizard',
        set: { name: 'Base Set', id: 'base1' },
        images: { small: '/api/placeholder/150/200', large: '/api/placeholder/300/400' },
        rarity: 'Rare Holo',
        types: ['Fire'],
        hp: '120',
        confidence: 0.95,
        matchType: 'exact',
        detectedFeatures: ['Fire symbol', 'Charizard artwork', 'Base Set border']
      },
      {
        id: 'base1-2',
        name: 'Blastoise', 
        set: { name: 'Base Set', id: 'base1' },
        images: { small: '/api/placeholder/150/200', large: '/api/placeholder/300/400' },
        rarity: 'Rare Holo',
        types: ['Water'],
        hp: '100',
        confidence: 0.78,
        matchType: 'similar',
        detectedFeatures: ['Water symbol', 'Similar card layout']
      },
      {
        id: 'base1-15',
        name: 'Venusaur',
        set: { name: 'Base Set', id: 'base1' },
        images: { small: '/api/placeholder/150/200', large: '/api/placeholder/300/400' },
        rarity: 'Rare Holo',
        types: ['Grass'],
        hp: '100',
        confidence: 0.72,
        matchType: 'similar',
        detectedFeatures: ['Grass symbol', 'Vintage card design']
      }
    ];

    // Set confidence based on the top result
    setConfidence(mockResults[0]?.confidence || 0);

    return mockResults;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ confidence }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-500 ${
          confidence > 0.8 ? 'bg-green-500' : 
          confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${confidence * 100}%` }}
      />
    </div>
  );

  return (
    <div className="visual-card-search space-y-6">
      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <BsCardImage className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Visual Card Search
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upload a photo of your Pokemon card to identify it and find pricing information
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaUpload />
            <span>Upload Image</span>
          </button>

          <button
            onClick={startCamera}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaCamera />
            <span>Use Camera</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Camera View */}
      <div className="relative">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md mx-auto rounded-lg hidden"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.classList.remove('hidden');
            }
          }}
        />
        
        {streamRef.current && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-4">
              <button
                onClick={captureFromCamera}
                className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              >
                <BiTargetLock className="w-6 h-6" />
              </button>
              <button
                onClick={stopCamera}
                className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Processing State */}
      {isProcessing && (
        <div className="text-center p-6">
          <FaSpinner className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing your card image...
          </p>
        </div>
      )}

      {/* Image Preview */}
      {previewImage && !isProcessing && (
        <div className="text-center">
          <img 
            src={previewImage} 
            alt="Card preview" 
            className="max-w-xs mx-auto rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recognition Results
            </h3>
            {confidence > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                <span className={`font-medium ${
                  confidence > 0.8 ? 'text-green-600' : 
                  confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
          </div>

          <ConfidenceBar confidence={confidence} />

          <div className="grid gap-4">
            {results.map((card) => (
              <div key={card.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={card.images.small} 
                    alt={card.name}
                    className="w-20 h-28 object-cover rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {card.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        card.matchType === 'exact' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {card.matchType === 'exact' ? 'Exact Match' : 'Similar'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Set: {card.set.name}</div>
                      <div>Rarity: {card.rarity}</div>
                      {card.hp && <div>HP: {card.hp}</div>}
                      <div>Confidence: {Math.round(card.confidence * 100)}%</div>
                    </div>

                    {card.detectedFeatures && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Detected Features:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {card.detectedFeatures.map((feature, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                        onClick={() => onSearchResults?.([card])}
                      >
                        <FaSearch className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1">
                        <FaEye className="w-3 h-3" />
                        <span>View Prices</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-red-700 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Tips for Best Results:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Ensure good lighting and avoid glare</li>
          <li>• Keep the card flat and centered</li>
          <li>• Make sure the entire card is visible</li>
          <li>• Use a plain background if possible</li>
          <li>• Higher resolution images work better</li>
        </ul>
      </div>
    </div>
  );
};

export default VisualCardSearch;