import React from 'react';
import Image from 'next/image';
import { getBadgeImage } from '../../utils/scrapedImageMapping';
import { FadeIn, SlideUp, Scale, StaggeredChildren } from '../ui/animations/animations';

// Type definitions
interface GymLeader {
  name: string;
  badge: string;
  [key: string]: any;
}

interface RegionData {
  id: string;
  color: string;
  [key: string]: any;
}

interface BadgeCollectionProps {
  region: RegionData;
  gymLeaders: GymLeader[];
  theme: 'light' | 'dark';
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ region, gymLeaders, theme }) => {
  return (
    <div className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">Badge Collection</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Collect all {gymLeaders.length} badges to challenge the Pokémon League
            </p>
          </div>
        </FadeIn>

        {/* Badge Grid */}
        <StaggeredChildren className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-12">
          {gymLeaders.map((leader, index) => (
            <SlideUp key={leader.badge} delay={index * 0.05}>
              <div className="text-center group">
                <Scale>
                  <div className={`relative w-24 h-24 mx-auto mb-3 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                  } shadow-lg group-hover:shadow-2xl transition-all duration-300 p-4`}>
                    <Image
                      src={getBadgeImage(leader.badge, region.id)}
                      alt={leader.badge}
                      layout="fill"
                      objectFit="contain"
                      className="p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Try different naming patterns
                        const patterns = [
                          getBadgeImage(leader.badge.replace(' Badge', ''), region.id),
                          `/images/scraped/badges/${leader.badge.toLowerCase().replace(/\s+/g, '-')}.png`,
                          `/images/scraped/badges/${region.id}-${leader.badge.toLowerCase().replace(/\s+/g, '-')}.png`
                        ];
                        
                        const currentPattern = patterns.findIndex(p => target.src.includes(p));
                        if (currentPattern < patterns.length - 1) {
                          target.src = patterns[currentPattern + 1];
                        } else {
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="badge-fallback">${index + 1}</div>`;
                          }
                        }
                      }}
                    />
                  </div>
                </Scale>
                <h3 className="font-semibold text-sm">{leader.badge}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{leader.name}</p>
              </div>
            </SlideUp>
          ))}
        </StaggeredChildren>

        {/* Progress Bar */}
        <div className={`rounded-full h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
          <div 
            className={`h-full bg-gradient-to-r ${region.color} transition-all duration-1000 ease-out`}
            style={{ width: '100%' }}
          />
        </div>
        
        {/* Completion Message */}
        <div className="text-center mt-8">
          <FadeIn delay={0.5}>
            <p className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                All Badges Collected!
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              You're ready to challenge the Elite Four
            </p>
          </FadeIn>
        </div>
      </div>

      <style jsx>{`
        .badge-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: #666;
          background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default BadgeCollection;