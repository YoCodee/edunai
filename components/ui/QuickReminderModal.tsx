"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { addSingleEvent } from "@/app/dashboard/schedule/actions";

interface QuickReminderModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickReminderModal({
  onClose,
  onSuccess,
}: QuickReminderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: format(new Date(), "HH:mm"),
    endTime: format(new Date(Date.now() + 60 * 60 * 1000), "HH:mm"), // +1 hour
    reminderMinutes: 15,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    const result = await addSingleEvent({
      ...formData,
      location: "",
      description: "Quick reminder added from Overview",
      color: "blue",
      type: "task",
    });

    setIsSubmitting(false);

    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
      // Prompt for notification permission if they selected a reminder
      if (
        formData.reminderMinutes > 0 &&
        "Notification" in window &&
        Notification.permission !== "granted"
      ) {
        Notification.requestPermission();
      }
    } else {
      alert("Gagal menambahkan pengingat: " + result.error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modal = (
    <>
      <style>{`
        @keyframes reminder-modal-backdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes reminder-modal-card { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .reminder-modal-backdrop { animation: reminder-modal-backdrop 0.22s ease forwards; }
        .reminder-modal-card { animation: reminder-modal-card 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        className="reminder-modal-backdrop fixed inset-0 z-9990 flex items-center justify-center p-4"
        style={{
          background: "rgba(15,17,22,0.55)",
          backdropFilter: "blur(8px)",
        }}
        onClick={handleBackdropClick}
      >
        {/* Card */}
        <div
          className="reminder-modal-card w-full max-w-[400px] bg-white rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.22)] overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}
        >
          {/* Header */}
          <div style={{ padding: "22px 24px 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #111827, #374151)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell size={17} color="#fff" />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#111827",
                      lineHeight: 1.2,
                    }}
                  >
                    Quick Reminder
                  </h2>
                  <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>
                    Tambahkan pengingat ke jadwal
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-red-50 hover:text-red-500 transition-all"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid #f3f4f6",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#9ca3af",
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: "18px 24px 24px" }}>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5 ml-1">
                  Kegiatan / Pengingat
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Rapat Organisasi"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="flex text-[12px] font-bold text-gray-700 mb-1.5 ml-1 items-center gap-1.5">
                    <CalendarIcon size={12} className="text-gray-400" /> Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="flex text-[12px] font-bold text-gray-700 mb-1.5 ml-1 items-center gap-1.5">
                      <Clock size={12} className="text-gray-400" /> Mulai
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-center font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-1.5 ml-1 text-center">
                      Selesai
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-center font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Reminder Selection */}
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5 ml-1">
                  Notifikasi Pengingat
                </label>
                <select
                  value={formData.reminderMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reminderMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[13px] rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium appearance-none"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right .5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value={0}>Tidak ada pengingat</option>
                  <option value={5}>5 Menit sebelumnya</option>
                  <option value={10}>10 Menit sebelumnya</option>
                  <option value={15}>15 Menit sebelumnya</option>
                  <option value={30}>30 Menit sebelumnya</option>
                  <option value={60}>1 Jam sebelumnya</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px 20px",
                  background: isSubmitting
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #111827, #374151)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: isSubmitting
                    ? "none"
                    : "0 6px 20px rgba(0,0,0,0.25)",
                  transition: "all 0.2s ease",
                }}
                className="hover:shadow-[0_10px_28px_rgba(0,0,0,0.3)] hover:-translate-y-px disabled:hover:shadow-none disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>Simpan ke Jadwal</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}
