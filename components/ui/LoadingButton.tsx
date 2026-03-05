"use client";

import { ReactNode } from "react";

interface LoadingButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function LoadingButton({
  children,
  isLoading = false,
  disabled = false,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: LoadingButtonProps) {
  const variantClasses = {
    primary: "bg-primary text-white hover:opacity-90",
    secondary: "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900",
    danger: "bg-red-500 text-white hover:opacity-90",
  };

  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`px-6 py-2 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 ${variantClasses[variant]} ${
        isLoading || disabled ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      )}
      {children}
    </button>
  );
}
