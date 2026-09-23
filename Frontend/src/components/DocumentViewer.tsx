import React, { useEffect, useState } from "react";
import { Download, ExternalLink, FileText, FolderOpen } from "lucide-react";
import { documentApi } from "../api/documentApi";

export interface WorkspaceSourceFile {
  FileName: string;
  FileURL?: string;
  Chunks?: Array<{
    rawText: string;
    pageNumber?: number | null;
    fileName?: string;
  }>;
}

interface DocumentViewerProps {
  chatId?: string | null;
  documentTitle?: string;
  files?: WorkspaceSourceFile[];
  isLoading?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  chatId,
  documentTitle,
  files = [],
  isLoading = false,
}) => {
  const [activeFileKey, setActiveFileKey] = useState<string | null>(null);
  const selectedIndex = files.findIndex(
    (file, index) => `${file.FileName}:${index}` === activeFileKey,
  );
  const activeIndex = selectedIndex < 0 ? 0 : selectedIndex;
  const activeFile = files[activeIndex];
  const isPdf = activeFile?.FileName.toLowerCase().endsWith(".pdf");
  const previewKey = `${chatId || ""}:${activeIndex}`;
  const [preview, setPreview] = useState<{ key: string; url: string } | null>(
    null,
  );
  const [previewError, setPreviewError] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const currentPreviewError =
    previewError?.key === previewKey ? previewError.message : null;
  const previewUrl = preview?.key === previewKey ? preview.url : null;

  useEffect(() => {
    if (!chatId || !activeFile || !isPdf) return;
    const controller = new AbortController();
    let objectUrl: string | null = null;
    documentApi
      .getChatFile(chatId, activeIndex, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setPreview({ key: previewKey, url: objectUrl });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setPreviewError({
            key: previewKey,
            message:
              error instanceof Error
                ? error.message
                : "Could not load the PDF preview.",
          });
        }
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [chatId, activeIndex, activeFile, isPdf, previewKey]);

  return (
    <section className="flex h-full min-w-0 flex-col bg-slate-950 text-slate-100">
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 bg-slate-950/90 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {files.length > 1 ? (
            <FolderOpen size={16} className="shrink-0 text-indigo-300" />
          ) : (
            <FileText size={16} className="shrink-0 text-indigo-300" />
          )}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">
              {documentTitle || "Your sources"}
            </h2>
            <p className="text-[11px] text-slate-500">
              {files.length
                ? `${files.length} ${files.length === 1 ? "source" : "sources"} in this workspace`
                : "Your private research workspace"}
            </p>
          </div>
        </div>
        {previewUrl && (
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={previewUrl}
              download={activeFile.FileName}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Download source"
              title="Download source"
            >
              <Download size={15} />
            </a>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Open source in new tab"
              title="Open source"
            >
              <ExternalLink size={15} />
            </a>
          </div>
        )}
      </header>

      {files.length > 1 && (
        <nav
          aria-label="Files in this folder chat"
          className="flex shrink-0 gap-2 overflow-x-auto border-b border-white/10 px-4 py-2"
        >
          {files.map((file, index) => (
            <button
              key={`${file.FileName}-${index}`}
              onClick={() => setActiveFileKey(`${file.FileName}:${index}`)}
              className={`max-w-56 truncate rounded-lg px-3 py-1.5 text-xs transition ${index === activeIndex ? "bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-400/30" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              title={file.FileName}
            >
              {file.FileName}
            </button>
          ))}
        </nav>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Loading your source…
          </div>
        ) : !activeFile ? (
          <div className="flex h-full min-h-80 flex-col items-center justify-center px-8 text-center">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-indigo-300/15 bg-indigo-400/10 text-indigo-200">
              <FileText size={23} />
            </div>
            <h3 className="text-base font-semibold">
              Bring your research into focus
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Upload a document, add a web source, or start a folder chat. Your
              actual source and its extracted text will appear here.
            </p>
          </div>
        ) : isPdf ? (
          previewUrl ? (
            <iframe
              key={previewUrl}
              src={previewUrl}
              title={activeFile.FileName}
              className="h-full min-h-[70vh] w-full border-0 bg-slate-900"
            />
          ) : (
            <div className="flex h-full min-h-80 items-center justify-center text-sm text-slate-400">
              {currentPreviewError || "Opening your private PDF…"}
            </div>
          )
        ) : activeFile.Chunks?.length ? (
          <article className="mx-auto max-w-3xl space-y-4 px-5 py-8 sm:px-10">
            {activeFile.Chunks.map((chunk, index) => (
              <section
                key={`${chunk.fileName || activeFile.FileName}-${index}`}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
              >
                <div className="mb-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  <span>{chunk.fileName || activeFile.FileName}</span>
                  {chunk.pageNumber ? (
                    <span>Page {chunk.pageNumber}</span>
                  ) : (
                    <span>Excerpt {index + 1}</span>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
                  {chunk.rawText}
                </p>
              </section>
            ))}
          </article>
        ) : (
          <div className="mx-auto flex h-full min-h-80 max-w-lg flex-col items-center justify-center px-8 text-center">
            <FileText size={24} className="mb-3 text-slate-500" />
            <h3 className="font-medium">Source preview isn’t available yet</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The source is uploaded, but no readable text is available to
              preview. You can still open the original file if it is accessible.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DocumentViewer;
