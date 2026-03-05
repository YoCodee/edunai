"use client";

import React, { ReactNode } from "react";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  variant?: "underline" | "pills" | "cards";
  onChange?: (tabId: string) => void;
  className?: string;
}

export default function Tabs({
  items,
  defaultTab,
  variant = "underline",
  onChange,
  className = "",
}: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || items[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const variantClasses = {
    underline: {
      container: "flex gap-6 border-b border-gray-200",
      button: "pb-3 px-1 border-b-2 font-semibold transition-all",
      active: "border-primary text-primary",
      inactive: "border-transparent text-gray-600 hover:text-gray-900",
    },
    pills: {
      container: "flex gap-2 flex-wrap",
      button: "px-4 py-2 rounded-full font-semibold transition-all",
      active: "bg-primary text-white",
      inactive: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    },
    cards: {
      container: "flex gap-3 flex-wrap",
      button: "px-4 py-3 rounded-lg border font-semibold transition-all",
      active: "bg-primary border-primary text-white",
      inactive: "border-gray-200 text-gray-700 hover:border-gray-300",
    },
  };

  const config = variantClasses[variant];

  return (
    <div className={className}>
      {/* Tab Buttons */}
      <div className={config.container}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`${config.button} ${
              activeTab === item.id ? config.active : config.inactive
            } flex items-center gap-2`}
          >
            {item.icon}
            {item.label}
            {item.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-white/20">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {items.find((item) => item.id === activeTab)?.content}
      </div>
    </div>
  );
}
