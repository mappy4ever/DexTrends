import React from 'react';
import { useRouter } from 'next/router';
import { FadeIn } from '../ui/animations/animations';
import { pokemonTheme, responsive } from '../../utils/pokemonTheme';
import StyledBackButton from '../ui/StyledBackButton';
import type { IconType } from 'react-icons';

interface PokemonHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: IconType;
  gradient?: string;
  backButton?: boolean;
  backUrl?: string;
  backText?: string;
  children?: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark';
}

const PokemonHero: React.FC<PokemonHeroProps> = ({ 
  title, 
  subtitle, 
  description, 
  icon: Icon, 
  gradient = pokemonTheme.gradients.hero,
  backButton = true,
  backUrl = '/pokemon',
  backText = 'Back to Pokémon Hub',
  children,
  className = '',
  theme = 'light'
}) => {
  const router = useRouter();

  return (
    <div className={`relative min-h-[60vh] flex items-center justify-center overflow-hidden ${className}`}>
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {Icon && <Icon className="text-white text-4xl md:text-6xl" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={responsive.container}>
        <FadeIn>
          <div className="relative z-10 text-center text-white">
            {/* Icon */}
            {Icon && (
              <div className="mb-6">
                <Icon className="text-5xl md:text-7xl mx-auto drop-shadow-2xl" />
              </div>
            )}

            {/* Title */}
            <h1 className={`${responsive.text.hero} font-black mb-6 tracking-tight drop-shadow-2xl`}>
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className={`${responsive.text.subtitle} mb-6 opacity-90 drop-shadow-lg`}>
                {subtitle}
              </p>
            )}

            {/* Description */}
            {description && (
              <p className={`${responsive.text.body} mb-8 opacity-80 max-w-3xl mx-auto drop-shadow-lg`}>
                {description}
              </p>
            )}

            {/* Custom children */}
            {children}
          </div>
        </FadeIn>
      </div>

      {/* Back Button */}
      {backButton && (
        <div className="absolute top-8 left-8 z-20">
          <StyledBackButton 
            text={backText}
            onClick={() => router.push(backUrl)}
          />
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white">
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2 opacity-80">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) rotate(10deg); 
            opacity: 0.8;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PokemonHero;