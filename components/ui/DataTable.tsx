"use client";

import { ReactNode } from "react";

interface DataTableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  variant?: "default" | "striped" | "bordered";
  className?: string;
}

export default function DataTable<T extends { id?: string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data available",
  onRowClick,
  variant = "default",
  className = "",
}: DataTableProps<T>) {
  const variantClasses = {
    default: "divide-y divide-gray-100",
    striped: "divide-y divide-gray-100 [&>tr:nth-child(odd)]:bg-gray-50",
    bordered: "divide-y divide-gray-200 border border-gray-200",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-100 rounded-lg animate-pulse"
            ></div>
          ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`py-16 text-center text-gray-500 ${className}`}>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide ${
                  col.align ? alignClasses[col.align] : "text-left"
                }`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={variantClasses[variant]}>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors ${
                onRowClick
                  ? "hover:bg-primary/5 cursor-pointer"
                  : "hover:bg-gray-50"
              }`}
            >
              {columns.map((col) => (
                <td
                  key={`${row.id || idx}-${String(col.key)}`}
                  className={`px-6 py-4 text-sm text-gray-900 ${
                    col.align ? alignClasses[col.align] : "text-left"
                  }`}
                >
                  {col.render?.(row[col.key], row) ?? (
                    <span>{String(row[col.key] ?? "-")}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
