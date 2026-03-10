/** @format */

type LogLevel = "debug" | "info" | "warn" | "error";

type ErrorDetails = Record<string, unknown>;
type ConstructorFn = (...args: unknown[]) => unknown;

const LOG_LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

function clampStatusCode(code: number): number {
	if (!Number.isInteger(code)) return 500;
	if (code < 100 || code > 599) return 500;
	return code;
}

function toError(error: unknown): Error {
	return error instanceof Error ? error : new Error(String(error));
}

function safeSerialize(
	value: unknown,
	seen: WeakSet<object> = new WeakSet(),
	depth = 0,
): unknown {
	if (value === null || value === undefined) return value;
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
		return value;
	}
	if (typeof value === "bigint") return value.toString();
	if (typeof value === "symbol") return value.toString();
	if (typeof value === "function")
		return `[Function ${(value as { name?: string }).name || "anonymous"}]`;
	if (Buffer.isBuffer(value)) return `[Buffer length=${value.length}]`;

	if (value instanceof Date) return value.toISOString();
	if (value instanceof Error) {
		return {
			name: value.name,
			message: value.message,
			stack: value.stack,
		};
	}

	if (depth >= 4) return "[MaxDepthReached]";
	if (Array.isArray(value)) {
		return value.map((item) => safeSerialize(item, seen, depth + 1));
	}

	if (typeof value === "object") {
		if (seen.has(value as object)) return "[Circular]";
		seen.add(value as object);

		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			out[k] = safeSerialize(v, seen, depth + 1);
		}
		return out;
	}

	return String(value);
}

/**
 * Base error class for discord-image-utils
 */
export class DiscordImageError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly details?: ErrorDetails;
	public readonly timestamp: Date;
	public readonly cause?: unknown;

	constructor(
		message: string,
		code: string = "UNKNOWN_ERROR",
		statusCode: number = 500,
		details?: ErrorDetails,
		cause?: unknown,
	) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.statusCode = clampStatusCode(statusCode);
		this.details = details
			? (safeSerialize(details) as ErrorDetails)
			: undefined;
		this.timestamp = new Date();
		this.cause = cause;

		if (
			(Error as unknown as { captureStackTrace?: ConstructorFn })
				.captureStackTrace
		) {
			(
				Error as unknown as {
					captureStackTrace: (
						target: object,
						constructorOpt?: ConstructorFn,
					) => void;
				}
			).captureStackTrace(this, this.constructor as unknown as ConstructorFn);
		}
	}

	/**
	 * Convert error to JSON format
	 */
	toJSON(): Record<string, unknown> {
		return {
			name: this.name,
			message: this.message,
			code: this.code,
			statusCode: this.statusCode,
			details: this.details,
			timestamp: this.timestamp.toISOString(),
			cause: safeSerialize(this.cause),
			stack: this.stack,
		};
	}
}

/**
 * Validation error class
 */
export class ValidationError extends DiscordImageError {
	constructor(message: string, field?: string, value?: unknown) {
		super(message, "VALIDATION_ERROR", 400, {
			field,
			value: safeSerialize(value),
		});
	}
}

/**
 * Network error class
 */
export class NetworkError extends DiscordImageError {
	constructor(message: string, url?: string, statusCode?: number) {
		super(message, "NETWORK_ERROR", statusCode || 503, {
			url,
			originalStatusCode: statusCode,
		});
	}
}

/**
 * Image processing error class
 */
export class ImageProcessingError extends DiscordImageError {
	constructor(message: string, operation?: string, imageInfo?: ErrorDetails) {
		super(message, "IMAGE_PROCESSING_ERROR", 500, {
			operation,
			imageInfo,
		});
	}
}

/**
 * File system error class
 */
export class FileSystemError extends DiscordImageError {
	constructor(message: string, path?: string, operation?: string) {
		super(message, "FILE_SYSTEM_ERROR", 500, {
			path,
			operation,
		});
	}
}

/**
 * Configuration error class
 */
export class ConfigurationError extends DiscordImageError {
	constructor(message: string, config?: string) {
		super(message, "CONFIGURATION_ERROR", 500, {
			config,
		});
	}
}

/**
 * Timeout error class
 */
export class TimeoutError extends DiscordImageError {
	constructor(message: string, timeout?: number, operation?: string) {
		super(message, "TIMEOUT_ERROR", 408, {
			timeout,
			operation,
		});
	}
}

/**
 * Error handler utility functions
 */
export class ErrorHandler {
	private static logLevel: LogLevel = "error";

	/**
	 * Set the logging level
	 */
	static setLogLevel(level: LogLevel): void {
		ErrorHandler.logLevel = level;
	}

	/**
	 * Log error with appropriate level
	 */
	static log(
		error: Error | DiscordImageError,
		level: LogLevel = "error",
	): void {
		const currentLevel = LOG_LEVELS[ErrorHandler.logLevel];
		const targetLevel = LOG_LEVELS[level];

		if (targetLevel < currentLevel) return;

		const timestamp = new Date().toISOString();
		const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

		if (error instanceof DiscordImageError) {
			console[level](`${prefix} ${error.code}: ${error.message}`, {
				details: error.details,
				cause: safeSerialize(error.cause),
				stack: error.stack,
			});
			return;
		}

		console[level](`${prefix} ${error.name}: ${error.message}`, {
			stack: error.stack,
		});
	}

	/**
	 * Wrap async function with error handling
	 */
	static async withErrorHandling<T>(
		fn: () => Promise<T>,
		context?: string,
		fallback?: T,
	): Promise<T> {
		try {
			return await fn();
		} catch (error) {
			const contextMessage = context ? ` in ${context}` : "";

			if (error instanceof DiscordImageError) {
				ErrorHandler.log(error);
				throw error;
			}

			const originalError = toError(error);
			const wrappedError = new DiscordImageError(
				`Unexpected error${contextMessage}: ${originalError.message}`,
				"UNEXPECTED_ERROR",
				500,
				{
					context,
					originalError: originalError.name,
				},
				originalError,
			);

			ErrorHandler.log(wrappedError);

			if (fallback !== undefined) {
				ErrorHandler.log(
					new DiscordImageError(
						`Using fallback value for ${context || "operation"}`,
						"FALLBACK_USED",
						200,
					),
					"warn",
				);
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
				value,
			);
		}

		return value;
	}

	/**
	 * Validate number range
	 */
	static validateRange(
		value: number,
		min: number,
		max: number,
		name: string,
	): number {
		ErrorHandler.validateRequired(value, name, "number");

		if (Number.isNaN(value)) {
			throw new ValidationError(`${name} must be a valid number`, name, value);
		}

		if (value < min || value > max) {
			throw new ValidationError(
				`${name} must be between ${min} and ${max}, got ${value}`,
				name,
				value,
			);
		}

		return value;
	}

	/**
	 * Validate string length
	 */
	static validateStringLength(
		value: string,
		maxLength: number,
		name: string,
		minLength: number = 0,
	): string {
		ErrorHandler.validateRequired(value, name, "string");

		if (value.length < minLength) {
			throw new ValidationError(
				`${name} must be at least ${minLength} characters long`,
				name,
				value,
			);
		}

		if (value.length > maxLength) {
			throw new ValidationError(
				`${name} must be no more than ${maxLength} characters long`,
				name,
				value,
			);
		}

		return value;
	}

	/**
	 * Validate array
	 */
	static validateArray<T>(
		value: T[],
		name: string,
		minLength: number = 0,
		maxLength?: number,
	): T[] {
		ErrorHandler.validateRequired(value, name);

		if (!Array.isArray(value)) {
			throw new ValidationError(`${name} must be an array`, name, value);
		}

		if (value.length < minLength) {
			throw new ValidationError(
				`${name} must have at least ${minLength} items`,
				name,
				value,
			);
		}

		if (maxLength && value.length > maxLength) {
			throw new ValidationError(
				`${name} must have no more than ${maxLength} items`,
				name,
				value,
			);
		}

		return value;
	}

	/**
	 * Create a safe wrapper for synchronous functions
	 */
	static safeFn<T extends unknown[], R>(
		fn: (...args: T) => R,
		context?: string,
		fallback?: R,
	): (...args: T) => R {
		return (...args: T): R => {
			try {
				return fn(...args);
			} catch (error) {
				const contextMessage = context ? ` in ${context}` : "";

				if (error instanceof DiscordImageError) {
					ErrorHandler.log(error);
					throw error;
				}

				const originalError = toError(error);
				const wrappedError = new DiscordImageError(
					`Unexpected error${contextMessage}: ${originalError.message}`,
					"UNEXPECTED_ERROR",
					500,
					{
						context,
						args: safeSerialize(args),
						originalError: originalError.name,
					},
					originalError,
				);

				ErrorHandler.log(wrappedError);

				if (fallback !== undefined) {
					ErrorHandler.log(
						new DiscordImageError(
							`Using fallback value for ${context || "operation"}`,
							"FALLBACK_USED",
							200,
						),
						"warn",
					);
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
		} = {},
	): Promise<T> {
		const {
			maxAttempts = 3,
			baseDelay = 1000,
			maxDelay = 10000,
			backoffFactor = 2,
			retryCondition = (error: Error) =>
				error instanceof NetworkError || error instanceof TimeoutError,
			context = "operation",
		} = options;

		let lastError!: Error;
		let attempt = 1;

		while (attempt <= maxAttempts) {
			try {
				return await fn();
			} catch (error) {
				lastError = toError(error);

				ErrorHandler.log(
					new DiscordImageError(
						`Attempt ${attempt}/${maxAttempts} failed for ${context}: ${lastError.message}`,
						"RETRY_ATTEMPT_FAILED",
						500,
						{ attempt, maxAttempts, context, originalError: lastError.message },
						lastError,
					),
					"warn",
				);

				if (attempt === maxAttempts || !retryCondition(lastError)) {
					break;
				}

				const delay = Math.min(
					baseDelay * backoffFactor ** (attempt - 1),
					maxDelay,
				);
				ErrorHandler.log(
					new DiscordImageError(
						`Retrying ${context} in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`,
						"RETRY_SCHEDULED",
						200,
						{ delay, attempt: attempt + 1, maxAttempts, context },
					),
					"info",
				);

				await new Promise((resolve) => setTimeout(resolve, delay));
				attempt++;
			}
		}

		if (lastError instanceof DiscordImageError) {
			throw lastError;
		}

		throw new DiscordImageError(
			`All ${maxAttempts} attempts failed for ${context}: ${lastError.message}`,
			"MAX_RETRIES_EXCEEDED",
			500,
			{ maxAttempts, context, lastError: lastError.message },
			lastError,
		);
	}
}
