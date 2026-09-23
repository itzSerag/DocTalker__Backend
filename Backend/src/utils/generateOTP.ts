import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

export const generateOTP = (): string => {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
};

export const hashOTP = (otp: string): string => {
    const secret = process.env.OTP_HMAC_SECRET || process.env.JWT_SECRET_KEY;
    if (!secret) throw new Error('OTP_HMAC_SECRET or JWT_SECRET_KEY must be configured');
    return createHmac('sha256', secret).update(otp).digest('hex');
};

export const compareOTP = (stored: string, candidate: string): boolean => {
    const candidateHash = hashOTP(candidate);
    // Continue accepting unexpired OTPs created before hash-at-rest was introduced.
    const storedHash = /^[a-f\d]{64}$/i.test(stored) ? stored : hashOTP(stored);
    return timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(candidateHash, 'hex'));
};

export default generateOTP;
