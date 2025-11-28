import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaSpinner } from 'react-icons/fa';
import { BsSoundwave } from 'react-icons/bs';
import { TCGCard } from '../../types/api/cards';
import logger from '@/utils/logger';
import { 
  SpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent,
  SpeechRecognitionConstructor 
} from '../../types/speech-recognition';

// Window interface extension for audio context
interface IWindow extends Window {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

interface VoiceSearchResult {
  id: string;
  name: string;
  set?: { name: string };
  images?: { small: string };
  rarity?: string;
  types?: string[];
}

interface VoiceSearchInterfaceProps {
  onSearchResults?: (results: VoiceSearchResult[], query: string) => void;
  onTranscript?: (transcript: string) => void;
  isEnabled?: boolean;
}

export default function VoiceSearchInterface({ 
  onSearchResults, 
  onTranscript, 
  isEnabled = true 
}: VoiceSearchInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const updateAudioLevel = useCallback(() => {
    const updateFrame = () => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(Math.min(average / 128, 1));

      if (isListening) {
        animationFrameRef.current = requestAnimationFrame(updateFrame);
      }
    };
    updateFrame();
  }, [isListening]);

  const setupAudioAnalyzer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const windowWithAudio = window as IWindow;
      const AudioContext = windowWithAudio.AudioContext || windowWithAudio.webkitAudioContext;
      
      if (!AudioContext) return;
      
      audioContextRef.current = new AudioContext();
      
      if (!audioContextRef.current) return;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      updateAudioLevel();
    } catch (err) {
      logger.warn('Could not setup audio analyzer:', { error: err });
    }
  }, [updateAudioLevel]);

  const handleVoiceSearch = useCallback(async (searchText: string) => {
    setIsProcessing(true);
    try {
      // Process the voice command
      const processedQuery = processVoiceCommand(searchText);
      
      // Simulate search with the processed query
      // In a real implementation, this would call your search API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults = generateMockResults(processedQuery);
      onSearchResults?.(mockResults, processedQuery);
    } catch (error) {
      setError('Failed to process voice search');
    } finally {
      setIsProcessing(false);
    }
  }, [onSearchResults]);

  // Initialize speech recognition
  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setupAudioAnalyzer();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimResult = '';
      let finalResult = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalResult += transcript;
          setConfidence(result[0].confidence);
        } else {
          interimResult += transcript;
        }
      }

      if (finalResult) {
        setTranscript(finalResult);
        setInterimTranscript('');
        onTranscript?.(finalResult);
        handleVoiceSearch(finalResult);
      } else {
        setInterimTranscript(interimResult);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      setIsProcessing(false);
      cleanupAudio();
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      cleanupAudio();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      cleanupAudio();
    };
  }, [isEnabled, handleVoiceSearch, onTranscript, setupAudioAnalyzer]);

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const processVoiceCommand = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Handle Pokemon-specific voice commands
    const pokemonCommands: Record<string, string> = {
      'find charizard': 'Charizard',
      'search for pikachu': 'Pikachu',
      'show me blastoise': 'Blastoise',
      'lookup venusaur': 'Venusaur',
      'find rare cards': 'rarity:rare',
      'show expensive cards': 'price:>100',
      'find holographic cards': 'rarity:holo',
      'search legendary pokemon': 'supertype:pokemon legendary',
      'find fire type': 'types:fire',
      'show water pokemon': 'types:water',
      'find trainer cards': 'supertype:trainer',
      'search energy cards': 'supertype:energy'
    };

    // Check for direct command matches
    for (const [command, query] of Object.entries(pokemonCommands)) {
      if (lowerText.includes(command.toLowerCase())) {
        return query;
      }
    }

    // Extract Pokemon names using pattern matching
    const pokemonPattern = /(?:find|search|show|lookup)\s+(?:me\s+)?(\w+)/i;
    const match = text.match(pokemonPattern);
    if (match) {
      return match[1];
    }

    // Return original text if no patterns match
    return text;
  };

  const generateMockResults = (query: string): VoiceSearchResult[] => {
    // Generate relevant mock results based on the processed query
    const baseResults: VoiceSearchResult[] = [
      {
        id: 'base1-4',
        name: 'Charizard',
        set: { name: 'Base Set' },
        images: { small: '/api/placeholder/150/200' },
        rarity: 'Rare Holo',
        types: ['Fire']
      },
      {
        id: 'base1-2',
        name: 'Blastoise',
        set: { name: 'Base Set' },
        images: { small: '/api/placeholder/150/200' },
        rarity: 'Rare Holo',
        types: ['Water']
      },
      {
        id: 'base1-15',
        name: 'Venusaur',
        set: { name: 'Base Set' },
        images: { small: '/api/placeholder/150/200' },
        rarity: 'Rare Holo',
        types: ['Grass']
      }
    ];

    // Filter results based on query
    return baseResults.filter(card => 
      card.name.toLowerCase().includes(query.toLowerCase()) ||
      (card.types?.some(type => type.toLowerCase().includes(query.toLowerCase())) || false) ||
      query.toLowerCase().includes(card.name.toLowerCase())
    );
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
  };

  if (!isEnabled) {
    return (
      <div className="text-center text-stone-500 dark:text-stone-400">
        Voice search not available
      </div>
    );
  }

  return (
    <div className="voice-search-interface">
      {/* Voice Search Button */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`relative p-6 rounded-full border-4 transition-all duration-300 ${
            isListening
              ? 'bg-red-500 border-red-400 text-white shadow-lg scale-110'
              : 'bg-amber-500 hover:bg-amber-600 border-amber-400 text-white shadow-md hover:scale-105'
          } ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice search'}
        >
          {isProcessing ? (
            <FaSpinner className="w-8 h-8 animate-spin" />
          ) : isListening ? (
            <FaMicrophoneSlash className="w-8 h-8" />
          ) : (
            <FaMicrophone className="w-8 h-8" />
          )}
          
          {/* Audio level indicator */}
          {isListening && (
            <div 
              className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse"
              style={{
                transform: `scale(${1 + audioLevel * 0.3})`,
                opacity: 0.6
              }}
            />
          )}
        </button>

        {/* Status Text */}
        <div className="text-center">
          {isProcessing && (
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <FaSpinner className="animate-spin" />
              <span>Processing...</span>
            </div>
          )}
          
          {isListening && !isProcessing && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <BsSoundwave className="animate-pulse" />
              <span>Listening...</span>
            </div>
          )}
          
          {!isListening && !isProcessing && (
            <span className="text-stone-600 dark:text-stone-400">
              Click to start voice search
            </span>
          )}
        </div>

        {/* Transcript Display */}
        {(transcript || interimTranscript) && (
          <div className="w-full max-w-md p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border">
            <div className="text-sm text-stone-500 dark:text-stone-400 mb-1">
              Voice Input:
            </div>
            <div className="text-stone-900 dark:text-white">
              {transcript && (
                <span className="font-medium">{transcript}</span>
              )}
              {interimTranscript && (
                <span className="text-stone-500 italic">{interimTranscript}</span>
              )}
            </div>
            {confidence > 0 && (
              <div className="text-xs text-stone-400 mt-1">
                Confidence: {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-md p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Voice Commands Help */}
        <div className="w-full max-w-md p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
            Voice Commands:
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <div>"Find Charizard"</div>
            <div>"Show rare cards"</div>
            <div>"Search fire type"</div>
            <div>"Find expensive cards"</div>
            <div>"Show trainer cards"</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .voice-search-interface {
          padding: 2rem;
          max-width: 500px;
          margin: 0 auto;
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
      `}</style>
    </div>
  );
}