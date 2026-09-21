import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment {
    user: Types.ObjectId;
    amount: number;
    product: string;
    session_id: string;
    subscription_Expires_Date?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPaymentDocument extends IPayment, Document {}

const paymentSchema = new Schema<IPaymentDocument>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        product: {
            type: String,
            required: true,
        },
        session_id: {
            type: String,
            required: true,
            unique: true,
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

export const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);
export default Payment;
