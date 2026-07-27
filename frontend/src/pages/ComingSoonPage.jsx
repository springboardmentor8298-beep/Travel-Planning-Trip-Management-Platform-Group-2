import AppLayout from '../components/layout/AppLayout';

export default function ComingSoonPage({ title, milestone, description }) {
  return (
    <AppLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-voyage-300 bg-voyage-50/40 px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sunset-600">
          {milestone}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-ink-soft">{description}</p>
      </div>
    </AppLayout>
  );
}
