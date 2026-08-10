import React from 'react';
import { Search, Globe, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DestinationSearch = ({ stateValue, onStateChange, onSearch }) => {
  const { t } = useTranslation();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Country (Read-Only) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('destinations.country', { defaultValue: 'Country' })}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value="India"
              readOnly
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 cursor-not-allowed outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
            />
          </div>
        </div>

        {/* State (Optional Input) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('destinations.stateOptional', { defaultValue: 'State (Optional)' })}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={stateValue}
              onChange={(e) => onStateChange && onStateChange(e.target.value)}
              placeholder={t('destinations.searchPlaceholder', { defaultValue: 'e.g., Rajasthan, Kerala, Goa' })}
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-[#0e87da] focus:ring-2 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-slate-800/30"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-2">
        <motion.button
          type="submit"
          whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)" }}
          whileTap={{ scale: 0.98 }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0e87da] hover:bg-[#0c76c0] px-6 text-sm font-bold text-white shadow-sm transition-colors duration-300 w-full sm:w-auto"
        >
          <Search className="h-4 w-4 stroke-[2.2]" />
          <span>{t('destinations.searchButton', { defaultValue: 'Search Destinations' })}</span>
        </motion.button>
      </div>
    </form>
  );
};

export default DestinationSearch;
