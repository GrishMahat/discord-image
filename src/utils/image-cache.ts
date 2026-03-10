/** @format */

/**
 * Simple in-memory cache for template images
 * Prevents repeated disk I/O for the same templates
 */

type CachedImage<T> = {
	data: T;
	timestamp: number;
};

class ImageCache<T = unknown> {
	private cache: Map<string, CachedImage<T>> = new Map();
	private readonly maxSize: number;
	private readonly ttlMs: number; // Time-to-live in milliseconds

	constructor(maxSize: number = 50, ttlSeconds: number = 300) {
		if (!Number.isInteger(maxSize) || maxSize <= 0) {
			throw new Error("maxSize must be a positive integer");
		}
		if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
			throw new Error("ttlSeconds must be a positive number");
		}

		this.maxSize = maxSize;
		this.ttlMs = ttlSeconds * 1000;
	}

	/**
	 * Get a cached image by key
	 */
	get(key: string): T | undefined {
		const cached = this.cache.get(key);
		if (!cached) return undefined;

		// Check if expired
		if (this.isExpired(cached.timestamp)) {
			this.cache.delete(key);
			return undefined;
		}

		// Refresh key to keep LRU ordering.
		this.cache.delete(key);
		this.cache.set(key, cached);

		return cached.data;
	}

	/**
	 * Store an image in the cache
	 */
	set(key: string, data: T): void {
		// Replace existing key to refresh insertion/LRU order.
		if (this.cache.has(key)) {
			this.cache.delete(key);
		}

		this.cache.set(key, {
			data,
			timestamp: Date.now(),
		});

		this.evictIfNeeded();
	}

	/**
	 * Get a cached value or compute and store it.
	 */
	async getOrSet(key: string, factory: () => Promise<T>): Promise<T> {
		const cached = this.get(key);
		if (cached !== undefined) return cached;

		const value = await factory();
		this.set(key, value);
		return value;
	}

	/**
	 * Check if a key exists and is not expired
	 */
	has(key: string): boolean {
		return this.get(key) !== undefined;
	}

	/**
	 * Clear all cached images
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Remove an entry from the cache
	 */
	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	/**
	 * Remove expired entries and return removed count
	 */
	pruneExpired(): number {
		let removed = 0;
		for (const [key, value] of this.cache) {
			if (this.isExpired(value.timestamp)) {
				this.cache.delete(key);
				removed++;
			}
		}
		return removed;
	}

	/**
	 * Get current cache size
	 */
	get size(): number {
		return this.cache.size;
	}

	/**
	 * Snapshot cache statistics
	 */
	get stats(): { size: number; maxSize: number; ttlSeconds: number } {
		return {
			size: this.cache.size,
			maxSize: this.maxSize,
			ttlSeconds: this.ttlMs / 1000,
		};
	}

	private isExpired(timestamp: number): boolean {
		return Date.now() - timestamp > this.ttlMs;
	}

	private evictIfNeeded(): void {
		// Prefer removing expired entries first.
		this.pruneExpired();

		while (this.cache.size > this.maxSize) {
			const oldestKey = this.cache.keys().next().value;
			if (!oldestKey) break;
			this.cache.delete(oldestKey);
		}
	}
}

// Singleton instance for template images
export const templateCache = new ImageCache(50, 300);

// Singleton instance for user images (shorter TTL)
export const userImageCache = new ImageCache(100, 60);

export { ImageCache };
