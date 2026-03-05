"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { sendGroupMessage, getNoteContent } from "../actions";
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
    X
} from "lucide-react";
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
    const [isLoading, setIsLoading] = useState(true);

    // Modals
    const [isAttachNoteModalOpen, setIsAttachNoteModalOpen] = useState(false);
    const [isAttachBoardModalOpen, setIsAttachBoardModalOpen] = useState(false);
    const [viewingNote, setViewingNote] = useState<{ title: string; content: string; author: string } | null>(null);
    const [isLoadingNote, setIsLoadingNote] = useState(false);

    // Supabase
    const supabase = createClient();

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
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                currentUserId = user.id;

                // 1. Fetch participants
                const { data: memberData } = await supabase
                    .from("study_group_members")
                    .select(`
                        user_id,
                        profiles ( full_name )
                    `)
                    .eq("group_id", groupId);

                if (memberData) {
                    const formattedMembers = memberData.map((m: any) => ({
                        id: m.user_id,
                        name: m.profiles?.full_name || "Unknown",
                        avatar: (m.profiles?.full_name || "?").charAt(0),
                        isOnline: true
                    }));
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
                    .select("id, content, attachment_type, attachment_id, created_at, user_id, profiles(full_name)")
                    .eq("group_id", groupId)
                    .order("created_at", { ascending: true });

                if (messagesData) {
                    const formatted = messagesData.map((m: any) => ({
                        id: m.id,
                        sender: m.profiles?.full_name || "Unknown User",
                        text: m.content || "",
                        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'study_group_messages',
                            filter: `group_id=eq.${groupId}`
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
                                time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                isMe: payload.new.user_id === currentUserId,
                                attachment_type: payload.new.attachment_type,
                                attachment_id: payload.new.attachment_id
                            };

                            setMessages(prev => {
                                if (prev.some(m => m.id === newMsg.id)) return prev;
                                return [...prev, newMsg];
                            });
                        }
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
            setMessages(prev => [
                ...prev,
                {
                    id: result.data.id,
                    sender: "Me",
                    text: sentMsg,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                }
            ]);
        }
    };

    const handleAttachNote = async (noteId: string, noteTitle: string) => {
        setIsAttachNoteModalOpen(false);
        const sentMsg = `Saya melampirkan catatan: "${noteTitle}"`;
        const result = await sendGroupMessage(groupId, sentMsg, "note", noteId);

        if (!result.error && result.data) {
            setMessages(prev => [
                ...prev,
                {
                    id: result.data.id,
                    sender: "Me",
                    text: sentMsg,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                    attachment_type: "note",
                    attachment_id: noteId
                }
            ]);
        }
    };

    const handleAttachBoard = async (boardId: string, boardTitle: string) => {
        setIsAttachBoardModalOpen(false);
        const sentMsg = `Ayo bahas project board: "${boardTitle}"`;
        const result = await sendGroupMessage(groupId, sentMsg, "board", boardId);

        if (!result.error && result.data) {
            setMessages(prev => [
                ...prev,
                {
                    id: result.data.id,
                    sender: "Me",
                    text: sentMsg,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: true,
                    attachment_type: "board",
                    attachment_id: boardId
                }
            ]);
        }
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
                        <div className="w-12 h-12 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-md">
                            <Users size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-[20px] font-bold text-gray-900 leading-tight flex items-center gap-2">
                                {title}
                                <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-widest ${type === 'public' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {type}
                                </span>
                            </h1>
                            <p className="text-[13px] text-gray-500 font-medium">
                                {participants.length} Anggota • {participants.filter(p => p.isOnline).length} Online
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">

                    <div className="w-px h-6 bg-gray-200 mx-2"></div>
                    <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
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
                            <div className="text-center bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mx-auto max-w-lg shadow-sm">
                                <h3 className="font-bold text-indigo-700 mb-1">Selamat Datang di {title}!</h3>
                                <p className="text-[13px] text-indigo-600">Grup ini siap untuk diskusi. Jadilah yang pertama menyapa teman-temanmu di sini.</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex max-w-[80%] ${msg.isMe ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                                <div className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${msg.isMe ? 'bg-indigo-600 text-white' : 'bg-purple-100 text-purple-600'}`}>
                                        {msg.sender.charAt(0)}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-[13px] font-bold text-gray-700">{msg.isMe ? 'Kamu' : msg.sender}</span>
                                            <span className="text-[10px] text-gray-400">{msg.time}</span>
                                        </div>
                                        <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                                            {msg.text}
                                            {msg.attachment_type === "note" && msg.attachment_id && (
                                                <button
                                                    onClick={async () => {
                                                        setIsLoadingNote(true);
                                                        const res = await getNoteContent(msg.attachment_id!);
                                                        if (res.data) {
                                                            setViewingNote({
                                                                title: res.data.title,
                                                                content: res.data.content_markdown || "Catatan ini kosong.",
                                                                author: (res.data.profiles as any)?.full_name || "Unknown"
                                                            });
                                                        }
                                                        setIsLoadingNote(false);
                                                    }}
                                                    className={`mt-2 flex items-center gap-2 ${msg.isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'} font-medium px-3 py-2 rounded-lg text-[12px] transition-colors cursor-pointer w-fit`}
                                                >
                                                    <Eye size={14} /> Lihat Isi Catatan
                                                </button>
                                            )}
                                            {msg.attachment_type === "board" && (
                                                <Link href={`/dashboard/boards/${msg.attachment_id}`} className="mt-2 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-700 font-medium px-3 py-2 rounded-lg text-[12px] text-white transition-colors cursor-pointer w-fit">
                                                    <FolderOpen size={14} /> Buka Project Board Ini
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] shrink-0">
                        <form onSubmit={handleSendMessage} className="flex gap-2 w-full max-w-5xl mx-auto">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Ketik pesan untuk diskusi..."
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[14px] rounded-2xl pl-5 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0"
                            >
                                <Send size={20} className={newMessage.trim() ? "ml-1" : ""} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- RIGHT SIDEBAR: RESOURCES & INTEGRATION --- */}
                <div className="w-[320px] bg-white border-l border-gray-100 hidden lg:flex flex-col shrink-0 z-10 shadow-[-4px_0_20px_rgba(0,0,0,0.02)]">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-[16px] font-bold text-gray-900">Resource Grup</h2>
                        <p className="text-[12px] text-gray-500">Integrasikan notes & project board.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-8">

                        {/* Notes Integration */}
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                                    <FileText size={16} className="text-blue-500" /> Notes Tersimpan
                                </h3>
                                <button onClick={() => setIsAttachNoteModalOpen(true)} className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 border-dashed text-center">
                                <FileText size={24} className="text-blue-300 mx-auto mb-2" />
                                <p className="text-[12px] text-gray-500">Belum ada catatan yang dilampirkan dari AI Workspace.</p>
                                <button onClick={() => setIsAttachNoteModalOpen(true)} className="mt-3 text-[12px] font-bold text-blue-600 hover:underline">
                                    Lampirkan Notes
                                </button>
                            </div>
                        </section>

                        {/* Boards Integration */}
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                                    <FolderOpen size={16} className="text-green-500" /> Project Board Grup
                                </h3>
                                <button onClick={() => setIsAttachBoardModalOpen(true)} className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 border-dashed text-center">
                                <FolderOpen size={24} className="text-green-300 mx-auto mb-2" />
                                <p className="text-[12px] text-gray-500">Grup ini belum terhubung dengan Kanban Board manapun.</p>
                                <button onClick={() => setIsAttachBoardModalOpen(true)} className="mt-3 text-[12px] font-bold text-green-600 hover:underline">
                                    Hubungkan Board
                                </button>
                            </div>
                        </section>

                        {/* Online Members */}
                        <section>
                            <h3 className="text-[14px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Users size={16} className="text-purple-500" /> Anggota ({participants.length})
                            </h3>
                            <div className="space-y-3">
                                {participants.map(p => (
                                    <div key={p.id} className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center font-bold text-[12px] text-gray-600">
                                                {p.avatar}
                                            </div>
                                            {p.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}
                                        </div>
                                        <span className="text-[13px] font-medium text-gray-700 line-clamp-1">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
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
                            <button onClick={() => setIsAttachNoteModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
                            {isLoading ? (
                                <p className="text-center text-gray-500 p-4">Loading notes...</p>
                            ) : notes.length === 0 ? (
                                <p className="text-center text-gray-500 p-4">Kamu belum memiliki Notes.</p>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} onClick={() => handleAttachNote(note.id, note.title)} className="p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer flex items-center gap-3">
                                        <FileText className="text-blue-500 shrink-0" size={20} />
                                        <div>
                                            <h4 className="font-bold text-[14px] text-gray-800">{note.title}</h4>
                                            <p className="text-[11px] text-gray-500">Dibuat {formatDistanceToNow(new Date(note.created_at))} lalu</p>
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
                            <button onClick={() => setIsAttachBoardModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
                            {isLoading ? (
                                <p className="text-center text-gray-500 p-4">Loading boards...</p>
                            ) : boards.length === 0 ? (
                                <p className="text-center text-gray-500 p-4">Kamu tidak tergabung dalam Project Board manapun.</p>
                            ) : (
                                boards.map(board => (
                                    <div key={board.id} onClick={() => handleAttachBoard(board.id, board.title)} className="p-4 border border-gray-100 rounded-xl hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer flex items-center gap-3">
                                        <FolderOpen className="text-green-500 shrink-0" size={20} />
                                        <div>
                                            <h4 className="font-bold text-[14px] text-gray-800">{board.title}</h4>
                                            <p className="text-[11px] text-gray-500 line-clamp-1">{board.description || 'Tidak ada deskripsi'}</p>
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
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
                            <div>
                                <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
                                    <FileText size={20} className="text-blue-500" />
                                    {viewingNote.title}
                                </h2>
                                <p className="text-[12px] text-gray-500 mt-0.5">Dibagikan oleh <span className="font-semibold text-indigo-600">{viewingNote.author}</span></p>
                            </div>
                            <button onClick={() => setViewingNote(null)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-white/80 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-indigo-600">
                                <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-gray-700">
                                    {viewingNote.content}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end">
                            <button onClick={() => setViewingNote(null)} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 transition-colors cursor-pointer">
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
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[14px] font-medium text-gray-700">Memuat isi catatan...</span>
                    </div>
                </div>
            )}

        </div>
    );
}
