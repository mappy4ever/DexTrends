import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiWifiOff, FiRefreshCw, FiHome } from 'react-icons/fi';
import { Container } from '@/components/ui/Container';
import Button from '@/components/ui/Button';

/**
 * Offline Page - Displayed when the user has no network connection
 *
 * Features:
 * - Friendly offline message
 * - Retry connection button
 * - Link to cached homepage
 * - Cached content suggestions
 */
export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      <Head>
        <title>Offline - DexTrends</title>
        <meta name="description" content="You appear to be offline. Some features may be unavailable." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 flex items-center justify-center p-4">
        <Container variant="elevated" padding="xl" className="max-w-md text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <FiWifiOff className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-stone-800 dark:text-white mb-2">
            You're Offline
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mb-6">
            It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={handleRetry}
              icon={<FiRefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>

            <Link href="/">
              <Button
                variant="secondary"
                fullWidth
                icon={<FiHome className="w-4 h-4" />}
              >
                Go to Homepage
              </Button>
            </Link>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 rounded-lg bg-stone-100 dark:bg-stone-800/50 text-left">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
              While you're offline:
            </h3>
            <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                Previously viewed pages may still be available
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                Your favorites and collections are saved locally
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                Changes will sync when you reconnect
              </li>
            </ul>
          </div>
        </Container>
      </div>
    </>
  );
}
