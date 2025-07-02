// Memory tracking script for performance tests
const v8 = require('v8');
const os = require('os');
const fs = require('fs');

// Track memory usage over time
const memoryLog = [];
const startTime = Date.now();

// Log memory usage every 5 seconds
const interval = setInterval(() => {
  const heapStats = v8.getHeapStatistics();
  const memoryUsage = process.memoryUsage();
  
  const stats = {
    timestamp: Date.now() - startTime,
    heapUsed: Math.round(heapStats.used_heap_size / 1024 / 1024),
    heapTotal: Math.round(heapStats.total_heap_size / 1024 / 1024),
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
    arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024),
  };
  
  memoryLog.push(stats);
  
  // Log to console for monitoring
  console.log(`Memory Stats: RSS=${stats.rss}MB, Heap=${stats.heapUsed}/${stats.heapTotal}MB`);
}, 5000);

// Handle process exit
process.on('exit', () => {
  clearInterval(interval);
  
  // Write memory log to file
  fs.writeFileSync('memory-usage.json', JSON.stringify({
    startTime,
    endTime: Date.now(),
    duration: Date.now() - startTime,
    samples: memoryLog,
    summary: {
      maxRss: Math.max(...memoryLog.map(s => s.rss)),
      maxHeap: Math.max(...memoryLog.map(s => s.heapUsed)),
      avgRss: Math.round(memoryLog.reduce((sum, s) => sum + s.rss, 0) / memoryLog.length),
      avgHeap: Math.round(memoryLog.reduce((sum, s) => sum + s.heapUsed, 0) / memoryLog.length),
    }
  }, null, 2));
  
  console.log('Memory tracking completed. Results saved to memory-usage.json');
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  process.exit(0);
});

// Force garbage collection if available
if (global.gc) {
  setInterval(() => {
    global.gc();
    console.log('Forced garbage collection');
  }, 30000);
}