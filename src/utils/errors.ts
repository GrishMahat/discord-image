/** @format */

/**
 * Base error class for discord-image-utils
 */
export class DiscordImageError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string = "UNKNOWN_ERROR",
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON format
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Validation error class
 */
export class ValidationError extends DiscordImageError {
  constructor(message: string, field?: string, value?: any) {
    super(
      message,
      "VALIDATION_ERROR",
      400,
      {
        field,
        value: typeof value === "object" ? JSON.stringify(value) : value,
      }
    );
  }
}

/**
 * Network error class
 */
export class NetworkError extends DiscordImageError {
  constructor(message: string, url?: string, statusCode?: number) {
    super(
      message,
      "NETWORK_ERROR",
      statusCode || 503,
      {
        url,
        originalStatusCode: statusCode,
      }
    );
  }
}

/**
 * Image processing error class
 */
export class ImageProcessingError extends DiscordImageError {
  constructor(message: string, operation?: string, imageInfo?: Record<string, any>) {
    super(
      message,
      "IMAGE_PROCESSING_ERROR",
      500,
      {
        operation,
        imageInfo,
      }
    );
  }
}

/**
 * File system error class
 */
export class FileSystemError extends DiscordImageError {
  constructor(message: string, path?: string, operation?: string) {
    super(
      message,
      "FILE_SYSTEM_ERROR",
      500,
      {
        path,
        operation,
      }
    );
  }
}

/**
 * Configuration error class
 */
export class ConfigurationError extends DiscordImageError {
  constructor(message: string, config?: string) {
    super(
      message,
      "CONFIGURATION_ERROR",
      500,
      {
        config,
      }
    );
  }
}

/**
 * Timeout error class
 */
export class TimeoutError extends DiscordImageError {
  constructor(message: string, timeout?: number, operation?: string) {
    super(
      message,
      "TIMEOUT_ERROR",
      408,
      {
        timeout,
        operation,
      }
    );
  }
}

/**
 * Error handler utility functions
 */
export class ErrorHandler {
  private static logLevel: "debug" | "info" | "warn" | "error" = "error";

  /**
   * Set the logging level
   */
  static setLogLevel(level: "debug" | "info" | "warn" | "error"): void {
    this.logLevel = level;
  }

  /**
   * Log error with appropriate level
   */
  static log(error: Error | DiscordImageError, level: "debug" | "info" | "warn" | "error" = "error"): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.logLevel];
    const targetLevel = levels[level];

    if (targetLevel >= currentLevel) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

      if (error instanceof DiscordImageError) {
        console[level](`${prefix} ${error.code}: ${error.message}`, {
          details: error.details,
          stack: error.stack,
        });
      } else {
        console[level](`${prefix} ${error.name}: ${error.message}`, {
          stack: error.stack,
        });
      }
    }
  }

  /**
   * Wrap async function with error handling
   */
  static async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: string,
    fallback?: T
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const contextMessage = context ? ` in ${context}` : "";
      
      if (error instanceof DiscordImageError) {
        this.log(error);
        throw error;
      }

      // Convert unknown errors to DiscordImageError
      const wrappedError = new DiscordImageError(
        `Unexpected error${contextMessage}: ${error instanceof Error ? error.message : String(error)}`,
        "UNEXPECTED_ERROR",
        500,
        {
          context,
          originalError: error instanceof Error ? error.name : typeof error,
        }
      );

      this.log(wrappedError);

      if (fallback !== undefined) {
        this.log(new DiscordImageError(`Using fallback value for ${context}`, "FALLBACK_USED", 200), "warn");
        return fallback;
      }

      throw wrappedError;
    }
  }

  /**
   * Validate required parameter
   */
  static validateRequired<T>(value: T, name: string, type?: string): T {
    if (value === null || value === undefined) {
      throw new ValidationError(`${name} is required`, name, value);
    }

    if (type && typeof value !== type) {
      throw new ValidationError(
        `${name} must be of type ${type}, got ${typeof value}`,
        name,
        value
      );
    }

    return value;
  }

  /**
   * Validate number range
   */
  static validateRange(value: number, min: number, max: number, name: string): number {
    this.validateRequired(value, name, "number");

    if (isNaN(value)) {
      throw new ValidationError(`${name} must be a valid number`, name, value);
    }

    if (value < min || value > max) {
      throw new ValidationError(
        `${name} must be between ${min} and ${max}, got ${value}`,
        name,
        value
      );
    }

    return value;
  }

  /**
   * Validate string length
   */
  static validateStringLength(value: string, maxLength: number, name: string, minLength: number = 0): string {
    this.validateRequired(value, name, "string");

    if (value.length < minLength) {
      throw new ValidationError(
        `${name} must be at least ${minLength} characters long`,
        name,
        value
      );
    }

    if (value.length > maxLength) {
      throw new ValidationError(
        `${name} must be no more than ${maxLength} characters long`,
        name,
        value
      );
    }

    return value;
  }

  /**
   * Validate array
   */
  static validateArray<T>(value: T[], name: string, minLength: number = 0, maxLength?: number): T[] {
    this.validateRequired(value, name);

    if (!Array.isArray(value)) {
      throw new ValidationError(`${name} must be an array`, name, value);
    }

    if (value.length < minLength) {
      throw new ValidationError(
        `${name} must have at least ${minLength} items`,
        name,
        value
      );
    }

    if (maxLength && value.length > maxLength) {
      throw new ValidationError(
        `${name} must have no more than ${maxLength} items`,
        name,
        value
      );
    }

    return value;
  }

  /**
   * Create a safe wrapper for synchronous functions
   */
  static safeFn<T extends any[], R>(
    fn: (...args: T) => R,
    context?: string,
    fallback?: R
  ): (...args: T) => R {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        const contextMessage = context ? ` in ${context}` : "";
        
        if (error instanceof DiscordImageError) {
          this.log(error);
          throw error;
        }

        const wrappedError = new DiscordImageError(
          `Unexpected error${contextMessage}: ${error instanceof Error ? error.message : String(error)}`,
          "UNEXPECTED_ERROR",
          500,
          {
            context,
            args: args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : arg),
            originalError: error instanceof Error ? error.name : typeof error,
          }
        );

        this.log(wrappedError);

        if (fallback !== undefined) {
          this.log(new DiscordImageError(`Using fallback value for ${context}`, "FALLBACK_USED", 200), "warn");
          return fallback;
        }

        throw wrappedError;
      }
    };
  }
}

/**
 * Retry utility with exponential backoff
 */
export class RetryHandler {
  /**
   * Retry an async operation with exponential backoff
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
      retryCondition?: (error: Error) => boolean;
      context?: string;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      retryCondition = (error: Error) => error instanceof NetworkError || error instanceof TimeoutError,
      context = "operation",
    } = options;

    let lastError!: Error;
    let attempt = 1;

    while (attempt <= maxAttempts) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        ErrorHandler.log(
          new DiscordImageError(
            `Attempt ${attempt}/${maxAttempts} failed for ${context}: ${lastError.message}`,
            "RETRY_ATTEMPT_FAILED",
            500,
            { attempt, maxAttempts, context, originalError: lastError.message }
          ),
          "warn"
        );

        if (attempt === maxAttempts || !retryCondition(lastError)) {
          break;
        }

        const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
        ErrorHandler.log(
          new DiscordImageError(
            `Retrying ${context} in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`,
            "RETRY_SCHEDULED",
            200,
            { delay, attempt: attempt + 1, maxAttempts, context }
          ),
          "info"
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }

    // All retries failed, throw the last error
    if (lastError instanceof DiscordImageError) {
      throw lastError;
    }

    throw new DiscordImageError(
      `All ${maxAttempts} attempts failed for ${context}: ${lastError.message}`,
      "MAX_RETRIES_EXCEEDED",
      500,
      { maxAttempts, context, lastError: lastError.message }
    );
  }
}