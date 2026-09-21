import { CookieOptions, Response } from 'express';

export const COOKIE_NAME = 'jwt';

export const getAuthCookieOptions = (): CookieOptions => {
    const isProduction = process.env.NODE_ENV === 'production';
    // 30 days in milliseconds
    const maxAge = 5 * 24 * 60 * 60 * 1000;

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge,
        path: '/',
    };
};

export const setAuthCookie = (res: Response, token: string): void => {
    res.cookie(COOKIE_NAME, token, getAuthCookieOptions());
};

export const clearAuthCookie = (res: Response): void => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
    });
};

export default {
    COOKIE_NAME,
    getAuthCookieOptions,
    setAuthCookie,
    clearAuthCookie,
};
