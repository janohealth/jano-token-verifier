import jwt from 'jsonwebtoken';

/**
 * Middleware function to verify JWT tokens.
 * @param {object} options - Configuration options for the middleware.
 * @param {string} options.secretKey - The secret key to verify the JWT token. (Required)
 * @param {boolean} [options.disableTokenVerification=false] -  Set to true to skip token verification (for development or specific environments).
 * @param {string} [options.userProperty='user'] - The property name to attach the decoded user information to the request object.
 * @param {function} [options.logger=console] - Logger object, defaults to console. You can pass your custom logger.
 * @param {object} [options.messages] - Custom error messages.
 * @param {string} [options.messages.noToken='No authorization header provided'] - Message for missing token.
 * @param {string} [options.messages.malformedToken='Malformed authorization header'] - Message for malformed token.
 * @param {string} [options.messages.expiredToken='Session expired. Please login'] - Message for expired token.
 * @param {string} [options.messages.invalidToken='Error validating token credentials. Please relogin'] - Message for invalid token.
 * @param {function} [options.extractToken] - Custom function to extract token from request. Defaults to Bearer token extraction.
 *
 * @returns {function} Express middleware function.
 */
export function createVerifyTokenMiddleware(options) {
    if (!options || !options.secretKey) {
        throw new Error('Secret key is required in options for JWT verification middleware.');
    }

    const secretKey = options.secretKey;
    const disableTokenVerification = options.disableTokenVerification || false;
    const userProperty = options.userProperty || 'user';
    const logger = options.logger || console;

    // Custom error messages
    const messages = {
        noToken: 'No authorization header provided',
        malformedToken: 'Malformed authorization header',
        expiredToken: 'Session expired. Please login',
        invalidToken: 'Error validating token credentials. Please relogin',
        ...options.messages
    };

    // Default token extractor - Bearer token from Authorization header
    const defaultExtractToken = (req) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return null;
        const [bearer, token] = authHeader.split(' ');
        return bearer === 'Bearer' ? token : null;
    };

    const extractToken = options.extractToken || defaultExtractToken;

    return function verifyToken(req, resp, next) {
        if (disableTokenVerification) {
            logger.info('Token verification is disabled. Skipping verification.');
            return next();
        }

        const token = extractToken(req);
        if (!token) {
            logger.warn(messages.noToken);
            return resp.status(401).json({ message: messages.noToken });
        }

        try {
            const decodedToken = jwt.verify(token, secretKey);
            req[userProperty] = decodedToken;
            next();
        } catch (err) {
            logger.warn({ err }, 'Error decoding/verifying token');
            if (err.name === 'TokenExpiredError') {
                return resp.status(401).json({ message: messages.expiredToken });
            } else {
                return resp.status(401).json({ message: messages.invalidToken });
            }
        }
    };
}
