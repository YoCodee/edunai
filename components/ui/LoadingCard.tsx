"use client";

interface LoadingCardProps {
  variant?: "card" | "board" | "list-item" | "form";
  count?: number;
  className?: string;
}

export default function LoadingCard({
  variant = "card",
  count = 1,
  className = "",
}: LoadingCardProps) {
  const variants = {
    card: (
      <div
        className={`bg-white rounded-2xl p-6 border border-gray-100 ${className}`}
      >
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          </div>
          <div className="flex gap-2 pt-4">
            <div className="h-8 bg-gray-200 rounded-lg flex-1 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded-lg flex-1 animate-pulse"></div>
          </div>
        </div>
      </div>
    ),
    board: (
      <div
        className={`bg-white rounded-2xl p-4 border border-gray-100 ${className}`}
      >
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded-lg w-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
          <div className="flex gap-1 pt-2">
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    ),
    "list-item": (
      <div
        className={`bg-white rounded-lg p-4 border border-gray-100 flex gap-4 ${className}`}
      >
        <div className="h-12 w-12 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
    ),
    form: (
      <div className={`space-y-4 ${className}`}>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
      </div>
    ),
  };

  if (count === 1) {
    return variants[variant];
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i}>{variants[variant]}</div>
        ))}
    </div>
  );
}
