"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Palette,
  Shield,
  CreditCard,
  Paintbrush,
  Moon,
  Sun,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing & Plan", icon: CreditCard },
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
          <nav className="flex flex-col gap-1 sticky top-[100px]">
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
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#fca03e] to-orange-300 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-orange-200/50">
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

          {activeTab === "notifications" && (
            <div className="anim-fade-in relative z-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-6 max-w-xl">
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                  <div>
                    <h4 className="font-bold text-gray-900 text-[15px] mb-1">
                      AI Task Breakdowns
                    </h4>
                    <p className="text-gray-500 text-[13px]">
                      Get notified when AI finishes analyzing your syllabus.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                  <div>
                    <h4 className="font-bold text-gray-900 text-[15px] mb-1">
                      Group Project Updates
                    </h4>
                    <p className="text-gray-500 text-[13px]">
                      Alerts for task assignments and list movements.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                  <div>
                    <h4 className="font-bold text-gray-900 text-[15px] mb-1">
                      Schedule Reminders
                    </h4>
                    <p className="text-gray-500 text-[13px]">
                      Upcoming class and meeting alerts 30 minutes before.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="anim-fade-in relative z-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Appearance
              </h2>
              <p className="text-gray-500 text-[14px] mb-6">
                Customize how Edunai looks on your device.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                <div className="border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-blue-500 ring-2 ring-transparent bg-white group hover:shadow-md transition-all text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Sun size={20} />
                  </div>
                  <span className="font-bold text-gray-900 block text-[14px]">
                    Light Mode
                  </span>
                  <span className="text-[12px] text-gray-500">Active</span>
                </div>

                <div className="border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-gray-400 opacity-60 bg-gray-50 text-center">
                  <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Moon size={20} />
                  </div>
                  <span className="font-bold text-gray-900 block text-[14px]">
                    Dark Mode
                  </span>
                  <span className="text-[12px] text-gray-500">Coming Soon</span>
                </div>

                <div className="border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-gray-400 opacity-60 bg-gray-50 text-center">
                  <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Smartphone size={20} />
                  </div>
                  <span className="font-bold text-gray-900 block text-[14px]">
                    System Context
                  </span>
                  <span className="text-[12px] text-gray-500">Coming Soon</span>
                </div>
              </div>
            </div>
          )}

          {(activeTab === "security" || activeTab === "billing") && (
            <div className="anim-fade-in relative z-10 h-full flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-6 shadow-inner">
                {activeTab === "security" ? (
                  <Shield size={32} />
                ) : (
                  <CreditCard size={32} />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Module under development
              </h3>
              <p className="text-gray-400 text-center max-w-sm">
                This section is currently being updated to provide you with the
                best experience.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
