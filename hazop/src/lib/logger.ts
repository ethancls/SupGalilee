type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private context: string;
  private isDevelopment = process.env.NODE_ENV !== "production";

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, data?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    const dataStr = data ? ` ${JSON.stringify(data)}` : "";
    return `${prefix} ${message}${dataStr}`;
  }

  debug(message: string, data?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message, data));
    }
  }

  info(message: string, data?: LogContext): void {
    console.info(this.formatMessage("info", message, data));
  }

  warn(message: string, data?: LogContext): void {
    console.warn(this.formatMessage("warn", message, data));
  }

  error(message: string, error?: Error | unknown, data?: LogContext): void {
    const errorData = error instanceof Error 
      ? { ...data, error: error.message, stack: error.stack }
      : { ...data, error };
    console.error(this.formatMessage("error", message, errorData));
  }
}

// Factory function to create loggers
export function createLogger(context: string): Logger {
  return new Logger(context);
}

// Pre-configured loggers for common contexts
export const authLogger = createLogger("Auth");
export const dbLogger = createLogger("Database");
export const apiLogger = createLogger("API");
export const proxyLogger = createLogger("Proxy");
