import { Request, Response, NextFunction } from 'express';

interface Logger {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
}

interface ErrorMessages {
    noToken?: string;
    malformedToken?: string;
    expiredToken?: string;
    invalidToken?: string;
}

interface VerifyTokenMiddlewareOptions {
    secretKey: string;
    disableTokenVerification?: boolean;
    userProperty?: string;
    logger?: Logger;
    messages?: ErrorMessages;
    extractToken?: (req: Request) => string | null;
}

export function createVerifyTokenMiddleware(
    options: VerifyTokenMiddlewareOptions
): (req: Request, res: Response, next: NextFunction) => void; 