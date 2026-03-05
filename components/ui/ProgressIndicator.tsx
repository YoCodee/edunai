"use client";

interface ProgressIndicatorProps {
  label: string;
  value: number;
  max?: number;
  percentage?: number;
  color?: "primary" | "success" | "warning" | "danger";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "linear" | "circular";
}

export default function ProgressIndicator({
  label,
  value,
  max = 100,
  percentage,
  color = "primary",
  showLabel = true,
  size = "md",
  variant = "linear",
}: ProgressIndicatorProps) {
  const actualPercentage = percentage ?? (value / max) * 100;
  const clampedPercentage = Math.min(Math.max(actualPercentage, 0), 100);

  const colorClasses = {
    primary: "from-primary to-blue-400",
    success: "from-green-400 to-emerald-500",
    warning: "from-yellow-400 to-orange-500",
    danger: "from-red-400 to-rose-500",
  };

  const sizeClasses = {
    sm: { height: "h-1", textSize: "text-xs" },
    md: { height: "h-2", textSize: "text-sm" },
    lg: { height: "h-3", textSize: "text-base" },
  };

  if (variant === "circular") {
    const circleSize = size === "sm" ? 40 : size === "md" ? 60 : 80;
    const strokeWidth = 3;
    const normalizedRadius = circleSize / 2 - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset =
      circumference - (clampedPercentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div
          className="relative"
          style={{ width: circleSize, height: circleSize }}
        >
          <svg
            width={circleSize}
            height={circleSize}
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              stroke="#e5e7eb"
              fill="none"
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={normalizedRadius}
              strokeWidth={strokeWidth}
            />
            <circle
              stroke="currentColor"
              fill="none"
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={normalizedRadius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + " " + circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-500 text-${color}-500`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold ${sizeClasses[size].textSize}`}>
              {Math.round(clampedPercentage)}%
            </span>
          </div>
        </div>
        {showLabel && (
          <p className="mt-3 text-sm text-gray-700 font-medium">{label}</p>
        )}
      </div>
    );
  }

  // Linear variant
  return (
    <div>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">{label}</label>
          <span
            className={`${sizeClasses[size].textSize} font-semibold text-gray-900`}
          >
            {Math.round(clampedPercentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size].height}`}
      >
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
