import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { NextPage } from 'next';
import Layout from '../../components/layout/Layout';
import styles from '../../styles/RegionPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { BsChevronLeft as ChevronLeft, BsChevronRight as ChevronRight, BsAward as Award, BsGeoAlt as MapPin, BsStars as Sparkles, BsTrophy as Trophy, BsController as Gamepad2, BsShield as Shield, BsStar as Star } from 'react-icons/bs';

// Interfaces for type safety
interface TeamMember {
  name: string;
  level: number;
  type: string[];
}

interface GymLeader {
  id: string;
  name: string;
  city: string;
  type: string;
  badge: string;
  badgeImage: string;
  trainerImage: string;
  recommendedLevel: string;
  signature: string;
  team: TeamMember[];
  funFacts: string[];
  strategy: string;
}

interface LegendaryPokemon {
  name: string;
  type: string[];
  location: string;
  image: string;
}

interface RarePokemon {
  name: string;
  location: string;
  rarity: string;
}

interface Game {
  name: string;
  year: string;
  platform: string;
  coverImage: string;
}

interface RegionData {
  name: string;
  description: string;
  generation: number;
  professor: string;
  starterPokemon: string[];
  map: string;
  gymLeaders: GymLeader[];
  legendaryPokemon: LegendaryPokemon[];
  rarePokemon: RarePokemon[];
  games: Game[];
  specialFeatures: string[];
}

// Region data (in production, this would come from an API or database)
const regionData: Record<string, RegionData> = {
  kanto: {
    name: 'Kanto',
    description: 'The original Pokémon region, home to the first 151 Pokémon',
    generation: 1,
    professor: 'Professor Oak',
    starterPokemon: ['Bulbasaur', 'Charmander', 'Squirtle'],
    map: '/images/scraped/maps/kanto-region-map.png',
    gymLeaders: [
      {
        id: 'brock',
        name: 'Brock',
        city: 'Pewter City',
        type: 'Rock',
        badge: 'Boulder Badge',
        badgeImage: '/images/scraped/badges/boulder-badge.png',
        trainerImage: '/images/scraped/gym-leaders/red-blue-brock.png',
        recommendedLevel: '12-14',
        signature: 'Onix',
        team: [
          { name: 'Geodude', level: 12, type: ['Rock', 'Ground'] },
          { name: 'Onix', level: 14, type: ['Rock', 'Ground'] }
        ],
        funFacts: [
          'Aspiring Pokémon Breeder',
          'Has 9 younger siblings',
          'Eyes are always closed in the games'
        ],
        strategy: 'Use Water, Grass, or Fighting-type moves'
      },
      {
        id: 'misty',
        name: 'Misty',
        city: 'Cerulean City',
        type: 'Water',
        badge: 'Cascade Badge',
        badgeImage: '/images/scraped/badges/cascade-badge.png',
        trainerImage: '/images/scraped/gym-leaders/red-blue-misty.png',
        recommendedLevel: '18-21',
        signature: 'Starmie',
        team: [
          { name: 'Staryu', level: 18, type: ['Water'] },
          { name: 'Starmie', level: 21, type: ['Water', 'Psychic'] }
        ],
        funFacts: [
          'The Tomboyish Mermaid',
          'Youngest of four sisters',
          'Dreams of traveling the world'
        ],
        strategy: 'Electric and Grass types are super effective'
      },
      {
        id: 'lt-surge',
        name: 'Lt. Surge',
        city: 'Vermilion City',
        type: 'Electric',
        badge: 'Thunder Badge',
        badgeImage: '/images/scraped/badges/thunder-badge.png',
        trainerImage: '/images/scraped/gym-leaders/red-blue-lt-surge.png',
        recommendedLevel: '24-26',
        signature: 'Raichu',
        team: [
          { name: 'Voltorb', level: 21, type: ['Electric'] },
          { name: 'Pikachu', level: 18, type: ['Electric'] },
          { name: 'Raichu', level: 24, type: ['Electric'] }
        ],
        funFacts: [
          'Known as the Lightning American',
          'Former military officer',
          'His Gym has electric door puzzles'
        ],
        strategy: 'Ground-type moves are super effective'
      },
      {
        id: 'erika',
        name: 'Erika',
        city: 'Celadon City',
        type: 'Grass',
        badge: 'Rainbow Badge',
        badgeImage: '/images/scraped/badges/rainbow-badge.png',
        trainerImage: '/images/scraped/gym-leaders/red-blue-erika.png',
        recommendedLevel: '29-32',
        signature: 'Vileplume',
        team: [
          { name: 'Victreebel', level: 29, type: ['Grass', 'Poison'] },
          { name: 'Tangela', level: 24, type: ['Grass'] },
          { name: 'Vileplume', level: 29, type: ['Grass', 'Poison'] }
        ],
        funFacts: [
          'The Nature-Loving Princess',
          'Teaches at the Pokémon academy',
          'Often falls asleep during battles'
        ],
        strategy: 'Fire, Ice, Flying, and Psychic moves work well'
      }
    ],
    legendaryPokemon: [
      {
        name: 'Articuno',
        type: ['Ice', 'Flying'],
        location: 'Seafoam Islands',
        image: '/images/pokemon/144.png'
      },
      {
        name: 'Zapdos',
        type: ['Electric', 'Flying'],
        location: 'Power Plant',
        image: '/images/pokemon/145.png'
      },
      {
        name: 'Moltres',
        type: ['Fire', 'Flying'],
        location: 'Victory Road',
        image: '/images/pokemon/146.png'
      },
      {
        name: 'Mewtwo',
        type: ['Psychic'],
        location: 'Cerulean Cave',
        image: '/images/pokemon/150.png'
      }
    ],
    rarePokemon: [
      { name: 'Lapras', location: 'Silph Co. (Gift)', rarity: 'Very Rare' },
      { name: 'Snorlax', location: 'Routes 12 & 16', rarity: 'Unique Encounter' },
      { name: 'Dratini', location: 'Safari Zone', rarity: 'Extremely Rare' }
    ],
    games: [
      {
        name: 'Pokémon Red & Blue',
        year: '1996',
        platform: 'Game Boy',
        coverImage: '/images/scraped/games/covers/pokemon-red-boxart.png'
      },
      {
        name: 'Pokémon Yellow',
        year: '1998',
        platform: 'Game Boy',
        coverImage: '/images/scraped/games/covers/pokemon-yellow-boxart.png'
      },
      {
        name: 'Pokémon FireRed & LeafGreen',
        year: '2004',
        platform: 'Game Boy Advance',
        coverImage: '/images/scraped/games/covers/pokemon-firered-boxart.png'
      },
      {
        name: "Pokémon Let's Go Pikachu & Eevee",
        year: '2018',
        platform: 'Nintendo Switch',
        coverImage: '/images/scraped/games/covers/pokemon-lets-go-pikachu-boxart.png'
      }
    ],
    specialFeatures: [
      'First Pokémon region ever created',
      'Home to the original 151 Pokémon',
      'Features the Pokémon League at Indigo Plateau',
      'Connected to Johto region via Route 26'
    ]
  },
  johto: {
    name: 'Johto',
    description: 'A mystical region filled with ancient traditions and legendary Pokémon',
    generation: 2,
    professor: 'Professor Elm',
    starterPokemon: ['Chikorita', 'Cyndaquil', 'Totodile'],
    map: '/images/scraped/maps/johto-region-map.png',
    gymLeaders: [
      {
        id: 'falkner',
        name: 'Falkner',
        city: 'Violet City',
        type: 'Flying',
        badge: 'Zephyr Badge',
        badgeImage: '/images/scraped/badges/zephyr-badge.png',
        trainerImage: '/images/scraped/gym-leaders/gold-silver-falkner.png',
        recommendedLevel: '9-13',
        signature: 'Pidgeotto',
        team: [
          { name: 'Pidgey', level: 7, type: ['Normal', 'Flying'] },
          { name: 'Pidgeotto', level: 9, type: ['Normal', 'Flying'] }
        ],
        funFacts: [
          'Son of a legendary Flying-type trainer',
          'Dreams of becoming a great Flying Pokémon Master',
          'Studies migratory patterns of Flying Pokémon'
        ],
        strategy: 'Electric, Ice, and Rock types are super effective'
      },
      {
        id: 'bugsy',
        name: 'Bugsy',
        city: 'Azalea Town',
        type: 'Bug',
        badge: 'Hive Badge',
        badgeImage: '/images/scraped/badges/hive-badge.png',
        trainerImage: '/images/scraped/gym-leaders/gold-silver-bugsy.png',
        recommendedLevel: '15-17',
        signature: 'Scyther',
        team: [
          { name: 'Metapod', level: 14, type: ['Bug'] },
          { name: 'Kakuna', level: 14, type: ['Bug', 'Poison'] },
          { name: 'Scyther', level: 16, type: ['Bug', 'Flying'] }
        ],
        funFacts: [
          'Bug Pokémon researcher and enthusiast',
          'Youngest Gym Leader in Johto',
          'Captured his first Pokémon at age 7'
        ],
        strategy: 'Fire, Flying, and Rock moves are effective'
      }
    ],
    legendaryPokemon: [
      {
        name: 'Raikou',
        type: ['Electric'],
        location: 'Roaming Johto',
        image: '/images/pokemon/243.png'
      },
      {
        name: 'Entei',
        type: ['Fire'],
        location: 'Roaming Johto',
        image: '/images/pokemon/244.png'
      },
      {
        name: 'Suicune',
        type: ['Water'],
        location: 'Roaming Johto',
        image: '/images/pokemon/245.png'
      },
      {
        name: 'Lugia',
        type: ['Psychic', 'Flying'],
        location: 'Whirl Islands',
        image: '/images/pokemon/249.png'
      },
      {
        name: 'Ho-Oh',
        type: ['Fire', 'Flying'],
        location: 'Ecruteak City',
        image: '/images/pokemon/250.png'
      },
      {
        name: 'Celebi',
        type: ['Psychic', 'Grass'],
        location: 'Ilex Forest (Event)',
        image: '/images/pokemon/251.png'
      }
    ],
    rarePokemon: [
      { name: 'Skarmory', location: 'Route 45', rarity: 'Very Rare' },
      { name: 'Lapras', location: 'Union Cave (Fridays)', rarity: 'Weekly Encounter' },
      { name: 'Dunsparce', location: 'Dark Cave', rarity: 'Rare' }
    ],
    games: [
      {
        name: 'Pokémon Gold & Silver',
        year: '1999',
        platform: 'Game Boy Color',
        coverImage: '/images/scraped/games/covers/pokemon-gold-boxart.png'
      },
      {
        name: 'Pokémon Crystal',
        year: '2000',
        platform: 'Game Boy Color',
        coverImage: '/images/scraped/games/covers/pokemon-crystal-boxart.png'
      },
      {
        name: 'Pokémon HeartGold & SoulSilver',
        year: '2009',
        platform: 'Nintendo DS',
        coverImage: '/images/scraped/games/covers/pokemon-heartgold-boxart.png'
      }
    ],
    specialFeatures: [
      'First region to feature day/night cycle',
      'Introduced 100 new Pokémon species',
      'Home to the legendary beasts',
      'Features time-based events and encounters',
      'Connected to Kanto for post-game exploration'
    ]
  }
};

const RegionPage: NextPage = () => {
  const router = useRouter();
  const { region } = router.query;
  const [currentGymLeaderIndex, setCurrentGymLeaderIndex] = useState<number>(0);
  const [showAllGymLeaders, setShowAllGymLeaders] = useState<boolean>(false);
  
  const regionKey = Array.isArray(region) ? region[0] : region;
  const data = regionKey ? regionData[regionKey.toLowerCase()] : undefined;
  
  if (!data) {
    return (
      <Layout>
        <div className={styles.loading}>Loading region data...</div>
      </Layout>
    );
  }

  const nextGymLeader = () => {
    setCurrentGymLeaderIndex((prev: number) => 
      prev === data.gymLeaders.length - 1 ? 0 : prev + 1
    );
  };

  const prevGymLeader = () => {
    setCurrentGymLeaderIndex((prev: number) => 
      prev === 0 ? data.gymLeaders.length - 1 : prev - 1
    );
  };

  const currentLeader = data.gymLeaders[currentGymLeaderIndex];

  return (
    <Layout>
      <div className={styles.regionPage}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <Image
              src={data.map}
              alt={`${data.name} Region Map`}
              fill
              className={styles.heroImage}
              priority
            />
            <div className={styles.heroOverlay} />
          </div>
          <div className={styles.heroContent}>
            <motion.h1 
              className={styles.regionTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {data.name} Region
            </motion.h1>
            <motion.p 
              className={styles.regionDescription}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {data.description}
            </motion.p>
            <div className={styles.regionStats}>
              <div className={styles.stat}>
                <Sparkles size={20} />
                <span>Generation {data.generation}</span>
              </div>
              <div className={styles.stat}>
                <Trophy size={20} />
                <span>{data.gymLeaders.length} Gym Leaders</span>
              </div>
              <div className={styles.stat}>
                <Shield size={20} />
                <span>{data.legendaryPokemon.length} Legendaries</span>
              </div>
            </div>
          </div>
        </section>

        {/* Starter Pokémon Section */}
        <section className={styles.starterSection}>
          <h2>Choose Your Starter</h2>
          <p className={styles.professorInfo}>
            Meet {data.professor}, who will give you one of these three Pokémon to begin your journey!
          </p>
          <div className={styles.starterGrid}>
            {data.starterPokemon.map((starter: string, idx: number) => {
              const types: Record<string, string[]> = {
                'Bulbasaur': ['Grass', 'Poison'],
                'Charmander': ['Fire'],
                'Squirtle': ['Water'],
                'Chikorita': ['Grass'],
                'Cyndaquil': ['Fire'],
                'Totodile': ['Water'],
                'Treecko': ['Grass'],
                'Torchic': ['Fire'],
                'Mudkip': ['Water'],
                'Turtwig': ['Grass'],
                'Chimchar': ['Fire'],
                'Piplup': ['Water'],
                'Snivy': ['Grass'],
                'Tepig': ['Fire'],
                'Oshawott': ['Water'],
                'Chespin': ['Grass'],
                'Fennekin': ['Fire'],
                'Froakie': ['Water'],
                'Rowlet': ['Grass', 'Flying'],
                'Litten': ['Fire'],
                'Popplio': ['Water'],
                'Grookey': ['Grass'],
                'Scorbunny': ['Fire'],
                'Sobble': ['Water'],
                'Sprigatito': ['Grass'],
                'Fuecoco': ['Fire'],
                'Quaxly': ['Water']
              };
              const starterTypes = types[starter] || ['Unknown'];
              const mainType = starterTypes[0].toLowerCase();
              
              return (
                <motion.div
                  key={starter}
                  className={`${styles.starterCard} ${styles[mainType]}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={styles.starterImageContainer}>
                    <Image
                      src={`/images/pokemon/${starter.toLowerCase()}.png`}
                      alt={starter}
                      width={150}
                      height={150}
                      className={styles.starterImage}
                    />
                    <div className={styles.starterGlow} />
                  </div>
                  <h3>{starter}</h3>
                  <div className={styles.starterTypes}>
                    {starterTypes.map((type: string) => (
                      <span key={type} className={`${styles.typeChip} ${styles[type.toLowerCase()]}`}>
                        {type}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Gym Leaders Section */}
        <section className={styles.gymLeadersSection}>
          <div className={styles.sectionHeader}>
            <h2>Gym Leaders</h2>
            <button 
              className={styles.viewAllButton}
              onClick={() => setShowAllGymLeaders(!showAllGymLeaders)}
            >
              {showAllGymLeaders ? 'Show Carousel' : 'View All Leaders'}
            </button>
          </div>

          {!showAllGymLeaders ? (
            <div className={styles.gymLeaderCarousel}>
              <button 
                className={styles.carouselButton} 
                onClick={prevGymLeader}
                aria-label="Previous gym leader"
              >
                <ChevronLeft size={24} />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentLeader.id}
                  className={styles.gymLeaderCard}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.leaderImageContainer}>
                    <Image
                      src={currentLeader.trainerImage}
                      alt={currentLeader.name}
                      width={400}
                      height={400}
                      className={styles.leaderImage}
                    />
                    <div className={styles.typeTag}>{currentLeader.type}</div>
                  </div>
                  
                  <div className={styles.leaderInfo}>
                    <h3>{currentLeader.name}</h3>
                    <p className={styles.cityName}>
                      <MapPin size={16} /> {currentLeader.city}
                    </p>
                    
                    <div className={styles.badgeSection}>
                      <Image
                        src={currentLeader.badgeImage}
                        alt={currentLeader.badge}
                        width={60}
                        height={60}
                        className={styles.badgeImage}
                      />
                      <div>
                        <h4>{currentLeader.badge}</h4>
                        <p className={styles.recommendedLevel}>
                          Recommended Level: {currentLeader.recommendedLevel}
                        </p>
                      </div>
                    </div>

                    <div className={styles.teamSection}>
                      <h4>Team</h4>
                      <div className={styles.pokemonTeam}>
                        {currentLeader.team.map((pokemon: TeamMember, idx: number) => (
                          <div key={idx} className={styles.teamMember}>
                            <span className={styles.pokemonName}>{pokemon.name}</span>
                            <span className={styles.pokemonLevel}>Lv. {pokemon.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.funFacts}>
                      <h4>Fun Facts</h4>
                      <ul>
                        {currentLeader.funFacts.map((fact: string, idx: number) => (
                          <li key={idx}>{fact}</li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.strategy}>
                      <Award size={20} />
                      <p>{currentLeader.strategy}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button 
                className={styles.carouselButton} 
                onClick={nextGymLeader}
                aria-label="Next gym leader"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          ) : (
            <div className={styles.allGymLeaders}>
              {data.gymLeaders.map((leader: GymLeader) => (
                <motion.div
                  key={leader.id}
                  className={styles.gymLeaderTile}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Image
                    src={leader.trainerImage}
                    alt={leader.name}
                    width={200}
                    height={200}
                    className={styles.tileImage}
                  />
                  <h4>{leader.name}</h4>
                  <p>{leader.type} Type</p>
                  <div className={styles.tileBadge}>
                    <Image
                      src={leader.badgeImage}
                      alt={leader.badge}
                      width={40}
                      height={40}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Regional Map Section */}
        <section className={styles.mapSection}>
          <h2>Regional Map</h2>
          <div className={styles.mapContainer}>
            <Image
              src={data.map}
              alt={`${data.name} Region Map`}
              width={1200}
              height={800}
              className={styles.regionMap}
            />
          </div>
        </section>

        {/* Rare Pokémon Section */}
        <section className={styles.rareSection}>
          <h2>Rare Pokémon Encounters</h2>
          <div className={styles.rareGrid}>
            {data.rarePokemon.map((pokemon: RarePokemon, idx: number) => (
              <motion.div
                key={pokemon.name}
                className={styles.rareCard}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={styles.rarityBadge}>
                  <Sparkles size={16} />
                  {pokemon.rarity}
                </div>
                <h4>{pokemon.name}</h4>
                <p>
                  <MapPin size={14} />
                  {pokemon.location}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Legendary Pokémon Section */}
        <section className={styles.legendarySection}>
          <h2>Legendary Pokémon</h2>
          <div className={styles.legendaryGrid}>
            {data.legendaryPokemon.map((pokemon: LegendaryPokemon) => (
              <motion.div
                key={pokemon.name}
                className={styles.legendaryCard}
                whileHover={{ scale: 1.05 }}
              >
                <div className={styles.legendaryImageContainer}>
                  <Image
                    src={pokemon.image}
                    alt={pokemon.name}
                    width={150}
                    height={150}
                    className={styles.legendaryImage}
                  />
                  <div className={styles.legendaryGlow} />
                </div>
                <h3>{pokemon.name}</h3>
                <div className={styles.legendaryTypes}>
                  {pokemon.type.map((t: string) => (
                    <span key={t} className={`${styles.typeChip} ${styles[t.toLowerCase()]}`}>
                      {t}
                    </span>
                  ))}
                </div>
                <p className={styles.legendaryLocation}>
                  <MapPin size={14} /> {pokemon.location}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Regional Games Section */}
        <section className={styles.gamesSection}>
          <h2>Games Set in {data.name}</h2>
          <div className={styles.gamesGrid}>
            {data.games.map((game: Game) => (
              <motion.div
                key={game.name}
                className={styles.gameCard}
                whileHover={{ y: -5 }}
              >
                <Image
                  src={game.coverImage}
                  alt={game.name}
                  width={200}
                  height={300}
                  className={styles.gameCover}
                />
                <div className={styles.gameInfo}>
                  <h4>{game.name}</h4>
                  <p>
                    <Gamepad2 size={14} /> {game.platform}
                  </p>
                  <p className={styles.gameYear}>{game.year}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Special Features Section */}
        <section className={styles.featuresSection}>
          <h2>What Makes {data.name} Special</h2>
          <div className={styles.featuresList}>
            {data.specialFeatures.map((feature: string, idx: number) => (
              <motion.div
                key={idx}
                className={styles.featureItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Star className={styles.featureIcon} />
                <p>{feature}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default RegionPage;