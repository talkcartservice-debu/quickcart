import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-5xl font-bold text-gray-700 mb-4">404</h1>
      <h2 className="text-2xl text-gray-500 mb-8">Page Not Found</h2>
      <p className="text-gray-400 text-center max-w-md mb-8">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Link href="/">
        <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
          Return Home
        </button>
      </Link>
    </div>
  );
}