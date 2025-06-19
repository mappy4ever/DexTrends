import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
// import CardList from "../components/cardlist.js";

export default function Leaderboard() {
  const router = useRouter();

  // Redirect directly to trending page
  useEffect(() => {
    router.push('/trending');
  }, [router]);

  // Show a temporary loading message while redirecting
  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
          <div className="w-20 h-20 rounded-full border-4 border-t-primary border-r-primary/70 border-b-primary/40 border-l-transparent animate-spin"></div>
        </div>
        <h3 className="mt-6 text-xl font-semibold">Redirecting to Trending Cards...</h3>
        <p className="text-gray-500 mt-2">Taking you to the most popular cards right now</p>
      </div>
    </div>
  );
}































