"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: "primary" | "secondary";
  };
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  subtitle,
  action,
  breadcrumbs,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span className="text-gray-400">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="text-primary hover:underline">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs font-semibold text-primary/60 uppercase tracking-widest mb-3">
          {subtitle}
        </p>
      )}

      {/* Title and Action */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 text-base max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {action && (
          <button
            onClick={action.onClick}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              action.variant === "secondary"
                ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                : "bg-primary text-white hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
