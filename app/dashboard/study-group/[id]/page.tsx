"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { sendGroupMessage, getNoteContent, summarizeStudyGroup } from "../actions";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Users,
  Send,
  MoreVertical,
  FileText,
  FolderOpen,
  Eye,
  Plus,
  Video,
  Mic,
  MonitorUp,
  Settings,
  X,
  CircleDashed,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  Layout,
  CheckSquare,
  Sparkles
} from "lucide-react";

// --- Sub-components for Project Board Integration ---

function BoardWidget({ boardId, supabase, onOpenBoard, isMe, hasEditAccess }: { boardId: string, supabase: any, onOpenBoard: (id: string) => void, isMe: boolean, hasEditAccess: boolean }) {
  const [boardInfo, setBoardInfo] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreview() {
      const { data: bData } = await supabase.from("boards").select("title").eq("id", boardId).single();
      if (bData) setBoardInfo(bData);

      const { data: listsData } = await supabase.from("board_lists").select("id, title").eq("board_id", boardId).order('position');
      if (listsData && listsData.length > 0) {
        setLists(listsData);
        const listIds = listsData.map((l: any) => l.id);
        const { data: cards } = await supabase
          .from("board_cards")
          .select("id, title, list_id")
          .in("list_id", listIds)
          .limit(3);
        if (cards) setTasks(cards);
      }
      setLoading(false);
    }
    fetchPreview();
  }, [boardId]);

  const handleMoveTask = async (cardId: string, newListId: string) => {
    // Optimistic
    setTasks(prev => prev.map(t => t.id === cardId ? { ...t, list_id: newListId } : t));
    // Re-use logic from board actions, or direct supabase call here for simplicity in widget:
    await supabase.from("board_cards").update({ list_id: newListId }).eq("id", cardId);
  };

  if (loading) return <div className="mt-2 p-3 bg-white/50 animate-pulse rounded-xl h-20 w-64"></div>;

  return (
    <div className={`mt-2 border rounded-xl p-3 shadow-sm min-w-[260px] ${isMe ? "bg-white/10 border-white/20 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`}>
      <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: isMe ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)" }}>
        <h4 className="font-bold flex items-center gap-1.5 text-[13px]"><Layout size={14} /> {boardInfo?.title || "Project Board"}</h4>
        <button onClick={() => onOpenBoard(boardId)} className={`text-[11px] font-bold px-2 py-1 rounded-md transition-colors ${isMe ? "bg-white/20 hover:bg-white/30" : "bg-white border border-gray-200 hover:bg-gray-100"}`}>Buka di Panel</button>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 && <p className="text-[11px] opacity-70 italic">Belum ada tugas.</p>}
        {tasks.map(task => {
          const currentList = lists.find(l => l.id === task.list_id);
          const isDone = currentList?.title?.toLowerCase().includes("done");
          return (
            <div key={task.id} className={`p-2 rounded-lg text-[12px] flex flex-col gap-1.5 ${isMe ? "bg-white/10" : "bg-white border text-gray-700"}`}>
              <div className="flex items-start justify-between gap-2">
                <span className={`font-medium leading-tight ${isDone ? "line-through opacity-60" : ""}`}>{task.title}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider uppercase ${isDone ? "bg-green-500/20 text-white-500" : isMe ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {currentList?.title || "Unknown"}
                </span>

                {hasEditAccess ? (
                  <select
                    title="Pindahkan status"
                    className={`text-[10px] bg-transparent border-none outline-none cursor-pointer font-bold ${isMe ? "text-white opacity-80" : "text-gray-500"}`}
                    value={task.list_id}
                    onChange={(e) => handleMoveTask(task.id, e.target.value)}
                  >
                    {lists.map(l => (
                      <option key={l.id} value={l.id} className="text-gray-800 bg-white">{l.title}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`text-[10px] cursor-not-allowed font-bold opacity-60 ${isMe ? "text-white" : "text-gray-500"}`} title="Hanya admin/lead yang bisa mengubah status">
                    {lists.find(l => l.id === task.list_id)?.title || ""}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { moveCard, createCard, updateMemberRole } from "../../boards/[id]/actions";
import { SwitchCamera } from "lucide-react";

function MiniBoardPanel({ boardId, supabase, onClose, hasEditAccess, participants }: { boardId: string, supabase: any, onClose: () => void, hasEditAccess: boolean, participants: any[] }) {
  const [boardInfo, setBoardInfo] = useState<any>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isAddingTaskToList, setIsAddingTaskToList] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const { data: bData } = await supabase.from("boards").select("*").eq("id", boardId).single();
    if (bData) setBoardInfo(bData);

    const { data: listsData } = await supabase
      .from("board_lists")
      .select("id, title, position, board_cards(id, title, position, labels)")
      .eq("board_id", boardId)
      .order("position");

    if (listsData) {
      const sorted = listsData.map((l: any) => ({
        ...l,
        board_cards: l.board_cards.sort((a: any, b: any) => a.position - b.position)
      }));
      setLists(sorted);
    }

    const { data: membersData } = await supabase
      .from("board_members")
      .select("user_id, role, profiles(full_name, avatar_url)")
      .eq("board_id", boardId);
    if (membersData) setBoardMembers(membersData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [boardId]);

  const handleDragEnd = async (result: any) => {
    if (!hasEditAccess) return;
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newLists = Array.from(lists);
    const sourceList = newLists.find(l => l.id === source.droppableId);
    const destList = newLists.find(l => l.id === destination.droppableId);

    if (!sourceList || !destList) return;

    if (source.droppableId === destination.droppableId) {
      const clonedCards = Array.from(sourceList.board_cards) as any[];
      const [movedCard] = clonedCards.splice(source.index, 1);
      clonedCards.splice(destination.index, 0, movedCard);

      const newClonedCards = clonedCards.map((c, idx) => ({ ...c, position: idx }));
      setLists(newLists.map(l => l.id === source.droppableId ? { ...l, board_cards: newClonedCards } : l));
      await moveCard(draggableId, destination.droppableId, destination.index);
    } else {
      const sourceCards = Array.from(sourceList.board_cards) as any[];
      const destCards = Array.from(destList.board_cards) as any[];

      const [movedCard] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedCard);

      const newSourceCards = sourceCards.map((c, idx) => ({ ...c, position: idx }));
      const newDestCards = destCards.map((c, idx) => ({ ...c, position: idx }));

      setLists(newLists.map(l => {
        if (l.id === source.droppableId) return { ...l, board_cards: newSourceCards };
        if (l.id === destination.droppableId) return { ...l, board_cards: newDestCards };
        return l;
      }));
      await moveCard(draggableId, destination.droppableId, destination.index);
    }
  };

  const handleAddTask = async (listId: string) => {
    if (!newTaskTitle.trim()) {
      setIsAddingTaskToList(null);
      return;
    }
    const relevantList = lists.find(l => l.id === listId);
    const newPos = relevantList ? relevantList.board_cards.length : 0;

    // Optimistic UI can be complex here so we just rely on refetch for add
    const result = await createCard(listId, newTaskTitle, "", newPos);
    if (result.data) {
      await fetchData();
    }
    setNewTaskTitle("");
    setIsAddingTaskToList(null);
  };

  const handleRoleToggle = async (memberUserId: string, newRole: string) => {
    if (!hasEditAccess) return;

    // Optimistic Update
    setBoardMembers(prev => {
      const exists = prev.find(m => m.user_id === memberUserId);
      if (exists) return prev.map(m => m.user_id === memberUserId ? { ...m, role: newRole } : m);
      return [...prev, { user_id: memberUserId, role: newRole }]; // insert optimistic
    });

    const result = await updateMemberRole(boardId, memberUserId, newRole);
    if (!result.success) {
      await fetchData();
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 flex flex-col items-center"><div className="w-8 h-8 rounded-full border-2 border-t-blue-500 animate-spin mb-4" /> Memuat Mini Board...</div>;

  return (
    <div className="flex flex-col h-full bg-[#fbfcff] relative">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <div>
          <h3 className="font-bold text-[15px] text-gray-900 flex items-center gap-1.5"><Layout size={16} className="text-green-500" /> {boardInfo?.title}</h3>
          <p className="text-[11px] text-gray-500 flex items-center gap-2">Live Sync Board &bull; {hasEditAccess ? <span className="text-green-600 font-bold">Editor</span> : <span className="text-gray-400">Viewer</span>} &bull; <button onClick={() => setIsMembersModalOpen(true)} className="hover:underline hover:text-blue-500 text-blue-400 font-medium">Atur Akses</button></p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-800 transition-colors"><X size={16} /></button>
      </div>

      {isMembersModalOpen && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col shadow-[-4px_0_20px_rgba(0,0,0,0.02)]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
            <h4 className="font-bold text-gray-900 text-[14px]">Akses Anggota Project</h4>
            <button onClick={() => setIsMembersModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {participants.map(participant => {
              const boardMemberRef = boardMembers.find(m => m.user_id === participant.id);
              const currentRole = boardMemberRef?.role || 'member';

              return (
                <div key={participant.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden">
                      {participant.avatar ? (
                        <img src={participant.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[12px] font-bold text-indigo-500">{participant.name?.charAt(0) || "U"}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-800 leading-tight">{participant.name || "Unknown"}</span>
                      <span className="text-[11px] text-gray-500 capitalize">{currentRole === 'admin' ? 'Editor / Lead' : 'Viewer'}</span>
                    </div>
                  </div>

                  {hasEditAccess ? (
                    <select
                      value={currentRole}
                      onChange={(e) => handleRoleToggle(participant.id, e.target.value)}
                      className={`text-[11px] font-bold px-2 py-1.5 rounded-lg border outline-none cursor-pointer ${currentRole === 'admin' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                    >
                      <option value="admin">Editor</option>
                      <option value="member">Viewer</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${currentRole === 'admin' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {currentRole === 'admin' ? 'Editor' : 'Viewer'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        <DragDropContext onDragEnd={handleDragEnd}>
          {lists.map(list => (
            <div key={list.id} className="bg-gray-50 rounded-xl border border-gray-200/60 p-3 shadow-sm flex flex-col max-h-[500px]">
              <h4 className="text-[12px] font-bold text-gray-700 mb-3 flex justify-between items-center uppercase tracking-wider shrink-0">
                {list.title} <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border">{list.board_cards.length}</span>
              </h4>

              <Droppable droppableId={list.id} isDropDisabled={!hasEditAccess}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-2 flex-1 overflow-y-auto min-h-[50px] p-1 -mx-1 ${snapshot.isDraggingOver ? "bg-gray-100/50 rounded-lg" : ""}`}
                  >
                    {list.board_cards.length === 0 && !snapshot.isDraggingOver && <p className="text-[11px] text-center text-gray-400 italic py-2">Kosong</p>}
                    {list.board_cards.map((card: any, index: number) => (
                      <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={!hasEditAccess}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-2.5 rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${snapshot.isDragging ? "shadow-lg scale-[1.02] rotate-1 z-50 border-blue-200" : ""} ${!hasEditAccess ? "cursor-default" : ""}`}
                          >
                            <p className="text-[13px] font-medium text-gray-800 leading-snug">{card.title}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {hasEditAccess && (
                <div className="mt-2 pt-2 border-t border-gray-200/50 shrink-0">
                  {isAddingTaskToList === list.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        autoFocus
                        className="w-full text-[13px] p-2 bg-white border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Nama tugas..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTask(list.id);
                          if (e.key === "Escape") setIsAddingTaskToList(null);
                        }}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleAddTask(list.id)} className="bg-blue-600 text-white text-[11px] px-3 py-1.5 rounded-md font-bold">Simpan</button>
                        <button onClick={() => setIsAddingTaskToList(null)} className="bg-gray-200 text-gray-700 text-[11px] px-3 py-1.5 rounded-md font-bold hover:bg-gray-300">Batal</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAddingTaskToList(list.id);
                        setNewTaskTitle("");
                      }}
                      className="w-full text-left text-[12px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} /> Tambah Tugas
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  )
}
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// --- State Interfaces ---
interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  role?: string;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  attachment_type?: string | null;
  attachment_id?: string | null;
  reaction?: string;
}

export default function StudyGroupRoom() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "Study Group Room";
  const type = searchParams.get("type") || "public";

  // States
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [notes, setNotes] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [userRole, setUserRole] = useState("member");
  const [isLoading, setIsLoading] = useState(true);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Modals
  const [isAttachNoteModalOpen, setIsAttachNoteModalOpen] = useState(false);
  const [isAttachBoardModalOpen, setIsAttachBoardModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<{
    title: string;
    content: string;
    author: string;
  } | null>(null);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);

  // Supabase
  const supabase = createClient();

  const handleSummarize = async () => {
    if (messages.length === 0) return alert("Belum ada obrolan untuk dirangkum.");
    setIsSummarizing(true);

    // Format text
    const textToSummarize = messages.map(m => `[${m.time}] ${m.sender}: ${m.text}`).join('\n');

    const result = await summarizeStudyGroup(textToSummarize);
    setIsSummarizing(false);

    if (result.success && result.summary) {
      setSummaryResult(result.summary);
    } else {
      alert(result.error);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let channel: any = null;
    let currentUserId: string | null = null;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        currentUserId = user.id;

        // 1. Fetch participants
        const { data: memberData } = await supabase
          .from("study_group_members")
          .select(
            `
                        user_id,
                        role,
                        profiles ( full_name, avatar_url )
                    `,
          )
          .eq("group_id", groupId);

        if (memberData) {
          const formattedMembers = memberData.map((m: any) => {
            if (m.user_id === currentUserId) {
              setUserRole(m.role || "member");
            }
            return {
              id: m.user_id,
              name: m.profiles?.full_name || "Unknown",
              avatar: m.profiles?.avatar_url,
              isOnline: true,
              role: m.role
            };
          });
          setParticipants(formattedMembers);
        }

        // 2. Fetch User's Notes for Attachment Panel
        const { data: notesData } = await supabase
          .from("notes")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(10);
        if (notesData) setNotes(notesData);

        // 3. Fetch User's Boards for Attachment Panel
        const { data: boardData } = await supabase
          .from("board_members")
          .select(`boards ( id, title, description, created_at )`)
          .eq("user_id", user.id);

        if (boardData) {
          const mappedBoards = boardData
            .filter((item: any) => item.boards)
            .map((item: any) => item.boards);
          setBoards(mappedBoards);
        }

        // 4. Fetch existing messages
        const { data: messagesData } = await supabase
          .from("study_group_messages")
          .select(
            "id, content, attachment_type, attachment_id, created_at, user_id, profiles(full_name)",
          )
          .eq("group_id", groupId)
          .order("created_at", { ascending: true });

        if (messagesData) {
          const formatted = messagesData.map((m: any) => ({
            id: m.id,
            sender: m.profiles?.full_name || "Unknown User",
            text: m.content || "",
            time: new Date(m.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isMe: m.user_id === user.id,
            attachment_type: m.attachment_type,
            attachment_id: m.attachment_id,
          }));
          setMessages(formatted);
        }

        // 5. Real-time Messages Subscription
        channel = supabase
          .channel(`group-${groupId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "study_group_messages",
              filter: `group_id=eq.${groupId}`,
            },
            async (payload) => {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", payload.new.user_id)
                .single();

              const newMsg: Message = {
                id: payload.new.id,
                sender: profileData?.full_name || "Unknown",
                text: payload.new.content,
                time: new Date(payload.new.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isMe: payload.new.user_id === currentUserId,
                attachment_type: payload.new.attachment_type,
                attachment_id: payload.new.attachment_id,
              };

              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            },
          )
          .subscribe();
      } catch (err) {
        console.error("Error fetching study group data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [groupId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const sentMsg = newMessage;
    setNewMessage("");

    const result = await sendGroupMessage(groupId, sentMsg);
    if (!result.error && result.data) {
      setMessages((prev) => [
        ...prev,
        {
          id: result.data.id,
          sender: "Me",
          text: sentMsg,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: true,
        },
      ]);
    }
  };

  const handleAttachNote = async (noteId: string, noteTitle: string) => {
    setIsAttachNoteModalOpen(false);
    const sentMsg = `Saya melampirkan catatan: "${noteTitle}"`;
    const result = await sendGroupMessage(groupId, sentMsg, "note", noteId);

    if (!result.error && result.data) {
      setMessages((prev) => [
        ...prev,
        {
          id: result.data.id,
          sender: "Me",
          text: sentMsg,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: true,
          attachment_type: "note",
          attachment_id: noteId,
        },
      ]);
    }
  };

  const handleAttachBoard = async (boardId: string, boardTitle: string) => {
    setIsAttachBoardModalOpen(false);
    const sentMsg = `Ayo bahas project board: "${boardTitle}"`;
    const result = await sendGroupMessage(groupId, sentMsg, "board", boardId);

    if (!result.error && result.data) {
      setMessages((prev) => [
        ...prev,
        {
          id: result.data.id,
          sender: "Me",
          text: sentMsg,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: true,
          attachment_type: "board",
          attachment_id: boardId,
        },
      ]);
    }
  };

  const handleReact = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, reaction: m.reaction === emoji ? undefined : emoji }
          : m
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#fbfcff] overflow-hidden">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-tr from-[#1a1c20] to-gray-800 rounded-2xl flex items-center justify-center shadow-md shadow-gray-200">
              <Users size={24} className="text-[#38bcfc]" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-gray-900 leading-tight flex items-center gap-2">
                {title}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-widest ${type === "public" ? "bg-blue-100 text-[#38bcfc]" : "bg-gray-100 text-gray-500"}`}
                >
                  {type}
                </span>
              </h1>
              <p className="text-[13px] text-gray-500 font-medium">
                {participants.length} Anggota
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSummarize}
            disabled={isSummarizing || messages.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[13px] font-bold rounded-xl shadow-[0_2px_10px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSummarizing ? (
              <div className="w-4 h-4 border-2 border-white/80 rounded-full border-t-transparent animate-spin"></div>
            ) : (
              <Sparkles size={16} className="text-amber-100 group-hover:text-white transition-colors" />
            )}
            Rangkum Diskusi
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col bg-[#fbfcff] z-0 min-h-0">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center">
              <span className="bg-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Hari ini
              </span>
            </div>

            {messages.length === 0 && (
              <div className="text-center bg-blue-50 border border-blue-100 p-4 rounded-2xl mx-auto max-w-lg shadow-sm">
                <h3 className="font-bold text-[#1a1c20] mb-1">
                  Selamat Datang di {title}!
                </h3>
                <p className="text-[13px] text-gray-500">
                  Grup ini siap untuk diskusi. Jadilah yang pertama menyapa
                  teman-temanmu di sini.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex max-w-[80%] group ${msg.isMe ? "ml-auto justify-end" : "mr-auto justify-start"}`}
              >
                <div
                  className={`flex gap-3 relative ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${msg.isMe ? "bg-[#38bcfc] text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    {msg.sender.charAt(0)}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`flex flex-col relative ${msg.isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[13px] font-bold text-gray-700">
                        {msg.isMe ? "Kamu" : msg.sender}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {msg.time}
                      </span>
                    </div>
                    <div
                      className={`relative p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.isMe ? "bg-[#38bcfc] text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"}`}
                    >
                      {msg.text}
                      {msg.attachment_type === "note" && msg.attachment_id && (
                        <button
                          onClick={async () => {
                            setIsLoadingNote(true);
                            const res = await getNoteContent(
                              msg.attachment_id!,
                            );
                            if (res.data) {
                              setViewingNote({
                                title: res.data.title,
                                content:
                                  res.data.content_markdown ||
                                  "Catatan ini kosong.",
                                author:
                                  (res.data.profiles as any)?.full_name ||
                                  "Unknown",
                              });
                            }
                            setIsLoadingNote(false);
                          }}
                          className={`mt-2 flex items-center gap-2 ${msg.isMe ? "bg-white/20 hover:bg-white/30 text-white" : "bg-blue-50 hover:bg-blue-100 text-[#38bcfc]"} font-medium px-3 py-2 rounded-lg text-[12px] transition-colors cursor-pointer w-fit`}
                        >
                          <Eye size={14} /> Lihat Isi Catatan
                        </button>
                      )}
                      {msg.attachment_type === "board" && msg.attachment_id && (
                        <BoardWidget
                          boardId={msg.attachment_id}
                          supabase={supabase}
                          isMe={msg.isMe}
                          hasEditAccess={userRole === "admin"}
                          onOpenBoard={(id) => setActiveBoardId(id)}
                        />
                      )}

                      {/* Reaction Display */}
                      {msg.reaction && (
                        <div
                          className={`absolute -bottom-3 ${msg.isMe ? "right-2" : "left-2"} bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-full px-1.5 py-0.5 text-[14px] z-10 cursor-pointer hover:scale-110 transition-transform`}
                          onClick={() => handleReact(msg.id, msg.reaction!)}
                        >
                          {msg.reaction}
                        </div>
                      )}
                    </div>

                    {/* Reaction Picker (Hover) */}
                    <div
                      className={`absolute top-6 ${msg.isMe ? "-left-[85px]" : "-right-[85px]"} opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-100 rounded-full shadow-sm p-1 flex gap-1 z-20`}
                    >
                      <button
                        onClick={() => handleReact(msg.id, "👍")}
                        className="hover:scale-125 transition-transform text-[16px] cursor-pointer"
                        title="Thumb Up"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => handleReact(msg.id, "❤️")}
                        className="hover:scale-125 transition-transform text-[16px] cursor-pointer"
                        title="Love"
                      >
                        ❤️
                      </button>
                      <button
                        onClick={() => handleReact(msg.id, "😂")}
                        className="hover:scale-125 transition-transform text-[16px] cursor-pointer"
                        title="Haha"
                      >
                        😂
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] shrink-0">
            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 w-full max-w-5xl mx-auto"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan untuk diskusi..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[14px] rounded-2xl pl-5 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-[#38bcfc]/30 focus:border-[#38bcfc] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-14 h-14 bg-[#38bcfc] hover:bg-[#2da0db] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0"
              >
                <Send size={20} className={newMessage.trim() ? "ml-1" : ""} />
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR: RESOURCES & INTEGRATION --- */}
        <div className="w-[320px] bg-white border-l border-gray-100 hidden lg:flex flex-col shrink-0 z-10 shadow-[-4px_0_20px_rgba(0,0,0,0.02)] transition-all">
          {activeBoardId ? (
            <MiniBoardPanel boardId={activeBoardId} supabase={supabase} onClose={() => setActiveBoardId(null)} hasEditAccess={userRole === "admin"} participants={participants} />
          ) : (
            <>
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-[16px] font-bold text-gray-900">
                  Resource Grup
                </h2>
                <p className="text-[12px] text-gray-500">
                  Integrasikan notes & project board.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-8">
                {/* Notes Integration */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" /> Notes
                      Tersimpan
                    </h3>
                    <button
                      onClick={() => setIsAttachNoteModalOpen(true)}
                      className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 border-dashed text-center">
                    <FileText size={24} className="text-blue-300 mx-auto mb-2" />
                    <p className="text-[12px] text-gray-500">
                      Belum ada catatan yang dilampirkan dari AI Workspace.
                    </p>
                    <button
                      onClick={() => setIsAttachNoteModalOpen(true)}
                      className="mt-3 text-[12px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Lampirkan Notes
                    </button>
                  </div>
                </section>

                {/* Boards Integration */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                      <FolderOpen size={16} className="text-green-500" /> Project
                      Board Grup
                    </h3>
                    <button
                      onClick={() => setIsAttachBoardModalOpen(true)}
                      className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 border-dashed text-center">
                    <FolderOpen size={24} className="text-green-300 mx-auto mb-2" />
                    <p className="text-[12px] text-gray-500">
                      Grup ini belum terhubung dengan Kanban Board manapun.
                    </p>
                    <button
                      onClick={() => setIsAttachBoardModalOpen(true)}
                      className="mt-3 text-[12px] font-bold text-green-600 hover:underline"
                    >
                      Hubungkan Board
                    </button>
                  </div>
                </section>

                {/* Online Members */}
                <section>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Users size={16} className="text-[#38bcfc]" /> Anggota (
                    {participants.length})
                  </h3>
                  <div className="space-y-3">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gray-100 border overflow-hidden flex items-center justify-center font-bold text-[12px] text-gray-600">
                            {p.avatar ? (
                              <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              p.name?.charAt(0) || "U"
                            )}
                          </div>
                          {p.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></div>
                          )}
                        </div>
                        <span className="text-[13px] font-medium text-gray-700 line-clamp-1">
                          {p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Attach Note Modal */}
      {isAttachNoteModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                Pilih Notes (AI Workspace)
              </h2>
              <button
                onClick={() => setIsAttachNoteModalOpen(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
              {isLoading ? (
                <p className="text-center text-gray-500 p-4">
                  Loading notes...
                </p>
              ) : notes.length === 0 ? (
                <p className="text-center text-gray-500 p-4">
                  Kamu belum memiliki Notes.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleAttachNote(note.id, note.title)}
                    className="p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <FileText className="text-blue-500 shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-[14px] text-gray-800">
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Dibuat {formatDistanceToNow(new Date(note.created_at))}{" "}
                        lalu
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attach Board Modal */}
      {isAttachBoardModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                Pilih Project Board
              </h2>
              <button
                onClick={() => setIsAttachBoardModalOpen(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
              {isLoading ? (
                <p className="text-center text-gray-500 p-4">
                  Loading boards...
                </p>
              ) : boards.length === 0 ? (
                <p className="text-center text-gray-500 p-4">
                  Kamu tidak tergabung dalam Project Board manapun.
                </p>
              ) : (
                boards.map((board) => (
                  <div
                    key={board.id}
                    onClick={() => handleAttachBoard(board.id, board.title)}
                    className="p-4 border border-gray-100 rounded-xl hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <FolderOpen className="text-green-500 shrink-0" size={20} />
                    <div>
                      <h4 className="font-bold text-[14px] text-gray-800">
                        {board.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1">
                        {board.description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* View Note Content Modal */}
      {viewingNote && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-blue-50 to-blue-100/50 shrink-0">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={20} className="text-blue-500" />
                  {viewingNote.title}
                </h2>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  Dibagikan oleh{" "}
                  <span className="font-semibold text-[#1a1c20]">
                    {viewingNote.author}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setViewingNote(null)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-white/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#38bcfc]">
                <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-gray-700">
                  {viewingNote.content}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end">
              <button
                onClick={() => setViewingNote(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1a1c20] text-white text-[13px] font-bold hover:bg-[#2a2c30] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Note Overlay */}
      {isLoadingNote && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#38bcfc] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[14px] font-medium text-gray-700">
              Memuat isi catatan...
            </span>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[400px] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                Pengaturan Grup
              </h2>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Nama Grup</label>
                <div className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 cursor-not-allowed text-gray-500 font-medium">
                  {title}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Hanya admin yang bisa mengubah nama grup.</p>
              </div>
              <div>
                <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Tipe Grup</label>
                <div className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[14px] rounded-xl px-4 py-3 cursor-not-allowed text-gray-500 uppercase font-bold tracking-wider">
                  {type}
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-full bg-[#1a1c20] hover:bg-[#2a2c30] text-white font-bold rounded-xl py-3.5 mt-2 transition-all shadow-md cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {summaryResult && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-amber-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
              <h2 className="text-[18px] font-bold text-amber-900 flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                Ringkasan Diskusi AI
              </h2>
              <button
                onClick={() => setSummaryResult(null)}
                className="p-2 text-amber-900/50 hover:text-amber-900 rounded-full hover:bg-white/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-gray-800">
              <div className="prose prose-sm prose-amber max-w-none prose-headings:text-amber-950 prose-a:text-orange-600 prose-strong:text-amber-900">
                <ReactMarkdown>{summaryResult}</ReactMarkdown>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end">
              <button
                onClick={() => setSummaryResult(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1a1c20] text-white text-[13px] font-bold hover:bg-[#2a2c30] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
