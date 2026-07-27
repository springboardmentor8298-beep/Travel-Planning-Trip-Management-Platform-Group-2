import { forwardRef } from 'react';
import clsx from 'clsx';

const TextareaField = forwardRef(function TextareaField(
  { label, error, className, rows = 3, ...rest },
  ref
) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-soft/40',
          'transition-colors duration-150',
          error ? 'border-red-400' : 'border-voyage-100 hover:border-voyage-300',
          className
        )}
        {...rest}
      />
      {error && <span className="mt-1.5 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
});

export default TextareaField;
