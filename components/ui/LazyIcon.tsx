import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Create a generic icon placeholder
const IconPlaceholder = ({ className }: { className?: string }) => (
  <div className={`w-4 h-4 bg-gray-300 rounded animate-pulse ${className || ''}`} />
);

// Dynamic icon imports with specific icon names
export const FaCopy = dynamic(
  () => import('react-icons/fa').then(mod => ({ default: mod.FaCopy })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const FaEdit = dynamic(
  () => import('react-icons/fa').then(mod => ({ default: mod.FaEdit })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const FaTrash = dynamic(
  () => import('react-icons/fa').then(mod => ({ default: mod.FaTrash })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const FaShare = dynamic(
  () => import('react-icons/fa').then(mod => ({ default: mod.FaShare })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsChevronUp = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsChevronUp })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsChevronDown = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsChevronDown })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const FiShoppingBag = dynamic(
  () => import('react-icons/fi').then(mod => ({ default: mod.FiShoppingBag })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsSearch = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsSearch })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsHeart = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsHeart })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsShield = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsShield })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsLightning = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsLightning })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const GiPotionBall = dynamic(
  () => import('react-icons/gi').then(mod => ({ default: mod.GiPotionBall })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const GiSwordWound = dynamic(
  () => import('react-icons/gi').then(mod => ({ default: mod.GiSwordWound })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const GiStoneBlock = dynamic(
  () => import('react-icons/gi').then(mod => ({ default: mod.GiStoneBlock })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const GiCrystalGrowth = dynamic(
  () => import('react-icons/gi').then(mod => ({ default: mod.GiCrystalGrowth })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const FiFilter = dynamic(
  () => import('react-icons/fi').then(mod => ({ default: mod.FiFilter })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const FiChevronDown = dynamic(
  () => import('react-icons/fi').then(mod => ({ default: mod.FiChevronDown })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

// Add more icons as needed
export const GiCardPickup = dynamic(
  () => import('react-icons/gi').then(mod => ({ default: mod.GiCardPickup })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const GiTrophy = dynamic(
  () => import('react-icons/gi').then(mod => ({ default: mod.GiTrophy })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const GiGamepad = dynamic(
  () => import('react-icons/gi').then(mod => ({ default: mod.GiGamepad })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const GiCrystalBall = dynamic(
  () => import('react-icons/gi').then(mod => ({ default: mod.GiCrystalBall })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsCalendar = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsCalendar })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsGlobe = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsGlobe })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsController = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsController })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsStar = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsStar })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsStarFill = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsStarFill })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsPeople = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsPeople })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const BsGraphUp = dynamic(
  () => import('react-icons/bs').then(mod => ({ default: mod.BsGraphUp })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const FaGamepad = dynamic(
  () => import('react-icons/fa').then(mod => ({ default: mod.FaGamepad })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const FaWifi = dynamic(
  () => import('react-icons/fa').then(mod => ({ default: mod.FaWifi })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const FaMountain = dynamic(
  () => import('react-icons/fa').then(mod => ({ default: mod.FaMountain })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);

export const FaCity = dynamic(
  () => import('react-icons/fa').then(mod => ({ default: mod.FaCity })),
  { ssr: false, loading: () => <IconPlaceholder /> }
);