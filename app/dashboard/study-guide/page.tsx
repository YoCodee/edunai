import { BookOpenText, Sparkles, ChevronRight } from "lucide-react";

export default function StudyGuidePage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbfcff] p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
            <BookOpenText size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
              Study Guide
            </h1>
            <p className="text-[14px] text-gray-400 mt-0.5">
              Materi belajar terstruktur untuk semua mata kuliah kamu.
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-28 h-28 bg-linear-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-inner">
            <BookOpenText
              size={52}
              className="text-blue-400"
              strokeWidth={1.5}
            />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles size={14} className="text-yellow-500" />
          </div>
        </div>

        <h2 className="text-[22px] font-bold text-gray-800 mb-3">
          Study Guide Segera Hadir
        </h2>
        <p className="text-[14px] text-gray-400 leading-relaxed mb-8">
          Kami sedang membangun fitur panduan belajar yang akan membantumu
          memahami materi lebih cepat dengan ringkasan pintar, contoh soal, dan
          jalur belajar yang dipersonalisasi oleh AI.
        </p>

        {/* Feature preview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {[
            {
              emoji: "📖",
              title: "Smart Summaries",
              desc: "Ringkasan otomatis per bab",
            },
            {
              emoji: "🧩",
              title: "Practice Sets",
              desc: "Latihan soal adaptif",
            },
            {
              emoji: "🗺️",
              title: "Learning Path",
              desc: "Jalur belajar personal",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-100 rounded-2xl p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] opacity-60"
            >
              <span className="text-[24px] block mb-2">{f.emoji}</span>
              <h4 className="text-[13px] font-bold text-gray-700">{f.title}</h4>
              <p className="text-[12px] text-gray-400 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
