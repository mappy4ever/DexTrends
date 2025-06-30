import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaSpinner } from 'react-icons/fa';
import { BsSoundwave } from 'react-icons/bs';

export default function VoiceSearchInterface({ onSearchResults, onTranscript, isEnabled = true }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

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

    recognition.onresult = (event) => {
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

    recognition.onerror = (event) => {
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
  }, [isEnabled]);

  const setupAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      updateAudioLevel();
    } catch (err) {
      console.warn('Could not setup audio analyzer:', err);
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current || !isListening) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(Math.min(average / 128, 1));

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const handleVoiceSearch = async (searchText) => {
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
  };

  const processVoiceCommand = (text) => {
    const lowerText = text.toLowerCase();
    
    // Handle Pokemon-specific voice commands
    const pokemonCommands = {
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

  const generateMockResults = (query) => {
    // Generate relevant mock results based on the processed query
    const baseResults = [
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
      card.types.some(type => type.toLowerCase().includes(query.toLowerCase())) ||
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
      <div className="text-center text-gray-500 dark:text-gray-400">
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
              : 'bg-blue-500 hover:bg-blue-600 border-blue-400 text-white shadow-md hover:scale-105'
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
              className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse">
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
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
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
            <span className="text-gray-600 dark:text-gray-400">
              Click to start voice search
            </span>
          )}
        </div>

        {/* Transcript Display */}
        {(transcript || interimTranscript) && (
          <div className="w-full max-w-md p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Voice Input:
            </div>
            <div className="text-gray-900 dark:text-white">
              {transcript && (
                <span className="font-medium">{transcript}</span>
              )}
              {interimTranscript && (
                <span className="text-gray-500 italic">{interimTranscript}</span>
              )}
            </div>
            {confidence > 0 && (
              <div className="text-xs text-gray-400 mt-1">
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
        <div className="w-full max-w-md p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Voice Commands:
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
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