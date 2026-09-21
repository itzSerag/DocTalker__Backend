import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage {
    _id?: Types.ObjectId;
    role: 'user' | 'assistant';
    content: string;
    model?: string;
    createdAt?: Date;
}

export interface IChat {
    chatName: string;
    documentId: Types.ObjectId;
    messages: Types.DocumentArray<IMessage & Document>;
    isProcessed?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IChatDocument extends Omit<IChat, 'messages'>, Document {
    messages: Types.DocumentArray<IMessage & Document>;
}

const messageSchema = new Schema<IMessage>(
    {
        role: { type: String, enum: ['user', 'assistant'], default: 'user', required: true },
        content: { type: String, required: true },
        model: { type: String },
    },
    { timestamps: true }
);

const chatSchema = new Schema<IChatDocument>(
    {
        chatName: {
            type: String,
            required: true,
            default: 'New Chat',
            trim: true,
        },
        documentId: {
            type: Schema.Types.ObjectId,
            ref: 'Document',
            required: true,
        },
        messages: [messageSchema],
        isProcessed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Chat = mongoose.model<IChatDocument>('Chat', chatSchema);
export default Chat;
