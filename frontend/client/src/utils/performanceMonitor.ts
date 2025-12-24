/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, number> = new Map();

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * Bắt đầu đo performance
     */
    startMeasure(name: string): void {
        this.metrics.set(name, performance.now());
    }

    /**
     * Kết thúc đo performance và log kết quả
     */
    endMeasure(name: string, logToConsole: boolean = true): number {
        const startTime = this.metrics.get(name);
        if (!startTime) {
            console.warn(`Performance measure "${name}" was not started`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.metrics.delete(name);

        if (logToConsole) {
            console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        }

        // Warn for slow operations
        if (duration > 1000) {
            console.warn(
                `🐌 Slow operation detected: ${name} took ${duration.toFixed(
                    2
                )}ms`
            );
        }

        return duration;
    }

    /**
     * Đo API call performance
     */
    async measureAPICall<T>(
        name: string,
        apiCall: () => Promise<T>,
        options: { warnThreshold?: number; logToConsole?: boolean } = {}
    ): Promise<T> {
        const { warnThreshold = 2000, logToConsole = true } = options;

        this.startMeasure(name);

        try {
            const result = await apiCall();
            const duration = this.endMeasure(name, logToConsole);

            if (duration > warnThreshold) {
                console.warn(
                    `🐌 Slow API call: ${name} took ${duration.toFixed(2)}ms`
                );
            }

            return result;
        } catch (error) {
            this.endMeasure(name, false);
            console.error(`❌ API call failed: ${name}`, error);
            throw error;
        }
    }

    /**
     * Monitor memory usage
     */
    logMemoryUsage(context: string = "Unknown"): void {
        if ("memory" in performance) {
            const memory = (performance as any).memory;
            console.log(`🧠 Memory usage [${context}]:`, {
                used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
            });

            // Warn if memory usage is high
            const usagePercentage =
                (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            if (usagePercentage > 80) {
                console.warn(
                    `⚠️ High memory usage: ${usagePercentage.toFixed(2)}%`
                );
            }
        }
    }

    /**
     * Check for potential memory leaks
     */
    checkForMemoryLeaks(): void {
        if ("memory" in performance) {
            const memory = (performance as any).memory;
            const usagePercentage =
                (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

            if (usagePercentage > 90) {
                console.error(
                    "🚨 Potential memory leak detected! Memory usage > 90%"
                );
                this.logMemoryUsage("Memory Leak Check");
            }
        }
    }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Auto-check memory every 30 seconds in development
if (import.meta.env.DEV) {
    setInterval(() => {
        performanceMonitor.checkForMemoryLeaks();
    }, 30000);
}
