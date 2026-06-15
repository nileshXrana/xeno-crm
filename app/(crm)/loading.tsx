export default function Loading() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 skeleton rounded-xl" />
        <div className="space-y-2">
          <div className="h-6 w-48 skeleton" />
          <div className="h-4 w-32 skeleton" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 skeleton rounded-2xl" />
        ))}
      </div>
      <div className="h-64 skeleton rounded-2xl" />
    </div>
  );
}
