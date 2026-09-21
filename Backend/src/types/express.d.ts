import { IUserDocument } from '../models/User';

declare global {
    namespace Express {
        interface User extends IUserDocument {}

        interface Request {
            user?: IUserDocument;
            price?: number;
            productName?: string;
        }
    }
}

export {};
