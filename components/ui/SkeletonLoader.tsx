"use client";

interface SkeletonLoaderProps {
  variant?: "card" | "list" | "text" | "avatar";
  count?: number;
  className?: string;
}

export default function SkeletonLoader({
  variant = "card",
  count = 1,
  className = "",
}: SkeletonLoaderProps) {
  const skeletonVariants = {
    card: (
      <div className={`bg-gray-100 rounded-xl animate-pulse p-4 ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    ),
    list: (
      <div className={`space-y-3 animate-pulse ${className}`}>
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
      </div>
    ),
    text: (
      <div className={`space-y-2 animate-pulse ${className}`}>
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
      </div>
    ),
    avatar: (
      <div className={`animate-pulse ${className}`}>
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
      </div>
    ),
  };

  return skeletonVariants[variant];
}
