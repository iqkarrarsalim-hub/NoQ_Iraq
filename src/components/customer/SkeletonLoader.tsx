export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 p-4 space-y-3 animate-pulse">
      <div className="aspect-[4/3] bg-slate-200 rounded-2xl w-full" />
      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
      <div className="h-3 bg-slate-200 rounded-md w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-slate-200 rounded-md w-1/3" />
        <div className="h-8 bg-slate-200 rounded-xl w-20" />
      </div>
    </div>
  );
}

export function ListingDetailSkeleton() {
  return (
    <div className="space-y-4 max-w-md mx-auto animate-pulse">
      <div className="aspect-[16/10] bg-slate-200 rounded-3xl w-full" />
      <div className="bg-white p-5 rounded-3xl border border-gray-100 space-y-3">
        <div className="h-6 bg-slate-200 rounded-md w-2/3" />
        <div className="h-4 bg-slate-200 rounded-md w-1/3" />
        <div className="h-16 bg-slate-100 rounded-2xl w-full mt-2" />
      </div>
    </div>
  );
}
