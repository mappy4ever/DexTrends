/**
 * OAuth Callback Handler
 * Handles redirects from OAuth providers (Google, GitHub, Discord)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('OAuth callback error', { error: error.message });
          setError(error.message);
          setTimeout(() => router.push('/auth/login'), 3000);
          return;
        }

        if (data.session) {
          logger.info('OAuth callback successful', { userId: data.session.user.id });
          // Redirect to home or return URL
          const returnUrl = sessionStorage.getItem('auth_return_url') || '/';
          sessionStorage.removeItem('auth_return_url');
          router.push(returnUrl);
        } else {
          // No session, redirect to login
          router.push('/auth/login');
        }
      } catch (err) {
        logger.error('OAuth callback exception', { error: err });
        setError('An unexpected error occurred');
        setTimeout(() => router.push('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900">
      {error ? (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-2">Authentication failed</p>
          <p className="text-sm text-stone-500 dark:text-stone-400">{error}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-4">Redirecting to login...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600 dark:text-stone-300">Completing sign in...</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">Please wait while we verify your account</p>
        </div>
      )}
    </div>
  );
}
