"use client";

import { useState, useRef } from "react";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Table,
  ChevronRight,
  Info,
  Sparkles,
  FileImage,
  Eye,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import * as XLSX from "xlsx";
import { bulkImportClasses, importKRSWithAI, BulkClassRow } from "./actions";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Props {
  onClose: () => void;
  onSuccess: () => void;
}
interface PreviewRow extends BulkClassRow {
  _valid: boolean;
  _error?: string;
}

const VALID_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const VALID_COLORS = ["blue", "purple", "green", "orange"];
const COLOR_DOT: Record<string, string> = {
  blue: "#3b82f6",
  purple: "#a855f7",
  green: "#22c55e",
  orange: "#f97316",
};

/* ─── Template Download ──────────────────────────────────────────────────── */
function downloadTemplate() {
  const data = [
    {
      course_name: "Calculus I",
      day_of_week: "Monday",
      start_time: "08:00",
      end_time: "09:40",
      location: "Room A101",
      color: "blue",
      semester_start_date: "2026-02-24",
      weeks: 16,
    },
    {
      course_name: "Physics Lab",
      day_of_week: "Tuesday",
      start_time: "13:00",
      end_time: "15:00",
      location: "Lab B2",
      color: "purple",
      semester_start_date: "2026-02-24",
      weeks: 16,
    },
    {
      course_name: "English",
      day_of_week: "Wednesday",
      start_time: "10:00",
      end_time: "11:40",
      location: "Online",
      color: "green",
      semester_start_date: "2026-02-24",
      weeks: 16,
    },
  ];
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
    { wch: 10 },
    { wch: 22 },
    { wch: 8 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Schedule");
  const info = [
    { Field: "course_name", Description: "Course/class name", Required: "Yes" },
    { Field: "day_of_week", Description: "Monday … Sunday", Required: "Yes" },
    {
      Field: "start_time",
      Description: "HH:mm 24-hour (e.g. 08:00)",
      Required: "Yes",
    },
    {
      Field: "end_time",
      Description: "HH:mm 24-hour (e.g. 09:40)",
      Required: "Yes",
    },
    { Field: "location", Description: "Room or location", Required: "No" },
    {
      Field: "color",
      Description: "blue / purple / green / orange",
      Required: "No",
    },
    {
      Field: "semester_start_date",
      Description: "YYYY-MM-DD first day of semester",
      Required: "Yes",
    },
    {
      Field: "weeks",
      Description: "Repeat for N weeks (default 16)",
      Required: "No",
    },
  ];
  const wsI = XLSX.utils.json_to_sheet(info);
  wsI["!cols"] = [{ wch: 24 }, { wch: 50 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsI, "Field Guide");
  XLSX.writeFile(wb, "edunai_schedule_template.xlsx");
}

/* ─── Row Validation ─────────────────────────────────────────────────────── */
function validateRow(r: Record<string, unknown>): PreviewRow {
  const errs: string[] = [];
  const course_name = String(r.course_name || r["Course Name"] || "").trim();
  const day_of_week = String(r.day_of_week || r["Day of Week"] || "").trim();
  const start_time = String(r.start_time || r["Start Time"] || "").trim();
  const end_time = String(r.end_time || r["End Time"] || "").trim();
  const location = String(r.location || r["Location"] || "").trim();
  const color = String(r.color || r["Color"] || "blue")
    .trim()
    .toLowerCase();
  const semester_start_date = String(
    r.semester_start_date || r["Semester Start Date"] || "",
  ).trim();
  const weeks = Number(r.weeks || r["Weeks"] || 16);

  if (!course_name) errs.push("course_name empty");
  if (!VALID_DAYS.some((d) => d.toLowerCase() === day_of_week.toLowerCase()))
    errs.push(`day "${day_of_week}" invalid`);
  if (!/^\d{2}:\d{2}$/.test(start_time)) errs.push("start_time must be HH:mm");
  if (!/^\d{2}:\d{2}$/.test(end_time)) errs.push("end_time must be HH:mm");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(semester_start_date))
    errs.push("date must be YYYY-MM-DD");

  return {
    course_name,
    day_of_week,
    start_time,
    end_time,
    location,
    color: VALID_COLORS.includes(color) ? color : "blue",
    semester_start_date,
    weeks: isNaN(weeks) || weeks <= 0 ? 16 : weeks,
    _valid: errs.length === 0,
    _error: errs.length > 0 ? errs.join("; ") : undefined,
  };
}

/* ─── StepPill ───────────────────────────────────────────────────────────── */
function StepPill({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  const cls = active
    ? "bg-gray-900 text-white"
    : done
      ? "bg-gray-200 text-gray-600"
      : "bg-gray-100 text-gray-400";
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}
    >
      {done && <CheckCircle size={10} />}
      {label}
    </div>
  );
}

/* ─── Preview Table ──────────────────────────────────────────────────────── */
function PreviewTable({
  rows,
  onColorChange,
  onFieldChange,
}: {
  rows: PreviewRow[];
  onColorChange?: (i: number, v: string) => void;
  onFieldChange?: (i: number, f: string, v: string) => void;
}) {
  const valid = rows.filter((r) => r._valid);
  const invalid = rows.filter((r) => !r._valid);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-[12px] font-semibold">
          {valid.length > 0 && (
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full">
              ✓ {valid.length} valid
            </span>
          )}
          {invalid.length > 0 && (
            <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full">
              ✗ {invalid.length} invalid
            </span>
          )}
        </div>
        {valid.length > 0 && (
          <p className="text-[12px] text-gray-400">
            ≈{" "}
            <span className="font-bold text-gray-700">
              {valid.reduce((s, r) => s + (r.weeks || 16), 0)} events
            </span>{" "}
            will be created
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="w-full text-[12px]">
            <thead className="sticky top-0">
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "#",
                  "Course Name",
                  "Day",
                  "Time",
                  "Location",
                  "Color",
                  "Sem. Start",
                  "Wks",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 font-bold text-gray-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-50 last:border-0 ${!row._valid ? "bg-red-50/40" : "hover:bg-gray-50/30"}`}
                >
                  <td className="px-3 py-2.5 text-gray-400 font-mono">
                    {i + 1}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-gray-800">
                    <span className="block truncate max-w-[150px]">
                      {row.course_name || (
                        <span className="text-red-400 italic">empty</span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                    {row.day_of_week}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 font-mono whitespace-nowrap">
                    {onFieldChange ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="time"
                          value={row.start_time}
                          onChange={(e) =>
                            onFieldChange(i, "start_time", e.target.value)
                          }
                          className="w-20 text-[11px] border border-gray-200 rounded px-1 py-0.5"
                        />
                        <span className="text-gray-300">–</span>
                        <input
                          type="time"
                          value={row.end_time}
                          onChange={(e) =>
                            onFieldChange(i, "end_time", e.target.value)
                          }
                          className="w-20 text-[11px] border border-gray-200 rounded px-1 py-0.5"
                        />
                      </div>
                    ) : (
                      `${row.start_time} – ${row.end_time}`
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 max-w-[100px]">
                    <span className="block truncate">
                      {row.location || <span className="text-gray-300">—</span>}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {onColorChange ? (
                      <select
                        value={row.color}
                        onChange={(e) => onColorChange(i, e.target.value)}
                        className="text-[11px] border border-gray-200 rounded px-1 py-0.5 bg-white"
                      >
                        {VALID_COLORS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            background: COLOR_DOT[row.color] || "#9ca3af",
                          }}
                        />
                        <span className="text-gray-600">{row.color}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 font-mono whitespace-nowrap">
                    {onFieldChange ? (
                      <input
                        type="date"
                        value={row.semester_start_date}
                        onChange={(e) =>
                          onFieldChange(
                            i,
                            "semester_start_date",
                            e.target.value,
                          )
                        }
                        className="w-32 text-[11px] border border-gray-200 rounded px-1 py-0.5"
                      />
                    ) : (
                      row.semester_start_date
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 text-center">
                    {onFieldChange ? (
                      <input
                        type="number"
                        min={1}
                        max={52}
                        value={row.weeks}
                        onChange={(e) =>
                          onFieldChange(i, "weeks", e.target.value)
                        }
                        className="w-12 text-[11px] border border-gray-200 rounded px-1 py-0.5 text-center"
                      />
                    ) : (
                      row.weeks
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {row._valid ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                        <CheckCircle size={11} /> Valid
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-red-500 font-semibold"
                        title={row._error}
                      >
                        <AlertCircle size={11} /> Error
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {invalid.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[12px] font-bold text-red-500">
            ⚠ Rows with errors (will be skipped):
          </p>
          {invalid.map((row, i) => (
            <div
              key={i}
              className="text-[12px] text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
            >
              Row {rows.indexOf(row) + 1}: {row._error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────────────────── */
export default function BulkImportModal({ onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<"excel" | "krs">("excel");

  // Excel flow
  const excelRef = useRef<HTMLInputElement>(null);
  const [excelPhase, setExcelPhase] = useState<"upload" | "preview" | "done">(
    "upload",
  );
  const [excelRows, setExcelRows] = useState<PreviewRow[]>([]);
  const [excelName, setExcelName] = useState("");
  const [excelErr, setExcelErr] = useState("");

  // KRS flow
  const krsRef = useRef<HTMLInputElement>(null);
  const [krsPhase, setKrsPhase] = useState<
    "upload" | "processing" | "preview" | "done"
  >("upload");
  const [krsRows, setKrsRows] = useState<PreviewRow[]>([]);
  const [krsName, setKrsName] = useState("");
  const [krsErr, setKrsErr] = useState("");
  const [krsPreviewUrl, setKrsPreviewUrl] = useState("");
  const [krsIsImage, setKrsIsImage] = useState(true);

  // Shared
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ total: number; events: number } | null>(
    null,
  );

  /* Excel handlers */
  function onExcelFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelName(file.name);
    setExcelErr("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const sn =
          wb.SheetNames.find((n) => n.toLowerCase() !== "field guide") ||
          wb.SheetNames[0];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          wb.Sheets[sn],
          { defval: "" },
        );
        if (!jsonRows.length) {
          setExcelErr("File is empty.");
          return;
        }
        setExcelRows(jsonRows.map(validateRow));
        setExcelPhase("preview");
      } catch {
        setExcelErr("Failed to read file.");
      }
    };
    reader.readAsBinaryString(file);
  }

  async function onExcelImport() {
    const valid = excelRows.filter((r) => r._valid);
    if (!valid.length) return;
    setBusy(true);
    setExcelErr("");
    const res = await bulkImportClasses(valid as BulkClassRow[]);
    setBusy(false);
    if (res.error) {
      setExcelErr(res.error);
    } else {
      setDone({ total: valid.length, events: res.totalEvents || 0 });
      setExcelPhase("done");
      onSuccess();
    }
  }

  /* KRS handlers */
  async function onKrsFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setKrsName(file.name);
    setKrsErr("");
    setKrsRows([]);
    const isImg = file.type.startsWith("image/");
    setKrsIsImage(isImg);
    setKrsPreviewUrl(isImg ? URL.createObjectURL(file) : "");
    setKrsPhase("processing");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      const b64 = dataUrl.split(",")[1];
      if (!b64) {
        setKrsErr("Failed to read file.");
        setKrsPhase("upload");
        return;
      }
      const res = await importKRSWithAI(b64, file.type);
      if (res.error) {
        setKrsErr(res.error);
        setKrsPhase("upload");
        return;
      }
      setKrsRows(
        (res.rows || []).map((r) => ({
          ...r,
          _valid: true,
          _error: undefined,
        })),
      );
      setKrsPhase("preview");
    };
    reader.readAsDataURL(file);
  }

  function onKrsColor(i: number, v: string) {
    setKrsRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, color: v } : r)),
    );
  }

  function onKrsField(i: number, f: string, v: string) {
    setKrsRows((prev) =>
      prev.map((r, idx) =>
        idx === i ? { ...r, [f]: f === "weeks" ? Number(v) : v } : r,
      ),
    );
  }

  async function onKrsImport() {
    const valid = krsRows.filter((r) => r._valid);
    if (!valid.length) return;
    setBusy(true);
    setKrsErr("");
    const res = await bulkImportClasses(valid as BulkClassRow[]);
    setBusy(false);
    if (res.error) {
      setKrsErr(res.error);
    } else {
      setDone({ total: valid.length, events: res.totalEvents || 0 });
      setKrsPhase("done");
      onSuccess();
    }
  }

  function resetKrs() {
    setKrsPhase("upload");
    setKrsRows([]);
    setKrsName("");
    setKrsErr("");
    setKrsPreviewUrl("");
    if (krsRef.current) krsRef.current.value = "";
  }

  const isDone = excelPhase === "done" || krsPhase === "done";
  // Cast to string to prevent TS narrowing out "done" inside !isDone blocks
  const exPhase = excelPhase as string;
  const krPhase = krsPhase as string;
  const excelValidCount = excelRows.filter((r) => r._valid).length;
  const krsValidCount = krsRows.filter((r) => r._valid).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[780px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <BookOpen size={17} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">
                Import Schedule
              </h2>
              <p className="text-[12px] text-gray-400">
                Bulk import via Excel or AI-powered KRS scan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode tabs */}
        {!isDone && (
          <div className="flex gap-2 px-7 py-3 border-b border-gray-50 bg-gray-50/50 shrink-0">
            <button
              onClick={() => setMode("excel")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${mode === "excel" ? "bg-white shadow-sm border border-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
            >
              <FileSpreadsheet size={14} /> Excel Template
            </button>
            <button
              onClick={() => setMode("krs")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${mode === "krs" ? "bg-white shadow-sm border border-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
            >
              <Sparkles
                size={14}
                className={mode === "krs" ? "text-amber-500" : ""}
              />
              Import KRS (AI)
              <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                NEW
              </span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {/* Done */}
          {isDone && done && (
            <div className="flex flex-col items-center justify-center py-14 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle size={30} className="text-gray-700" />
              </div>
              <div>
                <h3 className="text-[20px] font-black text-gray-900">
                  Import Successful!
                </h3>
                <p className="text-[14px] text-gray-500 mt-1.5">
                  <span className="font-bold text-gray-800">
                    {done.total} course{done.total > 1 ? "s" : ""}
                  </span>{" "}
                  →{" "}
                  <span className="font-bold text-gray-800">
                    {done.events} calendar events
                  </span>{" "}
                  created
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-[14px] hover:bg-gray-700 transition-colors"
              >
                View Calendar
              </button>
            </div>
          )}

          {/* ══ EXCEL mode ══ */}
          {!isDone && mode === "excel" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <StepPill
                  label="1. Download Template"
                  active={excelPhase === "upload"}
                  done={excelPhase !== "upload"}
                />
                <ChevronRight size={13} className="text-gray-300" />
                <StepPill
                  label="2. Upload & Preview"
                  active={exPhase === "preview"}
                  done={exPhase === "done"}
                />
                <ChevronRight size={13} className="text-gray-300" />
                <StepPill
                  label="3. Import"
                  active={false}
                  done={exPhase === "done"}
                />
              </div>

              {exPhase === "upload" && (
                <>
                  <div className="rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <Download size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-gray-800 mb-1">
                          Step 1 — Download Template
                        </h3>
                        <p className="text-[13px] text-gray-500 mb-3">
                          Fill in your courses, then upload it back.
                        </p>
                        <button
                          onClick={downloadTemplate}
                          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-gray-700 transition-colors"
                        >
                          <Download size={13} /> Download .xlsx Template
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-5 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Info size={13} className="text-gray-400" />
                      <h3 className="text-[13px] font-bold text-gray-700">
                        Column Guide
                      </h3>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        {
                          f: "course_name",
                          d: "Course name",
                          ex: "Calculus I",
                          req: true,
                        },
                        {
                          f: "day_of_week",
                          d: "Weekday",
                          ex: "Monday … Sunday",
                          req: true,
                        },
                        {
                          f: "start_time",
                          d: "Start (HH:mm)",
                          ex: "08:00",
                          req: true,
                        },
                        {
                          f: "end_time",
                          d: "End (HH:mm)",
                          ex: "09:40",
                          req: true,
                        },
                        {
                          f: "location",
                          d: "Room/location",
                          ex: "Room A101",
                          req: false,
                        },
                        {
                          f: "color",
                          d: "Card color",
                          ex: "blue / purple / green / orange",
                          req: false,
                        },
                        {
                          f: "semester_start_date",
                          d: "First day (YYYY-MM-DD)",
                          ex: "2026-02-24",
                          req: true,
                        },
                        { f: "weeks", d: "Repeat weeks", ex: "16", req: false },
                      ].map((col) => (
                        <div
                          key={col.f}
                          className="flex items-start gap-3 py-0.5"
                        >
                          <code className="text-[11px] font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded shrink-0 min-w-[185px]">
                            {col.f}
                            {col.req && (
                              <span className="text-red-400 ml-0.5">*</span>
                            )}
                          </code>
                          <span className="text-[12px] text-gray-500">
                            {col.d} —{" "}
                            <span className="italic text-gray-400">
                              {col.ex}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
                    onClick={() => excelRef.current?.click()}
                  >
                    <Upload size={22} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-[14px] font-bold text-gray-600">
                      Step 2 — Upload your filled template
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1">
                      Supports .xlsx and .csv
                    </p>
                    <button className="mt-4 bg-gray-900 text-white px-5 py-2 rounded-xl text-[13px] font-bold hover:bg-gray-700 transition-colors">
                      Choose File
                    </button>
                    <input
                      ref={excelRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={onExcelFile}
                    />
                  </div>

                  {excelErr && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle
                        size={14}
                        className="text-red-500 shrink-0 mt-0.5"
                      />
                      <p className="text-[13px] text-red-700">{excelErr}</p>
                    </div>
                  )}
                </>
              )}

              {exPhase === "preview" && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-mono text-gray-500">
                      📄 {excelName}
                    </p>
                    <button
                      onClick={() => {
                        setExcelPhase("upload");
                        setExcelRows([]);
                        if (excelRef.current) excelRef.current.value = "";
                      }}
                      className="text-[12px] text-gray-400 hover:text-gray-700 flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> Change file
                    </button>
                  </div>
                  {excelErr && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle
                        size={13}
                        className="text-red-500 shrink-0"
                      />
                      <p className="text-[12px] text-red-700">{excelErr}</p>
                    </div>
                  )}
                  <PreviewTable rows={excelRows} />
                </>
              )}
            </div>
          )}

          {/* ══ KRS mode ══ */}
          {!isDone && mode === "krs" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <StepPill
                  label="1. Upload KRS"
                  active={krPhase === "upload"}
                  done={krPhase !== "upload"}
                />
                <ChevronRight size={13} className="text-gray-300" />
                <StepPill
                  label="2. AI Parsing"
                  active={krPhase === "processing"}
                  done={krPhase === "preview" || krPhase === "done"}
                />
                <ChevronRight size={13} className="text-gray-300" />
                <StepPill
                  label="3. Review & Import"
                  active={krPhase === "preview"}
                  done={krPhase === "done"}
                />
              </div>

              {/* Upload */}
              {krPhase === "upload" && (
                <>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
                    <div className="flex items-start gap-3">
                      <Sparkles
                        size={16}
                        className="text-amber-500 shrink-0 mt-0.5"
                      />
                      <div>
                        <h3 className="text-[14px] font-bold text-gray-800 mb-1">
                          How AI KRS Import Works
                        </h3>
                        <p className="text-[13px] text-gray-600 leading-relaxed">
                          Upload a <strong>photo or PDF of your KRS</strong>.
                          Gemini AI reads the document, detects courses, days,
                          times, and rooms — then fills them automatically.
                          Works with KRS from{" "}
                          <strong>any Indonesian university</strong>.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {[
                            "ITB",
                            "UI",
                            "ITS",
                            "UGM",
                            "UNAIR",
                            "Binus",
                            "Telkom University",
                            "dan lainnya",
                          ].map((u) => (
                            <span
                              key={u}
                              className="text-[10px] font-semibold bg-white border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full"
                            >
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center cursor-pointer hover:border-amber-300 hover:bg-amber-50/20 transition-all group"
                    onClick={() => krsRef.current?.click()}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-amber-100 flex items-center justify-center mx-auto mb-4 transition-colors">
                      <FileImage
                        size={26}
                        className="text-gray-400 group-hover:text-amber-500 transition-colors"
                      />
                    </div>
                    <p className="text-[15px] font-bold text-gray-700 mb-1">
                      Upload your KRS
                    </p>
                    <p className="text-[13px] text-gray-400 mb-1">
                      Photo (JPG, PNG, WebP) or PDF
                    </p>
                    <p className="text-[12px] text-gray-300">
                      Max 10 MB recommended
                    </p>
                    <button className="mt-5 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
                      <Upload size={14} /> Choose KRS File
                    </button>
                    <input
                      ref={krsRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                      className="hidden"
                      onChange={onKrsFile}
                    />
                  </div>

                  {krsErr && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle
                        size={14}
                        className="text-red-500 shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-[13px] font-semibold text-red-700 mb-0.5">
                          AI could not parse the document
                        </p>
                        <p className="text-[12px] text-red-600">{krsErr}</p>
                        <p className="text-[12px] text-gray-400 mt-1.5">
                          Tips: use a clear, well-lit image where the full table
                          is visible.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Processing */}
              {krPhase === "processing" && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  {krsIsImage && krsPreviewUrl && (
                    <div className="w-full max-w-xs rounded-xl overflow-hidden border border-gray-100 shadow-sm mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={krsPreviewUrl}
                        alt="KRS preview"
                        className="w-full object-contain max-h-[200px]"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <Loader2
                      size={20}
                      className="text-amber-500 animate-spin"
                    />
                    <span className="text-[15px] font-bold text-gray-800">
                      Gemini AI is reading your KRS…
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-400 max-w-sm">
                    Scanning document structure, identifying courses, mapping
                    Indonesian field names. Usually takes 5–15 seconds.
                  </p>
                </div>
              )}

              {/* Preview */}
              {krPhase === "preview" && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {krsIsImage && krsPreviewUrl && (
                        <button
                          onClick={() => window.open(krsPreviewUrl, "_blank")}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye size={12} /> View KRS
                        </button>
                      )}
                      <p className="text-[12px] font-mono text-gray-400">
                        {krsName}
                      </p>
                    </div>
                    <button
                      onClick={resetKrs}
                      className="text-[12px] text-gray-400 hover:text-gray-700 flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> Reupload
                    </button>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[12px] text-amber-700 flex items-start gap-2">
                    <Info size={13} className="shrink-0 mt-0.5" />
                    <span>
                      AI extraction is automatic —{" "}
                      <strong>review the results below</strong> and correct
                      times/dates if needed before importing.
                    </span>
                  </div>

                  {krsErr && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle
                        size={13}
                        className="text-red-500 shrink-0"
                      />
                      <p className="text-[12px] text-red-700">{krsErr}</p>
                    </div>
                  )}
                  <PreviewTable
                    rows={krsRows}
                    onColorChange={onKrsColor}
                    onFieldChange={onKrsField}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isDone && (
          <div className="px-7 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => {
                if (mode === "excel" && excelPhase === "preview") {
                  setExcelPhase("upload");
                  setExcelRows([]);
                } else if (mode === "krs" && krsPhase === "preview") {
                  resetKrs();
                } else {
                  onClose();
                }
              }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-[13px] hover:bg-gray-50 transition-colors"
            >
              {(mode === "excel" && excelPhase === "preview") ||
              (mode === "krs" && krsPhase === "preview")
                ? "← Back"
                : "Cancel"}
            </button>

            {mode === "excel" && exPhase === "preview" && (
              <button
                onClick={onExcelImport}
                disabled={busy || excelValidCount === 0}
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Importing…
                  </>
                ) : (
                  <>
                    <Table size={14} /> Import {excelValidCount} Course
                    {excelValidCount > 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}

            {mode === "krs" && krPhase === "preview" && (
              <button
                onClick={onKrsImport}
                disabled={busy || krsValidCount === 0}
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Importing…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-400" /> Import{" "}
                    {krsValidCount} Course{krsValidCount > 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
