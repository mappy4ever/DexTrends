import React from 'react';
import Head from 'next/head';
import { FadeIn } from '../components/ui/animations';

export default function CSSTest() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>CSS Test - DexTrends</title>
      </Head>
      
      <FadeIn>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">CSS Variable Test Page</h1>
          
          {/* Test background colors */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Background Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-black">
                <p className="font-medium">Page Background</p>
                <div className="w-full h-20 bg-page-bg border border-black mt-2"></div>
                <p className="text-sm mt-1">Should be light (#fafafa)</p>
              </div>
              <div className="p-4 border-2 border-black">
                <p className="font-medium">Card Background</p>
                <div className="w-full h-20 bg-card-bg border border-black mt-2"></div>
                <p className="text-sm mt-1">Should be white (#ffffff)</p>
              </div>
            </div>
          </div>
          
          {/* Test text colors */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Text Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-black bg-white">
                <p className="font-medium">Dark Text</p>
                <p className="text-dark-text text-2xl">This should be dark (#171717)</p>
              </div>
              <div className="p-4 border-2 border-black bg-white">
                <p className="font-medium">Grey Text</p>
                <p className="text-text-grey text-2xl">This should be grey (#737373)</p>
              </div>
            </div>
          </div>
          
          {/* Test Pokemon colors */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Pokemon Colors</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-pokemon-red text-white rounded">Pokemon Red</div>
              <div className="p-4 bg-pokemon-blue text-white rounded">Pokemon Blue</div>
              <div className="p-4 bg-pokemon-yellow text-black rounded">Pokemon Yellow</div>
              <div className="p-4 bg-pokemon-green text-white rounded">Pokemon Green</div>
            </div>
          </div>
          
          {/* Test components */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Component Tests</h2>
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold mb-2">Card Component</h3>
                <p>This should have proper background, border, and shadow.</p>
              </div>
              
              <div className="flex gap-4">
                <button className="btn btn-primary">Primary Button</button>
                <button className="btn btn-secondary">Secondary Button</button>
                <button className="btn btn-ghost">Ghost Button</button>
              </div>
              
              <div>
                <input className="input" placeholder="Test input field" />
              </div>
            </div>
          </div>
          
          {/* CSS Variable values */}
          <div className="mb-8 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-4">Current CSS Variable Values</h2>
            <div className="font-mono text-sm space-y-1">
              <p>--page-bg: {getComputedStyle(document.documentElement).getPropertyValue('--page-bg') || 'NOT SET'}</p>
              <p>--card-bg: {getComputedStyle(document.documentElement).getPropertyValue('--card-bg') || 'NOT SET'}</p>
              <p>--dark-text: {getComputedStyle(document.documentElement).getPropertyValue('--dark-text') || 'NOT SET'}</p>
              <p>--border-color: {getComputedStyle(document.documentElement).getPropertyValue('--border-color') || 'NOT SET'}</p>
              <p>--pokemon-red: {getComputedStyle(document.documentElement).getPropertyValue('--pokemon-red') || 'NOT SET'}</p>
            </div>
          </div>
          
          {/* Body styles check */}
          <div className="mb-8 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-4">Body Computed Styles</h2>
            <div className="font-mono text-sm space-y-1">
              <p>background: {typeof window !== 'undefined' ? getComputedStyle(document.body).backgroundColor : 'N/A'}</p>
              <p>color: {typeof window !== 'undefined' ? getComputedStyle(document.body).color : 'N/A'}</p>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}