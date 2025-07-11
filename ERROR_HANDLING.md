# Error Handling Guide

The discord-image-utils library has been enhanced with a comprehensive error handling system that provides better error reporting, logging, and recovery mechanisms.

## Overview

The library now includes:
- **Custom error classes** for different types of errors
- **Enhanced validation** with detailed error messages
- **Retry mechanisms** for network operations
- **Centralized error handling** utilities
- **Structured logging** with different levels
- **Error recovery** mechanisms

## Error Classes

### DiscordImageError (Base Class)

The base error class that all other custom errors extend from.

```typescript
import { DiscordImageError } from 'discord-image-utils';

try {
  // Some operation
} catch (error) {
  if (error instanceof DiscordImageError) {
    console.log(`Error Code: ${error.code}`);
    console.log(`Status Code: ${error.statusCode}`);
    console.log(`Details:`, error.details);
    console.log(`Timestamp: ${error.timestamp}`);
  }
}
```

### ValidationError

Thrown when input validation fails.

```typescript
import { ValidationError, blur } from 'discord-image-utils';

try {
  await blur(null, 15); // Invalid image input
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Validation failed: ${error.message}`);
    console.log(`Field: ${error.details?.field}`);
    console.log(`Value: ${error.details?.value}`);
  }
}
```

### NetworkError

Thrown when network operations fail (e.g., fetching images from URLs).

```typescript
import { NetworkError, wanted } from 'discord-image-utils';

try {
  await wanted('https://invalid-url.com/image.jpg');
} catch (error) {
  if (error instanceof NetworkError) {
    console.log(`Network error: ${error.message}`);
    console.log(`URL: ${error.details?.url}`);
    console.log(`Status Code: ${error.details?.originalStatusCode}`);
  }
}
```

### ImageProcessingError

Thrown when image processing operations fail.

```typescript
import { ImageProcessingError, triggered } from 'discord-image-utils';

try {
  await triggered(corruptedImageBuffer);
} catch (error) {
  if (error instanceof ImageProcessingError) {
    console.log(`Image processing failed: ${error.message}`);
    console.log(`Operation: ${error.details?.operation}`);
    console.log(`Image Info: ${error.details?.imageInfo}`);
  }
}
```

### FileSystemError

Thrown when file system operations fail (e.g., loading templates).

```typescript
import { FileSystemError } from 'discord-image-utils';

// This error might occur if template files are missing
try {
  await wanted(userAvatar);
} catch (error) {
  if (error instanceof FileSystemError) {
    console.log(`File system error: ${error.message}`);
    console.log(`Path: ${error.details?.path}`);
    console.log(`Operation: ${error.details?.operation}`);
  }
}
```

### TimeoutError

Thrown when operations timeout.

```typescript
import { TimeoutError, validateURL } from 'discord-image-utils';

try {
  // validateURL now has timeout support
  await validateURL('https://slow-server.com/image.jpg', 5000); // 5 second timeout
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log(`Operation timed out: ${error.message}`);
    console.log(`Timeout: ${error.details?.timeout}ms`);
    console.log(`Operation: ${error.details?.operation}`);
  }
}
```

## Error Handler Utilities

### ErrorHandler.withErrorHandling

Wraps async functions with comprehensive error handling.

```typescript
import { ErrorHandler } from 'discord-image-utils';

const result = await ErrorHandler.withErrorHandling(
  async () => {
    // Your risky operation
    return await someAsyncOperation();
  },
  'my operation', // context for logging
  defaultValue    // fallback value (optional)
);
```

### Validation Methods

The ErrorHandler provides built-in validation methods:

```typescript
import { ErrorHandler } from 'discord-image-utils';

// Validate required parameters
ErrorHandler.validateRequired(value, 'parameterName', 'string');

// Validate number ranges
ErrorHandler.validateRange(level, 1, 10, 'blur level');

// Validate string length
ErrorHandler.validateStringLength(text, 100, 'message', 1);

// Validate arrays
ErrorHandler.validateArray(items, 'items', 1, 10);
```

### Logging Configuration

Configure logging levels:

```typescript
import { ErrorHandler } from 'discord-image-utils';

// Set logging level (debug, info, warn, error)
ErrorHandler.setLogLevel('debug'); // Shows all logs
ErrorHandler.setLogLevel('error'); // Shows only errors (default)
```

## Retry Mechanism

The library includes automatic retry logic for network operations with exponential backoff.

```typescript
import { RetryHandler, NetworkError } from 'discord-image-utils';

const result = await RetryHandler.withRetry(
  async () => {
    // Your network operation
    return await fetchSomething();
  },
  {
    maxAttempts: 3,      // Maximum retry attempts
    baseDelay: 1000,     // Base delay in ms
    maxDelay: 10000,     // Maximum delay in ms
    backoffFactor: 2,    // Exponential backoff factor
    retryCondition: (error) => error instanceof NetworkError,
    context: 'fetch operation'
  }
);
```

## Enhanced validateURL Function

The `validateURL` function has been enhanced with better error handling:

```typescript
import { validateURL, NetworkError, ValidationError } from 'discord-image-utils';

try {
  const buffer = await validateURL(
    'https://example.com/image.jpg',
    30000 // 30 second timeout
  );
} catch (error) {
  if (error instanceof NetworkError) {
    console.log('Network issue:', error.message);
  } else if (error instanceof ValidationError) {
    console.log('Validation issue:', error.message);
  }
}
```

## Best Practices

### 1. Always Handle Specific Error Types

```typescript
import { 
  ValidationError, 
  NetworkError, 
  ImageProcessingError,
  blur 
} from 'discord-image-utils';

try {
  const result = await blur(image, level);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors (user input issues)
    return { success: false, error: 'Invalid input', details: error.details };
  } else if (error instanceof NetworkError) {
    // Handle network errors (retry or use cached image)
    return { success: false, error: 'Network issue', retry: true };
  } else if (error instanceof ImageProcessingError) {
    // Handle processing errors (fallback to simpler processing)
    return { success: false, error: 'Processing failed', fallback: true };
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}
```

### 2. Use Error Details for Better User Experience

```typescript
try {
  await someOperation();
} catch (error) {
  if (error instanceof ValidationError) {
    const fieldName = error.details?.field;
    const invalidValue = error.details?.value;
    
    // Provide specific feedback to user
    alert(`The ${fieldName} field has an invalid value: ${invalidValue}`);
  }
}
```

### 3. Log Errors Appropriately

```typescript
import { ErrorHandler } from 'discord-image-utils';

// Set appropriate log level for your environment
if (process.env.NODE_ENV === 'development') {
  ErrorHandler.setLogLevel('debug');
} else {
  ErrorHandler.setLogLevel('error');
}
```

### 4. Use Fallback Values for Non-Critical Operations

```typescript
const result = await ErrorHandler.withErrorHandling(
  async () => await generateOptionalEffect(image),
  'optional effect',
  null // fallback to null if it fails
);

if (result) {
  // Use the effect
} else {
  // Continue without the effect
}
```

## Migration from Previous Versions

If you're upgrading from a previous version, here's how to migrate:

### Before (Old Error Handling)
```typescript
try {
  const result = await blur(image, level);
} catch (error) {
  console.error('Error:', error.message);
}
```

### After (New Error Handling)
```typescript
import { ValidationError, ImageProcessingError, blur } from 'discord-image-utils';

try {
  const result = await blur(image, level);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation Error:', error.message, error.details);
  } else if (error instanceof ImageProcessingError) {
    console.error('Processing Error:', error.message, error.details);
  } else {
    console.error('Unexpected Error:', error);
  }
}
```

## Error Codes Reference

| Error Class | Code | Description |
|-------------|------|-------------|
| ValidationError | VALIDATION_ERROR | Input validation failed |
| NetworkError | NETWORK_ERROR | Network operation failed |
| ImageProcessingError | IMAGE_PROCESSING_ERROR | Image processing failed |
| FileSystemError | FILE_SYSTEM_ERROR | File system operation failed |
| ConfigurationError | CONFIGURATION_ERROR | Configuration issue |
| TimeoutError | TIMEOUT_ERROR | Operation timed out |
| DiscordImageError | UNKNOWN_ERROR | Unknown error |
| DiscordImageError | UNEXPECTED_ERROR | Unexpected error occurred |
| DiscordImageError | MAX_RETRIES_EXCEEDED | All retry attempts failed |

## Support

If you encounter any issues with the error handling system, please:

1. Check the error type and details
2. Review the relevant documentation section
3. Enable debug logging for more information
4. Report issues with full error details and context

The enhanced error handling system makes the library more robust and easier to debug, providing better user experience and developer productivity.