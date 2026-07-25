// Date Helpers for TripNest

/**
 * Computes status of a trip relative to the current date.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {'Upcoming' | 'Active' | 'Completed'}
 */
export const getTripStatus = (startDate, endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (today < start) {
    return 'Upcoming';
  } else if (today > end) {
    return 'Completed';
  } else {
    return 'Active';
  }
};

const getLocale = () => {
  const currentLang = localStorage.getItem('i18nextLng') || 'en';
  if (currentLang === 'hi') return 'hi-IN';
  if (currentLang === 'te') return 'te-IN';
  if (currentLang === 'ta') return 'ta-IN';
  return 'en-IN';
};

/**
 * Formats YYYY-MM-DD to a readable short form e.g. "Jul 5, 2026"
 * @param {string} dateStr 
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(getLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC' // Keep date exact as stored
  });
};

/**
 * Formats a start and end date range beautifully
 * e.g., "Jul 5 - 15, 2026" or "Dec 28, 2025 - Jan 5, 2026"
 */
export const formatDateRange = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return '';
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const locale = getLocale();
  
  const sMonth = start.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' });
  const sDay = start.toLocaleDateString(locale, { day: 'numeric', timeZone: 'UTC' });
  const sYear = start.toLocaleDateString(locale, { year: 'numeric', timeZone: 'UTC' });
  
  const eMonth = end.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' });
  const eDay = end.toLocaleDateString(locale, { day: 'numeric', timeZone: 'UTC' });
  const eYear = end.toLocaleDateString(locale, { year: 'numeric', timeZone: 'UTC' });
  
  if (sYear !== eYear) {
    return `${sMonth} ${sDay}, ${sYear} – ${eMonth} ${eDay}, ${eYear}`;
  }
  if (sMonth !== eMonth) {
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${sYear}`;
  }
  if (sDay === eDay) {
    return `${sMonth} ${sDay}, ${sYear}`;
  }
  return `${sMonth} ${sDay} – ${eDay}, ${sYear}`;
};

/**
 * Returns list of intermediate YYYY-MM-DD date strings between start and end date
 */
export const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  let current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

/**
 * Returns a human-friendly relative time string e.g., "5 mins ago", "Just now"
 * @param {string} isoString 
 */
export const getRelativeTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};
