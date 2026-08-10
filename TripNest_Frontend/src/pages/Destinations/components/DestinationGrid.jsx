import React from 'react';
import DestinationCard from './DestinationCard';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DestinationGrid = ({ destinations = [], onViewDetails, isLoading, error, hasSearched }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900/20 border border-dashed border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0e87da] mb-4"></div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          {t('destinations.curating', { defaultValue: 'Curating Destinations...' })}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm leading-relaxed">
          {t('destinations.curatingDesc', { defaultValue: 'Retrieving sights from Gemini and historical summaries from Wikipedia.' })}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900/20 border border-dashed border-red-200 dark:border-red-900/40 rounded-3xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 mb-4">
          <Compass className="h-7 w-7 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-bold text-red-600 dark:text-red-400">
          {t('destinations.errorTitle', { defaultValue: 'Something went wrong' })}
        </h3>
        <p className="text-xs text-red-455 dark:text-red-500 mt-1 max-w-sm leading-relaxed">
          {error}
        </p>
      </div>
    );
  }

  if (hasSearched && (!destinations || destinations.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900/20 border border-dashed border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 mb-4">
          <Compass className="h-7 w-7 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-bold text-slate-850 dark:text-white">
          {t('destinations.noDestinationsTitle', { defaultValue: 'No Destinations Found' })}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm leading-relaxed">
          {t('destinations.noDestinationsDesc', { defaultValue: 'No destinations were generated for the specified state. Please try another one.' })}
        </p>
      </motion.div>
    );
  }

  if (!destinations || destinations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900/20 border border-dashed border-[#e5e2dd] dark:border-slate-800/80 rounded-3xl"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 dark:bg-slate-900 text-[#0e87da] mb-4">
          <Compass className="h-7 w-7 stroke-[1.8] animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          {t('destinations.exploreDestinationsTitle', { defaultValue: 'Explore Destinations' })}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm leading-relaxed">
          {t('destinations.exploreDestinationsDesc', { defaultValue: 'Search for destinations to explore India.' })}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {destinations.map((dest) => (
        <DestinationCard
          key={dest.id || dest.name}
          destination={dest}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default DestinationGrid;
