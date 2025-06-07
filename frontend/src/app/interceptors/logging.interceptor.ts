import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private loggingService: LoggingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;

    // Log the request
    this.loggingService.logHttpRequest(method, url, {
      params: request.params.toString(),
      body: request.body
    });

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          // Log successful response
          this.loggingService.logHttpResponse(method, url, {
            time: Date.now() - startTime,
            event
          });
        },
        error: (error: HttpErrorResponse) => {
          // Log error response
          this.loggingService.logHttpError(method, url, {
            time: Date.now() - startTime,
            status: error.status,
            message: error.message,
            error
          });
        }
      })
    );
  }
} 