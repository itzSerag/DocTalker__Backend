import apiClient from "./client";

export const documentApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post("/upload/upload", formData);
    return res.data;
  },

  uploadFolder: async (files: File[], folderName: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("folderName", folderName);
    const res = await apiClient.post("/upload/uploadfolder", formData);
    return res.data;
  },

  processDocument: async (chatId: string) => {
    const res = await apiClient.post("/upload/process", { chatId });
    return res.data;
  },

  getChatFile: async (
    chatId: string,
    fileIndex: number,
    signal?: AbortSignal,
  ) => {
    const res = await apiClient.get(`/chat/${chatId}/files/${fileIndex}`, {
      responseType: "blob",
      signal,
    });
    return res.data as Blob;
  },

  extractContent: async (url: string) => {
    const res = await apiClient.post("/extractions/extract-content", { url });
    return res.data;
  },

  uploadHandwritten: async (imageFile: File) => {
    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await apiClient.post("/handwritten/uploadPic", formData);
    return res.data;
  },
};

export default documentApi;
