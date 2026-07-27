import { forwardRef } from 'react';
import clsx from 'clsx';

const FormField = forwardRef(function FormField(
  { label, error, icon: Icon, type = 'text', className, ...rest },
  ref
) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      <span className="relative flex items-center">
        {Icon && <Icon className="pointer-events-none absolute left-3 h-[18px] w-[18px] text-ink-soft/60" size={18} />}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-soft/40',
            'transition-colors duration-150',
            Icon && 'pl-10',
            error ? 'border-red-400' : 'border-voyage-100 hover:border-voyage-300',
            className
          )}
          {...rest}
        />
      </span>
      {error && <span className="mt-1.5 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
});

export default FormField;
