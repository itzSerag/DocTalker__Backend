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
  createChat: async (documentId: string, chatName?: string) => {
    const res = await apiClient.post<{
      status: string;
      data: { chat: ChatThread & { id: string } };
    }>("/chat", { documentId, chatName });
    return res.data;
  },

  getAllChats: async () => {
    const res = await apiClient.get<{
      status: string;
      allChats: Array<{ id: string; chatName: string }>;
    }>("/chat");
    return res.data;
  },

  getChat: async (chatId: string) => {
    const res = await apiClient.get<{
      status: string;
      theChat?: any;
      data?: { chat: ChatThread };
    }>(`/chat/${chatId}`);
    return {
      ...res.data,
      chat: res.data.theChat || res.data.data?.chat,
    };
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

  streamQuery: async (
    chatId: string,
    queryText: string,
    modelType: "openai" | "gemini-text" = "openai",
  ) => {
    // We use native fetch to handle the stream
    const baseURL = apiClient.defaults.baseURL || "/api";
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseURL}/query/query-stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ chatId, query: queryText, modelType }),
      credentials: "include", // essential for cookies
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(
        errorBody?.message || `Request failed (${response.status}).`,
      );
    }

    return response;
  },
};

export default chatApi;
