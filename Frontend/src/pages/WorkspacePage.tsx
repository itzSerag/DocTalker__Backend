import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { DocumentViewer } from "../components/DocumentViewer";
import { ChatPanel } from "../components/ChatPanel";
import { UploadModal } from "../components/UploadModal";
import { PricingModal } from "../components/PricingModal";
import { MobileHeader } from "../components/layout/MobileHeader";
import { chatApi } from "../api/chatApi";

interface ChatItem {
  id: string;
  chatName: string;
}

export function WorkspacePage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentName, setDocumentName] = useState<string>(
    "Select or Upload a Document",
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

  // Fetch all chats for authenticated user
  const fetchChats = useCallback(async (selectChatId?: string) => {
    try {
      setChatsLoading(true);
      const res = await chatApi.getAllChats();
      const allChats = res.allChats || [];
      setChats(allChats);

      if (selectChatId) {
        setActiveChatId(selectChatId);
      } else if (allChats.length > 0) {
        setActiveChatId((prev) =>
          prev && allChats.some((c) => c.id === prev) ? prev : allChats[0].id,
        );
      } else {
        setActiveChatId(null);
        setDocumentName("Select or Upload a Document");
      }
    } catch (err) {
      console.error("Failed to load user chats:", err);
    } finally {
      setChatsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchChats(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchChats]);

  // When activeChatId changes, fetch chat details to get document title
  useEffect(() => {
    if (!activeChatId) return;

    let isMounted = true;
    chatApi
      .getChat(activeChatId)
      .then((res) => {
        if (!isMounted) return;
        if (res.chat) {
          const doc = (res.chat as any).documentId;
          const name =
            doc?.FileName ||
            res.chat.title ||
            res.chat.chatName ||
            "Active Document";
          setDocumentName(name);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch chat details:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeChatId]);

  const handleOpenUploadModal = (tab: "file" | "web" | "youtube" | "ocr") => {
    setUploadModalTab(tab);
    setIsUploadModalOpen(true);
  };

  const handleNewChat = () => {
    // Open upload modal to index a new document/source
    handleOpenUploadModal("file");
  };

  const handleJumpToPage = (page: number) => {
    setCurrentPage(page);
    setMobileView("document");
  };

  const handleUploadSuccess = async (data: Record<string, unknown>) => {
    const docData = data as {
      chatId?: string;
      documentId?: string;
      data?: { chatId?: string; documentId?: string; documentName?: string };
      documentName?: string;
    };

    const newChatId = docData.chatId || docData.data?.chatId;

    if (docData?.data?.documentName || docData?.documentName) {
      setDocumentName(
        docData?.data?.documentName ||
          docData?.documentName ||
          "Uploaded Document",
      );
    }

    setIsUploadModalOpen(false);
    // Refresh chats and switch to newly created chat
    await fetchChats(newChatId);
    setMobileView("chat");
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
        chats={chats}
        chatsLoading={chatsLoading}
        activeChatId={activeChatId}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSelectChat={(id) => setActiveChatId(id)}
        onNewChat={handleNewChat}
        onOpenUpload={() => handleOpenUploadModal("file")}
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
          <DocumentViewer
            documentTitle={documentName}
            highlightPage={currentPage}
          />
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
            chatId={activeChatId}
            onOpenUploadModal={handleOpenUploadModal}
            onJumpToPage={handleJumpToPage}
          />
        </div>
      </main>

      {/* Multimodal Upload & Extraction Modal */}
      <UploadModal
        key={uploadModalTab}
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
