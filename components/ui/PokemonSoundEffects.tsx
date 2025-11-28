import React, { useState, useEffect, useCallback } from 'react';

// Sound effects controller
interface PokemonSoundController {
  soundEnabled: boolean;
  toggleSound: () => void;
  playPokemonSound: (soundType: string) => void;
  playBeep: (frequency?: number, duration?: number, type?: OscillatorType) => void;
}

export const PokemonSoundController = (): PokemonSoundController => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Check if user has sound preference
    const soundPref = localStorage.getItem('pokemon-sound-enabled');
    if (soundPref === 'true') {
      setSoundEnabled(true);
    }
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('pokemon-sound-enabled', newState.toString());
  };

  // Create simple beep sounds using Web Audio API
  const playBeep = useCallback((frequency = 440, duration = 200, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;

    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = audioContext || new AudioContextClass();
      if (!audioContext) setAudioContext(context);

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type as OscillatorType;

      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration / 1000);
    } catch (e) {
      // Audio not supported on this device
    }
  }, [soundEnabled, audioContext, setAudioContext]);

  // Predefined Pokemon-style sounds
  const playPokemonSound = useCallback((soundType: string) => {
    switch (soundType) {
      case 'pokeball':
        playBeep(800, 100);
        setTimeout(() => playBeep(600, 150), 120);
        break;
      case 'catch':
        playBeep(400, 200);
        setTimeout(() => playBeep(500, 200), 220);
        setTimeout(() => playBeep(600, 300), 440);
        break;
      case 'hover':
        playBeep(1000, 50);
        break;
      case 'click':
        playBeep(1200, 80);
        break;
      case 'success':
        playBeep(659, 125); // E
        setTimeout(() => playBeep(659, 125), 125); // E
        setTimeout(() => playBeep(659, 125), 250); // E
        setTimeout(() => playBeep(523, 125), 375); // C
        setTimeout(() => playBeep(659, 125), 500); // E
        setTimeout(() => playBeep(784, 125), 625); // G
        setTimeout(() => playBeep(392, 125), 875); // G
        break;
      case 'error':
        playBeep(200, 300, 'sawtooth');
        break;
      default:
        playBeep();
    }
  }, [playBeep]);

  // Expose sound functions globally
  useEffect(() => {
    (window as any).pokemonSounds = {
      play: playPokemonSound,
      enabled: soundEnabled
    };
  }, [soundEnabled, playPokemonSound]);

  return {
    soundEnabled,
    toggleSound,
    playPokemonSound,
    playBeep
  };
};

// Enhanced hover effects with sounds
export const withSoundEffects = (Component: React.ComponentType<Record<string, unknown>>) => {
  return (props: Record<string, unknown>) => {
    const handleMouseEnter = (e: React.MouseEvent) => {
      if ((window as any).pokemonSounds?.enabled) {
        (window as any).pokemonSounds.play('hover');
      }
      (props as any).onMouseEnter?.(e);
    };

    const handleClick = (e: React.MouseEvent) => {
      if ((window as any).pokemonSounds?.enabled) {
        (window as any).pokemonSounds.play('click');
      }
      (props as any).onClick?.(e);
    };

    return (
      <Component 
        {...props} 
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
      />
    );
  };
};

// Sound controller UI component
export const PokemonSoundButton: React.FC = () => {
  const { soundEnabled, toggleSound } = PokemonSoundController();

  return (
    <button
      onClick={toggleSound}
      className={`fixed top-20 right-4 z-30 p-2 rounded-full transition-all duration-300 ${
        soundEnabled 
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-stone-400 hover:bg-stone-500 text-white'
      }`}
      title={`Sound effects: ${soundEnabled ? 'ON' : 'OFF'}`}
    >
      {soundEnabled ? 'SND' : 'MUT'}
    </button>
  );
};

export default { PokemonSoundController, PokemonSoundButton, withSoundEffects };