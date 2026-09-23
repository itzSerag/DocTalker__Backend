import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (data: object | string): string => {
    const secret = process.env.JWT_SECRET_KEY || 'default-jwt-secret';
    const configuredExpiration = process.env.JWT_EXPIRE_TIME?.trim() || '30d';
    // Historically numeric values (for example "5") were intended as days,
    // but jsonwebtoken interprets numeric strings as milliseconds.
    const expiresIn = /^\d+$/.test(configuredExpiration) ? `${configuredExpiration}d` : configuredExpiration;

    return jwt.sign(data, secret, {
        expiresIn: expiresIn as SignOptions['expiresIn'],
    });
};

export default generateToken;
