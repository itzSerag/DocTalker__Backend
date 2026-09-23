import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  Globe,
  Video,
  PenTool,
  CheckCircle,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { documentApi } from "../api/documentApi";

interface UploadModalProps {
  isOpen: boolean;
  initialTab?: "file" | "web" | "youtube" | "ocr";
  onClose: () => void;
  onUploadSuccess?: (docData: Record<string, unknown>) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  initialTab = "file",
  onClose,
  onUploadSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<
    "file" | "web" | "youtube" | "ocr"
  >(initialTab);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setUrlInput("");
    setIsLoading(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadProgress(null);
    setSelectedFile(null);
  };

  const handleTabChange = (tab: "file" | "web" | "youtube" | "ocr") => {
    setActiveTab(tab);
    resetState();
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadProgress(20);

    try {
      const res = await documentApi.uploadFile(file);
      setUploadProgress(60);

      if (res?.data?.documentId || res?.documentId) {
        const docId = res?.data?.documentId || res?.documentId;
        const files = res?.data?.files || res?.files || [file.name];
        await documentApi.processDocument(docId, files);
      }

      setUploadProgress(100);
      setSuccessMsg(`"${file.name}" uploaded and indexed successfully.`);
      onUploadSuccess?.(res);
    } catch (err: unknown) {
      const resError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        resError.response?.data?.message ||
          "Failed to upload document. Please check file format and size.",
      );
      setUploadProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !isLoading) handleFileSelect(file);
  };

  const handleUrlExtract = async (type: "web" | "youtube") => {
    if (!urlInput.trim()) {
      setErrorMsg("Please enter a valid URL.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await documentApi.extractContent(urlInput.trim());
      setSuccessMsg(
        type === "youtube"
          ? "YouTube transcript extracted and indexed successfully."
          : "Webpage content extracted and indexed successfully.",
      );
      onUploadSuccess?.(res);
    } catch (err: unknown) {
      const resError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        resError.response?.data?.message ||
          "Failed to extract content from the provided URL.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOcrUpload = async (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await documentApi.uploadHandwritten(file);
      setSuccessMsg(
        "Handwritten document analyzed and converted successfully.",
      );
      onUploadSuccess?.(res);
    } catch (err: unknown) {
      const resError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        resError.response?.data?.message ||
          "Failed to process handwritten image.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const TABS = [
    { id: "file" as const, label: "Document", icon: <FileText size={14} /> },
    { id: "web" as const, label: "Web Scraper", icon: <Globe size={14} /> },
    { id: "youtube" as const, label: "YouTube", icon: <Video size={14} /> },
    { id: "ocr" as const, label: "Handwritten", icon: <PenTool size={14} /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Add Knowledge Source
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Upload files or extract web knowledge directly into your workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            id="btn-close-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mx-4 mt-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-4 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle size={15} className="shrink-0 text-emerald-400" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Document Upload */}
          {activeTab === "file" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <div
                onClick={() => !isLoading && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center group ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-500/5"
                    : "border-slate-700 hover:border-indigo-500/60 bg-slate-950/30 hover:bg-slate-950/50"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
                  {isLoading ? (
                    <Loader2
                      size={24}
                      className="text-indigo-400 animate-spin"
                    />
                  ) : (
                    <UploadCloud size={24} className="text-indigo-400" />
                  )}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white mb-1">
                  {isLoading
                    ? "Uploading & Indexing..."
                    : "Click to select or drag & drop"}
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Research papers, reports, contracts, books
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {["PDF", "DOCX", "TXT", "CSV"].map((fmt) => (
                    <span
                      key={fmt}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              {selectedFile && uploadProgress !== null && (
                <div className="p-3 bg-slate-950/50 border border-slate-700 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                      {uploadProgress}%
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                  {uploadProgress === 100 && (
                    <CheckCircle
                      size={18}
                      className="text-emerald-400 shrink-0"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Web Scraper */}
          {activeTab === "web" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Webpage or Article URL
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-950/50 border border-slate-700 rounded-xl focus-within:border-indigo-500 transition-colors">
                  <Globe size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
                    className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  DocTalker scrapes clean markdown, strips ads & scripts, and
                  stores it for instant Q&A.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleUrlExtract("web")}
                  disabled={isLoading || !urlInput.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  {isLoading && <Loader2 size={14} className="animate-spin" />}
                  <span>Scrape & Ingest</span>
                </button>
              </div>
            </div>
          )}

          {/* YouTube */}
          {activeTab === "youtube" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  YouTube Video Link
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-950/50 border border-slate-700 rounded-xl focus-within:border-indigo-500 transition-colors">
                  <Video size={16} className="text-rose-400 shrink-0" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Extracts video transcripts and timestamps automatically for
                  chapter-wise citation analysis.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleUrlExtract("youtube")}
                  disabled={isLoading || !urlInput.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  {isLoading && <Loader2 size={14} className="animate-spin" />}
                  <span>Extract Transcript</span>
                </button>
              </div>
            </div>
          )}

          {/* Handwritten OCR */}
          {activeTab === "ocr" && (
            <div className="space-y-4">
              <input
                ref={ocrInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleOcrUpload(file);
                }}
              />
              <div
                onClick={() => !isLoading && ocrInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/30 hover:bg-slate-950/50 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-colors">
                  {isLoading ? (
                    <Loader2
                      size={24}
                      className="text-amber-400 animate-spin"
                    />
                  ) : (
                    <PenTool size={24} className="text-amber-400" />
                  )}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white mb-1">
                  {isLoading
                    ? "Processing Handwritten OCR..."
                    : "Upload photo of handwritten notes"}
                </div>
                <p className="text-[11px] text-slate-400">
                  Gemini Vision OCR transcribes cursive, math equations, and
                  diagrams.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
