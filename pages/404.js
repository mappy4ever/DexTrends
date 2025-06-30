import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-4 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}