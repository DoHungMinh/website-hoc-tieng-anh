/**
 * Simple API caching utility để tránh duplicate requests
 */

interface CacheEntry {
    data: any;
    timestamp: number;
    expiry: number;
}

class APICache {
    private cache = new Map<string, CacheEntry>();
    private defaultTTL = 5 * 60 * 1000; // 5 phút

    /**
     * Lưu dữ liệu vào cache
     */
    set(key: string, data: any, ttl: number = this.defaultTTL) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiry: Date.now() + ttl,
        });
    }

    /**
     * Lấy dữ liệu từ cache
     */
    get(key: string): any | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Kiểm tra hết hạn
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Xóa cache cho key cụ thể
     */
    delete(key: string) {
        this.cache.delete(key);
    }

    /**
     * Xóa toàn bộ cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Tạo cache key từ URL và params
     */
    createKey(url: string, params?: Record<string, any>): string {
        if (!params) return url;

        const queryString = Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join("&");

        return `${url}?${queryString}`;
    }
}

// Export singleton instance
export const apiCache = new APICache();

/**
 * Hook để fetch data với caching
 */
export const useCachedFetch = () => {
    const fetchWithCache = async (
        url: string,
        options?: RequestInit,
        cacheKey?: string,
        ttl?: number
    ) => {
        const key = cacheKey || url;

        // Kiểm tra cache trước
        const cachedData = apiCache.get(key);
        if (cachedData) {
            return cachedData;
        }

        // Fetch mới nếu không có cache
        const response = await fetch(url, options);
        const data = await response.json();

        // Lưu vào cache nếu thành công
        if (response.ok && data.success) {
            apiCache.set(key, data, ttl);
        }

        return data;
    };

    return { fetchWithCache };
};
