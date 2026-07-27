import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  className,
  disabled,
  ...rest
}) {
  const variants = {
    primary:
      'bg-voyage-500 text-white hover:bg-voyage-600 shadow-sm shadow-voyage-500/20',
    secondary:
      'bg-white text-ink border border-voyage-100 hover:border-voyage-300',
    ghost: 'bg-transparent text-voyage-500 hover:bg-voyage-50'
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold',
        'transition-all duration-150 active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
