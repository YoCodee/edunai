"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  X,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";
import { processImageWithAI, saveGeneratedNote } from "./actions";

export default function AIBoardScanner() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string | null>(
    null,
  );

  const [noteTitle, setNoteTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedMarkdown(null); // Reset previous result
        setSaveSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setSaveSuccess(false);
    try {
      // The selectedImage is already a data URL (e.g., data:image/jpeg;base64,...)
      const response = await processImageWithAI(selectedImage);

      if (response.success && response.content) {
        setGeneratedMarkdown(response.content);
        // Generate a default title based on timestamp
        setNoteTitle(`Scanned Note - ${new Date().toLocaleDateString()}`);
      } else {
        alert(response.error || "Failed to process image.");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNote = async () => {
    if (!generatedMarkdown || !noteTitle) return;

    setIsSaving(true);
    const response = await saveGeneratedNote(noteTitle, generatedMarkdown);
    setIsSaving(false);

    if (response.success) {
      setSaveSuccess(true);
    } else {
      alert("Error saving note: " + response.error);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setGeneratedMarkdown(null);
    setNoteTitle("");
    setSaveSuccess(false);
  };

  return (
    <div className="min-h-full font-sans bg-[#fbfcff] flex flex-col p-6 lg:p-8">
      {/* Hidden File Inputs */}
      {/* 1. For Gallery/File Selection */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={galleryInputRef}
        onChange={handleImageSelect}
      />
      {/* 2. For Direct Camera Access (Mobile) */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={cameraInputRef}
        onChange={handleImageSelect}
      />

      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[12px] font-bold tracking-wide uppercase mb-4 shadow-sm">
            <Sparkles size={14} /> Powered by Gemini Flash
          </div>
          <h1 className="text-[36px] font-bold text-gray-900 mb-3 tracking-tight">
            AI Board Scanner
          </h1>
          <p className="text-[15px] text-gray-500 max-w-2xl">
            Take a photo of a whiteboard, notebook, or any study material. Our
            AI will automatically extract text, summarize core concepts, and
            reformat it into a beautiful Markdown note.
          </p>
        </div>

        {!selectedImage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto lg:mx-0 mt-8">
            {/* Gallery Upload Card */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="group flex flex-col items-center justify-center p-12 bg-white rounded-[32px] border-2 border-dashed border-gray-200 hover:border-[#38bcfc] hover:bg-blue-50/30 transition-all duration-300 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)]"
            >
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-6 border border-blue-100">
                <Upload size={32} className="text-[#38bcfc]" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-bold text-gray-900 mb-2">
                Upload Image
              </h3>
              <p className="text-[13px] text-gray-500 text-center">
                Browse from your gallery or drag and drop
              </p>
            </button>

            {/* Camera Capture Card */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="group flex flex-col items-center justify-center p-12 bg-white rounded-[32px] border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all duration-300 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)]"
            >
              <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-6 border border-purple-100">
                <Camera size={32} className="text-purple-500" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-bold text-gray-900 mb-2">
                Take Photo
              </h3>
              <p className="text-[13px] text-gray-500 text-center">
                Snap a whiteboard or your written notes
              </p>
            </button>
          </div>
        )}

        {/* Selected Image Preview & Processing State */}
        {selectedImage && !generatedMarkdown && (
          <div className="w-full max-w-2xl mx-auto lg:mx-0">
            <div className="bg-white p-4 rounded-[32px] shadow-[0_4px_30px_-10px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col">
              <div className="relative w-full aspect-video md:aspect-[4/3] rounded-[24px] overflow-hidden bg-gray-100 border border-gray-200 mb-6">
                <img
                  src={selectedImage}
                  alt="Scanned material"
                  className="w-full h-full object-contain"
                />

                {/* Close Button overlay */}
                {!isProcessing && (
                  <button
                    onClick={resetScanner}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur text-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 transition-opacity">
                    <Sparkles
                      size={48}
                      className="text-purple-400 mb-4 animate-pulse"
                    />
                    <h3 className="text-[20px] font-bold tracking-tight mb-2">
                      Analyzing Material...
                    </h3>
                    <p className="text-[13px] text-gray-300">
                      Gemini is extracting and summarizing text
                    </p>

                    {/* Animated progress bar */}
                    <div className="w-64 h-2 bg-white/20 rounded-full mt-6 overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#38bcfc] to-purple-500 rounded-full animate-[progress_2s_ease-in-out_infinite] w-[50%]"></div>
                    </div>
                  </div>
                )}
              </div>

              {!isProcessing && (
                <div className="flex gap-4">
                  <button
                    onClick={resetScanner}
                    className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-colors border border-gray-200"
                  >
                    Retake
                  </button>
                  <button
                    onClick={handleScanImage}
                    className="flex-[2] py-4 bg-[#1a1c20] hover:bg-[#2a2c30] text-white font-bold rounded-2xl transition-colors shadow-xl flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} /> Convert to Smart Note
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result View: Displaying the Generated Markdown */}
        {generatedMarkdown && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
            {/* Left Col: Original Image Mini Reference */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                  <ImageIcon size={14} /> Source Material
                </h4>
                <div className="rounded-2xl overflow-hidden aspect-video relative group">
                  <img
                    src={selectedImage!}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={resetScanner}
                      className="text-white text-[13px] font-bold flex items-center gap-2 border border-white/40 px-4 py-2 rounded-xl backdrop-blur-md hover:bg-white/20"
                    >
                      <Camera size={16} /> Scan Another
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.08)] border border-gray-100">
                <h4 className="text-[15px] font-bold text-gray-900 mb-4">
                  Save to Smart Notes
                </h4>

                {saveSuccess ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 size={24} />
                    </div>
                    <span className="font-bold text-[14px]">
                      Note Saved Successfully!
                    </span>
                    <p className="text-[12px] mt-1 opacity-80">
                      You can view it in your Smart Notes dashboard.
                    </p>
                    <button
                      onClick={resetScanner}
                      className="mt-4 w-full py-2.5 bg-white border border-green-200 rounded-lg text-green-700 font-bold hover:bg-green-100 transition-colors text-[13px]"
                    >
                      Scan New Material
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-gray-500">
                        Document Title
                      </label>
                      <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] font-semibold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fca03e]"
                        placeholder="e.g. History Chapter 2 Summary"
                      />
                    </div>
                    <button
                      onClick={handleSaveNote}
                      disabled={isSaving}
                      className="w-full bg-[#fca03e] hover:bg-[#ffb05c] text-[#1a1c20] font-bold text-[14px] py-3.5 rounded-xl shadow-[0_4px_15px_rgba(252,160,62,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save size={18} /> Save Note
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Markdown Result */}
            <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-[32px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.06)] border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-md">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-gray-900">
                      AI Generated Note
                    </h2>
                    <p className="text-[12px] text-gray-500">
                      Edited and structured by Gemini
                    </p>
                  </div>
                </div>
              </div>

              {/* The actual markdown content rendered */}
              <div className="prose prose-purple max-w-none prose-headings:font-bold prose-h1:text-[24px] prose-h2:text-[20px] prose-h3:text-[16px] prose-a:text-[#38bcfc] prose-li:text-gray-600 prose-p:text-gray-600 text-[15px] leading-relaxed">
                <ReactMarkdown>{generatedMarkdown}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            left: -50%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}
