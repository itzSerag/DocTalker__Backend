import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IChunk {
  rawText: string;
  embeddings: number[];
  pageNumber?: number | null;
  fileName?: string;
}

export interface IFileItem {
  FileName: string;
  FileKey: string;
  FileURL: string;
  Chunks: IChunk[];
  isProcessed: boolean;
}

export interface IDocumentRecord {
  FileName: string;
  Files: IFileItem[];
  isProcessed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDocumentDoc extends IDocumentRecord, MongooseDocument {}

const chunkSchema = new Schema<IChunk>(
  {
    rawText: { type: String, required: true },
    embeddings: [{ type: Number }],
    pageNumber: { type: Number, default: null },
    fileName: { type: String },
  },
  { _id: true }
);

const fileItemSchema = new Schema<IFileItem>({
  FileName: { type: String, required: true },
  FileKey: { type: String, required: true },
  FileURL: { type: String, required: true },
  Chunks: [chunkSchema],
  isProcessed: { type: Boolean, default: false },
});

const documentSchema = new Schema<IDocumentDoc>(
  {
    FileName: {
      type: String,
      required: true,
      trim: true,
    },
    Files: [fileItemSchema],
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel = mongoose.model<IDocumentDoc>('Document', documentSchema);
export default DocumentModel;
