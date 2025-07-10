import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../components/layout/layout';
import { motion } from 'framer-motion';
import { BsGeoAlt as MapPin, BsTrophy as Trophy, BsShield as Shield, BsStars as Sparkles } from 'react-icons/bs';
import styles from '../../styles/RegionsIndex.module.css';

const regions = [
  {
    id: 'kanto',
    name: 'Kanto',
    generation: 1,
    description: 'Where it all began - the original Pokémon region',
    mapImage: '/images/scraped/maps/kanto-region-map.png',
    gymCount: 8,
    legendaryCount: 4,
    color: '#ff6b6b',
    games: ['Red & Blue', 'Yellow', 'FireRed & LeafGreen', "Let's Go"]
  },
  {
    id: 'johto',
    name: 'Johto',
    generation: 2,
    description: 'Mysterious lands with ancient traditions',
    mapImage: '/images/scraped/maps/johto-region-map.png',
    gymCount: 8,
    legendaryCount: 6,
    color: '#4ecdc4',
    games: ['Gold & Silver', 'Crystal', 'HeartGold & SoulSilver']
  },
  {
    id: 'hoenn',
    name: 'Hoenn',
    generation: 3,
    description: 'Tropical paradise with land and sea adventures',
    mapImage: '/images/scraped/maps/hoenn-region-map.png',
    gymCount: 8,
    legendaryCount: 10,
    color: '#45b7d1',
    games: ['Ruby & Sapphire', 'Emerald', 'Omega Ruby & Alpha Sapphire']
  },
  {
    id: 'sinnoh',
    name: 'Sinnoh',
    generation: 4,
    description: 'Mountainous region steeped in mythology',
    mapImage: '/images/scraped/maps/sinnoh-region-map.png',
    gymCount: 8,
    legendaryCount: 14,
    color: '#9b59b6',
    games: ['Diamond & Pearl', 'Platinum', 'Brilliant Diamond & Shining Pearl']
  },
  {
    id: 'unova',
    name: 'Unova',
    generation: 5,
    description: 'Modern region inspired by New York',
    mapImage: '/images/scraped/maps/unova-region-map.png',
    gymCount: 8,
    legendaryCount: 13,
    color: '#e74c3c',
    games: ['Black & White', 'Black 2 & White 2']
  },
  {
    id: 'kalos',
    name: 'Kalos',
    generation: 6,
    description: 'Beautiful region inspired by France',
    mapImage: '/images/scraped/maps/kalos-region-map.png',
    gymCount: 8,
    legendaryCount: 5,
    color: '#f39c12',
    games: ['X & Y']
  },
  {
    id: 'alola',
    name: 'Alola',
    generation: 7,
    description: 'Tropical islands with unique island trials',
    mapImage: '/images/scraped/maps/alola-region-map.png',
    gymCount: 0, // Island trials instead
    legendaryCount: 11,
    color: '#ff9ff3',
    games: ['Sun & Moon', 'Ultra Sun & Ultra Moon']
  },
  {
    id: 'galar',
    name: 'Galar',
    generation: 8,
    description: 'Industrial region inspired by Great Britain',
    mapImage: '/images/scraped/maps/galar-region-map.png',
    gymCount: 8,
    legendaryCount: 4,
    color: '#00b894',
    games: ['Sword & Shield']
  },
  {
    id: 'paldea',
    name: 'Paldea',
    generation: 9,
    description: 'Open-world region inspired by Spain',
    mapImage: '/images/scraped/maps/paldea-region-map.png',
    gymCount: 8,
    legendaryCount: 4,
    color: '#ffd93d',
    games: ['Scarlet & Violet']
  }
];

export default function RegionsIndex() {
  const [selectedGeneration, setSelectedGeneration] = useState('all');

  const filteredRegions = selectedGeneration === 'all' 
    ? regions 
    : regions.filter(region => region.generation.toString() === selectedGeneration);

  return (
    <Layout>
      <div className={styles.regionsPage}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <motion.h1 
              className={styles.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Explore the Pokémon World
            </motion.h1>
            <motion.p 
              className={styles.subtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Discover the diverse regions where your Pokémon adventures await
            </motion.p>
          </div>
        </section>

        {/* Generation Filter */}
        <section className={styles.filterSection}>
          <h2>Filter by Generation</h2>
          <div className={styles.generationFilters}>
            {['all', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((gen) => (
              <button
                key={gen}
                className={`${styles.filterButton} ${selectedGeneration === gen ? styles.active : ''}`}
                onClick={() => setSelectedGeneration(gen)}
              >
                {gen === 'all' ? 'All Regions' : `Gen ${gen}`}
              </button>
            ))}
          </div>
        </section>

        {/* Regions Grid */}
        <section className={styles.regionsSection}>
          <div className={styles.regionsGrid}>
            {filteredRegions.map((region, index) => (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/regions/${region.id}`} className={styles.regionCard}>
                  <div className={styles.regionCardInner}>
                    <div className={styles.regionImageContainer}>
                      <Image
                        src={region.mapImage}
                        alt={`${region.name} Map`}
                        fill
                        className={styles.regionImage}
                      />
                      <div 
                        className={styles.regionOverlay}
                        style={{ background: `linear-gradient(135deg, ${region.color}aa, ${region.color}66)` }}
                      />
                      <div className={styles.generationBadge}>
                        Gen {region.generation}
                      </div>
                    </div>
                    
                    <div className={styles.regionContent}>
                      <h3 className={styles.regionName}>{region.name}</h3>
                      <p className={styles.regionDescription}>{region.description}</p>
                      
                      <div className={styles.regionStats}>
                        {region.gymCount > 0 && (
                          <div className={styles.stat}>
                            <Trophy size={16} />
                            <span>{region.gymCount} Gyms</span>
                          </div>
                        )}
                        {region.gymCount === 0 && (
                          <div className={styles.stat}>
                            <Trophy size={16} />
                            <span>Island Trials</span>
                          </div>
                        )}
                        <div className={styles.stat}>
                          <Shield size={16} />
                          <span>{region.legendaryCount} Legendaries</span>
                        </div>
                        <div className={styles.stat}>
                          <Sparkles size={16} />
                          <span>{region.games.length} Games</span>
                        </div>
                      </div>
                      
                      <div className={styles.gamesList}>
                        {region.games.map((game, idx) => (
                          <span key={idx} className={styles.gameChip}>
                            {game}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <motion.div 
              className={styles.statCard}
              whileHover={{ scale: 1.05 }}
            >
              <MapPin size={32} className={styles.statIcon} />
              <h3>9</h3>
              <p>Regions to Explore</p>
            </motion.div>
            <motion.div 
              className={styles.statCard}
              whileHover={{ scale: 1.05 }}
            >
              <Trophy size={32} className={styles.statIcon} />
              <h3>64</h3>
              <p>Gym Leaders</p>
            </motion.div>
            <motion.div 
              className={styles.statCard}
              whileHover={{ scale: 1.05 }}
            >
              <Shield size={32} className={styles.statIcon} />
              <h3>71</h3>
              <p>Legendary Pokémon</p>
            </motion.div>
            <motion.div 
              className={styles.statCard}
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles size={32} className={styles.statIcon} />
              <h3>25</h3>
              <p>Years of Adventures</p>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}