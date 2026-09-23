import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP {
    otp: string;
    email: string;
    purpose: 'verification' | 'password_reset';
    attempts?: number;
    createdAt?: Date;
}

export interface IOTPDocument extends IOTP, Document {}

const otpSchema = new Schema<IOTPDocument>({
    otp: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    purpose: {
        type: String,
        enum: ['verification', 'password_reset'],
        default: 'verification',
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1200, // 20 minutes TTL index
    },
});

export const OTP = mongoose.model<IOTPDocument>('OTP', otpSchema);
export default OTP;
