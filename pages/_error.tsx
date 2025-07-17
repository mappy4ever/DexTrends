import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextPageContext } from "next";

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-pokemon-red mb-4">
            {statusCode || 404}
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            {statusCode === 404
              ? "Page not found"
              : statusCode === 500
              ? "Internal server error"
              : statusCode
              ? `An error ${statusCode} occurred on server`
              : "An error occurred on client"}
          </p>
          <p className="text-gray-600">
            {statusCode === 404
              ? "The page you're looking for doesn't exist."
              : "Something went wrong. Please try again later."}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-6 py-3 bg-pokemon-red text-white rounded-lg hover:bg-red-700 transition-colors mr-4"
          >
            Try Again
          </button>
          <Link href="/">
            <a className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              Go Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;