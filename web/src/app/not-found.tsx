import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-extrabold text-emerald-600 mb-4">404</p>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-slate-500 mb-8">The page you are looking for does not exist.</p>
      <Link href="/" className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700">
        Go Home
      </Link>
    </div>
  );
}
