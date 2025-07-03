import React, { useState, useEffect } from 'react';
import { PokeballSVG } from './PokeballSVG';

// Konami Code Easter Egg
export const KonamiCode = () => {
  const [sequence, setSequence] = useState([]);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newSequence = [...sequence, e.code].slice(-konamiCode.length);
      setSequence(newSequence);

      if (newSequence.join('') === konamiCode.join('')) {
        setShowEasterEgg(true);
        // Play audio if available
        try {
          const audio = new Audio('/sounds/pikachu.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {}); // Fail silently if no audio
        } catch (e) {}
        
        setTimeout(() => setShowEasterEgg(false), 5000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequence, konamiCode]);

  if (!showEasterEgg) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
      <div className="text-center text-white">
        <div className="text-6xl mb-4 animate-bounce">⚡</div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Pikachu, I choose you!
        </h1>
        <p className="text-xl mb-6">You found the secret Konami Code!</p>
        <div className="flex justify-center space-x-2">
          {Array.from({length: 5}).map((_, i) => (
            <PokeballSVG key={i} size={40} animate={true} color="shiny" />
          ))}
        </div>
        <p className="text-sm mt-4 opacity-70">This message will disappear in 5 seconds...</p>
      </div>
    </div>
  );
};

// Click counter easter egg (like Cookie Clicker but with Pokéballs)
export const PokeballClicker = () => {
  const [clicks, setClicks] = useState(0);
  const [showFloatingText, setShowFloatingText] = useState(false);
  const [ballSize, setBallSize] = useState(60);

  const handleClick = () => {
    setClicks(prev => prev + 1);
    setShowFloatingText(true);
    setBallSize(80);
    
    setTimeout(() => setShowFloatingText(false), 500);
    setTimeout(() => setBallSize(60), 200);
  };

  const getMilestoneMessage = (count) => {
    if (count === 10) return "🎉 You're getting the hang of this!";
    if (count === 50) return "⭐ Wow, you really like clicking!";
    if (count === 100) return "🏆 Century Club! Professor Oak would be proud!";
    if (count === 500) return "🚀 You're a clicking champion!";
    if (count === 1000) return "👑 Ultimate Pokéball Master!";
    return null;
  };

  const milestoneMessage = getMilestoneMessage(clicks);

  return (
    <div className="fixed bottom-20 right-20 z-30">
      {/* Milestone celebration */}
      {milestoneMessage && (
        <div className="absolute -top-16 -left-32 bg-yellow-400 text-black px-4 py-2 rounded-lg shadow-lg animate-bounce whitespace-nowrap">
          {milestoneMessage}
        </div>
      )}
      
      {/* Floating click text */}
      {showFloatingText && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-pokemon-red font-bold animate-float pointer-events-none">
          +1
        </div>
      )}
      
      {/* Click counter */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 text-xs font-bold shadow-lg">
        {clicks}
      </div>
      
      {/* Clickable Pokéball */}
      <button 
        onClick={handleClick}
        className="hover:scale-110 transition-transform duration-200 active:scale-95"
        title="Click the Pokéball!"
      >
        <PokeballSVG size={ballSize} className="drop-shadow-lg" />
      </button>
    </div>
  );
};

// Random Pokémon fact tooltip that appears occasionally
export const RandomFactTooltip = () => {
  const [showFact, setShowFact] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);

  const facts = [
    "Did you know? Raichu's tail can discharge 100,000 volts!",
    "Fun fact: Slowpoke's tail grows back if it breaks off!",
    "Trivia: Magikarp can live in almost any body of water!",
    "Cool fact: Ditto can transform into any Pokémon it sees!",
    "Amazing: Alakazam's brain never stops growing!",
    "Wow: Machamp can throw 1000 punches in 2 seconds!",
    "Neat: Psyduck gets headaches from using psychic powers!",
    "Wild: Snorlax sleeps most of the day and weighs 1000 pounds!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        setCurrentFact(Math.floor(Math.random() * facts.length));
        setShowFact(true);
        setTimeout(() => setShowFact(false), 4000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [facts.length]);

  if (!showFact) return null;

  return (
    <div className="fixed top-24 right-4 max-w-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-xl z-30 animate-slideIn">
      <div className="flex items-start space-x-2">
        <div className="text-2xl">💡</div>
        <div>
          <h4 className="font-bold text-sm mb-1">Pokémon Fact!</h4>
          <p className="text-xs leading-relaxed">{facts[currentFact]}</p>
        </div>
        <button 
          onClick={() => setShowFact(false)}
          className="text-white/70 hover:text-white"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Weather-based theme suggestions
export const WeatherThemeChanger = () => {
  const [weather, setWeather] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    // Simulate weather detection (in real app, use weather API)
    const hour = new Date().getHours();
    const mockWeather = {
      morning: { type: 'sunny', suggestion: 'Perfect weather for Electric-types!' },
      afternoon: { type: 'clear', suggestion: 'Great day for Fire-types!' },
      evening: { type: 'sunset', suggestion: 'Beautiful time for Psychic-types!' },
      night: { type: 'dark', suggestion: 'Perfect atmosphere for Ghost-types!' }
    };

    let currentWeather;
    if (hour >= 6 && hour < 12) currentWeather = mockWeather.morning;
    else if (hour >= 12 && hour < 17) currentWeather = mockWeather.afternoon;
    else if (hour >= 17 && hour < 20) currentWeather = mockWeather.evening;
    else currentWeather = mockWeather.night;

    setWeather(currentWeather);
    
    // Show suggestion after 30 seconds
    const timer = setTimeout(() => setShowSuggestion(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  if (!showSuggestion || !weather) return null;

  return (
    <div className="fixed top-24 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl z-30 max-w-xs animate-slideIn">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xl">🌤️</span>
        <h4 className="font-semibold text-sm">Weather Suggestion</h4>
        <button 
          onClick={() => setShowSuggestion(false)}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {weather.suggestion}
      </p>
    </div>
  );
};

// Catch notification system
export const CatchNotification = ({ show, pokemon, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 bg-green-500 text-white p-4 rounded-lg shadow-xl z-50 animate-slideIn">
      <div className="flex items-center space-x-3">
        <PokeballSVG size={32} color="premier" />
        <div>
          <h4 className="font-bold">Gotcha!</h4>
          <p className="text-sm">{pokemon} was added to your collection!</p>
        </div>
      </div>
    </div>
  );
};

// Mouse trail effect
export const MouseTrail = ({ enabled = false }) => {
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e) => {
      const newPoint = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now()
      };

      setTrail(prev => [...prev.slice(-10), newPoint]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => prev.filter(point => Date.now() - point.id < 1000));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          style={{
            left: point.x - 4,
            top: point.y - 4,
            opacity: (index + 1) / trail.length,
            animationDelay: `${index * 50}ms`
          }}
        />
      ))}
    </div>
  );
};

export default {
  KonamiCode,
  PokeballClicker,
  RandomFactTooltip,
  WeatherThemeChanger,
  CatchNotification,
  MouseTrail
};