"use client";

import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface EmptyStateAdvancedProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  subtitle?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
    icon?: ReactNode;
  }>;
  className?: string;
  illustration?: ReactNode;
}

export default function EmptyStateAdvanced({
  icon,
  title,
  description,
  subtitle,
  actions,
  className = "",
  illustration,
}: EmptyStateAdvancedProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-6 animate-in-up">{illustration}</div>
      ) : icon ? (
        <div className="mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-100 flex items-center justify-center text-4xl animate-in-up">
          {icon}
        </div>
      ) : null}

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs font-semibold text-primary/60 uppercase tracking-widest mb-3">
          {subtitle}
        </p>
      )}

      {/* Title */}
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 max-w-md">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-600 text-base max-w-sm mb-8 leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                action.variant === "secondary"
                  ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200"
                  : "bg-primary text-white hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
              }`}
            >
              {action.icon}
              {action.label}
              {action.variant !== "secondary" && <ArrowRight size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
