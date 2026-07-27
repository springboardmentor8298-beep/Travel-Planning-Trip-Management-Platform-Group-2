import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ title, onClose, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4 py-8">
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-ticket sm:p-8`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-soft hover:bg-voyage-50 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
