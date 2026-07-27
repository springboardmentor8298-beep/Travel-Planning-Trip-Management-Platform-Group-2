import { forwardRef } from 'react';
import clsx from 'clsx';

const SelectField = forwardRef(function SelectField(
  { label, error, className, children, ...rest },
  ref
) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      <select
        ref={ref}
        className={clsx(
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink',
          'transition-colors duration-150',
          error ? 'border-red-400' : 'border-voyage-100 hover:border-voyage-300',
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="mt-1.5 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
});

export default SelectField;
