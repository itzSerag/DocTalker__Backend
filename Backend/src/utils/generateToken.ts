import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (data: object | string): string => {
    const secret = process.env.JWT_SECRET_KEY || 'default-jwt-secret';
    const expiresIn = process.env.JWT_EXPIRE_TIME || '30d';

    return jwt.sign(data, secret, {
        expiresIn: expiresIn as SignOptions['expiresIn'],
    });
};

export default generateToken;
