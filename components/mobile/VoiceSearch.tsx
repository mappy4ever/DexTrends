import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import logger from '../../utils/logger';

// Type definitions
interface VoiceCommand {
  type: 'search' | 'filter' | 'sort' | 'navigate' | 'action' | 'clear' | 'help';
  query?: string;
  value?: string;
  page?: string;
  action?: string;
}

interface VoiceSearchProps {
  onSearchResult?: (result: VoiceCommand, transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  language?: string;
  autoStart?: boolean;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

// Extend window interface for vendor prefixes
interface WindowWithVendorPrefixes extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

type VoiceCommandHandler = (query: string) => VoiceCommand;

const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onSearchResult,
  onError,
  placeholder = "Tap to speak...",
  className = '',
  disabled = false,
  language = 'en-US',
  autoStart = false,
  continuous = false,
  interimResults = true,
  maxAlternatives = 1
}) => {
  const { utils } = useMobileUtils();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Voice commands mapping
  const voiceCommands: Record<string, VoiceCommandHandler> = {
    'search for': (query) => ({ type: 'search', query }),
    'find': (query) => ({ type: 'search', query }),
    'show me': (query) => ({ type: 'search', query }),
    'filter by': (query) => ({ type: 'filter', value: query }),
    'sort by': (query) => ({ type: 'sort', value: query }),
    'go to': (query) => ({ type: 'navigate', page: query }),
    'add to favorites': () => ({ type: 'action', action: 'favorite' }),
    'add to collection': () => ({ type: 'action', action: 'collection' }),
    'clear search': () => ({ type: 'clear' }),
    'help': () => ({ type: 'help' })
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as WindowWithVendorPrefixes;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        
        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.maxAlternatives = maxAlternatives;
        recognition.lang = language;
        
        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          setTranscript('');
          utils.hapticFeedback('light');
          startAudioVisualization();
          logger.debug('Voice recognition started');
        };
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            
            if (result.isFinal) {
              finalTranscript += transcript;
              setConfidence(result[0].confidence);
            } else {
              interimTranscript += transcript;
            }
          }
          
          const fullTranscript = finalTranscript || interimTranscript;
          setTranscript(fullTranscript);
          
          if (finalTranscript) {
            processVoiceCommand(finalTranscript.trim());
          }
        };
        
        recognition.onerror = (event: any) => {
          setError(event.error);
          setIsListening(false);
          stopAudioVisualization();
          utils.hapticFeedback('heavy');
          
          if (onError) {
            onError(event.error);
          }
          
          logger.error('Voice recognition error:', event.error);
        };
        
        recognition.onend = () => {
          setIsListening(false);
          stopAudioVisualization();
          logger.debug('Voice recognition ended');
        };
        
        recognitionRef.current = recognition;
        
        if (autoStart) {
          startListening();
        }
      } else {
        setIsSupported(false);
        logger.warn('Speech recognition not supported');
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAudioVisualization();
    };
  }, [language, continuous, interimResults, maxAlternatives, autoStart, utils, onError]);

  // Start audio visualization
  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const win = window as WindowWithVendorPrefixes;
      const AudioContext = win.AudioContext || win.webkitAudioContext;
      if (!AudioContext) {
        logger.error('AudioContext not available');
        return;
      }
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      
      const updateAudioLevel = () => {
        if (!analyzer) return;
        
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 255);
        
        if (isListening) {
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      logger.error('Failed to start audio visualization:', error);
    }
  }, [isListening]);

  // Stop audio visualization
  const stopAudioVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  }, []);

  // Process voice commands
  const processVoiceCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    for (const [command, handler] of Object.entries(voiceCommands)) {
      if (lowerTranscript.includes(command)) {
        const query = lowerTranscript.replace(command, '').trim();
        const result = handler(query);
        
        if (onSearchResult) {
          onSearchResult(result, transcript, confidence);
        }
        
        utils.hapticFeedback('medium');
        logger.debug('Voice command processed', { command, result });
        return;
      }
    }
    
    // If no specific command found, treat as general search
    if (onSearchResult) {
      onSearchResult({ type: 'search', query: transcript }, transcript, confidence);
    }
  }, [voiceCommands, onSearchResult, confidence, utils]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current || disabled) return;
    
    try {
      recognitionRef.current.start();
    } catch (error: any) {
      if (error.name !== 'InvalidStateError') {
        logger.error('Failed to start voice recognition:', error);
        setError(error.message);
      }
    }
  }, [isSupported, disabled]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  if (!isSupported) {
    return (
      <div className={`voice-search-unsupported ${className}`}>
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
          <span className="text-gray-500 text-sm">Voice search not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-search ${className} ${isListening ? 'listening' : ''}`}>
      {/* Voice Search Button */}
      <button
        onClick={toggleListening}
        disabled={disabled}
        className={`voice-search-button ${isListening ? 'active' : ''}`}
        aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
      >
        {/* Microphone Icon with Audio Visualization */}
        <div className="microphone-container">
          <div 
            className="microphone-icon"
            style={{
              transform: `scale(${1 + audioLevel * 0.3})`
            }}
          >
            {isListening ? '🎤' : '🎙️'}
          </div>
          
          {/* Audio Level Visualization */}
          {isListening && (
            <div className="audio-waves">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="audio-wave"
                  style={{
                    height: `${20 + audioLevel * 30}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Button Text */}
        <span className="button-text">
          {isListening ? 'Listening...' : placeholder}
        </span>
      </button>

      {/* Transcript Display */}
      {transcript && (
        <div className="transcript-display">
          <div className="transcript-text">
            "{transcript}"
          </div>
          {confidence > 0 && (
            <div className="confidence-indicator">
              Confidence: {Math.round(confidence * 100)}%
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-display">
          <span className="error-icon">⚠️</span>
          <span className="error-text">
            {error === 'not-allowed' ? 'Microphone access denied' :
             error === 'no-speech' ? 'No speech detected' :
             error === 'audio-capture' ? 'Microphone not available' :
             error === 'network' ? 'Network error' :
             'Voice recognition error'}
          </span>
        </div>
      )}

      {/* Voice Commands Help */}
      <div className="voice-commands-help">
        <details>
          <summary className="text-sm text-gray-600 cursor-pointer">Voice Commands</summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
            <div><strong>"Search for Pikachu"</strong> - Search for cards</div>
            <div><strong>"Filter by rarity"</strong> - Apply filters</div>
            <div><strong>"Sort by price"</strong> - Change sorting</div>
            <div><strong>"Add to favorites"</strong> - Favorite action</div>
            <div><strong>"Go to trending"</strong> - Navigate</div>
            <div><strong>"Help"</strong> - Show help</div>
          </div>
        </details>
      </div>

      <style jsx>{`
        .voice-search {
          position: relative;
        }
        
        .voice-search-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .voice-search-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .voice-search-button:active {
          transform: translateY(0);
        }
        
        .voice-search-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .voice-search-button.active {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          animation: pulse 2s infinite;
        }
        
        .microphone-container {
          position: relative;
          display: flex;
          align-items: center;
          margin-right: 8px;
        }
        
        .microphone-icon {
          font-size: 18px;
          transition: transform 0.1s ease;
        }
        
        .audio-waves {
          display: flex;
          align-items: center;
          margin-left: 8px;
          gap: 2px;
        }
        
        .audio-wave {
          width: 3px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 2px;
          animation: wave 1s ease-in-out infinite;
        }
        
        .transcript-display {
          margin-top: 12px;
          padding: 12px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 12px;
          border-left: 4px solid #667eea;
        }
        
        .transcript-text {
          font-style: italic;
          color: #4a5568;
          margin-bottom: 4px;
        }
        
        .confidence-indicator {
          font-size: 12px;
          color: #718096;
        }
        
        .error-display {
          margin-top: 12px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 12px;
          border-left: 4px solid #ef4444;
          display: flex;
          align-items: center;
        }
        
        .error-icon {
          margin-right: 8px;
        }
        
        .error-text {
          color: #e53e3e;
          font-size: 14px;
        }
        
        .voice-commands-help {
          margin-top: 12px;
        }
        
        .voice-commands-help summary {
          outline: none;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }
        
        @keyframes wave {
          0%, 100% {
            height: 20px;
            opacity: 0.5;
          }
          50% {
            height: 40px;
            opacity: 1;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .voice-search-button.active {
            animation: none;
          }
          
          .audio-wave {
            animation: none;
          }
          
          .microphone-icon {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceSearch;