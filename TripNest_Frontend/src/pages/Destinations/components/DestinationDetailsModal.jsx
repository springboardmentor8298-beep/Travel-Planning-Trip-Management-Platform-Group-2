import React from 'react';
import { X, MapPin, Sparkles, Navigation, Info, Landmark, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DestinationDetailsModal = ({ destination, onClose }) => {
  const { t } = useTranslation();
  if (!destination) return null;

  const {
    name = '',
    famousFor = '',
    shortDescription = '',
    fullDescription = '',
    thumbnail = '',
    image = '',
    latitude = null,
    longitude = null,
    wikipediaUrl = ''
  } = destination;

  const coverImage = image || thumbnail || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        />

        {/* Modal container (Slide-out from Right side panel) */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative z-10 w-full max-w-2xl h-full bg-[#fcfbf9] dark:bg-[#0b0e14] border-l border-[#e5e2dd] dark:border-slate-800/80 shadow-2xl flex flex-col"
        >
          {/* Header Controls */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e2dd] bg-white text-slate-655 hover:bg-slate-50 transition-colors shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-850"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content wrapper */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Image Header Banner */}
            <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-950">
              <img
                src={coverImage}
                alt={name}
                className="w-full h-full object-cover"
              />
              {/* Image Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#fcfbf9] via-transparent to-transparent dark:from-[#0b0e14] opacity-100" />
            </div>

            {/* Core Info */}
            <div className="px-6 sm:px-8 pb-12 -mt-10 relative z-10 space-y-8">
              {/* Title & Location block */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0e87da]">
                  <MapPin className="w-4 h-4" />
                  <span>India</span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {name || 'Destination Name'}
                </h2>
              </div>

              {/* Grid content columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Famous For Section */}
                <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>{t('destinations.famousForModal', { defaultValue: 'Famous For' })}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 font-medium leading-relaxed">
                    {famousFor || 'N/A'}
                  </p>
                </div>

                {/* Coordinates Section */}
                <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[#0e87da] font-bold text-xs uppercase tracking-wider">
                    <Navigation className="w-4 h-4" />
                    <span>{t('destinations.coordinates', { defaultValue: 'Coordinates' })}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 font-medium leading-relaxed">
                    {latitude !== null && longitude !== null ? `${latitude}, ${longitude}` : t('destinations.notAvailable', { defaultValue: 'Not Available' })}
                  </p>
                </div>
              </div>

              {/* Full Width Short Description */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>{t('destinations.overview', { defaultValue: 'Overview' })}</span>
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {shortDescription || t('destinations.infoComingSoon', { defaultValue: 'Information coming soon.' })}
                </p>
              </div>

              {/* Detailed Description */}
              <div className="border-t border-[#e5e2dd] dark:border-slate-800/60 pt-6 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {t('destinations.detailedHistory', { defaultValue: 'Detailed History & Info' })}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                    {fullDescription || t('destinations.infoComingSoon', { defaultValue: 'Information coming soon.' })}
                  </p>
                </div>

                {/* Wikipedia Link Button */}
                {wikipediaUrl && (
                  <div className="pt-2">
                    <a
                      href={wikipediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                    >
                      <Landmark className="w-4 h-4" />
                      <span>{t('destinations.readMoreWiki', { defaultValue: 'Read More on Wikipedia' })}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DestinationDetailsModal;
