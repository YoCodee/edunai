"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface TutorialStep {
  targetId: string; // ID elemen yang akan di-highlight
  title: string;
  description: string;
  position?: "right" | "left" | "top" | "bottom";
  icon?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: "sidebar-overview",
    title: "Overview",
    description:
      "Halaman utama dashboard kamu. Di sini kamu bisa melihat ringkasan aktivitas belajar, jadwal hari ini, catatan terbaru, dan statistik belajarmu secara sekilas.",
    position: "right",
    icon: "🧭",
  },
  {
    targetId: "sidebar-scheduler",
    title: "Smart Scheduler",
    description:
      "Jadwal belajar cerdas berbasis AI. Buat, kelola, dan atur jadwal kegiatan akademikmu — dari kelas, belajar mandiri, hingga pengingat tugas. Tersinkronisasi otomatis dengan aktivitasmu.",
    position: "right",
    icon: "📅",
  },
  {
    targetId: "sidebar-ai-workspace",
    title: "AI Workspace",
    description:
      "Ruang kerja AI personalmu. Upload foto catatan, tanya apapun tentang materi pelajaran, minta ringkasan, atau buat soal latihan. AI siap membantu belajarmu 24/7.",
    position: "right",
    icon: "🧠",
  },
  {
    targetId: "sidebar-boards",
    title: "Project Boards",
    description:
      "Manajemen proyek bergaya Kanban. Buat board untuk setiap projek atau mata kuliah, tambah task, dan lacak progres pengerjaanmu bersama tim atau secara mandiri.",
    position: "right",
    icon: "📋",
  },
  {
    targetId: "sidebar-study-guide",
    title: "Study Guide",
    description:
      "Panduan belajar terstruktur dengan AI. Dapatkan rangkuman materi, peta konsep, flashcard, dan kuis adaptif yang disesuaikan dengan level pemahamanmu.",
    position: "right",
    icon: "📖",
  },
  {
    targetId: "sidebar-study-group",
    title: "Study Group",
    description:
      "Belajar bersama lebih asik! Bergabung atau buat kelompok belajar, kolaborasi di collaborative canvas ala Miro/FigJam, dan diskusikan materi bersama teman.",
    position: "right",
    icon: "👥",
  },
  {
    targetId: "sidebar-settings",
    title: "Settings",
    description:
      "Kelola akun, preferensi notifikasi, tampilan dashboard, dan semua pengaturan aplikasimu dari sini.",
    position: "right",
    icon: "⚙️",
  },
];

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  startTutorial: () => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  currentStepData: TutorialStep | null;
}

const TutorialContext = createContext<TutorialContextType>({
  isActive: false,
  currentStep: 0,
  totalSteps: TUTORIAL_STEPS.length,
  startTutorial: () => {},
  stopTutorial: () => {},
  nextStep: () => {},
  prevStep: () => {},
  goToStep: () => {},
  currentStepData: null,
});

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTutorial = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const stopTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= TUTORIAL_STEPS.length - 1) {
        setIsActive(false);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < TUTORIAL_STEPS.length) {
      setCurrentStep(index);
    }
  }, []);

  const currentStepData = isActive ? TUTORIAL_STEPS[currentStep] : null;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: TUTORIAL_STEPS.length,
        startTutorial,
        stopTutorial,
        nextStep,
        prevStep,
        goToStep,
        currentStepData,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  return useContext(TutorialContext);
}
