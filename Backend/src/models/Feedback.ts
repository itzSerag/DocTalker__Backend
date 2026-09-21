import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFeedback {
    userId: Types.ObjectId;
    chatId: Types.ObjectId;
    messageId: Types.ObjectId;
    feedbackMessage: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IFeedbackDocument extends IFeedback, Document {}

const feedbackSchema = new Schema<IFeedbackDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            alias: 'userID',
        },
        chatId: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
            alias: 'chatID',
        },
        messageId: {
            type: Schema.Types.ObjectId,
            required: true,
            alias: 'messageID',
        },
        feedbackMessage: {
            type: String,
            required: [true, 'Feedback message is required'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Feedback = mongoose.model<IFeedbackDocument>('Feedback', feedbackSchema);
export default Feedback;
