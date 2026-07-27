import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
      <Compass className="h-10 w-10 text-voyage-500" />
      <h1 className="font-display text-2xl font-semibold text-ink">Off the map</h1>
      <p className="text-sm text-ink-soft">This page doesn&rsquo;t exist &mdash; let&rsquo;s get you back on route.</p>
      <Link to="/" className="mt-2 text-sm font-semibold text-voyage-500 hover:underline">
        Return home
      </Link>
    </div>
  );
}
