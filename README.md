# Jano Token Verifier

A reusable Express middleware for verifying JWT tokens in Node.js backend applications. This middleware provides a flexible and secure way to handle JWT token verification with configurable options.

## Installation

This package is hosted on GitHub Packages. To install it, you'll need to:

1. **Generate a GitHub Personal Access Token (PAT):**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Generate new token
   - Select the following scopes:
     - `read:packages` (Required to download packages)
   - Copy your generated token

2. **Configure npm:**
   Create or edit `~/.npmrc` (in your home directory) and add:
   ```ini
   @janohealth:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
   ```
   Replace `YOUR_GITHUB_PAT` with the token you generated.

3. **Install the package:**
   ```bash
   npm install @janohealth/jano-token-verifier
   ```

## Usage

First, import the middleware in your Express application:

```javascript
import { createVerifyTokenMiddleware } from 'jano-token-verifier';
import express from 'express';
const app = express();
```

Then, use the middleware in your routes:

```javascript
// Example configuration
const verifyJWT = createVerifyTokenMiddleware({
    secretKey: process.env.JWT_SECRET_KEY, // IMPORTANT: Use environment variables for your secret key
    disableTokenVerification: process.env.NODE_ENV === 'development', // Optional: Disable in development
    userProperty: 'currentUser', // Optional: Access user info via req.currentUser
    logger: console, // Optional: You can replace with your custom logger
    messages: { // Optional: Custom error messages
        noToken: 'Please provide an authentication token',
        expiredToken: 'Your session has expired'
    }
});

// Apply to protected routes
app.get('/protected', verifyJWT, (req, res) => {
    res.json({ message: 'Protected route accessed', user: req.currentUser });
});

// Public route example
app.get('/public', (req, res) => {
    res.json({ message: 'Public route' });
});
```

## Configuration Options

The `createVerifyTokenMiddleware` function accepts an options object with the following properties:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `secretKey` | string | Yes | - | The secret key used to verify JWT tokens |
| `disableTokenVerification` | boolean | No | false | Set to true to bypass token verification |
| `userProperty` | string | No | 'user' | Property name on request object to store decoded token |
| `logger` | object | No | console | Custom logger object with info, warn, error methods |
| `messages` | object | No | - | Custom error messages (see below) |
| `extractToken` | function | No | - | Custom function to extract token from request |

### Custom Error Messages

You can customize error messages by providing a `messages` object:

```javascript
const verifyJWT = createVerifyTokenMiddleware({
    secretKey: process.env.JWT_SECRET_KEY,
    messages: {
        noToken: 'Please provide an authentication token',
        malformedToken: 'Invalid token format',
        expiredToken: 'Your session has expired',
        invalidToken: 'Invalid credentials'
    }
});
```

### Custom Token Extraction

By default, the middleware extracts tokens from the Authorization header in the format `Bearer <token>`. You can customize this behavior by providing an `extractToken` function:

```javascript
const verifyJWT = createVerifyTokenMiddleware({
    secretKey: process.env.JWT_SECRET_KEY,
    extractToken: (req) => {
        // Example: Extract token from custom header
        return req.headers['x-custom-token'];
        // Or from query parameter
        // return req.query.token;
    }
});
```

## Error Handling

The middleware handles various token-related errors:

- **Missing Token**: Returns 401 Unauthorized with customizable message
- **Malformed Token**: Returns 401 Unauthorized with customizable message
- **Expired Token**: Returns 403 Forbidden with customizable message
- **Invalid Token**: Returns 403 Forbidden with customizable message

All error responses follow the format:
```json
{
    "message": "Error message here"
}
```

## Security Best Practices

1. **Secret Key Management**
   - Always use environment variables for your secret key
   - Never hardcode secrets in your application code
   - Use a strong, unique secret key for each environment

2. **HTTPS**
   - Always use HTTPS in production
   - JWT tokens should only be transmitted over secure connections

3. **Token Storage**
   - Store tokens securely on the client side
   - Clear tokens on logout
   - Implement token refresh mechanisms for long-lived sessions

## Example with Custom Logger

```javascript
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});

const verifyJWT = createVerifyTokenMiddleware({
    secretKey: process.env.JWT_SECRET_KEY,
    logger: logger
});
```

## TypeScript Support

This package includes TypeScript declarations and provides full type safety:

```typescript
import { createVerifyTokenMiddleware } from 'jano-token-verifier';
import { Request } from 'express';

const verifyJWT = createVerifyTokenMiddleware({
    secretKey: process.env.JWT_SECRET_KEY,
    extractToken: (req: Request) => req.headers['x-custom-token']
});
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 