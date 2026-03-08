"use client";

import { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  X,
  ArrowRight,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

interface ScanPhotoModalProps {
  onClose: () => void;
}

export default function ScanPhotoModal({ onClose }: ScanPhotoModalProps) {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isNavigating, setIsNavigating] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSendToAI = () => {
    if (!preview) return;
    setIsNavigating(true);
    // Simpan gambar ke sessionStorage agar dibaca oleh AIWorkspaceClient
    try {
      sessionStorage.setItem("scan_pending_image", preview);
    } catch {
      // sessionStorage mungkin penuh jika gambar sangat besar
      // fallback: langsung navigate, AI Workspace akan tampil normal
    }
    router.push("/dashboard/ai-workspace?scan=1");
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modal = (
    <>
      <style>{`
        @keyframes scan-modal-backdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scan-modal-card { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .scan-modal-backdrop { animation: scan-modal-backdrop 0.22s ease forwards; }
        .scan-modal-card { animation: scan-modal-card 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        @keyframes scan-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .scan-upload-zone {
          transition: all 0.2s ease;
        }
        .scan-upload-zone:hover {
          background: #fafafa;
          border-color: #d1d5db;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="scan-modal-backdrop fixed inset-0 z-9990 flex items-center justify-center p-4"
        style={{
          background: "rgba(15,17,22,0.55)",
          backdropFilter: "blur(8px)",
        }}
        onClick={handleBackdropClick}
      >
        {/* Card */}
        <div
          className="scan-modal-card w-full max-w-[420px] bg-white rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.22)] overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}
        >
          {/* Header */}
          <div style={{ padding: "22px 24px 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #111827, #374151)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Camera size={17} color="#fff" />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#111827",
                      lineHeight: 1.2,
                    }}
                  >
                    Scan Foto
                  </h2>
                  <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>
                    Foto catatan, tugas, atau papan tulis
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid #f3f4f6",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#9ca3af",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#fee2e2";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#ef4444";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#f9fafb";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#9ca3af";
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div style={{ padding: "18px 24px 24px" }}>
            {!preview ? (
              <>
                {/* Option buttons */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  {/* Kamera */}
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      padding: "20px 12px",
                      background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                      border: "1.5px solid #bae6fd",
                      borderRadius: 18,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(-2px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 8px 24px rgba(14,165,233,0.18)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(0)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "none";
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 16px rgba(14,165,233,0.35)",
                      }}
                    >
                      <Camera size={22} color="#fff" />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0c4a6e",
                        }}
                      >
                        Kamera
                      </p>
                      <p
                        style={{ fontSize: 11, color: "#7dd3fc", marginTop: 2 }}
                      >
                        Foto langsung
                      </p>
                    </div>
                  </button>

                  {/* Upload */}
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      padding: "20px 12px",
                      background: "linear-gradient(135deg, #fafafa, #f3f4f6)",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: 18,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(-2px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 8px 24px rgba(0,0,0,0.10)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(0)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "none";
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: "linear-gradient(135deg, #374151, #1f2937)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                      }}
                    >
                      <Upload size={20} color="#fff" />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1f2937",
                        }}
                      >
                        Upload
                      </p>
                      <p
                        style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}
                      >
                        Dari galeri/file
                      </p>
                    </div>
                  </button>
                </div>

                {/* Drag & Drop zone */}
                <div
                  className="scan-upload-zone"
                  onClick={() => galleryInputRef.current?.click()}
                  style={{
                    border: "2px dashed #e5e7eb",
                    borderRadius: 16,
                    padding: "20px 16px",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  <ImageIcon
                    size={20}
                    style={{ color: "#d1d5db", margin: "0 auto 8px" }}
                  />
                  <p
                    style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}
                  >
                    Drag foto ke sini, atau klik untuk pilih
                  </p>
                  <p style={{ fontSize: 11, color: "#d1d5db", marginTop: 4 }}>
                    JPG, PNG, WebP, HEIC — maks 10MB
                  </p>
                </div>
              </>
            ) : (
              /* Preview state */
              <div>
                {/* Image preview */}
                <div
                  style={{
                    position: "relative",
                    borderRadius: 16,
                    overflow: "hidden",
                    marginBottom: 14,
                    border: "1px solid #f3f4f6",
                    background: "#f9fafb",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: 240,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                  {/* Change button */}
                  <button
                    onClick={() => {
                      setPreview(null);
                      setFileName("");
                    }}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <X size={11} /> Ganti
                  </button>
                </div>

                {/* Filename */}
                {fileName && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      marginBottom: 14,
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    📄 {fileName}
                  </p>
                )}

                {/* Hint */}
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 12,
                    padding: "10px 14px",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14 }}>✨</span>
                  <p
                    style={{ fontSize: 12, color: "#166534", lineHeight: 1.5 }}
                  >
                    AI akan menganalisis foto ini dan mengubahnya menjadi
                    catatan terstruktur.
                  </p>
                </div>

                {/* Send to AI button */}
                <button
                  onClick={handleSendToAI}
                  disabled={isNavigating}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "13px 20px",
                    background: isNavigating
                      ? "#9ca3af"
                      : "linear-gradient(135deg, #111827, #374151)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: isNavigating ? "not-allowed" : "pointer",
                    boxShadow: isNavigating
                      ? "none"
                      : "0 6px 20px rgba(0,0,0,0.25)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isNavigating) {
                      (e.currentTarget as HTMLButtonElement).style.transform =
                        "translateY(-1px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 10px 28px rgba(0,0,0,0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      isNavigating ? "none" : "0 6px 20px rgba(0,0,0,0.25)";
                  }}
                >
                  {isNavigating ? (
                    <>
                      <Loader2
                        size={15}
                        style={{ animation: "spin 1s linear infinite" }}
                      />{" "}
                      Membuka AI Workspace...
                    </>
                  ) : (
                    <>
                      Analisis dengan AI <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={onFileChange}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}
