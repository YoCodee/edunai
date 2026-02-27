"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus,
  MoreHorizontal,
  AlignLeft,
  Calendar as CalendarIcon,
  MessageSquare,
  Users,
  Search,
  CheckCircle2,
  Clock,
  CircleDashed,
  Settings,
  Sparkles,
  BarChart3,
  X,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import {
  moveCard,
  createCard,
  generateAITasks,
  updateCardLabels,
  deleteCard,
} from "./actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BoardDetailPage({ params }: PageProps) {
  // Use React.use() to unwrap the Promise-based params in Next.js 15
  const unwrappedParams = use(params);
  const boardId = unwrappedParams.id;

  const [board, setBoard] = useState<any>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);

  // Modals / Input States
  const [isAddingCardToList, setIsAddingCardToList] = useState<string | null>(
    null,
  );
  const [newCardTitle, setNewCardTitle] = useState("");

  // Enhancements States
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [syllabusText, setSyllabusText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const [assignMenuOpen, setAssignMenuOpen] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchBoardData();
  }, [boardId]);

  const fetchBoardData = async () => {
    setIsLoading(true);

    // 1. Fetch Board Info
    const { data: boardData, error: boardError } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (boardData) setBoard(boardData);

    // 2. Fetch Board Members (for Avatars & Assignments)
    const { data: membersData } = await supabase
      .from("board_members")
      .select(
        `
         user_id,
         role,
         profiles(full_name, avatar_url)
       `,
      )
      .eq("board_id", boardId);

    if (membersData) setBoardMembers(membersData);

    // 3. Fetch Lists and Cards
    const { data: listsData, error: listsError } = await supabase
      .from("board_lists")
      .select(
        `
        id, 
        title, 
        position,
        board_cards (
          id, title, description, due_date, position, labels
        )
      `,
      )
      .eq("board_id", boardId)
      .order("position", { ascending: true });

    if (!listsError && listsData) {
      // Sort cards inside each list by position manually because Supabase's nested order is sometimes tricky
      const sortedLists = listsData.map((list) => ({
        ...list,
        board_cards: list.board_cards.sort(
          (a: any, b: any) => a.position - b.position,
        ),
      }));
      setLists(sortedLists);
    }

    setIsLoading(false);
  };

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return; // Dropped outside the list
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return; // Unchanged

    // Create a new clone of state to mutate safely
    const newLists = Array.from(lists);

    // Find Source and Destination lists
    const sourceList = newLists.find((list) => list.id === source.droppableId);
    const destList = newLists.find(
      (list) => list.id === destination.droppableId,
    );

    if (!sourceList || !destList) return;

    // Moving within the same list
    if (source.droppableId === destination.droppableId) {
      const clonedCards = Array.from(sourceList.board_cards) as any[];
      const [movedCard] = clonedCards.splice(source.index, 1);
      clonedCards.splice(destination.index, 0, movedCard);

      // Re-calculate positions for UI
      const newClonedCards = clonedCards.map((c, idx) => ({
        ...c,
        position: idx,
      }));

      const updatedLists = newLists.map((list) => {
        if (list.id === source.droppableId)
          return { ...list, board_cards: newClonedCards };
        return list;
      });

      setLists(updatedLists);

      // Fire Server Action (Optimistic UI Update already happened above)
      await moveCard(draggableId, destination.droppableId, destination.index);
    } else {
      // Moving from one list to another
      const sourceCards = Array.from(sourceList.board_cards) as any[];
      const destCards = Array.from(destList.board_cards) as any[];

      const [movedCard] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedCard);

      // Re-calculate UI positions
      const newSourceCards = sourceCards.map((c, idx) => ({
        ...c,
        position: idx,
      }));
      const newDestCards = destCards.map((c, idx) => ({ ...c, position: idx }));

      const updatedLists = newLists.map((list) => {
        if (list.id === source.droppableId)
          return { ...list, board_cards: newSourceCards };
        if (list.id === destination.droppableId)
          return { ...list, board_cards: newDestCards };
        return list;
      });

      setLists(updatedLists);

      // Fire Server Action
      await moveCard(draggableId, destination.droppableId, destination.index);
    }
  };

  const handleAddNewCard = async (listId: string) => {
    if (!newCardTitle.trim()) {
      setIsAddingCardToList(null);
      return;
    }

    const relevantList = lists.find((l) => l.id === listId);
    const newPos = relevantList ? relevantList.board_cards.length : 0;

    // Call server action immediately
    const result = await createCard(listId, newCardTitle, "", newPos);

    if (result.data) {
      // Refresh lists to get proper ID and everything from DB
      fetchBoardData();
    } else {
      alert(result.error);
    }

    setNewCardTitle("");
    setIsAddingCardToList(null);
  };

  const handleAIGeneration = async () => {
    if (!syllabusText.trim()) return;
    setIsGenerating(true);
    const result = await generateAITasks(boardId, syllabusText);
    if (result.success) {
      await fetchBoardData(); // reload cards
      setIsAIModalOpen(false);
      setSyllabusText("");
    } else {
      alert(result.error);
    }
    setIsGenerating(false);
  };

  const toggleAssignee = async (
    cardId: string,
    member: any,
    currentLabels: any[] = [],
  ) => {
    const isAssigned = currentLabels.some(
      (l: any) => l.type === "assignee" && l.user_id === member.user_id,
    );
    let newLabels;
    if (isAssigned) {
      newLabels = currentLabels.filter(
        (l: any) => !(l.type === "assignee" && l.user_id === member.user_id),
      );
    } else {
      newLabels = [
        ...currentLabels,
        {
          type: "assignee",
          user_id: member.user_id,
          name: member.profiles.full_name,
          avatar_url: member.profiles.avatar_url,
        },
      ];
    }

    // Optimistic UI Update
    const newLists = lists.map((list) => ({
      ...list,
      board_cards: list.board_cards.map((card: any) => {
        if (card.id === cardId) return { ...card, labels: newLabels };
        return card;
      }),
    }));
    setLists(newLists);

    // Call server action
    await updateCardLabels(cardId, newLabels);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    // Optimistic UI Update
    const newLists = lists.map((list) => ({
      ...list,
      board_cards: list.board_cards.filter((card: any) => card.id !== cardId),
    }));
    setLists(newLists);

    // Call server action
    const result = await deleteCard(cardId);
    if (!result.success && result.error) {
      alert("Failed to delete card: " + result.error);
      fetchBoardData(); // Revert
    }
  };

  // Analytics Helpers
  const totalTasks = lists.reduce(
    (acc, list) => acc + (list.board_cards?.length || 0),
    0,
  );
  const doneList = lists.find((l) => l.title.toLowerCase().includes("done"));
  const doneTasks = doneList?.board_cards?.length || 0;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  // Icon helper based on List Name
  const getListIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("todo") || t.includes("to do"))
      return <CircleDashed size={16} className="text-gray-400" />;
    if (t.includes("progress"))
      return <Clock size={16} className="text-orange-400" />;
    if (t.includes("done"))
      return <CheckCircle2 size={16} className="text-green-500" />;
    return <CircleDashed size={16} className="text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#fbfcff]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">
          Loading Workspace Layout...
        </p>
      </div>
    );
  }

  if (!board)
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Board not found or you don't have access.
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] font-sans bg-[#fbfcff] -mx-6 md:-mx-10 -mt-6 md:-mt-10 overflow-hidden relative overflow-x-auto">
      {/* 1. Header Area (Sticks to top) */}
      <div className="h-[80px] min-w-max border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 left-0 right-0 z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight flex items-center gap-3">
              {board.title}
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[11px] uppercase tracking-wider font-extrabold border border-gray-200/60 shadow-inner">
                CODE: {board.join_code}
              </span>
            </h1>
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">
              {board.description || "Collaborative Workspace"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Member Avatars */}
          <div className="flex items-center -space-x-3">
            {boardMembers.slice(0, 4).map((m, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden shadow-sm"
                title={m.profiles.full_name}
              >
                {m.profiles.avatar_url ? (
                  <img
                    src={m.profiles.avatar_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-gray-600">
                    {m.profiles.full_name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
            ))}
            {boardMembers.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-gray-600">
                  +{boardMembers.length - 4}
                </span>
              </div>
            )}
            <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-green-500 hover:border-green-400 hover:bg-green-50 z-10 -ml-1 transition-colors">
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>

          <div className="w-[1px] h-8 bg-gray-200"></div>

          <div className="flex gap-2">
            {/* Progress Mini Overview */}
            <div
              className="hidden lg:flex items-center gap-3 px-4 py-1.5 border border-gray-200 rounded-xl bg-white mr-2 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setIsAnalyticsOpen(true)}
            >
              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-[12px] font-bold text-gray-700">
                {progressPercent}%
              </span>
            </div>

            {/* AI Auto-Breakdown Trigger */}
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="px-3 py-1.5 flex items-center gap-2 text-[#fca03e] font-bold bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors text-[13px]"
            >
              <Sparkles size={16} />{" "}
              <span className="hidden sm:inline">AI Breakdown</span>
            </button>
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
              title="Analytics"
            >
              <BarChart3 size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors hidden md:block">
              <Search size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Canvas for Kanban Lists */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar p-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full items-start w-max">
            {lists.map((list) => (
              <div
                key={list.id}
                className="w-[320px] max-h-full flex flex-col bg-[#f0f2f5]/80 backdrop-blur-sm rounded-[24px] border border-gray-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden shrink-0"
              >
                {/* List Header */}
                <div className="p-4 px-5 flex items-center justify-between group cursor-grab">
                  <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                    {getListIcon(list.title)}
                    {list.title}
                    <span className="ml-1 px-2 py-0.5 bg-gray-200/70 text-gray-600 rounded-full text-[11px] font-bold">
                      {list.board_cards?.length || 0}
                    </span>
                  </h3>
                  <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-200">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                {/* Droppable Area for Cards */}
                <Droppable droppableId={list.id} type="CARD">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={clsx(
                        "flex-1 overflow-y-auto custom-scrollbar px-3 pb-3 min-h-[50px] transition-colors rounded-b-[24px]",
                        snapshot.isDraggingOver ? "bg-black/5" : "",
                      )}
                    >
                      {list.board_cards?.map((card: any, index: number) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={index}
                        >
                          {(provided, snapshot) => {
                            const assignees = (card.labels || []).filter(
                              (l: any) => l.type === "assignee",
                            );
                            const normalLabels = (card.labels || []).filter(
                              (l: any) =>
                                (l.type !== "assignee" &&
                                  typeof l === "string") ||
                                l.color,
                            );

                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                                className={clsx(
                                  "bg-white rounded-[16px] p-4 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-gray-300 transition-colors group select-none relative",
                                  snapshot.isDragging
                                    ? "shadow-2xl rotate-[3deg] scale-105 border-green-200 z-50 ring-2 ring-green-500/20"
                                    : "",
                                )}
                                onClick={() => setAssignMenuOpen(null)} // Close menu if clicking outside specifically
                              >
                                {/* Labels (if any exist) */}
                                {normalLabels.length > 0 && (
                                  <div className="flex gap-1.5 mb-3 flex-wrap">
                                    {normalLabels.map((lbl: any, i: number) => (
                                      <span
                                        key={i}
                                        className="w-10 h-2 bg-blue-400 rounded-full inline-block"
                                      ></span>
                                    ))}
                                  </div>
                                )}

                                {/* Card Title & Delete */}
                                <div className="flex justify-between items-start gap-2 mb-3">
                                  <h4 className="text-[14px] font-semibold text-gray-800 leading-snug">
                                    {card.title}
                                  </h4>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCard(card.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all shrink-0 -mt-1 -mr-1"
                                    title="Delete Task"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>

                                {/* Card Footer Meta */}
                                <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 mt-auto pt-1">
                                  {card.description && (
                                    <div
                                      className="flex items-center gap-1 group-hover:text-gray-600 transition-colors"
                                      title="Has Description"
                                    >
                                      <AlignLeft size={12} />
                                    </div>
                                  )}

                                  {/* Assignees & Collaborator Logic */}
                                  <div className="flex items-center -space-x-1.5 ml-auto relative">
                                    {assignees.map((a: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="w-[22px] h-[22px] rounded-full border-2 border-white bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden shadow-sm z-0"
                                        title={a.name}
                                      >
                                        {a.avatar_url ? (
                                          <img
                                            src={a.avatar_url}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-[9px] font-bold text-gray-500">
                                            {a.name?.charAt(0) || "U"}
                                          </span>
                                        )}
                                      </div>
                                    ))}

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignMenuOpen(
                                          assignMenuOpen === card.id
                                            ? null
                                            : card.id,
                                        );
                                      }}
                                      className="w-[22px] h-[22px] rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-green-500 hover:border-green-400 bg-white hover:bg-green-50 transition-colors z-10"
                                      title="Assign Member"
                                    >
                                      <Plus size={12} strokeWidth={3} />
                                    </button>

                                    {/* Assignment Dropdown Menu */}
                                    {assignMenuOpen === card.id && (
                                      <div
                                        className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-[60] p-1.5 overflow-hidden"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="text-[10px] font-bold text-gray-400 px-3 py-1.5 mb-1 border-b border-gray-50 uppercase tracking-wider flex items-center justify-between">
                                          <span>Assign to...</span>
                                          <X
                                            size={12}
                                            className="cursor-pointer hover:text-gray-900"
                                            onClick={() =>
                                              setAssignMenuOpen(null)
                                            }
                                          />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                          {boardMembers.length > 0 ? (
                                            boardMembers.map((member) => {
                                              const isAssigned = assignees.some(
                                                (l: any) =>
                                                  l.user_id === member.user_id,
                                              );
                                              return (
                                                <div
                                                  key={member.user_id}
                                                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                                  onClick={() =>
                                                    toggleAssignee(
                                                      card.id,
                                                      member,
                                                      card.labels || [],
                                                    )
                                                  }
                                                >
                                                  <div className="w-7 h-7 rounded-full border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden flex items-center justify-center">
                                                    {member.profiles
                                                      .avatar_url ? (
                                                      <img
                                                        src={
                                                          member.profiles
                                                            .avatar_url
                                                        }
                                                        className="w-full h-full object-cover"
                                                      />
                                                    ) : (
                                                      <span className="text-[11px] font-bold text-indigo-500">
                                                        {member.profiles.full_name?.charAt(
                                                          0,
                                                        )}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <span className="text-[13px] font-medium text-gray-700 truncate">
                                                    {member.profiles.full_name}
                                                  </span>
                                                  {isAssigned && (
                                                    <CheckCircle2
                                                      size={16}
                                                      className="text-green-500 ml-auto shrink-0"
                                                    />
                                                  )}
                                                </div>
                                              );
                                            })
                                          ) : (
                                            <div className="p-3 text-center text-gray-400 text-[12px]">
                                              No members in this board.
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add Card Interface */}
                      {isAddingCardToList === list.id ? (
                        <div className="bg-white rounded-[16px] p-3 shadow-md border border-gray-200 mt-2">
                          <textarea
                            autoFocus
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddNewCard(list.id);
                              }
                            }}
                            className="w-full text-[13px] font-medium text-gray-900 border-none focus:outline-none resize-none bg-transparent placeholder-gray-400 mb-2 h-16"
                            placeholder="Write a task name... (Press Enter to save)"
                          />
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setIsAddingCardToList(null)}
                              className="text-[12px] font-bold text-gray-400 hover:text-gray-700 px-2 py-1"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddNewCard(list.id)}
                              className="text-[12px] font-bold bg-[#1a1c20] text-white px-3 py-1.5 rounded-lg hover:bg-black"
                            >
                              Add Card
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsAddingCardToList(list.id)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-[16px] text-[13px] font-bold text-gray-500 hover:text-gray-900 hover:bg-black/5 transition-all mt-1 group"
                        >
                          <Plus
                            size={16}
                            className="group-hover:text-green-500 transition-colors"
                          />{" "}
                          Add new task
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            {/* Empty space trick to allow scrolling past the last list */}
            <div className="w-8 shrink-0"></div>
          </div>
        </DragDropContext>
      </div>

      {/* MODALS */}
      {/* 1. AI Breakdown Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[600px] flex flex-col overflow-hidden">
            <div className="p-5 px-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
              <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-[#fca03e]" />
                Auto-Breakdown Task
              </h2>
              <button
                onClick={() => setIsAIModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[14px] text-gray-600 mb-4">
                Paste your project syllabus, assignment description, or rubric
                below. Gemini AI will automatically extract the requirements and
                break them down into actionable task cards in your <b>To Do</b>{" "}
                list.
              </p>
              <textarea
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                className="w-full h-40 bg-gray-50 border border-gray-200 rounded-xl p-4 text-[14px] focus:outline-none focus:border-[#fca03e] focus:ring-2 focus:ring-[#fca03e]/20 resize-none mb-4"
                placeholder="e.g. The final project requires researching 5 historical events, drafting an essay, designing a presentation, and preparing flashcards... (paste here)"
              ></textarea>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGeneration}
                  disabled={isGenerating || !syllabusText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#fca03e] hover:bg-[#ffb05c] text-[#1a1c20] font-bold transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isGenerating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  {isGenerating ? "Analyzing..." : "Generate Tasks"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Analytics Modal */}
      {isAnalyticsOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden">
            <div className="p-5 px-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 size={20} className="text-green-500" />
                Project Analytics
              </h2>
              <button
                onClick={() => setIsAnalyticsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-wider">
                    Overall Progress
                  </h3>
                  <span className="text-[24px] font-extrabold text-green-500 leading-none">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-[13px] text-gray-500 mt-2 font-medium">
                  {doneTasks} of {totalTasks} tasks completed
                </p>
              </div>

              <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                Task Distribution
              </h3>
              <div className="space-y-3">
                {lists.map((list) => {
                  const count = list.board_cards?.length || 0;
                  const percentage =
                    totalTasks === 0
                      ? 0
                      : Math.round((count / totalTasks) * 100);
                  return (
                    <div key={list.id} className="flex items-center gap-4">
                      <div className="w-24 shrink-0 text-[13px] font-bold text-gray-700 truncate">
                        {list.title}
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={
                            "h-full rounded-full " +
                            (list.title.toLowerCase().includes("done")
                              ? "bg-green-500"
                              : list.title.toLowerCase().includes("progress")
                                ? "bg-orange-400"
                                : "bg-blue-400")
                          }
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-8 shrink-0 text-right text-[12px] font-bold text-gray-500">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
