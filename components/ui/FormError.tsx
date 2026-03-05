"use client";

import { ReactNode } from "react";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export default function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      className={`text-sm text-red-500 mt-1 flex items-center gap-1 ${className}`}
    >
      <span className="text-red-600">●</span>
      {message}
    </p>
  );
}
