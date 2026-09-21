import mongoose, { Document, Schema, Types } from 'mongoose';
import validator from 'validator';

export type SubscriptionType = 'free' | 'Gold' | 'Premium' | 'admin';

export interface IStarMessage {
    messageID: Types.ObjectId;
    chatID: Types.ObjectId;
}

export interface IUser {
    firstName: string;
    lastName?: string | null;
    email: string;
    password?: string;
    googleId?: string | null;
    subscription: SubscriptionType;
    isVerified: boolean;
    chats: Types.ObjectId[];
    starMessages: IStarMessage[];
    uploadRequest: number;
    maxUploadRequest: number;
    queryRequest: number;
    queryMax: number;
    lastResetDate?: Date;
    subscription_Expires_Date?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
    resetDailyCountersIfNeeded(): Promise<void>;
}

const userSchema = new Schema<IUserDocument>(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            minlength: [3, 'Minimum name length is 3 characters'],
            trim: true,
        },
        lastName: {
            type: String,
            default: null,
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            unique: true,
            validate: {
                validator: function (val: string) {
                    return validator.isEmail(val);
                },
                message: 'Please enter a valid email',
            },
        },
        password: {
            type: String,
            required: function (this: any) {
                return !this.googleId;
            },
            select: true,
        },
        googleId: {
            type: String,
            default: null,
        },
        subscription: {
            type: String,
            enum: ['free', 'Gold', 'Premium', 'admin'],
            default: 'free',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        chats: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Chat',
            },
        ],
        starMessages: [
            {
                messageID: { type: Schema.Types.ObjectId, required: true },
                chatID: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
            },
        ],
        uploadRequest: {
            type: Number,
            default: 0,
        },
        maxUploadRequest: {
            type: Number,
            default: 5,
        },
        queryRequest: {
            type: Number,
            default: 0,
        },
        queryMax: {
            type: Number,
            default: 50,
        },
        lastResetDate: {
            type: Date,
            default: Date.now,
        },
        subscription_Expires_Date: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.resetDailyCountersIfNeeded = async function () {
    const now = new Date();
    const lastReset = this.lastResetDate ? new Date(this.lastResetDate) : new Date(0);

    // Check if last reset was on a previous day (UTC / local)
    if (
        now.getFullYear() !== lastReset.getFullYear() ||
        now.getMonth() !== lastReset.getMonth() ||
        now.getDate() !== lastReset.getDate()
    ) {
        this.uploadRequest = 0;
        this.queryRequest = 0;
        this.lastResetDate = now;
        await this.save({ validateBeforeSave: false });
    }
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
export default User;
