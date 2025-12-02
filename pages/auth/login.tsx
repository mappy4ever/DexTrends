/**
 * Login Page - Modern authentication UI
 */

import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthSafe } from '@/context/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import FullBleedWrapper from '@/components/ui/FullBleedWrapper';
import logger from '@/utils/logger';

type AuthMode = 'login' | 'signup' | 'forgot';

// Password validation helper - enforces strong passwords
const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: '' };
};

// Email validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize input to prevent XSS
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 254); // Limit length
};

// Generic error messages to prevent information leakage
const getSecureErrorMessage = (error: string): string => {
  const lowerError = error.toLowerCase();
  // Don't reveal if email exists or not
  if (lowerError.includes('user not found') || lowerError.includes('invalid login')) {
    return 'Invalid email or password';
  }
  if (lowerError.includes('email already') || lowerError.includes('already registered')) {
    return 'Unable to create account. Please try a different email or sign in.';
  }
  if (lowerError.includes('rate limit') || lowerError.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return error;
};

const AuthPage: NextPage = () => {
  const router = useRouter();
  // Safe hook usage - will have default values if provider not available
  const auth = useAuthSafe();
  const signIn = auth?.signIn ?? (async () => ({ error: { message: 'Auth not available' } as { message: string } }));
  const signUp = auth?.signUp ?? (async () => ({ error: { message: 'Auth not available' } as { message: string } }));
  const signInWithProvider = auth?.signInWithProvider ?? (async () => ({ error: { message: 'Auth not available' } as { message: string } }));
  const resetPassword = auth?.resetPassword ?? (async () => ({ error: { message: 'Auth not available' } as { message: string } }));
  const user = auth?.user ?? null;
  const loading = auth?.loading ?? false;

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      const returnUrl = router.query.returnUrl as string || '/';
      router.push(returnUrl);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedUsername = sanitizeInput(username);

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { error } = await signIn(sanitizedEmail, password);
        if (error) {
          setError(getSecureErrorMessage(error.message));
        }
      } else if (mode === 'signup') {
        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
          setError(passwordValidation.message);
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        // Validate username
        if (sanitizedUsername.length < 3) {
          setError('Username must be at least 3 characters');
          setIsSubmitting(false);
          return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
          setError('Username can only contain letters, numbers, and underscores');
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUp(sanitizedEmail, password, sanitizedUsername);
        if (error) {
          setError(getSecureErrorMessage(error.message));
        } else {
          setSuccess('Check your email for a confirmation link!');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(sanitizedEmail);
        if (error) {
          // Always show success message to prevent email enumeration
          setSuccess('If an account exists with this email, you will receive a password reset link.');
        } else {
          setSuccess('If an account exists with this email, you will receive a password reset link.');
        }
      }
    } catch (err) {
      logger.error('Auth error', { error: err });
      setError('An unexpected error occurred. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'discord') => {
    setError('');
    const { error } = await signInWithProvider(provider);
    if (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'} | DexTrends</title>
        <meta name="description" content="Sign in to DexTrends to sync your favorites, collections, and preferences across devices." />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <ModernCard variant="glass" padding="xl" className="shadow-2xl">
              {/* Logo */}
              <div className="text-center mb-8">
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block"
                  >
                    <h1 className="text-3xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                      DexTrends
                    </h1>
                  </motion.div>
                </Link>
                <p className="text-amber-600 dark:text-amber-400 mt-2">
                  {mode === 'login' && 'Welcome back, Trainer!'}
                  {mode === 'signup' && 'Start your journey!'}
                  {mode === 'forgot' && 'Reset your password'}
                </p>
              </div>

              {/* Error/Success Messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-green-700 dark:text-green-300 text-sm"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      placeholder="Choose a username"
                      required
                      maxLength={30}
                      autoComplete="username"
                      pattern="^[a-zA-Z0-9_]+$"
                      title="Username can only contain letters, numbers, and underscores"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="trainer@pokemon.com"
                    required
                    maxLength={254}
                    autoComplete={mode === 'login' ? 'email' : 'email'}
                  />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      placeholder="••••••••"
                      required
                      maxLength={128}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      minLength={8}
                    />
                    {mode === 'signup' && (
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-300">
                        Min 8 chars with uppercase, lowercase, and number
                      </p>
                    )}
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      placeholder="••••••••"
                      required
                      maxLength={128}
                      autoComplete="new-password"
                      minLength={8}
                    />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Link'}
                    </>
                  )}
                </motion.button>
              </form>

              {/* OAuth Buttons */}
              {mode !== 'forgot' && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-300 dark:border-stone-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-stone-800 text-stone-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOAuthLogin('google')}
                      className="flex items-center justify-center py-2.5 border border-stone-300 dark:border-stone-600 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOAuthLogin('github')}
                      className="flex items-center justify-center py-2.5 border border-stone-300 dark:border-stone-600 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      <svg className="w-5 h-5 text-stone-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOAuthLogin('discord')}
                      className="flex items-center justify-center py-2.5 border border-stone-300 dark:border-stone-600 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </motion.button>
                  </div>
                </>
              )}

              {/* Mode Toggle */}
              <div className="mt-6 text-center text-sm text-stone-600 dark:text-stone-300">
                {mode === 'login' && (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                      className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                )}
                {mode === 'signup' && (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                      className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
                {mode === 'forgot' && (
                  <>
                    Remember your password?{' '}
                    <button
                      onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                      className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </ModernCard>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link href="/">
                <span className="text-sm text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                  ← Back to DexTrends
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </FullBleedWrapper>
    </>
  );
};

// Disable static generation - this page requires client-side auth
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default AuthPage;
