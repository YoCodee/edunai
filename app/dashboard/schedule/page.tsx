"use client";

import { useState, useEffect } from "react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
  addMonths,
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
} from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import { addFixedClass, addAITask } from "./actions";
import BulkImportModal from "./BulkImportModal";
import { FileSpreadsheet } from "lucide-react";

// Supabase Event Data Interface
interface EventData {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string; // ISO string from DB
  end_time: string; // ISO string
  color: string;
  event_type: "class" | "exam" | "meeting" | "task";
}

export default function SmartSchedulerOverview() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [activeTab, setActiveTab] = useState<"fixed" | "ai">("fixed");

  // Fixed Class State
  const [fixedClass, setFixedClass] = useState({
    title: "",
    location: "",
    startDate: format(new Date(), "yyyy-MM-dd"), // Used as the starting week
    startTime: "09:00",
    endTime: "10:30",
    color: "blue",
  });

  // AI Task State
  const [aiTask, setAiTask] = useState({
    title: "",
    duration: 2, // Hours
    deadlineDate: format(addDays(new Date(), 3), "yyyy-MM-dd"), // Default 3 days later
    color: "orange",
  });

  // Calculate the 7 days of the currently viewed week
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  const changeWeek = (offset: number) => {
    setCurrentDate(addDays(currentDate, offset * 7));
  };

  // Fetch Events from Supabase
  const fetchEvents = async () => {
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

      if (!error && data) {
        setEvents(data);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle Form Submission
  const handleSubmitOptions = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (activeTab === "fixed") {
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
        fetchEvents();
        setFixedClass({ ...fixedClass, title: "", location: "" });
      } else {
        alert(result.error);
      }
    } else {
      // AI Task
      const result = await addAITask({
        title: aiTask.title,
        durationHours: aiTask.duration,
        deadlineDate: aiTask.deadlineDate,
        color: aiTask.color,
      });

      if (result.success) {
        setIsModalOpen(false);
        setAiTask({ ...aiTask, title: "" });
        await fetchEvents();
        // Navigate the calendar to the AI-scheduled date
        if (result.ai_start) {
          const scheduledDate = new Date(result.ai_start);
          setCurrentDate(scheduledDate);
        }
        alert(
          result.ai_start
            ? `AI scheduled "${aiTask.title}" on ${format(new Date(result.ai_start), "EEEE, MMM d 'at' HH:mm")}. Calendar navigated to that day!`
            : `AI scheduled your task! Check the calendar.`,
        );
      } else {
        alert(result.error);
      }
    }

    setIsSubmitting(false);
  };

  // Complete/Delete Event
  const handleCompleteEvent = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) {
      setEvents(events.filter((ev) => ev.id !== id));
    } else {
      console.error("Error completing task:", error);
    }
  };

  // Filter events for the currently selected day (now including Tasks / AI Tasks)
  const dailyEvents = events.filter((event) =>
    isSameDay(parseISO(event.start_time), currentDate),
  );

  // Filter floating tasks (Only show tasks that are today or upcoming)
  const currentDateStart = new Date();
  currentDateStart.setHours(0, 0, 0, 0);
  const floatingTasks = events.filter(
    (event) =>
      event.event_type === "task" &&
      new Date(event.start_time) >= currentDateStart,
  );

  return (
    <div className="flex h-full font-sans bg-[#fbfcff] relative">
      {/* 1. Left Panel: Main Schedule Feed */}
      <div className="flex-1 flex flex-col pt-6 pr-8">
        {/* Header Area */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 mb-2">
              Smart Scheduler
            </h1>
            <p className="text-[14px] text-gray-500">
              Manage your academic life seamlessly across week blocks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet size={15} className="text-gray-500" /> Bulk
              Import
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1a1c20] hover:bg-[#2a2c30] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> New Event
            </button>
          </div>
        </div>

        {/* Weekly Navigator Slider */}
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

                  {/* Active dot indicator for 'Today' */}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-[#fca03e]"></span>
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

        {/* Dynamic Timeline for Selected Day */}
        <div className="flex-1 bg-white border border-gray-100/80 rounded-[32px] p-8 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#fca03e]/10 to-transparent rounded-bl-[100px] pointer-events-none"></div>

          <div className="mb-8 flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900">
                {format(currentDate, "EEEE, MMMM do")}
              </h2>
              <p className="text-[13px] text-gray-500 mt-1">
                {isLoading
                  ? "Loading..."
                  : `${dailyEvents.length} events scheduled`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wide rounded-lg">
                Daily Timeline
              </span>
            </div>
          </div>

          {/* Daily Hourly Calendar View (6 AM to 00:00) */}
          <div className="relative z-10 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-10 h-64 text-center">
                <Loader2 className="w-8 h-8 text-[#fca03e] animate-spin mb-4" />
                <h3 className="text-gray-500 font-medium">
                  Loading schedule...
                </h3>
              </div>
            ) : (
              <div className="relative mt-2" style={{ height: `${19 * 80}px` }}>
                {" "}
                {/* 6 AM to Midnight (19 slots) */}
                {/* Background Grid */}
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
                          <div className="absolute top-1/2 left-0 w-full border-t border-gray-50/50 border-dashed"></div>
                        )}
                      </div>
                    </div>
                  ),
                )}
                {/* Current Time Indicator line */}
                {isSameDay(currentDate, new Date()) &&
                  new Date().getHours() >= 6 && (
                    <div
                      className="absolute left-16 right-0 border-t-2 border-red-400 z-20 pointer-events-none"
                      style={{
                        top: `${(new Date().getHours() - 6 + new Date().getMinutes() / 60) * 80}px`,
                      }}
                    >
                      <div className="absolute -left-2 -top-[5px] w-2.5 h-2.5 bg-red-400 rounded-full"></div>
                    </div>
                  )}
                {/* Events Container */}
                <div className="absolute top-0 bottom-0 left-16 right-0 z-10">
                  {dailyEvents.map((event) => {
                    const startDate = parseISO(event.start_time);
                    const endDate = parseISO(event.end_time);
                    const startH = startDate.getHours();
                    const startM = startDate.getMinutes();
                    let endH = endDate.getHours();
                    let endM = endDate.getMinutes();

                    // If event completely before 6 AM
                    if (startH < 6 && endH <= 6 && (endH !== 0 || endM !== 0))
                      return null;

                    // Handle events that end exactly at 00:00 (midnight)
                    if (endH === 0 && endM === 0 && endDate > startDate) {
                      endH = 24;
                    }

                    const adjustedStartH = Math.max(startH, 6);
                    const adjustedStartM = startH < 6 ? 0 : startM;
                    const topPos =
                      (adjustedStartH - 6 + adjustedStartM / 60) * 80;

                    const adjustedEndH = Math.min(endH, 24);
                    let durationHours =
                      adjustedEndH +
                      endM / 60 -
                      (adjustedStartH + adjustedStartM / 60);
                    if (durationHours <= 0) return null;

                    const heightPos = durationHours * 80;

                    const colorConfig =
                      {
                        blue: "bg-blue-50/90 border-y border-r border-blue-200 text-blue-900 border-l-[4px] border-l-blue-500",
                        orange:
                          "bg-orange-50/90 border-y border-r border-orange-200 text-orange-900 border-l-[4px] border-l-orange-500",
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
                          height: `${Math.max(heightPos - 2, 24)}px`,
                        }}
                      >
                        <h4 className="text-[13px] font-bold truncate leading-tight flex items-start justify-between gap-2">
                          <span className="truncate">{event.title}</span>
                          {event.event_type === "task" ? (
                            <button
                              onClick={(e) => handleCompleteEvent(event.id, e)}
                              className="text-gray-400 hover:text-green-600 bg-white/50 hover:bg-green-100 rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-green-300"
                              title="Complete Task"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          ) : (
                            <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical size={14} />
                            </button>
                          )}
                        </h4>
                        {/* Only show details if card is tall enough */}
                        {durationHours >= 0.75 && (
                          <div className="mt-1">
                            <p className="text-[11px] font-medium opacity-80 mt-0.5 truncate flex items-center gap-1">
                              {format(startDate, "HH:mm")} -{" "}
                              {format(endDate, "HH:mm")}
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

      {/* 2. Right Panel: Utility Sidebar (Calendar Mini, Tasks) */}
      <div className="w-80 bg-white border-l border-gray-100/80 p-6 flex flex-col pt-10">
        {/* Simple Mini Month Calendar Placeholder */}
        <div className="mb-10">
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
              }); // Sunday
              const endDateMonth = endOfWeek(monthEnd, { weekStartsOn: 0 });

              const calendarDays = eachDayOfInterval({
                start: startDateMonth,
                end: endDateMonth,
              });

              return calendarDays.map((date, i) => {
                const isSelected = isSameDay(date, currentDate);
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();

                return (
                  <div
                    key={i}
                    onClick={() => setCurrentDate(date)}
                    className={clsx(
                      "w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-medium mx-auto cursor-pointer transition-colors",
                      !isCurrentMonth
                        ? "text-gray-300"
                        : isSelected
                          ? "bg-[#fca03e] text-white font-bold"
                          : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    {format(date, "d")}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Floating Tasks (Not tied to specific time) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-gray-900">
              Upcoming Tasks
            </h3>
            <button className="text-[12px] font-bold text-[#38bcfc] hover:underline">
              See all
            </button>
          </div>

          <div className="space-y-3">
            {floatingTasks.length === 0 ? (
              <p className="text-[12px] text-gray-400 px-1">
                No floating tasks. Add a 'task' event!
              </p>
            ) : (
              floatingTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => handleCompleteEvent(task.id, e)}
                  title="Click to complete"
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer bg-white overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-5 transition-opacity" />
                  <div className="mt-0.5 w-4 h-4 rounded border border-gray-300 group-hover:bg-green-100 group-hover:border-green-300 flex items-center justify-center shrink-0">
                    <CheckCircle2
                      size={12}
                      className="text-transparent group-hover:text-green-500 transition-colors"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-gray-800 truncate">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={10} />{" "}
                      {format(parseISO(task.start_time), "MMM do, HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL OVERLAY FOR ADDING NEW EVENT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[550px] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-[20px] font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon size={20} className="text-[#38bcfc]" /> Add to
                Master Schedule
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* TABS */}
            <div className="flex bg-gray-50/80 p-2 mx-6 mt-6 rounded-[16px] border border-gray-100">
              <button
                onClick={() => setActiveTab("fixed")}
                className={clsx(
                  "flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all",
                  activeTab === "fixed"
                    ? "bg-white text-[#38bcfc] shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-900",
                )}
              >
                Matkul Tetap / Fixed Class
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={clsx(
                  "flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                  activeTab === "ai"
                    ? "bg-white text-[#fca03e] shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-900",
                )}
              >
                AI Smart Planner
              </button>
            </div>

            <form onSubmit={handleSubmitOptions} className="p-6 pt-5 space-y-5">
              {/* === TAB 1: Matkul Tetap === */}
              {activeTab === "fixed" && (
                <>
                  <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl mb-4">
                    <p className="text-[12px] font-medium text-blue-700">
                      💡 This will generate repeating weekly classes for the
                      entire semester (16 weeks) starting from the date you
                      pick.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">
                      Class/Course Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fixedClass.title}
                      onChange={(e) =>
                        setFixedClass({ ...fixedClass, title: e.target.value })
                      }
                      className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/50 focus:border-[#38bcfc]"
                      placeholder="e.g. Physics 101 Lecture"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-3 gap-4">
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
                        Card Color
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
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="green">Green</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* === TAB 2: AI Smart Task === */}
              {activeTab === "ai" && (
                <>
                  <div className="p-3 bg-orange-50/50 border border-orange-100/50 rounded-xl mb-4 flex items-start gap-2">
                    <span className="text-[16px] py-0.5">✨</span>
                    <p className="text-[12px] font-medium text-orange-800">
                      Input your Task and Deadline. <b>Gemini AI</b> will
                      automatically scan your schedule, find a free slot of time
                      that does NOT overlap with your Fixed Classes, and assign
                      the task for you.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">
                      Task/Assignment Name
                    </label>
                    <input
                      type="text"
                      required
                      value={aiTask.title}
                      onChange={(e) =>
                        setAiTask({ ...aiTask, title: e.target.value })
                      }
                      className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fca03e]/50 focus:border-[#fca03e]"
                      placeholder="e.g. Calculus Chapter 3 Essay"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Est. Duration (Hours)
                      </label>
                      <input
                        type="number"
                        required
                        min={0.5}
                        step={0.5}
                        value={aiTask.duration}
                        onChange={(e) =>
                          setAiTask({
                            ...aiTask,
                            duration: parseFloat(e.target.value),
                          })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fca03e]/50 focus:border-[#fca03e]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Deadline Date
                      </label>
                      <input
                        type="date"
                        required
                        value={aiTask.deadlineDate}
                        onChange={(e) =>
                          setAiTask({ ...aiTask, deadlineDate: e.target.value })
                        }
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fca03e]/50 focus:border-[#fca03e]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
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
                  className={clsx(
                    "flex-[2] py-3.5 rounded-xl transition-all flex items-center justify-center font-bold text-[14px] disabled:opacity-70 disabled:cursor-not-allowed shadow-md text-white",
                    activeTab === "fixed"
                      ? "bg-[#38bcfc] hover:bg-[#20aaf0]"
                      : "bg-[#fca03e] hover:bg-[#ffb05c] text-[#1a1c20]",
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : activeTab === "fixed" ? (
                    "Setup Semester Schedule"
                  ) : (
                    "Plan with AI"
                  )}
                </button>
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
