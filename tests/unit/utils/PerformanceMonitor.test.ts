import PerformanceMonitor, { getPerformanceMonitor, resetPerformanceMonitor } from '../../../src/utils/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    resetPerformanceMonitor();
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    monitor.clearMetrics();
  });

  describe('measureOperation', () => {
    it('should measure synchronous operation duration', () => {
      const result = monitor.measureOperation('testOp', () => {
        return 42;
      });

      expect(result).toBe(42);
      const metrics = monitor.getMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].operationName).toBe('testOp');
      expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors in synchronous operations', () => {
      expect(() => {
        monitor.measureOperation('errorOp', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      const metrics = monitor.getMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].operationName).toBe('errorOp');
    });
  });

  describe('measureAsyncOperation', () => {
    it('should measure asynchronous operation duration', async () => {
      const result = await monitor.measureAsyncOperation('asyncOp', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'done';
      });

      expect(result).toBe('done');
      const metrics = monitor.getMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].operationName).toBe('asyncOp');
      expect(metrics[0].duration).toBeGreaterThanOrEqual(10);
    });

    it('should handle errors in asynchronous operations', async () => {
      await expect(
        monitor.measureAsyncOperation('asyncErrorOp', async () => {
          throw new Error('Async error');
        })
      ).rejects.toThrow('Async error');

      const metrics = monitor.getMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].operationName).toBe('asyncErrorOp');
    });
  });

  describe('threshold warnings', () => {
    it('should mark metric as exceeded when duration exceeds threshold', () => {
      const customMonitor = new PerformanceMonitor({ slowOp: 5 });

      customMonitor.measureOperation('slowOp', () => {
        // Simulate slow operation
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Busy wait
        }
      });

      const metrics = customMonitor.getMetrics();
      expect(metrics[0].exceeded).toBe(true);
    });

    it('should not mark metric as exceeded when duration is within threshold', () => {
      const customMonitor = new PerformanceMonitor({ fastOp: 1000 });

      customMonitor.measureOperation('fastOp', () => {
        // Fast operation
      });

      const metrics = customMonitor.getMetrics();
      expect(metrics[0].exceeded).toBe(false);
    });
  });

  describe('startTimer', () => {
    it('should allow manual timing of operations', async () => {
      const stopTimer = monitor.startTimer('manualOp');
      await new Promise(resolve => setTimeout(resolve, 15));
      stopTimer();

      const metrics = monitor.getMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].operationName).toBe('manualOp');
      expect(metrics[0].duration).toBeGreaterThanOrEqual(10);
    });
  });

  describe('metrics management', () => {
    it('should get metrics for specific operation', () => {
      monitor.measureOperation('op1', () => 1);
      monitor.measureOperation('op2', () => 2);
      monitor.measureOperation('op1', () => 3);

      const op1Metrics = monitor.getMetricsForOperation('op1');
      expect(op1Metrics.length).toBe(2);
      expect(op1Metrics.every(m => m.operationName === 'op1')).toBe(true);
    });

    it('should get only exceeded metrics', () => {
      const customMonitor = new PerformanceMonitor({ slowOp: 1 });

      customMonitor.measureOperation('slowOp', () => {
        const start = Date.now();
        while (Date.now() - start < 5) {}
      });
      customMonitor.measureOperation('fastOp', () => {});

      const exceededMetrics = customMonitor.getExceededMetrics();
      expect(exceededMetrics.length).toBe(1);
      expect(exceededMetrics[0].operationName).toBe('slowOp');
    });

    it('should calculate average duration', () => {
      monitor.measureOperation('avgOp', () => {});
      monitor.measureOperation('avgOp', () => {});
      monitor.measureOperation('avgOp', () => {});

      const avg = monitor.getAverageDuration('avgOp');
      expect(avg).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for average of non-existent operation', () => {
      const avg = monitor.getAverageDuration('nonExistent');
      expect(avg).toBe(0);
    });

    it('should clear all metrics', () => {
      monitor.measureOperation('op1', () => 1);
      monitor.measureOperation('op2', () => 2);

      expect(monitor.getMetrics().length).toBe(2);

      monitor.clearMetrics();
      expect(monitor.getMetrics().length).toBe(0);
    });

    it('should limit metrics history', () => {
      const customMonitor = new PerformanceMonitor();
      
      // Add more than maxMetricsHistory (100) metrics
      for (let i = 0; i < 150; i++) {
        customMonitor.measureOperation('op', () => i);
      }

      const metrics = customMonitor.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(100);
    });
  });

  describe('threshold management', () => {
    it('should update thresholds', () => {
      monitor.updateThresholds({ newOp: 500 });
      const thresholds = monitor.getThresholds();
      expect(thresholds.newOp).toBe(500);
    });

    it('should get current thresholds', () => {
      const thresholds = monitor.getThresholds();
      expect(thresholds.addProductToInvoice).toBe(500);
      expect(thresholds.loadPOSScreen).toBe(2000);
    });
  });

  describe('generateReport', () => {
    it('should generate performance report', () => {
      monitor.measureOperation('op1', () => 1);
      monitor.measureOperation('op1', () => 2);
      monitor.measureOperation('op2', () => 3);

      const report = monitor.generateReport();
      expect(report).toContain('Performance Report');
      expect(report).toContain('op1');
      expect(report).toContain('op2');
      expect(report).toContain('Executions');
      expect(report).toContain('Average');
    });
  });

  describe('singleton instance', () => {
    it('should return same instance from getPerformanceMonitor', () => {
      const instance1 = getPerformanceMonitor();
      const instance2 = getPerformanceMonitor();
      expect(instance1).toBe(instance2);
    });

    it('should reset singleton instance', () => {
      const instance1 = getPerformanceMonitor();
      resetPerformanceMonitor();
      const instance2 = getPerformanceMonitor();
      expect(instance1).not.toBe(instance2);
    });
  });
});
