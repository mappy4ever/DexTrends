import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TypeBadge } from '../TypeBadge';
import styles from './GymLeaderCard.module.css';

interface Pokemon {
  name: string;
  sprite: string;
  id?: number;
}

interface GymLeaderCardProps {
  name: string;
  region: string;
  type: string;
  badge: string;
  badgeImage?: string;
  image: string;
  team: Pokemon[];
  strengths: string[];
  weaknesses: string[];
  quote: string;
  funFact: string;
  gymTown: string;
  recommendedLevel?: number;
}

const GymLeaderCard: React.FC<GymLeaderCardProps> = ({
  name,
  region,
  type,
  badge,
  badgeImage,
  image,
  team,
  strengths,
  weaknesses,
  quote,
  funFact,
  gymTown,
  recommendedLevel
}) => {
  return (
    <div className={styles.cardWrapper}>
      {/* Main Card Content */}

      {/* Main Card Content */}
      <div className={styles.card} data-type={type}>
        {/* Type Specialist at Top */}
        <div className={styles.typeSpecialization}>
          <span className={styles.typeSpecLabel}>TYPE SPECIALIST</span>
          <div className={styles.typeInfo}>
            <TypeBadge
              type={type}
              size="lg"
              className={styles.mainTypeBadge}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          {/* Leader Info */}
          <div className={styles.leaderInfo}>
            <div className={styles.nameSection}>
              <div className={styles.badgeContainer}>
                <Image
                  src={badgeImage || `/images/scraped/badges/${badge.toLowerCase().replace(' badge', '-badge').replace(' ', '-')}.png`}
                  alt={`${badge} Badge`}
                  width={72}
                  height={72}
                  className={styles.badge}
                />
              </div>
              <div className={styles.nameInfo}>
                <h2 className={styles.leaderName}>{name}</h2>
                <p className={styles.gymLocation}>{gymTown}</p>
              </div>
            </div>
          </div>

          {/* Pokemon Team Section */}
          <div className={styles.teamSection}>
            <div className={styles.pokemonGrid}>
              {team && team.length > 0 ? team.map((pokemon, index) => (
                <Link
                  key={index}
                  href={pokemon.id ? `/pokedex/${pokemon.id}` : `/pokedex/${pokemon.name.toLowerCase()}`}
                  className={styles.pokemonItem}
                >
                  <Image
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    width={64}
                    height={64}
                    className={styles.pokemonSprite}
                  />
                </Link>
              )) : (
                <div style={{ color: 'red', fontSize: '12px' }}>No team data</div>
              )}
            </div>
          </div>

          {/* Weaknesses */}
          <div className={styles.battleInfo}>
            <div className={styles.weaknessesOnly}>
              <span className={styles.label}>Weak to:</span>
              <div className={styles.typeIcons}>
                {weaknesses.map((type, index) => (
                  <TypeBadge
                    key={index}
                    type={type}
                    size="xs"
                          className={styles.typeIcon}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className={styles.quote}>
            <p>&ldquo;{quote}&rdquo;</p>
          </div>

          {/* Fun Fact */}
          <div className={styles.funFact}>
            <span className={styles.funFactLabel}>Fun Fact:</span>
            <p>{funFact}</p>
          </div>
        </div>

        {/* Bottom Right Section - Gym Leader Tag and Level */}
        <div className={styles.bottomRightSection}>
          {recommendedLevel && (
            <div className={styles.recommendedLevelPill}>
              Recommended Level: {recommendedLevel}+
            </div>
          )}
          <div className={styles.tag}>GYM LEADER</div>
        </div>
        
        {/* Gym Leader Image - Positioned Inside Card */}
        <div className={styles.leaderImageContainer}>
          <Image
            src={image || `/images/scraped/gym-leaders/${region}-${name.toLowerCase()}-main.png`}
            alt={`${name} - ${region} Gym Leader`}
            width={500}
            height={700}
            className={`${styles.leaderImage} ${name === 'Chuck' ? styles.chuckImage : ''} ${name === 'Clair' ? styles.clairImage : ''} ${name === 'Fantina' ? styles.fantinaImage : ''} ${name === 'Crasher Wake' ? styles.crasherWakeImage : ''} ${name === 'Maylene' ? styles.mayleneImage : ''}`}
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default GymLeaderCard;