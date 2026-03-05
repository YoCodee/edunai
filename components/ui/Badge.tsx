"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "muted";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  className?: string;
}

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
}: BadgeProps) {
  const variantClasses = {
    primary: "bg-blue-100 text-blue-800 border border-blue-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    danger: "bg-red-100 text-red-800 border border-red-200",
    muted: "bg-gray-100 text-gray-800 border border-gray-200",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </span>
  );
}
