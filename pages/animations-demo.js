import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { EnhancedAnimationProvider } from '../components/ui/EnhancedAnimationSystem';

// Dynamically import the showcase to avoid SSR issues with animations
const AnimationShowcase = dynamic(
  () => import('../components/ui/AnimationShowcase'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading animation demos...</p>
        </div>
      </div>
    )
  }
);

export default function AnimationsDemo() {
  return (
    <>
      <Head>
        <title>DexTrends - Animation System Demo</title>
        <meta name="description" content="Comprehensive animation system showcase for DexTrends" />
      </Head>
      
      <EnhancedAnimationProvider>
        <AnimationShowcase />
      </EnhancedAnimationProvider>
    </>
  );
}