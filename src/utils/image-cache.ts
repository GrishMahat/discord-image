/** @format */

/**
 * Simple in-memory cache for template images
 * Prevents repeated disk I/O for the same templates
 */

type CachedImage = {
	data: any;
	timestamp: number;
};

class ImageCache {
	private cache: Map<string, CachedImage> = new Map();
	private maxSize: number;
	private ttl: number; // Time-to-live in milliseconds

	constructor(maxSize: number = 50, ttlSeconds: number = 300) {
		this.maxSize = maxSize;
		this.ttl = ttlSeconds * 1000;
	}

	/**
	 * Get a cached image by key
	 */
	get(key: string): any | undefined {
		const cached = this.cache.get(key);
		if (!cached) return undefined;

		// Check if expired
		if (Date.now() - cached.timestamp > this.ttl) {
			this.cache.delete(key);
			return undefined;
		}

		return cached.data;
	}

	/**
	 * Store an image in the cache
	 */
	set(key: string, data: any): void {
		// Evict oldest entries if cache is full
		if (this.cache.size >= this.maxSize) {
			const oldestKey = this.cache.keys().next().value;
			if (oldestKey) {
				this.cache.delete(oldestKey);
			}
		}

		this.cache.set(key, {
			data,
			timestamp: Date.now(),
		});
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
	 * Get current cache size
	 */
	get size(): number {
		return this.cache.size;
	}
}

// Singleton instance for template images
export const templateCache = new ImageCache(50, 300);

// Singleton instance for user images (shorter TTL)
export const userImageCache = new ImageCache(100, 60);

export { ImageCache };
