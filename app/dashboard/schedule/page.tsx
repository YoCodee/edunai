"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
  addMonths,
  endOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MoreVertical,
  MapPin,
  CheckCircle2,
  X,
  Loader2,
  Bell,
  BellOff,
  BellRing,
} from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import { addFixedClass, addSingleEvent } from "./actions";
import BulkImportModal from "./BulkImportModal";
import { FileSpreadsheet } from "lucide-react";

/* ──────────────────────────────────────────
   Types
────────────────────────────────────────── */
interface EventData {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  color: string;
  event_type: "class" | "exam" | "meeting" | "task";
  reminder_minutes?: number | null;
}

interface ReminderToast {
  id: string;
  title: string;
  startTime: string;
  minutesBefore: number;
}

/* ──────────────────────────────────────────
   Constants
────────────────────────────────────────── */
const REMINDER_OPTIONS = [
  { value: 0, label: "No reminder" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 1440, label: "1 day before" },
];

const COLOR_OPTIONS = [
  { value: "blue", label: "Blue", bg: "bg-blue-500" },
  { value: "purple", label: "Purple", bg: "bg-purple-500" },
  { value: "green", label: "Green", bg: "bg-green-500" },
  { value: "orange", label: "Orange", bg: "bg-brand-500" },
];

/* ──────────────────────────────────────────
   Component
────────────────────────────────────────── */
export default function SmartSchedulerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMode, setModalMode] = useState<"single" | "recurring">("single");

  // Notification permission
  const [notifPermission, setNotifPermission] =
    useState<NotificationPermission>("default");

  // In-app reminder toasts
  const [toasts, setToasts] = useState<ReminderToast[]>([]);
  const scheduledReminders = useRef<Set<string>>(new Set());
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Single Event Form
  const [singleEvent, setSingleEvent] = useState({
    title: "",
    location: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:30",
    color: "blue",
    type: "class" as "class" | "exam" | "meeting" | "task",
    reminderMinutes: 15,
  });

  // Fixed (recurring) Class State
  const [fixedClass, setFixedClass] = useState({
    title: "",
    location: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:30",
    color: "blue",
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Calendar
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));
  const changeWeek = (offset: number) =>
    setCurrentDate(addDays(currentDate, offset * 7));

  /* ── Fetch Events ── */
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true });
      if (!error && data) setEvents(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /* ── Notification Permission ── */
  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const requestNotifPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  /* ── Schedule Browser Reminders for all events ── */
  const scheduleReminder = useCallback((event: EventData) => {
    const reminderMin = event.reminder_minutes;
    if (!reminderMin || reminderMin === 0) return;

    const key = `${event.id}-${reminderMin}`;
    if (scheduledReminders.current.has(key)) return;

    const eventStart = parseISO(event.start_time);
    const reminderAt = new Date(eventStart.getTime() - reminderMin * 60 * 1000);
    const msUntilReminder = reminderAt.getTime() - Date.now();

    if (msUntilReminder < 0) return; // Already past

    scheduledReminders.current.add(key);

    const timer = setTimeout(() => {
      // 1. Browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`⏰ Upcoming: ${event.title}`, {
          body: `Starts at ${format(eventStart, "HH:mm")} — ${reminderMin < 60 ? `${reminderMin} min` : `${reminderMin / 60}h`} from now${event.location ? ` · ${event.location}` : ""}`,
          icon: "/favicon.ico",
          tag: key,
        });
      }

      // 2. In-app toast
      const toast: ReminderToast = {
        id: key,
        title: event.title,
        startTime: format(eventStart, "HH:mm"),
        minutesBefore: reminderMin,
      };
      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss toast after 10s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== key));
      }, 10000);
    }, msUntilReminder);

    timerRefs.current.set(key, timer);
  }, []);

  useEffect(() => {
    events.forEach(scheduleReminder);
    // Cleanup on unmount
    return () => {
      timerRefs.current.forEach((t) => clearTimeout(t));
    };
  }, [events, scheduleReminder]);

  /* ── Submit Form ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (modalMode === "single") {
      if (!singleEvent.title.trim()) {
        setFormError("Please enter an event title");
        return;
      }
      if (singleEvent.startTime >= singleEvent.endTime) {
        setFormError("Start time must be before end time");
        return;
      }

      setIsSubmitting(true);
      const result = await addSingleEvent({
        title: singleEvent.title,
        location: singleEvent.location,
        description: singleEvent.description,
        date: singleEvent.date,
        startTime: singleEvent.startTime,
        endTime: singleEvent.endTime,
        color: singleEvent.color,
        type: singleEvent.type,
        reminderMinutes: singleEvent.reminderMinutes,
      });

      if (result.success) {
        setIsModalOpen(false);
        await fetchEvents();
        setSingleEvent({
          ...singleEvent,
          title: "",
          location: "",
          description: "",
        });

        // Prompt notification permission if not granted
        if (singleEvent.reminderMinutes > 0 && notifPermission !== "granted") {
          await requestNotifPermission();
        }
      } else {
        setFormError(result.error || "Failed to add event");
      }
    } else {
      if (!fixedClass.title.trim()) {
        setFormError("Please enter a class title");
        return;
      }
      if (fixedClass.startTime >= fixedClass.endTime) {
        setFormError("Start time must be before end time");
        return;
      }

      setIsSubmitting(true);
      const result = await addFixedClass({
        title: fixedClass.title,
        location: fixedClass.location,
        startDate: fixedClass.startDate,
        startTime: fixedClass.startTime,
        endTime: fixedClass.endTime,
        color: fixedClass.color,
      });

      if (result.success) {
        setIsModalOpen(false);
        await fetchEvents();
        setFixedClass({ ...fixedClass, title: "", location: "" });
      } else {
        setFormError(result.error || "Failed to add weekly classes");
      }
    }

    setIsSubmitting(false);
  };

  /* ── Delete Event ── */
  const handleDeleteEvent = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) setEvents(events.filter((ev) => ev.id !== id));
  };

  /* ── Filters ── */
  const dailyEvents = events.filter((ev) =>
    isSameDay(parseISO(ev.start_time), currentDate),
  );
  const currentDateStart = new Date();
  currentDateStart.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .filter((ev) => new Date(ev.start_time) >= currentDateStart)
    .slice(0, 8);

  /* ──────────────────────────────────────────
     Render
  ────────────────────────────────────────── */
  return (
    <div className="flex h-full font-sans  relative">
      {/* ── In-App Reminder Toasts ── */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-white border border-brand-200 shadow-xl rounded-2xl p-4 max-w-[320px] animate-in slide-in-from-right"
          >
            <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
              <BellRing size={16} className="text-brand-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-800 truncate">
                {toast.title}
              </p>
              <p className="text-[12px] text-gray-500 mt-0.5">
                Starts at {toast.startTime} ·{" "}
                {toast.minutesBefore < 60
                  ? `${toast.minutesBefore} min`
                  : `${toast.minutesBefore / 60}h`}{" "}
                from now
              </p>
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="shrink-0 text-gray-300 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Left: Main Schedule ── */}
      <div className="flex-1 flex flex-col pt-6 pr-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 mb-2">
              Smart Scheduler
            </h1>
            <p className="text-[14px] text-gray-500">
              Manage your academic life · reminders keep you on track.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification permission button */}
            <button
              onClick={requestNotifPermission}
              title={
                notifPermission === "granted"
                  ? "Browser notifications enabled"
                  : notifPermission === "denied"
                    ? "Notifications blocked — enable in browser settings"
                    : "Enable browser notifications for reminders"
              }
              className={clsx(
                "p-2.5 rounded-xl border transition-colors",
                notifPermission === "granted"
                  ? "border-green-200 bg-green-50 text-green-600"
                  : notifPermission === "denied"
                    ? "border-red-200 bg-red-50 text-red-400"
                    : "border-gray-200 bg-white text-gray-400 hover:text-brand-500 hover:border-brand-300",
              )}
            >
              {notifPermission === "granted" ? (
                <Bell size={16} />
              ) : notifPermission === "denied" ? (
                <BellOff size={16} />
              ) : (
                <Bell size={16} />
              )}
            </button>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet size={15} className="text-gray-500" /> Bulk
              Import
            </button>
            <button
              onClick={() => {
                setIsModalOpen(true);
                setModalMode("single");
              }}
              className="bg-[#1a1c20] hover:bg-[#2a2c30] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> New Event
            </button>
          </div>
        </div>

        {/* Weekly Navigator */}
        <div className="bg-white border border-gray-100/80 rounded-[24px] p-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] mb-8 flex items-center justify-between">
          <button
            onClick={() => changeWeek(-1)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2 sm:gap-4 lg:gap-8 mx-auto overflow-x-auto custom-scrollbar px-2">
            {weekDays.map((date, i) => {
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, currentDate);
              const hasEvents = events.some((ev) =>
                isSameDay(parseISO(ev.start_time), date),
              );
              return (
                <button
                  key={i}
                  onClick={() => setCurrentDate(date)}
                  className={clsx(
                    "flex flex-col items-center justify-center w-12 h-16 sm:w-14 sm:h-20 rounded-2xl transition-all relative group",
                    isSelected
                      ? "bg-[#1a1c20] text-white shadow-md scale-110 z-10"
                      : "bg-transparent text-gray-400 hover:bg-gray-50",
                  )}
                >
                  <span
                    className={clsx(
                      "text-[11px] font-bold uppercase mb-1",
                      isSelected ? "text-gray-300" : "",
                    )}
                  >
                    {format(date, "EEE")}
                  </span>
                  <span
                    className={clsx(
                      "text-[18px] sm:text-[22px] font-bold",
                      isSelected ? "text-white" : "text-gray-900",
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  {isToday && !isSelected && (
                    <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-dash-primary" />
                  )}
                  {hasEvents && !isSelected && (
                    <span className="absolute bottom-2 w-1 h-1 rounded-full bg-gray-300" />
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => changeWeek(1)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Daily Timeline */}
        <div className="flex-1 bg-white border border-gray-100/80 rounded-[32px] p-8 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-dash-primary/10 to-transparent rounded-bl-[100px] pointer-events-none" />
          <div className="mb-8 flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900">
                {format(currentDate, "EEEE, MMMM do")}
              </h2>
              <p className="text-[13px] text-gray-500 mt-1">
                {isLoading
                  ? "Loading..."
                  : `${dailyEvents.length} event${dailyEvents.length !== 1 ? "s" : ""} scheduled`}
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wide rounded-lg">
              Daily Timeline
            </span>
          </div>

          <div className="relative z-10 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-10 h-64 text-center">
                <Loader2 className="w-8 h-8 text-dash-primary animate-spin mb-4" />
                <h3 className="text-gray-500 font-medium">
                  Loading schedule...
                </h3>
              </div>
            ) : (
              <div className="relative mt-2" style={{ height: `${19 * 80}px` }}>
                {/* Hour gridlines */}
                {Array.from({ length: 19 }, (_, i) => i + 6).map(
                  (hour, index) => (
                    <div
                      key={hour}
                      className="absolute w-full flex items-start pointer-events-none"
                      style={{ top: `${index * 80}px`, height: "80px" }}
                    >
                      <div className="w-16 shrink-0 text-right pr-4 pt-0">
                        <span className="text-[12px] font-bold text-gray-400">
                          {hour === 24
                            ? "00:00"
                            : `${hour.toString().padStart(2, "0")}:00`}
                        </span>
                      </div>
                      <div className="flex-1 border-t border-gray-100/80 w-full relative">
                        {hour !== 24 && (
                          <div className="absolute top-1/2 left-0 w-full border-t border-gray-50/50 border-dashed" />
                        )}
                      </div>
                    </div>
                  ),
                )}

                {/* Current time indicator */}
                {isSameDay(currentDate, new Date()) &&
                  new Date().getHours() >= 6 && (
                    <div
                      className="absolute left-16 right-0 border-t-2 border-red-400 z-20 pointer-events-none"
                      style={{
                        top: `${(new Date().getHours() - 6 + new Date().getMinutes() / 60) * 80}px`,
                      }}
                    >
                      <div className="absolute -left-2 -top-[5px] w-2.5 h-2.5 bg-red-400 rounded-full" />
                    </div>
                  )}

                {/* Events */}
                <div className="absolute top-0 bottom-0 left-16 right-0 z-10">
                  {dailyEvents.map((event) => {
                    const evStart = parseISO(event.start_time);
                    const evEnd = parseISO(event.end_time);
                    const startH = evStart.getHours();
                    const startM = evStart.getMinutes();
                    let endH = evEnd.getHours();
                    let endM = evEnd.getMinutes();

                    if (startH < 6 && endH <= 6 && (endH !== 0 || endM !== 0))
                      return null;
                    if (endH === 0 && endM === 0 && evEnd > evStart) endH = 24;

                    const adjStartH = Math.max(startH, 6);
                    const adjStartM = startH < 6 ? 0 : startM;
                    const topPos = (adjStartH - 6 + adjStartM / 60) * 80;
                    const adjEndH = Math.min(endH, 24);
                    const durationH =
                      adjEndH + endM / 60 - (adjStartH + adjStartM / 60);
                    if (durationH <= 0) return null;

                    const colorConfig =
                      {
                        blue: "bg-blue-50/90 border-y border-r border-blue-200 text-blue-900 border-l-[4px] border-l-blue-500",
                        orange:
                          "bg-brand-50/90 border-y border-r border-brand-200 text-brand-900 border-l-[4px] border-l-brand-500",
                        green:
                          "bg-green-50/90 border-y border-r border-green-200 text-green-900 border-l-[4px] border-l-green-500",
                        purple:
                          "bg-purple-50/90 border-y border-r border-purple-200 text-purple-900 border-l-[4px] border-l-purple-500",
                      }[event.color] ||
                      "bg-gray-50/90 border-y border-r border-gray-200 text-gray-900 border-l-[4px] border-l-gray-500";

                    return (
                      <div
                        key={event.id}
                        className={clsx(
                          "absolute left-2 right-4 rounded-md p-2 shadow-sm transition-all hover:shadow-md cursor-pointer hover:z-20 overflow-hidden backdrop-blur-sm group",
                          colorConfig,
                        )}
                        style={{
                          top: `${topPos + 1}px`,
                          height: `${Math.max(durationH * 80 - 2, 24)}px`,
                        }}
                      >
                        <h4 className="text-[13px] font-bold truncate leading-tight flex items-start justify-between gap-2">
                          <span className="truncate flex items-center gap-1">
                            {event.reminder_minutes ? (
                              <Bell size={10} className="shrink-0 opacity-60" />
                            ) : null}
                            {event.title}
                          </span>
                          <button
                            onClick={(e) => handleDeleteEvent(event.id, e)}
                            className="text-gray-400 hover:text-red-500 bg-white/50 hover:bg-red-50 rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-200"
                          >
                            <X size={12} />
                          </button>
                        </h4>
                        {durationH >= 0.75 && (
                          <div className="mt-1">
                            <p className="text-[11px] font-medium opacity-80 mt-0.5 truncate flex items-center gap-1">
                              {format(evStart, "HH:mm")} –{" "}
                              {format(evEnd, "HH:mm")}
                            </p>
                            {event.location && (
                              <p className="text-[11px] font-medium opacity-80 mt-0.5 truncate flex items-center gap-1">
                                <MapPin size={10} /> {event.location}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="w-80 bg-white border-l border-gray-100/80 p-6 flex flex-col pt-10">
        {/* Mini Month Calendar */}
        <div className="mb-8">
          <h3 className="text-[14px] font-bold text-gray-900 mb-4 flex justify-between items-center">
            <span>{format(currentDate, "MMMM yyyy")}</span>
            <div className="flex gap-2">
              <ChevronLeft
                size={16}
                className="text-gray-400 hover:text-black cursor-pointer"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              />
              <ChevronRight
                size={16}
                className="text-gray-400 hover:text-black cursor-pointer"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              />
            </div>
          </h3>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-gray-400">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {(() => {
              const monthStart = startOfMonth(currentDate);
              const monthEnd = endOfMonth(currentDate);
              const startDateMonth = startOfWeek(monthStart, {
                weekStartsOn: 0,
              });
              const endDateMonth = endOfWeek(monthEnd, { weekStartsOn: 0 });
              return eachDayOfInterval({
                start: startDateMonth,
                end: endDateMonth,
              }).map((date, i) => {
                const isSelected = isSameDay(date, currentDate);
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();
                const hasEv = events.some((ev) =>
                  isSameDay(parseISO(ev.start_time), date),
                );
                return (
                  <div
                    key={i}
                    onClick={() => setCurrentDate(date)}
                    className={clsx(
                      "w-8 h-8 flex flex-col items-center justify-center rounded-lg text-[12px] font-medium mx-auto cursor-pointer transition-colors relative",
                      !isCurrentMonth
                        ? "text-gray-300"
                        : isSelected
                          ? "bg-dash-primary text-white font-bold"
                          : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    {format(date, "d")}
                    {hasEv && !isSelected && isCurrentMonth && (
                      <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-400" />
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-gray-900">
              Upcoming Events
            </h3>
          </div>
          <div className="space-y-2.5">
            {upcomingEvents.length === 0 ? (
              <p className="text-[12px] text-gray-400 px-1">
                No upcoming events.
              </p>
            ) : (
              upcomingEvents.map((ev) => {
                const colorDot =
                  {
                    blue: "bg-blue-500",
                    orange: "bg-brand-500",
                    green: "bg-green-500",
                    purple: "bg-purple-500",
                  }[ev.color] || "bg-gray-400";
                return (
                  <div
                    key={ev.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group cursor-default bg-white"
                  >
                    <div
                      className={clsx(
                        "w-2.5 h-2.5 rounded-full shrink-0 mt-1.5",
                        colorDot,
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-gray-800 truncate flex items-center gap-1">
                        {ev.reminder_minutes ? (
                          <Bell
                            size={10}
                            className="text-brand-400 shrink-0"
                          />
                        ) : null}
                        {ev.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />{" "}
                        {format(parseISO(ev.start_time), "EEE, MMM d · HH:mm")}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteEvent(ev.id, e)}
                      className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── New Event Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[560px] overflow-hidden">
            {/* Modal header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-[20px] font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon size={20} className="text-[#38bcfc]" /> New Event
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-gray-50/80 p-2 mx-6 mt-6 rounded-[16px] border border-gray-100">
              <button
                onClick={() => {
                  setModalMode("single");
                  setFormError(null);
                }}
                className={clsx(
                  "flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all",
                  modalMode === "single"
                    ? "bg-white text-[#38bcfc] shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-900",
                )}
              >
                Single Event
              </button>
              <button
                onClick={() => {
                  setModalMode("recurring");
                  setFormError(null);
                }}
                className={clsx(
                  "flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all",
                  modalMode === "recurring"
                    ? "bg-white text-[#38bcfc] shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-900",
                )}
              >
                Weekly Class (16 wks)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 pt-5 space-y-4">
              {/* ── SINGLE EVENT ── */}
              {modalMode === "single" && (
                <>
                  {/* Title + Type */}
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Event Title
                      </label>
                      <input
                        type="text"
                        required
                        value={singleEvent.title}
                        onChange={(e) => {
                          setSingleEvent({
                            ...singleEvent,
                            title: e.target.value,
                          });
                          setFormError(null);
                        }}
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/50 focus:border-[#38bcfc]"
                        placeholder="e.g. Algorithm Midterm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Type
                      </label>
                      <select
                        value={singleEvent.type}
                        onChange={(e) =>
                          setSingleEvent({
                            ...singleEvent,
                            type: e.target.value as any,
                          })
                        }
                        className="bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-3 py-3 focus:outline-none h-[50px]"
                      >
                        <option value="class">Class</option>
                        <option value="exam">Exam</option>
                        <option value="meeting">Meeting</option>
                        <option value="task">Task</option>
                      </select>
                    </div>
                  </div>

                  {/* Date + Location */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={singleEvent.date}
                        onChange={(e) =>
                          setSingleEvent({
                            ...singleEvent,
                            date: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/50 focus:border-[#38bcfc]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={singleEvent.location}
                        onChange={(e) =>
                          setSingleEvent({
                            ...singleEvent,
                            location: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/50 focus:border-[#38bcfc]"
                        placeholder="Room A / Online"
                      />
                    </div>
                  </div>

                  {/* Start Time + End Time + Color */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Start
                      </label>
                      <input
                        type="time"
                        required
                        value={singleEvent.startTime}
                        onChange={(e) =>
                          setSingleEvent({
                            ...singleEvent,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        End
                      </label>
                      <input
                        type="time"
                        required
                        value={singleEvent.endTime}
                        onChange={(e) =>
                          setSingleEvent({
                            ...singleEvent,
                            endTime: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Color
                      </label>
                      <select
                        value={singleEvent.color}
                        onChange={(e) =>
                          setSingleEvent({
                            ...singleEvent,
                            color: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none"
                      >
                        {COLOR_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Reminder */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-700 ml-1 flex items-center gap-1.5">
                      <Bell size={13} className="text-brand-400" /> Reminder
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {REMINDER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setSingleEvent({
                              ...singleEvent,
                              reminderMinutes: opt.value,
                            })
                          }
                          className={clsx(
                            "py-2 px-2 rounded-xl text-[12px] font-semibold border-2 transition-all text-center",
                            singleEvent.reminderMinutes === opt.value
                              ? "border-brand-400 bg-brand-50 text-brand-700"
                              : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300",
                          )}
                        >
                          {opt.value === 0
                            ? "None"
                            : opt.label.replace(" before", "")}
                        </button>
                      ))}
                    </div>
                    {singleEvent.reminderMinutes > 0 &&
                      notifPermission !== "granted" && (
                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                          <Bell size={13} className="text-amber-500 shrink-0" />
                          <p className="text-[12px] text-amber-700 font-medium">
                            {notifPermission === "denied"
                              ? "Notifications blocked. Enable in browser settings for Chrome reminders, but in-app toasts will still work."
                              : "Browser notifications will be requested on save. In-app toasts are always on."}
                          </p>
                        </div>
                      )}
                  </div>
                </>
              )}

              {/* ── RECURRING ── */}
              {modalMode === "recurring" && (
                <>
                  <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl">
                    <p className="text-[12px] font-medium text-blue-700">
                      💡 Generates repeating weekly events for 16 weeks (full
                      semester) starting from the date you pick.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">
                      Class / Course Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fixedClass.title}
                      onChange={(e) => {
                        setFixedClass({ ...fixedClass, title: e.target.value });
                        setFormError(null);
                      }}
                      className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/50 focus:border-[#38bcfc]"
                      placeholder="e.g. Physics 101 Lecture"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Start Date (Week 1)
                      </label>
                      <input
                        type="date"
                        required
                        value={fixedClass.startDate}
                        onChange={(e) =>
                          setFixedClass({
                            ...fixedClass,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/50 focus:border-[#38bcfc]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={fixedClass.location}
                        onChange={(e) =>
                          setFixedClass({
                            ...fixedClass,
                            location: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/50 focus:border-[#38bcfc]"
                        placeholder="Auditorium B"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        required
                        value={fixedClass.startTime}
                        onChange={(e) =>
                          setFixedClass({
                            ...fixedClass,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        required
                        value={fixedClass.endTime}
                        onChange={(e) =>
                          setFixedClass({
                            ...fixedClass,
                            endTime: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Color
                      </label>
                      <select
                        value={fixedClass.color}
                        onChange={(e) =>
                          setFixedClass({
                            ...fixedClass,
                            color: e.target.value,
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none"
                      >
                        {COLOR_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-3">
                {formError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} />
                    {formError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-[14px] hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-3.5 rounded-xl transition-all flex items-center justify-center font-bold text-[14px] disabled:opacity-70 disabled:cursor-not-allowed shadow-md text-white bg-[#38bcfc] hover:bg-[#20aaf0]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : modalMode === "single" ? (
                      <>
                        <CheckCircle2 size={16} className="mr-2" />
                        {singleEvent.reminderMinutes > 0
                          ? "Save with Reminder"
                          : "Save Event"}
                      </>
                    ) : (
                      "Setup Semester Schedule"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <BulkImportModal
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={() => {
            setIsBulkModalOpen(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}
