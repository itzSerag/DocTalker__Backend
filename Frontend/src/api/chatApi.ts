import apiClient from "./client";

export interface CitationItem {
  rawText?: string;
  snippet?: string;
  page?: number;
  pageNumber?: number | null;
  fileName?: string;
  documentId?: string;
}

export interface ChatMessage {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  citations?: CitationItem[];
  createdAt?: string;
}

export interface ChatThread {
  _id: string;
  title?: string;
  documentId?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface QueryResponse {
  status: string;
  data: {
    response: string;
    citations: CitationItem[];
    model: string;
  };
}

export interface SendQueryOptions {
  chatId: string;
  query: string;
  modelType?: "openai" | "gemini-text";
}

export const chatApi = {
  getAllChats: async () => {
    const res = await apiClient.get<{
      status: string;
      data: { chats: ChatThread[] };
    }>("/chat");
    return res.data;
  },

  getChat: async (chatId: string) => {
    const res = await apiClient.get<{
      status: string;
      data: { chat: ChatThread };
    }>(`/chat/${chatId}`);
    return res.data;
  },

  deleteChat: async (chatId: string) => {
    const res = await apiClient.delete<{ status: string }>(`/chat/${chatId}`);
    return res.data;
  },

  sendQuery: async (
    chatIdOrOptions: string | SendQueryOptions,
    queryText?: string,
    modelType: "openai" | "gemini-text" = "openai",
  ) => {
    const payload =
      typeof chatIdOrOptions === "object"
        ? {
            chatId: chatIdOrOptions.chatId,
            query: chatIdOrOptions.query,
            modelType: chatIdOrOptions.modelType || "openai",
          }
        : {
            chatId: chatIdOrOptions,
            query: queryText,
            modelType,
          };

    const res = await apiClient.post<QueryResponse>(
      "/query/query-process",
      payload,
    );
    return res.data;
  },
};

export default chatApi;
