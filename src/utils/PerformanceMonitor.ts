/**
 * Performance monitoring utility for tracking critical operations
 * Requirements: 7.2, 7.3
 */

export interface PerformanceThresholds {
  [operationName: string]: number; // milliseconds
}

export interface PerformanceMetric {
  operationName: string;
  duration: number;
  timestamp: Date;
  exceeded: boolean;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  addProductToInvoice: 500,
  loadPOSScreen: 2000,
  saveInvoice: 1000,
  generateReport: 3000,
  loadProducts: 2000,
  loadCategories: 1000,
  searchProducts: 500,
  updateStock: 500,
};

class PerformanceMonitor {
  private thresholds: PerformanceThresholds;
  private metrics: PerformanceMetric[] = [];
  private maxMetricsHistory = 100;

  constructor(customThresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...(customThresholds || {}) } as PerformanceThresholds;
  }

  /**
   * Measure the duration of a synchronous operation
   */
  measureOperation<T>(operationName: string, operation: () => T): T {
    const start = performance.now();
    try {
      const result = operation();
      const duration = performance.now() - start;
      this.recordMetric(operationName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(operationName, duration);
      throw error;
    }
  }

  /**
   * Measure the duration of an asynchronous operation
   */
  async measureAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      this.recordMetric(operationName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(operationName, duration);
      throw error;
    }
  }

  /**
   * Start timing an operation manually
   */
  startTimer(operationName: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operationName, duration);
    };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(operationName: string, duration: number): void {
    const threshold = this.thresholds[operationName];
    const exceeded = threshold !== undefined && duration > threshold;

    const metric: PerformanceMetric = {
      operationName,
      duration,
      timestamp: new Date(),
      exceeded,
    };

    this.metrics.push(metric);

    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Log warning if threshold exceeded
    if (exceeded) {
      console.warn(
        `⚠️ Performance warning: ${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    } else if (process.env.NODE_ENV === 'development') {
      console.log(
        `✓ ${operationName} completed in ${duration.toFixed(2)}ms`
      );
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsForOperation(operationName: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.operationName === operationName);
  }

  /**
   * Get metrics that exceeded thresholds
   */
  getExceededMetrics(): PerformanceMetric[] {
    return this.metrics.filter((m) => m.exceeded);
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(operationName: string): number {
    const operationMetrics = this.getMetricsForOperation(operationName);
    if (operationMetrics.length === 0) return 0;

    const total = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / operationMetrics.length;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Update thresholds
   */
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds } as PerformanceThresholds;
  }

  /**
   * Get current thresholds
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  /**
   * Generate a performance report
   */
  generateReport(): string {
    const report: string[] = ['=== Performance Report ===\n'];

    const operationNames = Array.from(
      new Set(this.metrics.map((m) => m.operationName))
    );

    for (const opName of operationNames) {
      const metrics = this.getMetricsForOperation(opName);
      const avg = this.getAverageDuration(opName);
      const max = Math.max(...metrics.map((m) => m.duration));
      const min = Math.min(...metrics.map((m) => m.duration));
      const exceeded = metrics.filter((m) => m.exceeded).length;
      const threshold = this.thresholds[opName] || 'N/A';

      report.push(`\n${opName}:`);
      report.push(`  Executions: ${metrics.length}`);
      report.push(`  Average: ${avg.toFixed(2)}ms`);
      report.push(`  Min: ${min.toFixed(2)}ms`);
      report.push(`  Max: ${max.toFixed(2)}ms`);
      report.push(`  Threshold: ${threshold}ms`);
      report.push(`  Exceeded: ${exceeded} times`);
    }

    return report.join('\n');
  }
}

// Singleton instance
let performanceMonitorInstance: PerformanceMonitor | null = null;

/**
 * Get the singleton PerformanceMonitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetPerformanceMonitor(): void {
  performanceMonitorInstance = null;
}

export default PerformanceMonitor;
