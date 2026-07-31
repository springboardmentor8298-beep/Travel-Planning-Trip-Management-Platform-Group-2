import React, { useState } from 'react';
import DestinationSearch from './components/DestinationSearch';
import DestinationGrid from './components/DestinationGrid';
import DestinationDetailsModal from './components/DestinationDetailsModal';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDestinations } from '../../services/destinationService';

const DestinationsPage = () => {
  const [stateName, setStateName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const trimmedState = stateName.trim();
    if (!trimmedState) {
      setError('Please enter a state name to search.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchResults([]);

    try {
      const response = await getDestinations(trimmedState);
      if (response && response.success) {
        setSearchResults(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch destinations.');
      }
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Title & Header */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 dark:bg-slate-900/50 text-[#0e87da] border border-[#e5e2dd]/60 dark:border-slate-800/40">
            <Compass className="h-4.5 w-4.5 stroke-[1.8]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            Discover
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Explore India
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Discover famous tourist destinations across India.
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <DestinationSearch
        stateValue={stateName}
        onStateChange={setStateName}
        onSearch={handleSearch}
      />

      {/* Results Header (Optional context for layout separation) */}
      <div className="border-t border-[#e5e2dd]/60 dark:border-slate-800/50 pt-8">
        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
          Destinations
        </h3>

        {/* Results / Empty state grid */}
        <DestinationGrid
          destinations={searchResults}
          onViewDetails={setSelectedDestination}
          isLoading={isLoading}
          error={error}
          hasSearched={hasSearched}
        />
      </div>

      {/* Details Side Drawer Modal - Only rendered when destination is selected */}
      {selectedDestination && (
        <DestinationDetailsModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
        />
      )}
    </div>
  );
};

export default DestinationsPage;
