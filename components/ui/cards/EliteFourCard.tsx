import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TypeBadge } from '../TypeBadge';
import styles from './EliteFourCard.module.css';

interface Pokemon {
  name: string;
  sprite: string;
  id?: number;
}

interface EliteFourCardProps {
  name: string;
  region: string;
  type: string;
  rank: number;
  image: string;
  team: Pokemon[];
  signature: string;
  strengths: string[];
  weaknesses: string[];
  quote: string;
  strategy: string;
  difficulty?: number;
}

const EliteFourCard: React.FC<EliteFourCardProps> = ({
  name,
  region,
  type,
  rank,
  image,
  team,
  signature,
  strengths,
  weaknesses,
  quote,
  strategy,
  difficulty = 4
}) => {
  return (
    <div className={styles.cardWrapper}>
      {/* Main Card Content */}
      <div className={styles.card} data-type={type}>
        {/* Type Specialist at Top */}
        <div className={styles.typeSpecialization}>
          <span className={styles.typeSpecLabel}>ELITE TYPE SPECIALIST</span>
          <div className={styles.typeInfo}>
            <TypeBadge
              type={type}
              size="lg"
              showIcon={true}
              className={styles.mainTypeBadge}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          {/* Leader Info */}
          <div className={styles.leaderInfo}>
            <div className={styles.nameSection}>
              <div className={styles.rankContainer}>
                <div className={styles.rankBadge}>
                  #{rank}
                </div>
              </div>
              <div className={styles.nameInfo}>
                <h2 className={styles.leaderName}>{name}</h2>
                <p className={styles.gymLocation}>Elite Four Member</p>
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
                    showIcon={true}
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

          {/* Strategy */}
          <div className={styles.funFact}>
            <span className={styles.funFactLabel}>Battle Strategy:</span>
            <p>{strategy}</p>
          </div>
        </div>

        {/* Bottom Right Section - Elite Four Tag and Difficulty */}
        <div className={styles.bottomRightSection}>
          {difficulty && (
            <div className={styles.recommendedLevelPill}>
              Difficulty: {Array.from({ length: difficulty }).map((_, i) => '★').join('')}
            </div>
          )}
          <div className={styles.tag}>ELITE FOUR</div>
        </div>
        
        {/* Elite Four Member Image - Positioned Inside Card */}
        <div className={styles.leaderImageContainer}>
          <Image
            src={image || `/images/scraped/elite-four/${name.toLowerCase()}-1.png`}
            alt={`${name} - Elite Four`}
            width={500}
            height={700}
            className={styles.leaderImage}
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default EliteFourCard;