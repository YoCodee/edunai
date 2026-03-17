export default function DashboardLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Page title skeleton */}
      <div className="mb-8">
        <div className="h-8 w-56 bg-dash-surface rounded-xl mb-3" />
        <div className="h-4 w-80 bg-dash-surface rounded-lg" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-dash-surface border border-dash-border rounded-2xl p-5 h-[110px]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-20 bg-dash-border rounded-md" />
              <div className="w-9 h-9 bg-dash-border rounded-xl" />
            </div>
            <div className="h-7 w-16 bg-dash-border rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large card */}
        <div className="lg:col-span-2 bg-dash-surface border border-dash-border rounded-[24px] p-6 h-[320px]">
          <div className="h-5 w-40 bg-dash-border rounded-lg mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-dash-border rounded-xl shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-dash-border rounded-md mb-2" />
                  <div className="h-3 w-1/2 bg-dash-border rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side card */}
        <div className="bg-dash-surface border border-dash-border rounded-[24px] p-6 h-[320px]">
          <div className="h-5 w-32 bg-dash-border rounded-lg mb-6" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-dash-border rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
