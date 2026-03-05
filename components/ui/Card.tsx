"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "interactive" | "elevated" | "outlined";
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export default function Card({
  children,
  variant = "default",
  padding = "md",
  onClick,
  className = "",
  header,
  footer,
}: CardProps) {
  const variantClasses = {
    default: "bg-white border border-gray-200 shadow-sm",
    interactive:
      "bg-white border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-shadow",
    elevated: "bg-white shadow-lg border border-gray-100",
    outlined: "bg-transparent border-2 border-gray-300",
  };

  const paddingClasses = {
    sm: "p-3",
    md: "p-4 md:p-6",
    lg: "p-6 md:p-8",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-200 ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
    >
      {header && (
        <div className="mb-4 pb-4 border-b border-gray-200">{header}</div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>
      )}
    </div>
  );
}
