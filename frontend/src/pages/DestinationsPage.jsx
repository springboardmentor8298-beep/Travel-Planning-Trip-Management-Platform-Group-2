import { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import { destinationApi } from '../api/destinationApi';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDestinations = useCallback(async (query) => {
    setIsLoading(true);
    try {
      const { data } = await destinationApi.search({ search: query || undefined, size: 24 });
      setDestinations(data.data.content);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load destinations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDestinations('');
  }, [loadDestinations]);

  const onSubmit = (e) => {
    e.preventDefault();
    loadDestinations(search);
  };

  return (
    <AppLayout>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sunset-600">Explore</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">Destinations</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Browse destinations to inspire your next trip. Pick one when you create a trip.
        </p>
      </header>

      <form onSubmit={onSubmit} className="mb-6 flex max-w-md items-center gap-2">
        <span className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 h-[18px] w-[18px] text-ink-soft/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, city, or country"
            className="w-full rounded-lg border border-voyage-100 bg-white py-2.5 pl-10 pr-3.5 text-[15px] text-ink placeholder:text-ink-soft/40 hover:border-voyage-300"
          />
        </span>
        <button
          type="submit"
          className="rounded-lg bg-voyage-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-voyage-600"
        >
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-voyage-500" />
        </div>
      ) : destinations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-voyage-300 bg-voyage-50/40 p-10 text-center text-sm text-ink-soft">
          No destinations matched your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-voyage-100 bg-white p-5 transition-shadow hover:shadow-ticket"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{d.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-soft">
                    <MapPin className="h-3.5 w-3.5" />
                    {[d.city, d.country].filter(Boolean).join(', ') || 'Location unknown'}
                  </p>
                </div>
                {d.averageRating != null && (
                  <span className="flex items-center gap-1 rounded-full bg-sunset-100 px-2 py-1 text-xs font-semibold text-sunset-600">
                    <Star className="h-3 w-3 fill-current" />
                    {d.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
              {d.description && (
                <p className="mt-3 line-clamp-3 text-sm text-ink-soft">{d.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
