import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { DocumentViewer } from "../components/DocumentViewer";
import { ChatPanel } from "../components/ChatPanel";
import { UploadModal } from "../components/UploadModal";
import { PricingModal } from "../components/PricingModal";
import { MobileHeader } from "../components/layout/MobileHeader";

export function WorkspacePage() {
  const [activeChatId, setActiveChatId] = useState("1");
  const [currentPage, setCurrentPage] = useState(4);
  const [documentName, setDocumentName] = useState(
    "Q3_2023_Business_Strategy_Report.pdf",
  );

  // Mobile layout state
  const [mobileView, setMobileView] = useState<"document" | "chat">("chat");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadModalTab, setUploadModalTab] = useState<
    "file" | "web" | "youtube" | "ocr"
  >("file");
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const handleOpenUploadModal = (tab: "file" | "web" | "youtube" | "ocr") => {
    setUploadModalTab(tab);
    setIsUploadModalOpen(true);
  };

  const handleNewChat = () => {
    setActiveChatId(`chat-${Date.now()}`);
    setCurrentPage(1);
    setMobileView("chat");
  };

  const handleJumpToPage = (page: number) => {
    setCurrentPage(page);
    // On mobile, if user clicks citation from chat, switch to document view
    setMobileView("document");
  };

  const handleUploadSuccess = (data: Record<string, unknown>) => {
    const docData = data as {
      data?: { documentName?: string };
      documentName?: string;
    };
    if (docData?.data?.documentName || docData?.documentName) {
      setDocumentName(
        docData?.data?.documentName ||
          docData?.documentName ||
          "Uploaded Document",
      );
    }
    setIsUploadModalOpen(false);
  };

  return (
    <div
      className="flex flex-col lg:flex-row w-screen h-screen overflow-hidden antialiased font-sans"
      style={{
        background: "var(--color-canvas)",
        color: "var(--color-text-primary)",
      }}
    >
      {/* Mobile Top Header (only visible on < 1024px) */}
      <MobileHeader
        activeView={mobileView}
        onToggleView={(view) => setMobileView(view)}
        onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        documentTitle={documentName}
      />

      {/* Sidebar: Desktop persistent + Mobile slide-over drawer */}
      <Sidebar
        activeChatId={activeChatId}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSelectChat={(id) => setActiveChatId(id)}
        onNewChat={handleNewChat}
        onOpenPricing={() => setIsPricingModalOpen(true)}
      />

      {/* Workspace Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Document Viewer:
            - Desktop: visible flex-1
            - Mobile: visible only if mobileView === 'document' */}
        <div
          className={`flex-1 h-full overflow-hidden ${
            mobileView === "document" ? "flex" : "hidden lg:flex"
          }`}
        >
          <DocumentViewer highlightPage={currentPage} />
        </div>

        {/* AI Chat Workspace:
            - Desktop: fixed/flex side panel (w-[420px] to w-[480px])
            - Mobile: visible only if mobileView === 'chat' (w-full) */}
        <div
          className={`h-full overflow-hidden lg:w-[440px] xl:w-[480px] shrink-0 ${
            mobileView === "chat" ? "w-full flex flex-1" : "hidden lg:flex"
          }`}
        >
          <ChatPanel
            onOpenUploadModal={handleOpenUploadModal}
            onJumpToPage={handleJumpToPage}
          />
        </div>
      </main>

      {/* Multimodal Upload & Extraction Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        initialTab={uploadModalTab}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Stripe Pricing & Subscription Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </div>
  );
}

export default WorkspacePage;
