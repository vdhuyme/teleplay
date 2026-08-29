import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="text-lg text-neutral-400">Player not found</p>
      <Link
        href="/players"
        className="mt-4 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105"
      >
        Back to Players
      </Link>
    </div>
  );
}
