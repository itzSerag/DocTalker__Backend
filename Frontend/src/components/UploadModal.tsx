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

      // If document needs processing
      if (res?.data?.documentId || res?.documentId) {
        const docId = res?.data?.documentId || res?.documentId;
        const files = res?.data?.files || res?.files || [file.name];
        await documentApi.processDocument(docId, files);
      }

      setUploadProgress(100);
      setSuccessMsg(`"${file.name}" uploaded and indexed successfully.`);
      onUploadSuccess?.(res);
    } catch (err: unknown) {
      console.error("Upload error:", err);
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
      console.error("Extraction error:", err);
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
      console.error("OCR error:", err);
      const resError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        resError.response?.data?.message ||
          "Failed to process handwritten image.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-app-surface border border-border-default rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-subtle bg-app-surface">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Multimodal Knowledge Ingestion
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Upload files or extract web knowledge directly into your workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-app-surface-hover transition-colors"
            id="btn-close-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border-subtle bg-app-bg/50 px-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleTabChange("file")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === "file"
                ? "border-primary text-white bg-app-surface/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText size={14} />
            <span>Document</span>
          </button>
          <button
            onClick={() => handleTabChange("web")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === "web"
                ? "border-primary text-white bg-app-surface/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe size={14} />
            <span>Web Scraper</span>
          </button>
          <button
            onClick={() => handleTabChange("youtube")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === "youtube"
                ? "border-primary text-white bg-app-surface/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Video size={14} />
            <span>YouTube Video</span>
          </button>
          <button
            onClick={() => handleTabChange("ocr")}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === "ocr"
                ? "border-primary text-white bg-app-surface/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <PenTool size={14} />
            <span>Handwritten OCR</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mx-4 mt-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-4 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle size={15} className="shrink-0 text-emerald-400" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: Document Upload */}
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
                className="border-2 border-dashed border-border-default hover:border-primary/60 bg-app-input/50 hover:bg-app-input rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  {isLoading ? (
                    <Loader2 size={24} className="text-primary animate-spin" />
                  ) : (
                    <UploadCloud size={24} className="text-primary" />
                  )}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white">
                  {isLoading
                    ? "Uploading & Indexing Document..."
                    : "Click to select or drag & drop documents"}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">
                  Upload research papers, quarterly reports, contracts, or books
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-app-surface border border-border-subtle text-slate-300">
                    PDF
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-app-surface border border-border-subtle text-slate-300">
                    DOCX
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-app-surface border border-border-subtle text-slate-300">
                    TXT
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-app-surface border border-border-subtle text-slate-300">
                    CSV
                  </span>
                </div>
              </div>

              {selectedFile && uploadProgress !== null && (
                <div className="p-3 bg-app-input border border-border-subtle rounded-lg flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10 text-primary">
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
                    <div className="w-full bg-app-surface h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-primary h-full transition-all duration-300"
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

          {/* TAB 2: Web Scraper */}
          {activeTab === "web" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Webpage or Article URL
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-app-input border border-border-default rounded-lg focus-within:border-primary transition-colors">
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
                  stores it in Pinecone for instant Q&A.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleUrlExtract("web")}
                  disabled={isLoading || !urlInput.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  {isLoading && <Loader2 size={14} className="animate-spin" />}
                  <span>Scrape & Ingest</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: YouTube */}
          {activeTab === "youtube" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  YouTube Video Link
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-app-input border border-border-default rounded-lg focus-within:border-primary transition-colors">
                  <Video size={16} className="text-rose-400 shrink-0" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  {isLoading && <Loader2 size={14} className="animate-spin" />}
                  <span>Extract Transcript</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Handwritten OCR */}
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
                className="border-2 border-dashed border-border-default hover:border-amber-500/60 bg-app-input/50 hover:bg-app-input rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
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
                <div className="text-xs sm:text-sm font-semibold text-white">
                  {isLoading
                    ? "Processing Handwritten OCR..."
                    : "Upload photo of handwritten notes or whiteboard"}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Gemini Vision OCR transcribes cursive, math equations, and
                  diagrammatic notes directly.
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
