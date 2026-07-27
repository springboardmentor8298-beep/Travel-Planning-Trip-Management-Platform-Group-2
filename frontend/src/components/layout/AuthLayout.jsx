import { Plane } from 'lucide-react';

/**
 * Signature visual: a boarding-pass stub. The left panel reads like the
 * torn half of a ticket — route line, gate/seat-style metadata, perforated
 * divider — which is the one deliberate flourish on otherwise quiet,
 * functional auth screens.
 */
export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-ticket">
        {/* Stub panel */}
        <div className="relative hidden w-[38%] flex-col justify-between bg-voyage-500 p-8 text-white md:flex">
          <div>
            <div className="flex items-center gap-2 text-lg font-display font-semibold tracking-tight">
              <Plane className="h-5 w-5 rotate-45" strokeWidth={2.5} />
              TripNest
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-voyage-100/80">
              Boarding pass
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between font-mono text-xs text-voyage-100/90">
              <div>
                <p className="text-2xl font-display text-white">HOME</p>
                <p className="mt-1 tracking-wide">Where you are</p>
              </div>
              <div className="flex-1 px-3">
                <div className="relative h-px bg-voyage-100/40">
                  <Plane className="absolute -top-2 right-0 h-4 w-4 -rotate-0 text-sunset-300" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-display text-white">NEXT</p>
                <p className="mt-1 tracking-wide">Where you&rsquo;re going</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-dashed border-voyage-100/30 pt-4 font-mono text-[11px] text-voyage-100/80">
              <div>
                <p className="uppercase tracking-widest text-voyage-100/50">Passenger</p>
                <p className="mt-1 text-sm text-white">You</p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-voyage-100/50">Status</p>
                <p className="mt-1 text-sm text-white">Planning</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-voyage-100/70">
            Itineraries, budgets, and group trips, organized in one place.
          </p>

          {/* Perforated divider suggesting a tear-off stub */}
          <div className="absolute right-0 top-0 h-full w-px">
            <div className="perforated h-full w-px text-voyage-100" />
          </div>
        </div>

        {/* Form panel */}
        <div className="flex-1 p-8 sm:p-10">
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sunset-600">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-display font-semibold text-ink sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
