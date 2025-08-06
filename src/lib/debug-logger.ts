type LogLevel = 'info' | 'warning' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

// Simple in-memory logger for debugging
const logs: LogEntry[] = [];

export function addLog(message: string, level: LogLevel = 'info') {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  
  logs.push(entry);
  
  // Keep only last 1000 log entries to prevent memory issues
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  
  // Also log to console
  console.log(`[${level.toUpperCase()}] ${message}`);
}

export function getLogs(level?: LogLevel): LogEntry[] {
  if (level) {
    return logs.filter(log => log.level === level);
  }
  return [...logs];
}

export function clearLogs() {
  logs.length = 0;
}