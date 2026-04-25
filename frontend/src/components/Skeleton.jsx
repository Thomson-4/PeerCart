function Pulse({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-elevated/90 ${className}`}
      aria-hidden
    />
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-border-color bg-surface/80">
      <Pulse className="aspect-[4/5] w-full rounded-b-none rounded-t-[1.2rem]" />
      <div className="space-y-3 p-5">
        <Pulse className="h-4 w-[80%]" />
        <Pulse className="h-3 w-1/2" />
        <div className="flex justify-between pt-2">
          <Pulse className="h-8 w-24" />
          <Pulse className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export function FeedGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function NeedCardSkeleton() {
  return (
    <div className="glass-card gradient-stroke space-y-4 p-5">
      <div className="flex gap-3">
        <Pulse className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-4 w-32" />
          <Pulse className="h-3 w-48" />
        </div>
      </div>
      <Pulse className="h-5 w-[75%]" />
      <Pulse className="h-3 w-full" />
      <Pulse className="h-3 w-5/6" />
      <div className="flex justify-between border-t border-border-color/70 pt-4">
        <Pulse className="h-4 w-28" />
        <Pulse className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

export function NeedFeedSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <NeedCardSkeleton key={i} />
      ))}
    </>
  );
}
