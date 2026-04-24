"use client";

import {
  Users,
  Search,
  Plus,
  Play,
  MoreHorizontal,
  Video,
  Mic,
  Clock,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Flame,
  BookOpen,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  UserPlus,
  FileText,
  FolderOpen,
  Lock,
  Unlock,
  X,
  Trash2,
  Monitor,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  createStudyGroup,
  joinStudyGroupViaCode,
  joinPublicGroup,
  deleteStudyGroup,
  leaveStudyGroup,
} from "./actions";

// --- Dummy Data ---

const liveSessions = [
  {
    id: 1,
    title: "Advanced React Patterns & Hooks",
    subject: "Software Engineering",
    host: "Alex M.",
    participants: 12,
    maxParticipants: 15,
    tags: ["React", "Frontend", "Live"],
    color: "from-[#38bcfc] to-blue-500",
    bg: "bg-blue-50 text-blue-700",
    icon: <Target size={18} className="text-white" />,
  },
  {
    id: 2,
    title: "Calculus III: Multiple Integrals",
    subject: "Mathematics",
    host: "Sarah K.",
    participants: 8,
    maxParticipants: 20,
    tags: ["Math", "Exam Prep"],
    color: "from-dash-primary to-brand-400",
    bg: "bg-brand-50 text-brand-700",
    icon: <Zap size={18} className="text-white" />,
  },
  {
    id: 3,
    title: "Macroeconomics Discussion",
    subject: "Economics",
    host: "David L.",
    participants: 24,
    maxParticipants: 30,
    tags: ["Discussion", "Notes"],
    color: "from-[#1a1c20] to-gray-800",
    bg: "bg-gray-100 text-gray-800",
    icon: <BookOpen size={18} className="text-white" />,
  },
];

const yourGroups = [
  {
    id: 1,
    name: "Web Dev Warriors",
    description: "Group for building modern web apps.",
    members: 156,
    activeNow: 12,
    nextMeet: "Today, 8:00 PM",
    icon: <Users className="text-[#38bcfc]" size={24} />,
    color: "bg-blue-50",
  },
  {
    id: 2,
    name: "Physics 101 Study Group",
    description: "Preparing for the midterms together.",
    members: 45,
    activeNow: 3,
    nextMeet: "Tomorrow, 10:00 AM",
    icon: <Zap className="text-dash-primary" size={24} />,
    color: "bg-brand-50",
  },
  {
    id: 3,
    name: "UI/UX Design Masterclass",
    description: "Sharing design resources and feedback.",
    members: 89,
    activeNow: 8,
    nextMeet: "Friday, 4:00 PM",
    icon: <Sparkles className="text-gray-800" size={24} />,
    color: "bg-gray-100",
  },
];



const exploreGroupsDummy = [
  {
    id: 101,
    name: "Matematika Diskrit Lanjut",
    type: "public",
    members: 120,
    tags: ["Math", "Public"],
  },
  {
    id: 102,
    name: "UI/UX Elite Squad",
    type: "private",
    members: 15,
    tags: ["Design", "Invite Only"],
  },
  {
    id: 103,
    name: "Front-End Masterclass",
    type: "public",
    members: 340,
    tags: ["Web", "Public"],
  },
];

export default function StudyGroupPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [boards, setBoards] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [dynamicLeaderboard, setDynamicLeaderboard] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // --- Modals State ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newIcon, setNewIcon] = useState("general");
  const [newType, setNewType] = useState("private");

  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);

  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isJoinPrivateModalOpen, setIsJoinPrivateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // --- Custom Confirmation Modal State ---
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning",
  });

  const supabase = createClient();
  const router = useRouter();

  const fetchBoardsAndNotes = async () => {
    setIsLoadingData(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      if (authError) {
        console.error("Auth error:", authError);
      }

      if (user) {
        const { data: boardData, error: boardError } = await supabase
          .from("study_group_members")
          .select(
            `
            group_id,
            role,
            study_groups ( id, title, description, join_code, created_at, group_type )
          `,
          )
          .eq("user_id", user.id);

        if (boardError) console.error("Board error:", boardError);
        if (!boardError && boardData) {
          const mappedBoards = boardData
            .map((item: any) => ({
              ...item.study_groups,
              userRole: item.role,
            }))
            .sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            );
          setBoards(mappedBoards);
        }

        const { data: notesData, error: notesError } = await supabase
          .from("notes")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (notesError) console.error("Notes error:", notesError);
        if (!notesError && notesData) setNotes(notesData);

        // --- DYNAMIC LEADERBOARD CALCULATION ---
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select(
            `
            id, 
            full_name, 
            notes (id),
            events (id)
          `,
          )
          .limit(10);
        
        if (profilesError) console.error("Profiles Error:", profilesError);

        if (profilesData) {
          const dummyLeaderboard = [
            { name: "Jessica T.", initial: "J", hours: 42, points: 2450, trend: "up" },
            { name: "Michael R.", initial: "M", hours: 38, points: 2120, trend: "up" },
            { name: "Amanda W.", initial: "A", hours: 35, points: 1980, trend: "down" },
            { name: "Budi S.", initial: "B", hours: 31, points: 1850, trend: "up" },
            { name: "Reza A.", initial: "R", hours: 25, points: 1500, trend: "down" },
            { name: "Tania S.", initial: "T", hours: 22, points: 1350, trend: "up" },
            { name: "Alex M.", initial: "A", hours: 20, points: 1200, trend: "down" },
            { name: "Sarah K.", initial: "S", hours: 18, points: 1100, trend: "up" },
            { name: "David L.", initial: "D", hours: 15, points: 900, trend: "down" },
            { name: "Kevin J.", initial: "K", hours: 12, points: 700, trend: "up" },
          ];

          const calculatedDB = profilesData.map((p) => {
            const notesCount = (p as any).notes?.length || 0;
            const eventsCount = (p as any).events?.length || 0;
            // Boost DB user points so they appear on top in demo
            const points = notesCount * 100 + eventsCount * 50 + 2500;
            const hours = Math.floor(points / 60) + 5;

            return {
              name: p.full_name || "Scholar",
              initial: (p.full_name || "S").charAt(0),
              points: points,
              hours: hours,
              trend: points > 2500 ? "down" : "up",
            };
          });

          const dbNames = calculatedDB.map((c) => c.name);
          const remainingDummy = dummyLeaderboard.filter(
            (d) => !dbNames.includes(d.name)
          );

          const fullLeaderboard = [...calculatedDB, ...remainingDummy]
            .sort((a, b) => b.points - a.points)
            .slice(0, 10)
            .map((player, idx) => ({ ...player, rank: idx + 1 }));

          setDynamicLeaderboard(fullLeaderboard);
        }
      }

      // Fetch ALL Public and Private Groups for Live Sessions/Explore (GLOBAL)
      const { data: allGroupsData, error: allGroupsError } = await supabase
        .from("study_groups")
        .select(
          `
          id, title, description, subject, group_type, join_code, created_at, 
          profiles:owner_id ( full_name )
        `,
        )
        .order("created_at", { ascending: false });

      if (allGroupsError) {
        console.error("Error fetching all groups:", allGroupsError);
      } else if (allGroupsData) {
        setAllGroups(allGroupsData);
      }
    } catch (err) {
      console.error("fetchBoardsAndNotes failed:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchBoardsAndNotes();
  }, []);

  // --- Handlers ---
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setSubmitting(true);

    const combinedSubject = `${newIcon}|${newSubject || "General"}`;

    const result = await createStudyGroup(
      newTitle,
      newDesc,
      combinedSubject,
      newType,
    );
    setSubmitting(false);

    if (result.error) {
      alert(result.error);
    } else {
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewSubject("");
      fetchBoardsAndNotes();
      router.push(
        `/dashboard/study-group/${result.data?.id}?title=${encodeURIComponent(result.data?.title)}&type=${result.data?.group_type}`,
      );
    }
  };

  const handleJoinPrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput) return;
    setSubmitting(true);

    const result = await joinStudyGroupViaCode(joinCodeInput);
    setSubmitting(false);

    if (result.error) {
      alert(result.error);
    } else {
      setIsJoinPrivateModalOpen(false);
      setJoinCodeInput("");
      fetchBoardsAndNotes();
      if (result.data) {
        router.push(
          `/dashboard/study-group/${result.data.id}?title=${encodeURIComponent(result.data.title)}&type=${result.data.group_type || "private"}`,
        );
      }
    }
  };

  const handleJoinDemo = async (type: string, id: string, title: string) => {
    if (type === "public") {
      setSubmitting(true);
      const res = await joinPublicGroup(id);
      setSubmitting(false);
      if (res.error) {
        alert(res.error);
      } else {
        setIsExploreModalOpen(false);
        setIsLiveModalOpen(false);
        fetchBoardsAndNotes();
        router.push(
          `/dashboard/study-group/${id}?title=${encodeURIComponent(title)}&type=public`,
        );
      }
    } else {
      setIsExploreModalOpen(false);
      setIsLiveModalOpen(false);
      setIsJoinPrivateModalOpen(true);
    }
  };

  const handleDeleteGroup = (
    e: React.MouseEvent,
    groupId: string,
    groupTitle: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setConfirmConfig({
      isOpen: true,
      title: "Hapus Grup Belajar",
      message: `Apakah kamu yakin ingin menghapus grup "${groupTitle}"?\nSemua log chat, lampiran resource, dan anggota didalamnya akan terhapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
      type: "danger",
      onConfirm: async () => {
        setSubmitting(true);
        const result = await deleteStudyGroup(groupId);
        setSubmitting(false);
        if (result.error) {
          alert(result.error);
        } else {
          fetchBoardsAndNotes();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleLeaveGroup = (
    e: React.MouseEvent,
    groupId: string,
    groupTitle: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setConfirmConfig({
      isOpen: true,
      title: "Keluar dari Grup",
      message: `Apakah kamu yakin ingin keluar dari grup "${groupTitle}"? Kamu tidak akan bisa melihat diskusi di grup ini lagi kecuali bergabung kembali.`,
      type: "warning",
      onConfirm: async () => {
        setSubmitting(true);
        const result = await leaveStudyGroup(groupId);
        setSubmitting(false);
        if (result.error) {
          alert(result.error);
        } else {
          fetchBoardsAndNotes();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const parseSubject = (sub: string) => {
    if (!sub) return { icon: "general", text: "General" };
    if (sub.includes("|")) {
      const [icon, text] = sub.split("|");
      return { icon, text };
    }
    return { icon: sub.toLowerCase(), text: sub };
  };

  const getCardStyle = (code: string) => {
    const s = (code || "").toLowerCase();
    if (s.includes("math") || s.includes("matematika") || s === "math")
      return {
        icon: <Zap size={18} className="text-blue-500" />,
        color: "bg-blue-50",
        bg: "bg-blue-50 text-blue-600",
      };
    if (s.includes("ekonomi") || s.includes("business") || s === "ekonomi")
      return {
        icon: <BookOpen size={18} className="text-gray-600" />,
        color: "bg-gray-100",
        bg: "bg-gray-100 text-gray-700",
      };
    if (s.includes("design") || s.includes("desain") || s === "design")
      return {
        icon: <Sparkles size={18} className="text-purple-500" />,
        color: "bg-purple-50",
        bg: "bg-purple-50 text-purple-600",
      };
    if (s === "code" || s.includes("tech"))
      return {
        icon: <FolderOpen size={18} className="text-emerald-500" />,
        color: "bg-emerald-50",
        bg: "bg-emerald-50 text-emerald-600",
      };
    return {
      icon: <Target size={18} className="text-[#38bcfc]" />,
      color: "bg-sky-50",
      bg: "bg-sky-50 text-[#38bcfc]",
    };
  };

  const publicLiveSessions = allGroups.filter((g) => g.group_type === "public");

  return (
    <div className="flex-1 flex flex-col h-full  p-8 overflow-y-auto min-h-screen">
      {/* --- Top Header Context --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1a1c20] rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200/50">
            <Users size={24} className="text-[#38bcfc]" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
              Study Groups
            </h1>
            <p className="text-[15px] text-gray-500 mt-1">
              Belajar bareng lebih seru — temukan grup dan kolaborasi real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari kelas, grup, topik..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/30 focus:border-[#38bcfc] w-[240px] transition-all shadow-sm text-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#1a1c20] hover:bg-[#2a2c30] text-white px-5 py-2.5 rounded-xl font-medium text-[14px] transition-colors shadow-md shadow-gray-200 cursor-pointer"
          >
            <Plus size={18} />
            <span>Buat Grup</span>
          </button>
        </div>
      </div>

      {/* --- Main Grid Layout --- */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Content Area */}
        <div className="flex-1 flex flex-col gap-10">
          {/* Section: Live Sessions */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-[20px] font-bold text-gray-800">
                  Live Study Sessions
                </h2>
              </div>
              <button
                onClick={() => setIsLiveModalOpen(true)}
                className="text-[14px] font-medium text-[#38bcfc] hover:text-[#2da0db] flex items-center gap-1 transition-colors cursor-pointer"
              >
                Lihat Semua <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-5">
              {isLoadingData ? (
                <div className="col-span-1 md:col-span-2 py-8 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#38bcfc] animate-spin"></div>
                </div>
              ) : publicLiveSessions.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>Belum ada sesi belajar live yang terbuka. Ayo buat grup publik baru!</p>
                </div>
              ) : (
                publicLiveSessions.slice(0, 6).map((group) => {
                  const parsed = parseSubject(group.subject);
                  const style = getCardStyle(parsed.icon);
                  return (
                    <div
                      key={group.id}
                      className="group flex flex-col bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl ${style.color} flex items-center justify-center`}
                        >
                          {style.icon}
                        </div>
                        <div className="flex bg-red-50 text-red-600 px-2.5 py-1 rounded-full items-center gap-1.5 border border-red-100 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[11px] font-bold tracking-wide uppercase">
                            Live
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-[12px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                          {parsed.text}
                        </p>
                        <h3 className="text-[16px] font-bold text-gray-800 leading-snug group-hover:text-[#38bcfc] transition-colors line-clamp-2">
                          {group.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${style.bg}`}
                        >
                          {group.group_type === "public" ? "Public" : "Private"}
                        </span>
                      </div>

                      <div className="border-t border-gray-50 pt-4 flex items-center justify-between mt-auto mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">
                            {(group.profiles?.full_name || "?").charAt(0)}
                          </div>
                          <span className="text-[13px] font-medium text-gray-600 line-clamp-1">
                            {group.profiles?.full_name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Users size={14} />
                        </div>
                      </div>

                      {/* Clean Action Button */}
                      {boards.some((b) => b.id === group.id) ? (() => {
                        const joinedBoard = boards.find((b) => b.id === group.id);
                        const isAdmin = joinedBoard?.userRole === "admin";
                        return (
                          <div className="flex gap-2 w-full">
                            <Link
                              href={`/dashboard/study-group/${group.id}?title=${encodeURIComponent(group.title)}&type=${group.group_type || "private"}`}
                              className="flex-1 text-center bg-[#38bcfc] hover:bg-[#20a5e8] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm"
                            >
                              <Play size={14} /> Masuk Kelas
                            </Link>
                            {isAdmin ? (
                              <button
                                onClick={(e) => handleDeleteGroup(e, group.id, group.title)}
                                disabled={submitting}
                                className="px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-100 transition-all cursor-pointer disabled:opacity-50"
                                title="Hapus grup"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleLeaveGroup(e, group.id, group.title)}
                                disabled={submitting}
                                className="px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-100 transition-all cursor-pointer disabled:opacity-50"
                                title="Keluar dari grup"
                              >
                                <LogOut size={16} />
                              </button>
                            )}
                          </div>
                        );
                      })() : (
                        <button
                          onClick={() =>
                            handleJoinDemo(group.group_type, group.id, group.title)
                          }
                          className="w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-100 cursor-pointer"
                        >
                          {group.group_type === "public" ? (
                            <>
                              <Play size={14} /> Gabung Sekarang
                            </>
                          ) : (
                            <>
                              <Lock size={14} /> Minta Akses
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Section: Your Groups */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[20px] font-bold text-gray-800">
                Grup Belajar Kamu
              </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {isLoadingData ? (
                <div className="col-span-1 md:col-span-2 py-8 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#38bcfc] animate-spin"></div>
                </div>
              ) : boards.length === 0 ? (
                <div className="col-span-1 md:col-span-2 text-center py-8 text-gray-500">
                  <p>
                    Belum ada grup yang kamu ikuti. Gabung via Project Boards!
                  </p>
                </div>
              ) : (
                boards.slice(0, 5).map((group) => (
                  <Link
                    key={group.id}
                    href={`/dashboard/study-group/${group.id}?title=${encodeURIComponent(group.title)}&type=${group.group_type || "private"}`}
                    className="bg-white rounded-2xl p-5 border border-gray-100 flex gap-4 hover:border-blue-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all group/card"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                      <FolderOpen className="text-[#38bcfc]" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-[16px] font-bold text-gray-800 group-hover/card:text-[#38bcfc] transition-colors line-clamp-1">
                          {group.title}
                        </h3>
                        {group.userRole === "admin" ? (
                          <button
                            onClick={(e) =>
                              handleDeleteGroup(e, group.id, group.title)
                            }
                            disabled={submitting}
                            className="text-gray-300 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                            title="Hapus Grup"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <button className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                            <MoreHorizontal size={18} />
                          </button>
                        )}
                      </div>
                      <p className="text-[13px] text-gray-500 mt-1 mb-3 line-clamp-1">
                        {group.description || "No description provided."}
                      </p>

                      <div className="flex items-center gap-4 text-[12px] font-medium">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Users size={14} /> Kode: {group.join_code}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />{" "}
                          Aktif
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}

              {/* Create/Explore Card */}
              <div
                onClick={() => setIsExploreModalOpen(true)}
                className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 border-dashed flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:bg-blue-50 transition-colors group/new"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#38bcfc] group-hover/new:scale-110 transition-transform">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1a1c20] mb-1">
                    Eksplorasi Grup Lain
                  </h3>
                  <p className="text-[13px] text-gray-500">
                    Ikuti lebih banyak komunitas belajar
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Shared Notes / Resources */}
          <section className="mb-8">
            <h2 className="text-[20px] font-bold text-gray-800 mb-5">
              Materi & Catatan Terbaru
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoadingData ? (
                <div className="col-span-full py-8 text-center flex justify-center w-full">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
                </div>
              ) : notes.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-2xl border border-gray-100 w-full">
                  <p>Belum ada catatan. Ayo buat di AI Workspace!</p>
                </div>
              ) : (
                notes.map((doc, i) => (
                  <Link
                    href="/dashboard/ai-workspace"
                    key={doc.id}
                    className="flex flex-col p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-[0_4px_12px_rgba(56,188,252,0.06)] transition-all cursor-pointer group/doc"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover/doc:bg-[#38bcfc] group-hover/doc:text-white transition-colors">
                        <FileText size={18} />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-lg group-hover/doc:bg-blue-50 group-hover/doc:text-blue-500 transition-colors">
                        Note
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold text-gray-800 group-hover/doc:text-[#38bcfc] transition-colors line-clamp-2 leading-snug">
                        {doc.title}
                      </h4>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                      <p className="text-[11px] text-gray-500 font-medium">
                        {formatDistanceToNow(new Date(doc.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* --- Right Sidebar Layout --- */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
          {/* Productivity Leaderboard */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="text-[#38bcfc]" size={20} />
                <h2 className="text-[18px] font-bold text-gray-900">
                  Top Scholars
                </h2>
              </div>
              <p className="text-[13px] text-gray-500">
                Peringkat produktivitas minggu ini.
              </p>
            </div>

            {dynamicLeaderboard.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-[13px]">
                Memuat data pejuang...
              </div>
            ) : (
              <div className="px-5 pt-4 pb-0">
                <div className="flex items-end justify-center gap-2">
                  {/* Rank 2 */}
                  {dynamicLeaderboard[1] && (
                    <div className="flex flex-col items-center w-1/3">
                      <div className="relative mb-1">
                        <div className="absolute inset-0 bg-orange-400/40 rounded-full blur animate-pulse" />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 border-2 border-white shadow-md flex items-center justify-center font-bold text-white uppercase z-10 relative">
                            {dynamicLeaderboard[1].initial}
                        </div>
                      </div>
                      <div className="mt-2 text-center text-[12px] font-bold text-gray-800 line-clamp-1 w-[90%]">{dynamicLeaderboard[1].name}</div>
                      <div className="text-[10px] text-orange-500 font-bold mb-3">{dynamicLeaderboard[1].points} pt</div>
                      <div className="w-full bg-gradient-to-b from-amber-50 to-white rounded-t-xl border-t border-x border-amber-200/50 flex items-start justify-center pt-2 shadow-[0_-4px_10px_rgba(245,158,11,0.15)]" style={{ height: '60px' }}>
                          <span className="text-[14px] font-bold text-amber-500/60">#2</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 */}
                  {dynamicLeaderboard[0] && (
                    <div className="flex flex-col items-center w-1/3 z-10">
                      <div className="relative mb-1">
                        <Crown size={22} className="text-[#38bcfc] absolute -top-6 left-1/2 -translate-x-1/2 z-20 drop-shadow-sm" />
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#38bcfc] to-blue-500 border-2 border-white shadow-md flex items-center justify-center font-bold text-white uppercase z-10 relative">
                            {dynamicLeaderboard[0].initial}
                        </div>
                      </div>
                      <div className="mt-2 text-center text-[13px] font-bold text-gray-900 line-clamp-1 w-[95%]">{dynamicLeaderboard[0].name}</div>
                      <div className="text-[11px] text-[#38bcfc] font-bold mb-3">{dynamicLeaderboard[0].points} pt</div>
                      <div className="w-full bg-gradient-to-b from-blue-50 to-white rounded-t-xl border-t border-x border-blue-100 shadow-[0_-4px_10px_rgba(56,188,252,0.1)] flex items-start justify-center pt-2" style={{ height: '80px' }}>
                          <span className="text-[18px] font-black text-[#38bcfc]/40">#1</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {dynamicLeaderboard[2] && (
                    <div className="flex flex-col items-center w-1/3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 border-2 border-white shadow-sm flex items-center justify-center font-bold uppercase z-10 relative">
                            {dynamicLeaderboard[2].initial}
                        </div>
                      </div>
                      <div className="mt-2 text-center text-[12px] font-bold text-gray-800 line-clamp-1 w-[90%]">{dynamicLeaderboard[2].name}</div>
                      <div className="text-[10px] text-gray-500 font-medium mb-3">{dynamicLeaderboard[2].points} pt</div>
                      <div className="w-full bg-gray-50/60 rounded-t-xl border-t border-x border-gray-100/60 flex items-start justify-center pt-2 shadow-inner" style={{ height: '45px' }}>
                          <span className="text-[13px] font-bold text-gray-300">#3</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rank 4+ List */}
          {dynamicLeaderboard.length > 3 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden p-3">
              {dynamicLeaderboard.slice(3).map((user) => (
                <div
                  key={user.name}
                  className="flex items-center justify-between p-3 hover:bg-gray-50/80 rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center text-[14px] font-bold text-gray-300">
                      #{user.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-gray-500 uppercase">
                      {user.initial}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {user.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                        {user.hours} jam
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[13px] font-bold text-gray-700">
                      {user.points} pt
                    </span>
                    {user.trend === "up" ? (
                      <span className="flex items-center text-[10px] font-bold text-emerald-500 mt-0.5">
                        <ArrowUp size={10} /> 12
                      </span>
                    ) : (
                      <span className="flex items-center text-[10px] font-bold text-red-500 mt-0.5">
                        <ArrowDown size={10} /> 4
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div className="p-4 bg-white border-t border-gray-50 mt-2">
                <button
                  onClick={() => setIsLeaderboardModalOpen(true)}
                  className="w-full py-2.5 rounded-xl text-[13px] font-bold text-gray-600 hover:text-[#38bcfc] hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all shadow-sm cursor-pointer"
                >
                  Lihat Selengkapnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS SECTION --- */}

      {/* 1. Modal Buat Grup */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[500px] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-[20px] font-bold text-gray-900">
                Buat Grup Baru
              </h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setModalError(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700 ml-1">
                  Nama Grup
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/30 focus:border-[#38bcfc] transition-all font-medium"
                  placeholder="e.g. Pejuang Skripsi 2024"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700 ml-1">
                  Deskripsi{" "}
                  <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/30 focus:border-[#38bcfc] transition-all resize-none"
                  placeholder="Deskripsi singkat mengenai tujuan grup ini..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700 ml-1">
                  Bidang Studi / Subject
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/30 focus:border-[#38bcfc] transition-all font-medium"
                  placeholder="e.g. Desain Grafis, Matematika"
                />
              </div>

              {/* Pilihan Logo Grup */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[13px] font-bold text-gray-700 ml-1 mb-2 block">
                  Pilihan Logo Grup
                </label>
                <div className="flex gap-3 justify-between sm:justify-start">
                  {[
                    { id: "general", icon: <Target size={22} className={newIcon === "general" ? "text-[#38bcfc]" : "text-gray-400 group-hover:text-gray-600"} /> },
                    { id: "math", icon: <Zap size={22} className={newIcon === "math" ? "text-[#38bcfc]" : "text-gray-400 group-hover:text-gray-600"} /> },
                    { id: "ekonomi", icon: <BookOpen size={22} className={newIcon === "ekonomi" ? "text-[#38bcfc]" : "text-gray-400 group-hover:text-gray-600"} /> },
                    { id: "design", icon: <Sparkles size={22} className={newIcon === "design" ? "text-[#38bcfc]" : "text-gray-400 group-hover:text-gray-600"} /> },
                    { id: "tech", icon: <Monitor size={22} className={newIcon === "tech" ? "text-[#38bcfc]" : "text-gray-400 group-hover:text-gray-600"} /> },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setNewIcon(item.id)}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all border-2 group ${newIcon === item.id ? "border-[#38bcfc] bg-blue-50/50 shadow-sm" : "border-gray-100 hover:border-gray-200 bg-white"}`}
                    >
                      {item.icon}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipe Grup Radio */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[13px] font-bold text-gray-700 ml-1 mb-2 block">
                  Tipe Grup
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setNewType("public")}
                    className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${newType === "public" ? "border-[#38bcfc] bg-blue-50/50 shadow-[0_4px_12px_rgba(56,188,252,0.15)]" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <div
                      className={`p-2 rounded-full ${newType === "public" ? "bg-blue-100 text-[#38bcfc]" : "bg-gray-100 text-gray-400"}`}
                    >
                      <Unlock size={20} />
                    </div>
                    <div className="text-center">
                      <h4
                        className={`text-[14px] font-bold ${newType === "public" ? "text-[#1a1c20]" : "text-gray-600"}`}
                      >
                        Publik
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Semua orang bisa gabung
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setNewType("private")}
                    className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${newType === "private" ? "border-[#38bcfc] bg-blue-50/50 shadow-[0_4px_12px_rgba(56,188,252,0.15)]" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <div
                      className={`p-2 rounded-full ${newType === "private" ? "bg-blue-100 text-[#38bcfc]" : "bg-gray-100 text-gray-400"}`}
                    >
                      <Lock size={20} />
                    </div>
                    <div className="text-center">
                      <h4
                        className={`text-[14px] font-bold ${newType === "private" ? "text-[#1a1c20]" : "text-gray-600"}`}
                      >
                        Private
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Perlu kode akses (Invite)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

                {modalError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 mb-4">
                    <AlertTriangle size={14} />
                    {modalError}
                  </div>
                )}

                <div className="mt-4 pt-4">
                  <button
                    disabled={submitting}
                    className="w-full bg-[#1a1c20] hover:bg-[#2a2c30] text-white font-bold tracking-wide rounded-xl py-4 transition-all shadow-md shadow-gray-200 cursor-pointer disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Buat Sekarang"
                    )}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Eksplorasi Grup */}
      {isExploreModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col h-[80vh] md:h-auto md:max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900">
                  Eksplorasi Grup Lain
                </h2>
                <p className="text-[13px] text-gray-500">
                  Temukan komunitas baru untuk belajar bareng.
                </p>
              </div>
              <button
                onClick={() => setIsExploreModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Search Fake */}
              <div className="relative mb-6">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik topik atau nama pelajaran..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/30 focus:border-[#38bcfc] transition-all font-medium"
                />
              </div>

              <div className="space-y-3">
                {(() => {
                  const combinedAllGroups = [...allGroups];

                  let filteredGroups = [];

                  if (!searchQuery.trim()) {
                    // Tampilkan semua grup (HANYA DARI YANG BELUM DI-JOIN) jika tidak ada query
                    const unjoinedGroups = combinedAllGroups.filter(
                      (g) => !boards.some((b) => b.id === g.id)
                    );
                    filteredGroups = unjoinedGroups;
                  } else {
                    // Pencarian word-by-word DARI SEMUA GRUP (Termasuk yang sudah di-join)
                    const keywords = searchQuery.toLowerCase().split(" ").filter(Boolean);
                    filteredGroups = combinedAllGroups.filter((g) => {
                      const titleMatch = g.title.toLowerCase();
                      const subjectMatch = g.subject ? g.subject.toLowerCase() : "";
                      return keywords.some(
                        (kw) =>
                          titleMatch.includes(kw) || subjectMatch.includes(kw)
                      );
                    });
                  }

                  if (filteredGroups.length === 0) {
                    return (
                      <div className="py-8 text-center text-gray-500 text-[14px]">
                        Tidak ada grup yang sesuai dengan pencarianmu.
                      </div>
                    );
                  }

                  return filteredGroups.map((group) => {
                    const isJoined = boards.some((b) => b.id === group.id);
                    return (
                      <div
                        key={group.id}
                        className="p-4 border border-gray-100 rounded-2xl hover:border-blue-200 transition-colors flex items-center justify-between group/explore"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${group.group_type === "public" ? "bg-blue-50 text-[#38bcfc]" : "bg-gray-100 text-gray-500"}`}
                          >
                            {group.group_type === "public" ? (
                              <Unlock size={20} />
                            ) : (
                              <Lock size={20} />
                            )}
                          </div>
                          <div>
                            <h4 className="text-[15px] font-bold text-gray-900 mb-1">
                              {group.title}
                            </h4>
                            <div className="flex gap-2 items-center">
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium uppercase tracking-wider">
                                {parseSubject(group.subject).text}
                              </span>
                              <span className="text-[11px] text-gray-400 flex items-center ml-2">
                                <Users size={12} className="mr-1" /> Host:{" "}
                                {group.profiles?.full_name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isJoined ? (() => {
                          const joinedBoard = boards.find((b) => b.id === group.id);
                          const isAdmin = joinedBoard?.userRole === "admin";
                          return (
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                              <Link
                                href={`/dashboard/study-group/${group.id}?title=${encodeURIComponent(group.title)}&type=${group.group_type || "private"}`}
                                className="px-4 py-2 rounded-xl text-[13px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap bg-[#38bcfc] hover:bg-[#20a5e8] text-white flex items-center gap-1.5"
                              >
                                <Play size={14} /> Masuk Kelas
                              </Link>
                              {isAdmin ? (
                                <button
                                  onClick={(e) => handleDeleteGroup(e, group.id, group.title)}
                                  disabled={submitting}
                                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-100 transition-all cursor-pointer disabled:opacity-50"
                                  title="Hapus grup"
                                >
                                  <Trash2 size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => handleLeaveGroup(e, group.id, group.title)}
                                  disabled={submitting}
                                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-100 transition-all cursor-pointer disabled:opacity-50"
                                  title="Keluar dari grup"
                                >
                                  <LogOut size={14} />
                                </button>
                              )}
                            </div>
                          );
                        })() : (
                          <button
                            onClick={() =>
                              handleJoinDemo(
                                group.group_type,
                                group.id,
                                group.title,
                              )
                            }
                            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap mt-2 sm:mt-0 ${group.group_type === "public" ? "bg-[#1a1c20] hover:bg-[#2a2c30] text-white shadow-gray-200" : "bg-white border border-gray-200 hover:bg-gray-50 text-[#1a1c20] shadow-sm flex items-center gap-1.5"}`}
                          >
                            {group.group_type === "public" ? (
                              "Gabung Sekarang"
                            ) : (
                              <>
                                <Lock size={14} /> Minta Akses
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 text-center">
              <button
                onClick={() => setIsJoinPrivateModalOpen(true)}
                className="text-[13px] font-bold text-[#38bcfc] hover:underline cursor-pointer"
              >
                Sudah punya kode akses (Join Code)? Masuk disini.
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Join Private via Code */}
      {isJoinPrivateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[450px] overflow-hidden text-center p-10 relative">
            <button
              onClick={() => {
                setIsJoinPrivateModalOpen(false);
                setModalError(null);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={28} />
            </div>
            <h2 className="text-[24px] font-bold text-gray-900 mb-2">
              Gabung dengan Kode
            </h2>
            <p className="text-[14px] text-gray-500 mb-8 max-w-sm mx-auto">
              Masukkan 6 digit kode akses grup private mu.
            </p>

            <form onSubmit={handleJoinPrivate} className="space-y-5">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={(e) => {
                    setJoinCodeInput(e.target.value.toUpperCase());
                    setModalError(null);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[24px] text-center tracking-[0.5em] font-bold rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/50 focus:border-[#38bcfc] uppercase shadow-inner"
                  placeholder="XXXXXX"
                />
                {modalError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 mb-4">
                    <AlertTriangle size={14} />
                    {modalError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#1a1c20] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-black transition-all disabled:opacity-70 flex justify-center cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Submit Kode"
                  )}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Lihat Semua Live Sessions */}
      {isLiveModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[800px] overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-[20px] font-bold text-gray-900">
                  Semua Live Sessions
                </h2>
              </div>
              <button
                onClick={() => setIsLiveModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoadingData ? (
                <div className="col-span-full py-12 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#38bcfc] animate-spin"></div>
                </div>
              ) : publicLiveSessions.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p>Tidak ada sesi live publik saat ini.</p>
                </div>
              ) : (
                publicLiveSessions.map((group) => {
                  const parsed = parseSubject(group.subject);
                  const style = getCardStyle(parsed.icon);
                  return (
                    <div
                      key={group.id}
                      onClick={() =>
                        handleJoinDemo(group.group_type, group.id, group.title)
                      }
                      className="border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-blue-200 hover:bg-gray-50 transition-all group cursor-pointer relative overflow-hidden"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.color}`}
                      >
                        {style.icon}
                      </div>
                      <div className="flex-1 relative z-10">
                        <h4 className="font-bold text-[14px] text-gray-800 mb-0.5 group-hover:text-[#38bcfc] transition-colors line-clamp-1">
                          {group.title}
                        </h4>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 block">
                          {parsed.text}
                        </span>
                        <div className="flex items-center gap-2 text-gray-500 text-[11px] font-medium">
                          <div className="flex items-center gap-1">
                            <Users size={12} /> Live
                          </div>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="line-clamp-1">
                            Host: {group.profiles?.full_name || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex bg-red-50 text-red-500 px-2 py-0.5 rounded-full items-center gap-1 border border-red-100">
                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-tighter">
                          Live
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Full Leaderboard */}
      {isLeaderboardModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[500px] overflow-hidden">
            <div className="bg-blue-400 p-8 text-center relative">
              <button
                onClick={() => setIsLeaderboardModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              <Crown className="text-white mx-auto mb-3" size={40} />
              <h2 className="text-[28px] font-bold text-white mb-1">
                Hall of Fame
              </h2>
              <p className="text-[14px] text-white/80">
                Papan peringkat paling produktif bulan ini
              </p>
            </div>
            <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
              {dynamicLeaderboard.map((user, idx) => (
                <div
                  key={user.name}
                  className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-6 text-center text-[16px] font-black ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-gray-400" : idx === 2 ? "text-brand-400" : "text-gray-300"}`}
                    >
                      #{user.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                      {user.initial}
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-gray-800">
                        {user.name}
                      </h4>
                      <span className="text-[12px] text-gray-500">
                        {user.hours} Jam Belajar
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[14px] font-black text-[#1a1c20] block">
                      {user.points}{" "}
                      <span className="text-[10px] text-gray-400 uppercase">
                        PT
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- PREMIUM CUSTOM CONFIRMATION MODAL --- */}
      {confirmConfig.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[420px] overflow-hidden transform animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg",
                confirmConfig.type === "danger" ? "bg-red-50 text-red-500 shadow-red-100" : "bg-amber-50 text-amber-500 shadow-amber-100"
              )}>
                {confirmConfig.type === "danger" ? <Trash2 size={36} /> : <LogOut size={36} />}
              </div>
              
              <h2 className="text-[24px] font-bold text-gray-900 mb-3">
                {confirmConfig.title}
              </h2>
              <p className="text-[15px] text-gray-500 leading-relaxed whitespace-pre-wrap">
                {confirmConfig.message}
              </p>
            </div>
            
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                disabled={submitting}
                className={cn(
                  "flex-1 py-4 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer",
                  confirmConfig.type === "danger" ? "bg-red-500 hover:bg-red-600 shadow-red-200" : "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                )}
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Ya, Lanjutkan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
