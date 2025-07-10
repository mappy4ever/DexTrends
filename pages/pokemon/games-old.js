import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations";
import { useTheme } from "../../context/themecontext";
import { pokemonTheme } from "../../utils/pokemonTheme";
import StyledBackButton from "../../components/ui/StyledBackButton";
import GameTimeline from "../../components/ui/GameTimeline";
import { gameCovers } from "../../data/gameCovers";
import { GiCardPickup } from "react-icons/gi";
import { BsCalendar, BsGlobe, BsController } from "react-icons/bs";
import { useGames, loadDataWithFallback } from "../../utils/localDataLoader";

// Comprehensive Pokemon games data
const gamesData = {
  mainSeries: [
    {
      generation: 1,
      games: [
        {
          id: "red-blue",
          names: ["Pokémon Red", "Pokémon Blue"],
          logos: ["/images/game-logos/pokemon-red.png", "/images/game-logos/pokemon-blue.png"],
          releaseDate: "1996-02-27",
          region: "Kanto",
          platform: "Game Boy",
          description: "The games that started it all. Catch and train 151 Pokémon in the Kanto region.",
          features: ["Original 151 Pokémon", "Turn-based battles", "Trading via Link Cable"],
          color: "from-red-500 to-blue-500"
        },
        {
          id: "yellow",
          names: ["Pokémon Yellow"],
          logos: ["/images/game-logos/pokemon-yellow.png"],
          releaseDate: "1998-09-12",
          region: "Kanto",
          platform: "Game Boy",
          description: "Special Pikachu Edition following the anime storyline more closely.",
          features: ["Pikachu as starter", "Anime-inspired events", "Updated graphics"],
          color: "from-yellow-400 to-yellow-600"
        }
      ]
    },
    {
      generation: 2,
      games: [
        {
          id: "gold-silver",
          names: ["Pokémon Gold", "Pokémon Silver"],
          logos: ["/images/game-logos/pokemon-gold.png", "/images/game-logos/pokemon-silver.png"],
          releaseDate: "1999-11-21",
          region: "Johto",
          platform: "Game Boy Color",
          description: "Explore Johto and return to Kanto with 100 new Pokémon.",
          features: ["Day/Night cycle", "Breeding system", "Two regions to explore"],
          color: "from-yellow-500 to-gray-400"
        },
        {
          id: "crystal",
          names: ["Pokémon Crystal"],
          logos: ["/images/game-logos/pokemon-crystal.png"],
          releaseDate: "2000-12-14",
          region: "Johto",
          platform: "Game Boy Color",
          description: "Enhanced version with animated Pokémon sprites and female protagonist option.",
          features: ["Animated sprites", "Battle Tower", "Suicune storyline"],
          color: "from-blue-400 to-cyan-500"
        }
      ]
    },
    {
      generation: 3,
      games: [
        {
          id: "ruby-sapphire",
          names: ["Pokémon Ruby", "Pokémon Sapphire"],
          logos: ["/images/game-logos/pokemon-ruby.png", "/images/game-logos/pokemon-sapphire.png"],
          releaseDate: "2002-11-21",
          region: "Hoenn",
          platform: "Game Boy Advance",
          description: "Discover the tropical Hoenn region with enhanced graphics and double battles.",
          features: ["Double battles", "Abilities & Natures", "Secret bases"],
          color: "from-red-600 to-blue-600"
        },
        {
          id: "emerald",
          names: ["Pokémon Emerald"],
          logos: ["/images/game-logos/pokemon-emerald.png"],
          releaseDate: "2004-09-16",
          region: "Hoenn",
          platform: "Game Boy Advance",
          description: "The definitive Hoenn experience with Battle Frontier.",
          features: ["Battle Frontier", "Both evil teams", "Rayquaza storyline"],
          color: "from-emerald-500 to-emerald-700"
        },
        {
          id: "firered-leafgreen",
          names: ["Pokémon FireRed", "Pokémon LeafGreen"],
          logos: ["/images/game-logos/pokemon-firered.png", "/images/game-logos/pokemon-leafgreen.png"],
          releaseDate: "2004-01-29",
          region: "Kanto",
          platform: "Game Boy Advance",
          description: "Remakes of the original games with modern features and Sevii Islands.",
          features: ["Sevii Islands", "Updated graphics", "Wireless adapter support"],
          color: "from-orange-500 to-green-500"
        }
      ]
    },
    {
      generation: 4,
      games: [
        {
          id: "diamond-pearl",
          names: ["Pokémon Diamond", "Pokémon Pearl"],
          logos: ["/images/game-logos/pokemon-diamond.png", "/images/game-logos/pokemon-pearl.png"],
          releaseDate: "2006-09-28",
          region: "Sinnoh",
          platform: "Nintendo DS",
          description: "Experience Sinnoh with Wi-Fi battles and the Global Trade Station.",
          features: ["Wi-Fi battles", "Global Trade Station", "Underground mining"],
          color: "from-blue-500 to-pink-400"
        },
        {
          id: "platinum",
          names: ["Pokémon Platinum"],
          logos: ["/images/game-logos/pokemon-platinum.png"],
          releaseDate: "2008-09-13",
          region: "Sinnoh",
          platform: "Nintendo DS",
          description: "Enhanced Sinnoh adventure with Distortion World and Battle Frontier.",
          features: ["Distortion World", "Battle Frontier", "Improved graphics"],
          color: "from-gray-600 to-gray-800"
        },
        {
          id: "heartgold-soulsilver",
          names: ["Pokémon HeartGold", "Pokémon SoulSilver"],
          logos: ["/images/game-logos/pokemon-heartgold.png", "/images/game-logos/pokemon-soulsilver.png"],
          releaseDate: "2009-09-12",
          region: "Johto",
          platform: "Nintendo DS",
          description: "Beloved remakes with Pokémon following you and the Pokéwalker accessory.",
          features: ["Pokémon followers", "Pokéwalker", "16 Gym battles"],
          color: "from-yellow-500 to-gray-500"
        }
      ]
    },
    {
      generation: 5,
      games: [
        {
          id: "black-white",
          names: ["Pokémon Black", "Pokémon White"],
          logos: ["/images/game-logos/pokemon-black.png", "/images/game-logos/pokemon-white.png"],
          releaseDate: "2010-09-18",
          region: "Unova",
          platform: "Nintendo DS",
          description: "A fresh start with only new Pokémon and a deeper story.",
          features: ["156 new Pokémon", "Seasonal changes", "Triple/Rotation battles"],
          color: "from-gray-900 to-gray-100"
        },
        {
          id: "black2-white2",
          names: ["Pokémon Black 2", "Pokémon White 2"],
          logos: ["/images/game-logos/pokemon-black2.png", "/images/game-logos/pokemon-white2.png"],
          releaseDate: "2012-06-23",
          region: "Unova",
          platform: "Nintendo DS",
          description: "Direct sequels with new areas and Pokémon World Tournament.",
          features: ["New storyline", "Pokémon World Tournament", "Hidden Grottos"],
          color: "from-gray-800 to-gray-200"
        }
      ]
    },
    {
      generation: 6,
      games: [
        {
          id: "x-y",
          names: ["Pokémon X", "Pokémon Y"],
          logos: ["/images/game-logos/pokemon-x.png", "/images/game-logos/pokemon-y.png"],
          releaseDate: "2013-10-12",
          region: "Kalos",
          platform: "Nintendo 3DS",
          description: "The jump to 3D with Mega Evolution and character customization.",
          features: ["Full 3D graphics", "Mega Evolution", "Character customization"],
          color: "from-blue-600 to-red-600"
        },
        {
          id: "omega-ruby-alpha-sapphire",
          names: ["Pokémon Omega Ruby", "Pokémon Alpha Sapphire"],
          logos: ["/images/game-logos/pokemon-omega-ruby.png", "/images/game-logos/pokemon-alpha-sapphire.png"],
          releaseDate: "2014-11-21",
          region: "Hoenn",
          platform: "Nintendo 3DS",
          description: "Hoenn remakes with Mega Evolutions and the Delta Episode.",
          features: ["Mega Evolutions", "Delta Episode", "DexNav"],
          color: "from-red-700 to-blue-700"
        }
      ]
    },
    {
      generation: 7,
      games: [
        {
          id: "sun-moon",
          names: ["Pokémon Sun", "Pokémon Moon"],
          logos: ["/images/game-logos/pokemon-sun.png", "/images/game-logos/pokemon-moon.png"],
          releaseDate: "2016-11-18",
          region: "Alola",
          platform: "Nintendo 3DS",
          description: "Island trials replace gyms in the tropical Alola region.",
          features: ["Island trials", "Z-Moves", "Alolan forms"],
          color: "from-orange-500 to-purple-600"
        },
        {
          id: "ultra-sun-ultra-moon",
          names: ["Pokémon Ultra Sun", "Pokémon Ultra Moon"],
          logos: ["/images/game-logos/pokemon-ultra-sun.png", "/images/game-logos/pokemon-ultra-moon.png"],
          releaseDate: "2017-11-17",
          region: "Alola",
          platform: "Nintendo 3DS",
          description: "Enhanced versions with Ultra Wormholes and Rainbow Rocket.",
          features: ["Ultra Wormholes", "Rainbow Rocket", "New Pokémon"],
          color: "from-yellow-500 to-indigo-600"
        },
        {
          id: "lets-go",
          names: ["Pokémon Let's Go, Pikachu!", "Pokémon Let's Go, Eevee!"],
          logos: ["/images/game-logos/pokemon-lets-go-pikachu.png", "/images/game-logos/pokemon-lets-go-eevee.png"],
          releaseDate: "2018-11-16",
          region: "Kanto",
          platform: "Nintendo Switch",
          description: "Kanto reimagined with Pokémon GO catching mechanics.",
          features: ["GO-style catching", "Co-op play", "Ride Pokémon"],
          color: "from-yellow-400 to-amber-600"
        }
      ]
    },
    {
      generation: 8,
      games: [
        {
          id: "sword-shield",
          names: ["Pokémon Sword", "Pokémon Shield"],
          logos: ["/images/game-logos/pokemon-sword.png", "/images/game-logos/pokemon-shield.png"],
          releaseDate: "2019-11-15",
          region: "Galar",
          platform: "Nintendo Switch",
          description: "The Wild Area and Dynamax raids bring new adventures to Galar.",
          features: ["Wild Area", "Dynamax/Gigantamax", "Max Raid Battles"],
          color: "from-blue-600 to-red-600"
        },
        {
          id: "brilliant-diamond-shining-pearl",
          names: ["Pokémon Brilliant Diamond", "Pokémon Shining Pearl"],
          logos: ["/images/game-logos/pokemon-brilliant-diamond.png", "/images/game-logos/pokemon-shining-pearl.png"],
          releaseDate: "2021-11-19",
          region: "Sinnoh",
          platform: "Nintendo Switch",
          description: "Faithful remakes of Diamond and Pearl with modern features.",
          features: ["Grand Underground", "Following Pokémon", "Elite Four rematches"],
          color: "from-sky-500 to-pink-500"
        },
        {
          id: "legends-arceus",
          names: ["Pokémon Legends: Arceus"],
          logos: ["/images/game-logos/pokemon-legends-arceus.png"],
          releaseDate: "2022-01-28",
          region: "Hisui",
          platform: "Nintendo Switch",
          description: "A new take on Pokémon set in ancient Sinnoh (Hisui).",
          features: ["Open world exploration", "New catching mechanics", "Alpha Pokémon"],
          color: "from-gray-600 to-yellow-600"
        }
      ]
    },
    {
      generation: 9,
      games: [
        {
          id: "scarlet-violet",
          names: ["Pokémon Scarlet", "Pokémon Violet"],
          logos: ["/images/game-logos/pokemon-scarlet.png", "/images/game-logos/pokemon-violet.png"],
          releaseDate: "2022-11-18",
          region: "Paldea",
          platform: "Nintendo Switch",
          description: "Open-world adventure with three storylines to explore.",
          features: ["Open world", "Three storylines", "Terastallization"],
          color: "from-red-600 to-purple-600"
        }
      ]
    }
  ],
  spinoffs: [
    {
      category: "Mystery Dungeon",
      games: [
        {
          id: "red-rescue-blue-rescue",
          names: ["Pokémon Mystery Dungeon: Red Rescue Team", "Blue Rescue Team"],
          platform: "GBA/DS",
          releaseDate: "2005-11-17",
          description: "Play as a Pokémon in randomly generated dungeons.",
          color: "from-red-500 to-blue-500"
        },
        {
          id: "explorers",
          names: ["Pokémon Mystery Dungeon: Explorers of Time/Darkness/Sky"],
          platform: "Nintendo DS",
          releaseDate: "2007-09-13",
          description: "Emotional story-driven dungeon exploration.",
          color: "from-blue-600 to-gray-700"
        }
      ]
    },
    {
      category: "Ranger",
      games: [
        {
          id: "ranger",
          names: ["Pokémon Ranger"],
          platform: "Nintendo DS",
          releaseDate: "2006-03-23",
          description: "Capture Pokémon by drawing circles around them.",
          color: "from-orange-500 to-red-500"
        }
      ]
    },
    {
      category: "Stadium",
      games: [
        {
          id: "stadium",
          names: ["Pokémon Stadium"],
          platform: "Nintendo 64",
          releaseDate: "1999-04-30",
          description: "3D battles with rental teams and mini-games.",
          color: "from-purple-500 to-indigo-500"
        },
        {
          id: "colosseum",
          names: ["Pokémon Colosseum"],
          platform: "GameCube",
          releaseDate: "2003-11-21",
          description: "3D adventure with Shadow Pokémon to purify.",
          color: "from-gray-700 to-purple-700"
        }
      ]
    },
    {
      category: "Mobile",
      games: [
        {
          id: "go",
          names: ["Pokémon GO"],
          platform: "iOS/Android",
          releaseDate: "2016-07-06",
          description: "Catch Pokémon in the real world using AR.",
          color: "from-blue-400 to-yellow-400"
        },
        {
          id: "masters",
          names: ["Pokémon Masters EX"],
          platform: "iOS/Android",
          releaseDate: "2019-08-29",
          description: "Team up with trainers in 3v3 battles.",
          color: "from-red-500 to-blue-500"
        },
        {
          id: "unite",
          names: ["Pokémon UNITE"],
          platform: "Switch/Mobile",
          releaseDate: "2021-07-21",
          description: "5v5 MOBA battles with Pokémon.",
          color: "from-purple-600 to-orange-500"
        }
      ]
    }
  ]
};

export default function GamesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeTab, setActiveTab] = useState("main");
  const [scrapedGames, setScrapedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('local');

  // Load scraped game data
  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await loadDataWithFallback('games');
        if (data) {
          setScrapedGames(data);
          setDataSource(data.length > 2 ? 'local' : 'fallback');
        } else {
          setError('Failed to load game data');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading games:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  // Use placeholder image for logos
  const getLogoPlaceholder = (name, color) => {
    return (
      <div className={`w-full h-32 bg-gradient-to-br ${color} flex items-center justify-center rounded-lg`}>
        <span className="text-white font-bold text-lg px-4 text-center">{name}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>Pokémon Games | DexTrends</title>
        <meta name="description" content="Journey through all Pokémon game releases from 1996 to present" />
      </Head>

      <FadeIn>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <StyledBackButton 
              text="Back to Pokémon Hub" 
              onClick={() => router.push('/pokemon')} 
            />
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <GiCardPickup className="text-pokemon-red" />
              <span className="bg-gradient-to-r from-pokemon-red to-pokemon-blue bg-clip-text text-transparent">
                Pokémon Games
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Every game from Red & Blue to Scarlet & Violet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {dataSource === 'local' ? 'Data from local Bulbapedia scrape' : 'Using fallback data'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === "timeline"
                    ? 'bg-white dark:bg-gray-900 text-yellow-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveTab("main")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === "main"
                    ? 'bg-white dark:bg-gray-900 text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Main Series
              </button>
              <button
                onClick={() => setActiveTab("spinoffs")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === "spinoffs"
                    ? 'bg-white dark:bg-gray-900 text-pink-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Spin-offs
              </button>
            </div>
          </div>

          {/* Interactive Timeline */}
          {activeTab === "timeline" && (
            <div className="relative">
              <GameTimeline games={gamesData} theme={theme} />
            </div>
          )}

          {/* Enhanced Games from Bulbapedia */}
          {activeTab === "main" && (
            <>
              {/* Scraped Games Section */}
              {scrapedGames.length > 0 && (
                <SlideUp>
                  <div className={`rounded-2xl overflow-hidden mb-8 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 text-white">
                      <h2 className="text-2xl font-bold">Scraped Game Data</h2>
                      <p className="text-sm opacity-90">{dataSource === 'local' ? 'Local Bulbapedia data' : 'Fallback data'}</p>
                    </div>
                    <div className="p-6">
                      {loading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-400">Loading game data...</p>
                        </div>
                      ) : error ? (
                        <div className="text-center py-12">
                          <p className="text-red-500">{error}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Run the scraper to download game data: <code>node scripts/runScraper.js games</code>
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {scrapedGames.slice(0, 9).map((game, index) => (
                            <CardHover key={index}>
                              <div className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                              } shadow-lg hover:shadow-2xl`}>
                                {/* Game Cover Art */}
                                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                  {game.images?.cover ? (
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={game.images.cover}
                                        alt={game.title}
                                        layout="fill"
                                        objectFit="contain"
                                        className="p-4"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                      <span className="text-white font-bold text-lg px-4 text-center">{game.title}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Game Info */}
                                <div className="p-4">
                                  <h3 className="text-xl font-bold mb-2">
                                    {game.title}
                                  </h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {game.platform && (
                                      <div className="flex items-center gap-1">
                                        <BsController />
                                        <span>{game.platform}</span>
                                      </div>
                                    )}
                                    {game.region && (
                                      <div className="flex items-center gap-1">
                                        <BsGlobe />
                                        <span>{game.region}</span>
                                      </div>
                                    )}
                                  </div>
                                  {game.releaseDate && (
                                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                      <BsCalendar />
                                      <span>{game.releaseDate}</span>
                                    </div>
                                  )}
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {game.description}
                                  </p>
                                  <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                                    Local Data
                                  </div>
                                </div>
                              </div>
                            </CardHover>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </SlideUp>
              )}

              {/* Static Games Data */}
              <StaggeredChildren className="space-y-8">
                {gamesData.mainSeries.map((generation) => (
                  <SlideUp key={generation.generation}>
                    <div className={`rounded-2xl overflow-hidden ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <div className="bg-gradient-to-r from-pokemon-red to-pokemon-blue p-4 text-white">
                        <h2 className="text-2xl font-bold">Generation {generation.generation}</h2>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {generation.games.map((game) => (
                            <CardHover key={game.id}>
                              <div 
                                className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                                  theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                                } shadow-lg hover:shadow-2xl`}
                                onClick={() => setSelectedGame(game)}
                              >
                                {/* Game Cover Art */}
                                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                  {gameCovers[game.id] && (
                                    <div className="flex h-full">
                                      {game.names.length > 1 ? (
                                        // For dual versions, show both covers
                                        <>
                                          <div className="relative w-1/2 h-full">
                                            <Image
                                              src={
                                                gameCovers[game.id][game.id.split('-')[0]] || 
                                                gameCovers[game.id][Object.keys(gameCovers[game.id]).find(k => k !== 'logos' && k !== 'cover')]
                                              }
                                              alt={game.names[0]}
                                              layout="fill"
                                              objectFit="contain"
                                              className="p-2"
                                            />
                                          </div>
                                          <div className="relative w-1/2 h-full">
                                            <Image
                                              src={
                                                gameCovers[game.id][game.id.split('-')[1]] || 
                                                gameCovers[game.id][Object.keys(gameCovers[game.id]).filter(k => k !== 'logos' && k !== 'cover')[1]]
                                              }
                                              alt={game.names[1]}
                                              layout="fill"
                                              objectFit="contain"
                                              className="p-2"
                                            />
                                          </div>
                                        </>
                                      ) : (
                                        // For single version, show one cover
                                        <div className="relative w-1/2 h-full">
                                          <Image
                                            src={gameCovers[game.id].cover}
                                            alt={game.names[0]}
                                            layout="fill"
                                            objectFit="contain"
                                            className="p-4"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {!gameCovers[game.id] && getLogoPlaceholder(game.names.join(" & "), game.color)}
                                </div>

                                {/* Game Info */}
                                <div className="p-4">
                                  <h3 className="text-xl font-bold mb-2">
                                    {game.names.join(" & ")}
                                  </h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    <div className="flex items-center gap-1">
                                      <BsController />
                                      <span>{game.platform}</span>
                                    </div>
                                    <Link 
                                      href={`/pokemon/regions/${game.region.toLowerCase()}`}
                                      className="flex items-center gap-1 hover:text-pokemon-blue transition-colors"
                                    >
                                      <BsGlobe />
                                      <span>{game.region}</span>
                                    </Link>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {game.description}
                                  </p>
                                  <Link href={`/pokemon/games/${game.id}`} className="block w-full py-2 bg-gradient-to-r from-red-400 to-pink-400 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-center">
                                    View Details
                                  </Link>
                                </div>
                              </div>
                            </CardHover>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SlideUp>
                ))}
              </StaggeredChildren>
            </>
          )}

          {/* Spin-off Games */}
          {activeTab === "spinoffs" && (
            <StaggeredChildren className="space-y-8">
              {gamesData.spinoffs.map((category) => (
                <SlideUp key={category.category}>
                  <div className={`rounded-2xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <div className="bg-gradient-to-r from-purple-400 to-yellow-400 p-4 text-white">
                      <h2 className="text-2xl font-bold">{category.category} Series</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.games.map((game) => (
                          <CardHover key={game.id}>
                            <div className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                            } shadow-lg hover:shadow-2xl`}>
                              {/* Game Cover Art */}
                              <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                {gameCovers[game.id] && gameCovers[game.id].cover ? (
                                  <div className="relative w-full h-full">
                                    <Image
                                      src={gameCovers[game.id].cover}
                                      alt={game.names[0]}
                                      layout="fill"
                                      objectFit="contain"
                                      className="p-4"
                                    />
                                  </div>
                                ) : (
                                  <div className="p-4 h-full">
                                    {getLogoPlaceholder(game.names.join(" / "), game.color)}
                                  </div>
                                )}
                              </div>

                              {/* Game Info */}
                              <div className="p-4">
                                <h3 className="text-lg font-bold mb-2">
                                  {game.names.join(" / ")}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  <div className="flex items-center gap-1">
                                    <BsController />
                                    <span>{game.platform}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BsCalendar />
                                    <span>{new Date(game.releaseDate).getFullYear()}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {game.description}
                                </p>
                              </div>
                            </div>
                          </CardHover>
                        ))}
                      </div>
                    </div>
                  </div>
                </SlideUp>
              ))}
            </StaggeredChildren>
          )}

          {/* Game Detail Modal */}
          {selectedGame && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedGame(null)}
            >
              <SlideUp>
                <div 
                  className={`max-w-2xl w-full rounded-2xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } max-h-[90vh] overflow-y-auto`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className={`bg-gradient-to-r ${selectedGame.color} p-6 text-white relative`}>
                    <button 
                      onClick={() => setSelectedGame(null)}
                      className="absolute top-4 right-4 text-white bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                    >
                      ✕
                    </button>
                    <h2 className="text-3xl font-bold mb-2">{selectedGame.names.join(" & ")}</h2>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{selectedGame.platform}</span>
                      <span>•</span>
                      <span>{selectedGame.region} Region</span>
                      <span>•</span>
                      <span>{new Date(selectedGame.releaseDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-2">About</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedGame.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-2">Key Features</h3>
                      <ul className="space-y-2">
                        {selectedGame.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-pokemon-red mt-1">•</span>
                            <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Platform</p>
                        <p className="font-bold">{selectedGame.platform}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Release Date</p>
                        <p className="font-bold">{new Date(selectedGame.releaseDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SlideUp>
            </div>
          )}

          {/* Timeline Section */}
          <SlideUp>
            <div className={`mt-12 p-8 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h2 className="text-2xl font-bold mb-6 text-center">Game Timeline</h2>
              <div className="text-center">
                <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-pokemon-red">1996</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">First Release</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-pokemon-blue">30+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Main Games</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-pokemon-yellow">9</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Generations</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-pokemon-green">50+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Games</div>
                  </div>
                </div>
              </div>
            </div>
          </SlideUp>
        </div>
      </FadeIn>
    </div>
  );
}