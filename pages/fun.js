import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/themecontext';
import Head from 'next/head';
import logger from '../utils/logger';
import { FullBleedWrapper } from '../components/ui/FullBleedWrapper';

export default function FunPage() {
  const { theme } = useTheme();
  const [currentFact, setCurrentFact] = useState(0);
  const [randomPokemon, setRandomPokemon] = useState(null);

  const pokemonFacts = [
    {
      title: "Did you know?",
      fact: "Raichu's tail can discharge 100,000 volts of electricity!",
      emoji: "⚡"
    },
    {
      title: "Fun fact:",
      fact: "Slowpoke's tail grows back if it breaks off!",
      emoji: "🌊"
    },
    {
      title: "Trivia:",
      fact: "Magikarp can live in almost any body of water, no matter how polluted!",
      emoji: "🐟"
    },
    {
      title: "Cool fact:",
      fact: "Ditto can transform into any Pokémon it sees, copying their appearance and abilities!",
      emoji: "🔄"
    },
    {
      title: "Amazing:",
      fact: "Alakazam's brain never stops growing throughout its entire life!",
      emoji: "🧠"
    },
    {
      title: "Wow:",
      fact: "Machamp can throw 1000 punches in just 2 seconds!",
      emoji: "👊"
    },
    {
      title: "Neat:",
      fact: "Psyduck gets terrible headaches from using its psychic powers!",
      emoji: "🤕"
    },
    {
      title: "Wild:",
      fact: "Snorlax sleeps most of the day and weighs over 1000 pounds!",
      emoji: "😴"
    },
    {
      title: "Incredible:",
      fact: "Pikachu stores electricity in its cheek pouches and releases it when threatened!",
      emoji: "⚡"
    },
    {
      title: "Fascinating:",
      fact: "Charizard can melt almost anything with its fire that reaches 3000°F!",
      emoji: "🔥"
    }
  ];

  const pokemonQuizzes = [
    {
      question: "Which Pokémon is known as the Mouse Pokémon?",
      options: ["Pikachu", "Raichu", "Rattata", "Sandshrew"],
      correct: 0,
      explanation: "Pikachu is officially classified as the Mouse Pokémon!"
    },
    {
      question: "What type is super effective against Water-type Pokémon?",
      options: ["Fire", "Electric", "Grass", "Normal"],
      correct: 2,
      explanation: "Grass-type moves are super effective against Water-types!"
    },
    {
      question: "How many original Pokémon were there in Generation 1?",
      options: ["150", "151", "152", "149"],
      correct: 1,
      explanation: "There were 151 original Pokémon, including the mythical Mew!"
    }
  ];

  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const getRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * pokemonFacts.length);
    setCurrentFact(randomIndex);
  };

  const getRandomQuiz = () => {
    const randomIndex = Math.floor(Math.random() * pokemonQuizzes.length);
    setCurrentQuiz(randomIndex);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);
  };

  const getRandomPokemon = async () => {
    try {
      const randomId = Math.floor(Math.random() * 1010) + 1;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const pokemon = await response.json();
      setRandomPokemon({
        name: pokemon.name,
        id: pokemon.id,
        sprite: pokemon.sprites.front_default,
        types: pokemon.types.map(type => type.type.name)
      });
    } catch (error) {
      logger.error('Error fetching random Pokemon:', { error });
    }
  };

  useEffect(() => {
    getRandomPokemon();
  }, []);

  return (
    <>
      <Head>
        <title>Fun Zone - DexTrends</title>
        <meta name="description" content="Fun Pokémon facts, quizzes, and trivia!" />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="max-w-6xl mx-auto py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pokemon-red to-pokemon-blue bg-clip-text text-transparent">
              🎉 Fun Zone 🎉
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Discover amazing Pokémon facts, test your knowledge, and have fun!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Random Pokemon */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-center text-pokemon-blue">
                🎲 Random Pokémon
              </h2>
              {randomPokemon ? (
                <div className="text-center">
                  <img 
                    src={randomPokemon.sprite} 
                    alt={randomPokemon.name}
                    className="w-32 h-32 mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold capitalize mb-2 text-gray-800 dark:text-white">
                    {randomPokemon.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    #{randomPokemon.id.toString().padStart(3, '0')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {randomPokemon.types.map((type, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full bg-pokemon-red text-white text-sm font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <p className="text-gray-500">Loading...</p>
                </div>
              )}
              <button
                onClick={getRandomPokemon}
                className="w-full bg-pokemon-yellow hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition-colors duration-200">
                Get New Random Pokémon!
              </button>
            </div>

            {/* Pokemon Facts */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-center text-pokemon-red">
                💡 Pokémon Facts
              </h2>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-4xl mb-3">{pokemonFacts[currentFact].emoji}</div>
                  <h3 className="font-bold text-lg mb-2">{pokemonFacts[currentFact].title}</h3>
                  <p className="text-sm leading-relaxed">{pokemonFacts[currentFact].fact}</p>
                </div>
              </div>
              <button
                onClick={getRandomFact}
                className="w-full mt-4 bg-pokemon-blue hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors duration-200">
                Show Random Fact!
              </button>
            </div>

            {/* Pokemon Quiz */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-center text-pokemon-red">
                🧠 Pokémon Quiz
              </h2>
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">
                  {pokemonQuizzes[currentQuiz].question}
                </h3>
                <div className="space-y-2">
                  {pokemonQuizzes[currentQuiz].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showAnswer}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        showAnswer
                          ? index === pokemonQuizzes[currentQuiz].correct
                            ? 'bg-green-500 text-white'
                            : index === selectedAnswer && index !== pokemonQuizzes[currentQuiz].correct
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {showAnswer && (
                  <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {pokemonQuizzes[currentQuiz].explanation}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={getRandomQuiz}
                className="w-full bg-pokemon-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors duration-200">
                New Question!
              </button>
            </div>
          </div>

          {/* Pokemon Joke Section */}
          <div className="mt-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-center text-pokemon-yellow">
              😂 Pokémon Jokes
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 rounded-xl">
                <h3 className="font-bold mb-2">Why don&apos;t you ever see Pikachu in a restaurant?</h3>
                <p className="text-sm">Because it&apos;s always shocking to get the bill! ⚡</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-blue-500 text-white p-6 rounded-xl">
                <h3 className="font-bold mb-2">What do you call a Pokémon that can&apos;t move very fast?</h3>
                <p className="text-sm">A Slowpoke! 🐌</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 text-white p-6 rounded-xl">
                <h3 className="font-bold mb-2">Why did Team Rocket blast off again?</h3>
                <p className="text-sm">Because they&apos;re always reaching for the stars! 🚀</p>
              </div>
              <div className="bg-gradient-to-br from-red-400 to-pink-500 text-white p-6 rounded-xl">
                <h3 className="font-bold mb-2">What&apos;s a Pokémon&apos;s favorite type of music?</h3>
                <p className="text-sm">Rock type! 🎸</p>
              </div>
            </div>
          </div>
        </div>
      </FullBleedWrapper>
    </>
  );
}

// Mark this page as fullBleed to remove default padding
FunPage.fullBleed = true;