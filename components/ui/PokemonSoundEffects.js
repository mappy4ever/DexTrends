import React, { useState, useEffect } from 'react';

// Sound effects controller
export const PokemonSoundController = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState(null);

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
  const playBeep = (frequency = 440, duration = 200, type = 'sine') => {
    if (!soundEnabled) return;

    try {
      const context = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (!audioContext) setAudioContext(context);

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration / 1000);
    } catch (e) {
      // Audio not supported on this device
    }
  };

  // Predefined Pokemon-style sounds
  const playPokemonSound = (soundType) => {
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
  };

  // Expose sound functions globally
  useEffect(() => {
    window.pokemonSounds = {
      play: playPokemonSound,
      enabled: soundEnabled
    };
  }, [soundEnabled, audioContext]);

  return (
    <button
      onClick={toggleSound}
      className={`fixed top-20 right-4 z-30 p-2 rounded-full transition-all duration-300 ${
        soundEnabled 
          ? 'bg-green-500 hover:bg-green-600 text-white' 
          : 'bg-gray-400 hover:bg-gray-500 text-white'
      }`}
      title={`Sound effects: ${soundEnabled ? 'ON' : 'OFF'}`}
    >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  );
};

// Enhanced hover effects with sounds
export const withSoundEffects = (Component) => {
  return (props) => {
    const handleMouseEnter = (e) => {
      if (window.pokemonSounds?.enabled) {
        window.pokemonSounds.play('hover');
      }
      props.onMouseEnter?.(e);
    };

    const handleClick = (e) => {
      if (window.pokemonSounds?.enabled) {
        window.pokemonSounds.play('click');
      }
      props.onClick?.(e);
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

export default { PokemonSoundController, withSoundEffects };