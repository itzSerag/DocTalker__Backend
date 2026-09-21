import apiClient from "./client";

export const documentApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post("/upload/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  processDocument: async (
    documentId: string,
    files: (string | Record<string, unknown>)[],
  ) => {
    const res = await apiClient.post("/upload/process", {
      documentId,
      files,
    });
    return res.data;
  },

  extractContent: async (url: string) => {
    const res = await apiClient.post("/extractions/extract-content", { url });
    return res.data;
  },

  uploadHandwritten: async (imageFile: File) => {
    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await apiClient.post("/handwritten/uploadPic", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};

export default documentApi;
