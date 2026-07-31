import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DestinationCard = ({ destination, onViewDetails }) => {
  if (!destination) return null;

  const { name, famousFor, shortDescription, thumbnail, image, latitude, longitude } = destination;
  const displayImage = thumbnail || image || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80";

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        <img
          src={displayImage}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Content Area */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          {/* Tag / Location */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-[#0e87da]" />
            <span>India</span>
          </div>

          {/* Name */}
          <h3 className="text-base font-bold text-slate-800 dark:text-white line-clamp-1 leading-snug">
            {name}
          </h3>

          {/* Famous For (Tagline) */}
          {famousFor && (
            <div className="text-[10px] font-bold text-[#0e87da] uppercase tracking-wide">
              Famous For: {famousFor}
            </div>
          )}

          {/* Short Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {shortDescription || 'Information coming soon.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-auto flex gap-3">
          {/* View Details Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewDetails && onViewDetails(destination)}
            className="flex-grow py-2.5 px-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700/50 dark:hover:bg-slate-850/50 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5 group"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          </motion.button>

          {/* View on Map Button */}
          <motion.a
            href={latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!latitude || !longitude) {
                e.preventDefault();
              }
            }}
            whileTap={latitude && longitude ? { scale: 0.98 } : {}}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              latitude && longitude
                ? 'border-sky-100 hover:border-sky-200 hover:bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:hover:border-sky-850/50 dark:text-sky-400 cursor-pointer'
                : 'border-slate-100 bg-slate-50 text-slate-350 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>Map</span>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default DestinationCard;
