/**
 * User Profile Page
 * Shows user info, preferences, and logout option
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiLogOut, FiHeart, FiFolder, FiBell, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import FullBleedWrapper from '@/components/ui/FullBleedWrapper';
import Container from '@/components/ui/Container';
import StyledBackButton from '@/components/ui/StyledBackButton';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Edit profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize form when modal opens
  useEffect(() => {
    if (isEditModalOpen && profile) {
      setEditUsername(profile.username || '');
      setEditAvatarUrl(profile.avatar_url || '');
      setSaveError(null);
    }
  }, [isEditModalOpen, profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const { error } = await updateProfile({
        username: editUsername.trim() || undefined,
        avatar_url: editAvatarUrl.trim() || undefined,
      });

      if (error) {
        setSaveError(error.message);
      } else {
        setIsEditModalOpen(false);
      }
    } catch {
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/auth/login?returnUrl=/profile');
    }
  }, [user, loading, mounted, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push('/');
  };

  // Show loading state
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>My Profile | DexTrends</title>
        <meta name="description" content="Manage your DexTrends profile and settings" />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <Container className="py-6 md:py-8">
          <StyledBackButton variant="default" text="Back" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto mt-6"
          >
            {/* Profile Header */}
            <ModernCard variant="glass" padding="xl" className="mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                    {profile?.username || user.email?.split('@')[0] || 'Trainer'}
                  </h1>
                  <p className="text-stone-500 dark:text-stone-400 text-sm">
                    Pokemon Trainer
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                  <FiMail className="w-5 h-5 text-amber-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                  <FiUser className="w-5 h-5 text-amber-500" />
                  <span>@{profile?.username || user.email?.split('@')[0]}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                  <FiCalendar className="w-5 h-5 text-amber-500" />
                  <span>Joined {formatDate(profile?.created_at || user.created_at)}</span>
                </div>
              </div>
            </ModernCard>

            {/* Quick Links */}
            <ModernCard variant="elevated" padding="lg" className="mb-6">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
                Quick Links
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Link href="/favorites">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    <FiHeart className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Favorites</span>
                  </motion.div>
                </Link>
                <Link href="/collections">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    <FiFolder className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Collections</span>
                  </motion.div>
                </Link>
                <Link href="/price-alerts">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    <FiBell className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Price Alerts</span>
                  </motion.div>
                </Link>
              </div>
            </ModernCard>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                onClick={() => setIsEditModalOpen(true)}
              >
                <FiEdit2 className="w-5 h-5" />
                Edit Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSigningOut}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                onClick={handleSignOut}
              >
                {isSigningOut ? (
                  <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiLogOut className="w-5 h-5" />
                )}
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        </Container>
      </FullBleedWrapper>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        size="sm"
      >
        <div className="space-y-4">
          {/* Username Field */}
          <div>
            <label
              htmlFor="edit-username"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Username
            </label>
            <input
              id="edit-username"
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Avatar URL Field */}
          <div>
            <label
              htmlFor="edit-avatar"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
            >
              Avatar URL
            </label>
            <input
              id="edit-avatar"
              type="url"
              value={editAvatarUrl}
              onChange={(e) => setEditAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Enter a URL to an image for your profile picture
            </p>
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {saveError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <FiX className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSave className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProfilePage;
