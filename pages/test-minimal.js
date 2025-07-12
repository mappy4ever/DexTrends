import React from 'react';
import Image from 'next/image';

export default function TestMinimal() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Minimal Test Page</h1>
      <p className="mb-4">Testing image loading without any dynamic components</p>
      
      <div className="border border-gray-300 p-4 rounded">
        <Image
          src="/images/dextrends-vertical-logo.png"
          alt="DexTrends Logo Test"
          width={300}
          height={400}
          className="border border-blue-500"
        />
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        If this page loads without refreshing, the issue is with dynamic components on the main page.
      </p>
    </div>
  );
}