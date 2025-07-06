import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - Server Error | DexTrends</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🔥</div>
            <h1 className="text-6xl font-bold text-pokemon-red mb-4">500</h1>
            <p className="text-xl text-gray-700 mb-2">Server Error</p>
            <p className="text-gray-600">
              Oops! Something went wrong on our end. Our team has been notified and is working on it.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-pokemon-red text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <Link href="/">
              <a className="block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                Back to Homepage
              </a>
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            If this problem persists, please contact support.
          </div>
        </div>
      </div>
    </>
  );
}