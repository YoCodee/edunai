"use client";

import { useState } from "react";
import {
  User,
  Palette,
  Paintbrush,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/components/ui/ThemeContext";

function ColorField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[13px] text-gray-600 font-bold min-w-[120px] uppercase tracking-wider">{label}</span>
      <div className="flex-1 flex gap-3">
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-dash-primary/30 focus:border-dash-primary text-[13px] font-mono font-medium"
        />
        <div 
          className="relative w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden shadow-sm border border-gray-200" 
          style={{ backgroundColor: value }}
        >
          <input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-[-10px] w-[60px] h-[60px] opacity-0 cursor-pointer"
          />
          <Palette size={16} className="mix-blend-difference opacity-70" color="#fff" />
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance");
  const { colors, updateColor, resetToDefault } = useTheme();

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="w-full h-full pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1a1c20] tracking-tight mb-2">
          Settings & Privacy
        </h1>
        <p className="text-gray-500 font-medium text-[15px] max-w-xl">
          Manage your account preferences, notifications, and personalize your
          Edunai experience.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-all text-left",
                    isActive
                      ? "bg-white text-[#38bcfc] shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-100"
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/50 border border-transparent",
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-gray-100/80 rounded-[32px] p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[600px] anim-fade-in relative overflow-hidden">
          {/* Abstract Blur Decor */}
          <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-blue-50 rounded-full blur-[60px] opacity-60 pointer-events-none"></div>

          {activeTab === "profile" && (
            <div className="anim-fade-in relative z-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Profile Information
              </h2>

              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-linear-to-tr from-dash-primary to-brand-300 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-200/50">
                    S
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:text-[#38bcfc] shadow-sm transition-colors">
                    <Paintbrush size={14} />
                  </button>
                </div>
                <div>
                  <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl text-[13px] transition-colors mb-2 block">
                    Upload New Avatar
                  </button>
                  <p className="text-[12px] text-gray-400 font-medium">
                    JPEG or PNG, max 2MB.
                  </p>
                </div>
              </div>

              <div className="space-y-5 max-w-xl">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Student"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="User"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="student@edunai.edu"
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 text-gray-500 text-[14px] rounded-xl px-4 py-3 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    University / School
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 mt-8">
                  <button className="px-6 py-3 bg-[#1a1c20] hover:bg-black text-white font-bold rounded-xl transition-colors shadow-lg shadow-gray-200 flex items-center gap-2">
                    <CheckCircle2 size={18} /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}



          {activeTab === "appearance" && (
            <div className="anim-fade-in relative z-10">
              <div className="flex justify-between items-end mb-8 pt-2">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    Theme Customizer
                  </h2>
                  <p className="text-[13px] text-gray-500 font-medium mt-1">
                    Personalize your workspace colors. Changes are saved automatically.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={resetToDefault}
                    className="px-5 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-[13px] transition-colors"
                  >
                    Reset Defaults
                  </button>
                  <button 
                    className="px-6 py-2.5 text-white font-bold rounded-xl text-[13px] transition-opacity hover:opacity-90 shadow-sm"
                    style={{ backgroundColor: colors.dashPrimary }}
                  >
                    Custom
                  </button>
                </div>
              </div>

              <div className="bg-gray-50/50 border border-gray-100 rounded-[24px] p-8 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                  <ColorField label="Background" value={colors.dashBg} onChange={(v) => updateColor("dashBg", v)} />
                  <ColorField label="Surface" value={colors.dashSurface} onChange={(v) => updateColor("dashSurface", v)} />
                  
                  <ColorField label="Primary" value={colors.dashPrimary} onChange={(v) => updateColor("dashPrimary", v)} />
                  <ColorField label="Secondary Text" value={colors.dashTextSecondary} onChange={(v) => updateColor("dashTextSecondary", v)} />
                  
                  <ColorField label="Primary Text" value={colors.dashTextPrimary} onChange={(v) => updateColor("dashTextPrimary", v)} />
                  <ColorField label="Error / Danger" value={colors.dashDanger} onChange={(v) => updateColor("dashDanger", v)} />

                  <ColorField label="Sidebar" value={colors.dashSidebar} onChange={(v) => updateColor("dashSidebar", v)} />
                  <ColorField label="Border" value={colors.dashBorder} onChange={(v) => updateColor("dashBorder", v)} />
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
