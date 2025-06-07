import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warning = 2,
  Error = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logLevel: LogLevel = environment.production ? LogLevel.Warning : LogLevel.Debug;

  constructor() { }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.Debug)) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.Info)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.Warning)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.Error)) {
      console.error(`[ERROR] ${message}`, error);
      // Here you could also send errors to a monitoring service like Sentry
      // if (error) {
      //   Sentry.captureException(error);
      // }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  // Log HTTP requests
  logHttpRequest(method: string, url: string, params?: any): void {
    this.debug(`HTTP Request: ${method} ${url}`, params);
  }

  // Log HTTP responses
  logHttpResponse(method: string, url: string, response: any): void {
    this.debug(`HTTP Response: ${method} ${url}`, response);
  }

  // Log HTTP errors
  logHttpError(method: string, url: string, error: any): void {
    this.error(`HTTP Error: ${method} ${url}`, error);
  }

  // Log user actions
  logUserAction(action: string, details?: any): void {
    this.info(`User Action: ${action}`, details);
  }

  // Log component lifecycle events
  logComponentLifecycle(component: string, event: string): void {
    this.debug(`Component ${component}: ${event}`);
  }

  // Log state changes
  logStateChange(store: string, action: string, state: any): void {
    this.debug(`State Change [${store}]: ${action}`, state);
  }
} 