import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast = () => {
  const { notifications, dismissNotification } = useAppContext();

  if (notifications.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'border-emerald-100 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300';
      case 'warning': return 'border-amber-100 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300';
      case 'error': return 'border-rose-100 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300';
      case 'info':
      default:
        return 'border-sky-100 bg-sky-50 text-sky-800 dark:bg-sky-950/30 dark:border-sky-900/50 dark:text-sky-300';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg glass-panel animate-slide-in-right ${getBorderColor(notif.type)}`}
          role="alert"
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notif.type)}
          </div>
          <div className="flex-grow text-sm font-medium">
            {notif.message}
          </div>
          <button
            onClick={() => dismissNotification(notif.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
