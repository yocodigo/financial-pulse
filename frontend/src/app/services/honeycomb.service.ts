import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoggingService } from './logging.service';

declare global {
  interface Window {
    Honeycomb: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class HoneycombService {
  private initialized = false;

  constructor(private loggingService: LoggingService) {
    this.initializeHoneycomb();
  }

  private initializeHoneycomb(): void {
    if (this.initialized) {
      return;
    }

    try {
      // Load Honeycomb Web SDK
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@honeycombio/browser@latest/dist/browser.min.js';
      script.async = true;
      script.onload = () => {
        this.setupHoneycomb();
      };
      document.head.appendChild(script);
    } catch (error) {
      this.loggingService.error('Failed to initialize Honeycomb', error);
    }
  }

  private setupHoneycomb(): void {
    try {
      window.Honeycomb.init({
        apiKey: environment.honeycomb.apiKey,
        dataset: environment.honeycomb.dataset,
        serviceName: environment.honeycomb.serviceName,
        debug: !environment.production
      });

      // Add global error handler
      window.addEventListener('error', (event) => {
        this.sendError('Unhandled Error', event.error);
      });

      // Add unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        this.sendError('Unhandled Promise Rejection', event.reason);
      });

      this.initialized = true;
      this.loggingService.info('Honeycomb initialized successfully');
    } catch (error) {
      this.loggingService.error('Failed to setup Honeycomb', error);
    }
  }

  startSpan(name: string, attributes?: Record<string, any>): void {
    if (!this.initialized) return;

    try {
      window.Honeycomb.startSpan(name, attributes);
    } catch (error) {
      this.loggingService.error('Failed to start Honeycomb span', error);
    }
  }

  endSpan(name: string, attributes?: Record<string, any>): void {
    if (!this.initialized) return;

    try {
      window.Honeycomb.endSpan(name, attributes);
    } catch (error) {
      this.loggingService.error('Failed to end Honeycomb span', error);
    }
  }

  sendEvent(name: string, attributes?: Record<string, any>): void {
    if (!this.initialized) return;

    try {
      window.Honeycomb.sendEvent(name, attributes);
    } catch (error) {
      this.loggingService.error('Failed to send Honeycomb event', error);
    }
  }

  sendError(message: string, error?: any): void {
    if (!this.initialized) return;

    try {
      window.Honeycomb.sendError(message, error);
    } catch (err) {
      this.loggingService.error('Failed to send Honeycomb error', err);
    }
  }

  addContext(attributes: Record<string, any>): void {
    if (!this.initialized) return;

    try {
      window.Honeycomb.addContext(attributes);
    } catch (error) {
      this.loggingService.error('Failed to add Honeycomb context', error);
    }
  }
} 