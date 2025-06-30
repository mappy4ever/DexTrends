import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to avoid window reference errors
const QATestingTool = dynamic(() => import('../components/ui/QATestingTool'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pokemon-red mx-auto mb-4"></div>
        <p className="text-gray-600">Loading QA Testing Tool...</p>
      </div>
    </div>
  )
});

export default function QATestPage() {
  return (
    <>
      <Head>
        <title>Card QA Testing | DexTrends</title>
        <meta name="description" content="Quality assurance testing for card standardization" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <QATestingTool />
    </>
  );
}