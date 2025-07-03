import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TypeBadge from './TypeBadge';

// EvolutionStageCard: shows a Pokémon in the evolution chain with a black circle border and clickable name
export default function EvolutionStageCard({
  name = '',
  id,
  spriteUrl,
  types = [],
  isCurrent = false,
  onClick = null,
  circleSize = "large",
}) {
  // Safety check for name
  if (!name) {
    console.warn('EvolutionStageCard: name prop is undefined or empty');
    return null;
  }
  // Circle size classes
  const sizeMap = {
    large: 'w-28 h-28',
    medium: 'w-24 h-24',
    small: 'w-20 h-20',
  };
  const circleClass = sizeMap[circleSize] || sizeMap.large;
  return (
    <div className={`flex flex-col items-center p-2 bg-transparent transition-all ${isCurrent ? 'scale-110' : ''}`}>
      <div
        className={`relative ${circleClass} mb-2 flex items-center justify-center rounded-full ${isCurrent ? 'border-4 border-blue-500 bg-blue-50 dark:bg-blue-900/40 shadow-lg ring-4 ring-blue-300/40' : 'border-2 border-gray-400 bg-white shadow'} transition-all duration-300`}
        style={{ boxShadow: isCurrent ? '0 0 0 6px #3b82f6, 0 2px 12px rgba(59,130,246,0.15)' : '0 1px 6px rgba(0,0,0,0.08)' }}
      >
        {isCurrent && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg animate-bounce" title="Current Pokémon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l2.09 6.26L21 9.27l-5 4.87L17.18 21 12 17.27 6.82 21 8 14.14l-5-4.87 6.91-1.01z"/></svg>
          </span>
        )}
        <div className="flex items-center justify-center w-full h-full">
          <Image
            src={spriteUrl}
            alt={name}
            width={88}
            height={88}
            className="rounded-full object-contain"
            style={{ maxWidth: '80%', maxHeight: '80%' }}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
            sizes="(max-width: 768px) 100vw, 88px"
            onError={(e) => {
              const target = e.target;
              if (target && target.src !== window.location.origin + '/dextrendslogo.png') {
                target.src = '/dextrendslogo.png';
              }
            }}
          />
        </div>
      </div>
      <Link 
        href={`/pokedex/${id}`}
        className={`capitalize font-semibold text-blue-900 dark:text-blue-200 mb-1 hover:underline focus:underline outline-none ${isCurrent ? 'text-primary' : ''}`}
        tabIndex={0}
      >
        {name.replace(/-/g, ' ')}
      </Link>
      <div className="flex gap-1 mt-1">
        {types.map(type => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>
    </div>
  );
}
