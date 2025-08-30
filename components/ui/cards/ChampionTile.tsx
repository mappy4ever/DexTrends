import React from 'react';
import Image from 'next/image';
import styles from './ChampionCard.module.css';

interface Pokemon {
  name: string;
  sprite: string;
  type?: string[];
  level?: number;
}

interface ChampionCardProps {
  name: string;
  region: string;
  title?: string;
  image: string;
  team: Pokemon[];
  signature: string;
  previousRole?: string;
  quote: string;
  achievements?: string[];
  strategy: string;
  difficulty?: number;
}

const ChampionCard: React.FC<ChampionCardProps> = ({
  name,
  region,
  title = 'Champion',
  image,
  team,
  signature,
  previousRole,
  quote,
  achievements = [],
  strategy,
  difficulty = 5
}) => {
  return (
    <div className={styles.cardWrapper}>
      {/* Main Card Content */}

      {/* Main Card */}
      <div className={styles.card}>
        {/* Crown Badge */}
        <div className={styles.crownBadge}>
          <span className={styles.crownIcon}>👑</span>
          <span className={styles.championText}>CHAMPION</span>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.name}>{name}</h2>
            <p className={styles.title}>{title}</p>
            {previousRole && (
              <p className={styles.previousRole}>Former {previousRole}</p>
            )}
          </div>

          {/* Signature Pokemon */}
          <div className={styles.signatureSection}>
            <h3 className={styles.sectionTitle}>Ace Pokémon</h3>
            <div className={styles.signaturePokemon}>
              <span className={styles.signatureName}>{signature}</span>
            </div>
          </div>

          {/* Championship Team */}
          <div className={styles.teamSection}>
            <h3 className={styles.sectionTitle}>Championship Team</h3>
            <div className={styles.teamGrid}>
              {team.map((pokemon, index) => (
                <div key={index} className={styles.pokemonCard}>
                  <div className={styles.pokemonImageWrapper}>
                    <Image
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      width={80}
                      height={80}
                      className={styles.pokemonSprite}
                    />
                  </div>
                  <span className={styles.pokemonName}>{pokemon.name}</span>
                  {pokemon.level && (
                    <span className={styles.pokemonLevel}>Lv.{pokemon.level}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className={styles.achievementsSection}>
              <h3 className={styles.sectionTitle}>Achievements</h3>
              <ul className={styles.achievementsList}>
                {achievements.map((achievement, index) => (
                  <li key={index} className={styles.achievementItem}>
                    <span className={styles.achievementIcon}>🏆</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quote */}
          <div className={styles.quote}>
            <p>{quote}</p>
          </div>

          {/* Battle Strategy */}
          <div className={styles.strategy}>
            <h4 className={styles.strategyTitle}>Champion's Strategy</h4>
            <p className={styles.strategyText}>{strategy}</p>
          </div>

          {/* Challenge Rating */}
          <div className={styles.challengeRating}>
            <span className={styles.challengeLabel}>Ultimate Challenge:</span>
            <div className={styles.challengeStars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`${styles.star} ${i < difficulty ? styles.starActive : ''}`}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Champion Image - Positioned Inside Card with crown effect */}
        <div className={styles.championImageContainer}>
          <div className={styles.crownGlow} />
          <Image
            src={image || `/images/scraped/champions/${name.toLowerCase()}-1.png`}
            alt={`${name} - ${region} Champion`}
            width={600}
            height={800}
            className={styles.championImage}
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default ChampionCard;