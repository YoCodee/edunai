"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { format, parseISO } from "date-fns";
import {
  Plus,
  Users,
  LayoutTemplate,
  ArrowRight,
  MoreVertical,
  LogOut,
  FolderOpen,
} from "lucide-react";
import { createBoard, joinBoardViaCode } from "./actions";
import Link from "next/link";
import clsx from "clsx";

export default function ProjectBoardsOverview() {
  const [boards, setBoards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Join Modal
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");

  const supabase = createClient();

  const fetchBoards = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Get all boards where user is a member
      const { data, error } = await supabase
        .from("board_members")
        .select(
          `
          board_id,
          role,
          boards (
            id,
            title,
            description,
            join_code,
            created_at
          )
        `,
        )
        .eq("user_id", user.id);

      if (!error && data) {
        // Flatten the relationship response
        const mappedBoards = data.map((item) => ({
          ...item.boards,
          userRole: item.role,
        }));
        setBoards(mappedBoards);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const result = await createBoard(newTitle, newDesc);
    if (result.error) {
      alert(result.error);
    } else {
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      fetchBoards();
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput) return;

    const result = await joinBoardViaCode(joinCodeInput);
    if (result.error) {
      alert(result.error);
    } else {
      setIsJoinModalOpen(false);
      setJoinCodeInput("");
      fetchBoards();
    }
  };

  return (
    <div className="min-h-full font-sans bg-[#fbfcff] flex flex-col p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 w-full max-w-7xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[12px] font-bold tracking-wide uppercase mb-4 shadow-sm">
            <Users size={14} /> Collaborative
          </div>
          <h1 className="text-[36px] font-bold text-gray-900 tracking-tight">
            Project Boards
          </h1>
          <p className="text-[15px] text-gray-500 max-w-lg mt-2 leading-relaxed">
            Create Kanban boards for group projects, invite classmates with a
            code, and track tasks together seamlessly.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-[14px] shadow-sm hover:bg-gray-50 transition-colors"
          >
            Join via Code
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-[#1a1c20] hover:bg-[#2a2c30] text-white font-bold text-[14px] shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={16} /> New Board
          </button>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="w-full max-w-7xl mx-auto">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium text-[14px]">
              Loading your workspace...
            </p>
          </div>
        ) : boards.length === 0 ? (
          <div className="w-full bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] p-12 lg:p-20 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <LayoutTemplate size={40} className="text-green-500" />
            </div>
            <h3 className="text-[24px] font-bold text-gray-900 mb-2">
              No Active Boards
            </h3>
            <p className="text-[15px] text-gray-500 mb-8 max-w-sm">
              You haven't joined or created any project boards yet. Get started
              by creating your first workspace.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-[0_10px_20px_-10px_rgba(34,197,94,0.4)] transition-all font-bold tracking-wide"
            >
              Create First Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                href={`/dashboard/boards/${board.id}`}
                key={board.id}
                className="group bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <FolderOpen
                      size={20}
                      className="text-gray-600 group-hover:text-green-500 transition-colors"
                    />
                  </div>
                  <span
                    className={clsx(
                      "px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md",
                      board.userRole === "admin"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600",
                    )}
                  >
                    {board.userRole}
                  </span>
                </div>

                <h3 className="text-[18px] font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors">
                  {board.title}
                </h3>

                <p className="text-[13px] text-gray-500 line-clamp-2 mb-6 flex-1 pr-4">
                  {board.description || "No description provided."}
                </p>

                <div className="border-t border-gray-100 pt-5 mt-auto flex items-center gap-4 text-[12px]">
                  <div className="flex items-center gap-1.5 font-medium text-gray-500">
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                      CODE:
                    </span>
                    <span className="tracking-widest">{board.join_code}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[450px] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-[20px] font-bold text-gray-900">
                Create New Project Board
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                X
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700 ml-1">
                  Board Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-medium"
                  placeholder="e.g. History Thesis Group"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700 ml-1">
                  Description{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all resize-none"
                  placeholder="What is this board for?"
                />
              </div>

              <div className="mt-8">
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold tracking-wide rounded-xl py-4 transition-all shadow-md mt-2">
                  Initialize Board Setup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN MODAL */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[450px] overflow-hidden text-center p-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={28} />
            </div>
            <h2 className="text-[24px] font-bold text-gray-900 mb-2">
              Join a Workspace
            </h2>
            <p className="text-[14px] text-gray-500 mb-8 max-w-sm mx-auto">
              Enter the 6-character access code provided by your group leader or
              friend.
            </p>

            <form onSubmit={handleJoin} className="space-y-5">
              <input
                type="text"
                required
                maxLength={6}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[24px] text-center tracking-[0.5em] font-bold rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/50 focus:border-[#38bcfc] uppercase shadow-inner"
                placeholder="XXXXXX"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-[#1a1c20] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-black transition-all"
                >
                  Submit Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
