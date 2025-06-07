import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_BASE_URL = 'http://localhost:8080/api';
  private readonly CACHE_PREFIX = 'api_cache_';

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  // Generic GET request with caching
  public get<T>(endpoint: string, useCache: boolean = true): Observable<T> {
    const cacheKey = `${this.CACHE_PREFIX}${endpoint}`;

    if (useCache) {
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        return new Observable<T>(observer => {
          observer.next(cachedData);
          observer.complete();
        });
      }
    }

    return this.http.get<T>(`${this.API_BASE_URL}${endpoint}`).pipe(
      map(response => {
        if (useCache) {
          this.cacheService.set(cacheKey, response);
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Generic POST request
  public post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.API_BASE_URL}${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

  // Generic PUT request
  public put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.API_BASE_URL}${endpoint}`, data).pipe(
      catchError(this.handleError)
    );
  }

  // Generic DELETE request
  public delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.API_BASE_URL}${endpoint}`).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Clear cache for specific endpoint
  public clearCache(endpoint: string): void {
    const cacheKey = `${this.CACHE_PREFIX}${endpoint}`;
    this.cacheService.remove(cacheKey);
  }

  // Clear all API cache
  public clearAllCache(): void {
    this.cacheService.clear();
  }
}
