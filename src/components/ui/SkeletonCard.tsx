export function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs animate-pulse">
      <div className="aspect-[16/10] w-full bg-gray-200" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-1/2 rounded-md bg-gray-200" />
          <div className="h-5 w-12 rounded-md bg-gray-200" />
        </div>
        <div className="h-4 w-1/3 rounded-md bg-gray-200" />
        <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
          <div className="h-4 w-3/4 rounded-md bg-gray-200" />
          <div className="h-4 w-1/2 ml-auto rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
