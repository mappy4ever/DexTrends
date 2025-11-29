import React from "react";
import { NextPageContext } from "next";
import Head from "next/head";
import logger from "../utils/logger";

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  const getErrorDetails = (code: number | undefined) => {
    switch (code) {
      case 404:
        return {
          title: "Page Not Found",
          message: "The page you're looking for doesn't exist.",
          pokemonMessage: "This Pokemon has fled to another route!",
          icon: "🔍"
        };
      case 500:
        return {
          title: "Server Error",
          message: "Something went wrong on our servers.",
          pokemonMessage: "The server used Self-Destruct!",
          icon: "⚡"
        };
      case 403:
        return {
          title: "Access Forbidden",
          message: "You don't have permission to access this resource.",
          pokemonMessage: "This area is protected by a Gym Leader!",
          icon: "🔒"
        };
      default:
        return {
          title: "Something went wrong",
          message: "An unexpected error occurred.",
          pokemonMessage: "A wild error appeared!",
          icon: "❌"
        };
    }
  };

  const { title, message, pokemonMessage, icon } = getErrorDetails(statusCode);

  return (
    <>
      <Head>
        <title>{statusCode || 'Error'} - {title} | DexTrends</title>
        <meta name="description" content={message} />
      </Head>

      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Glass morphism error container */}
          <div className="bg-white/90 dark:bg-stone-800/90 rounded-2xl p-8 shadow-xl border border-stone-200 dark:border-stone-700 backdrop-blur-md">
            {/* Error icon and code */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-pulse">{icon}</div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent mb-2">
                {statusCode || '???'}
              </h1>
              <h2 className="text-2xl font-bold text-stone-900 mb-2">{title}</h2>
              <p className="text-stone-600 leading-relaxed">{message}</p>
            </div>

            {/* Pokemon-themed message */}
            <div className="mb-6 p-4 bg-yellow-50/50 rounded-lg border border-yellow-200/50">
              <p className="text-sm text-yellow-800 text-center italic">
                "{pokemonMessage}"
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-150 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Try Again
              </button>

              <button
                onClick={() => {
                  // Use window.location for reliable navigation in error states (SSR safe)
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="w-full px-6 py-3 bg-white/70 text-stone-700 rounded-xl hover:bg-white/90 transition-all duration-150 font-medium border border-stone-200/50 backdrop-blur-sm"
              >
                Go to Homepage
              </button>

              {statusCode !== 404 && (
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.history.back();
                    }
                  }}
                  className="w-full px-6 py-3 bg-stone-100/70 text-stone-600 rounded-xl hover:bg-stone-200/70 transition-all duration-150 font-medium"
                >
                  Go Back
                </button>
              )}
            </div>

            {/* Additional help text */}
            <div className="text-center mt-6">
              <p className="text-sm text-stone-500">
                Need help? Contact our support team.
              </p>
            </div>

            {/* Error ID for debugging */}
            <div className="mt-4 p-2 bg-stone-50/50 rounded text-center">
              <p className="text-xs text-stone-400">
                Error ID: err-{Date.now()}-{Math.random().toString(36).substr(2, 9)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
