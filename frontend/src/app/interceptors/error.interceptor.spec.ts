import { TestBed } from '@angular/core/testing';
import { ErrorInterceptor } from './error.interceptor';
import { HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        ErrorInterceptor,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    interceptor = TestBed.inject(ErrorInterceptor);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should handle 401 Unauthorized error', () => {
    const request = new HttpRequest('GET', '/api/data');
    const handler = { handle: () => throwError(() => new HttpErrorResponse({ status: 401 })) } as HttpHandler;

    interceptor.intercept(request, handler).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        expect(snackBar.open).toHaveBeenCalledWith('Session expired. Please login again.', 'Close', jasmine.any(Object));
      }
    });
  });

  it('should handle 403 Forbidden error', () => {
    const request = new HttpRequest('GET', '/api/data');
    const handler = { handle: () => throwError(() => new HttpErrorResponse({ status: 403 })) } as HttpHandler;

    interceptor.intercept(request, handler).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(snackBar.open).toHaveBeenCalledWith('You do not have permission to access this resource.', 'Close', jasmine.any(Object));
      }
    });
  });

  it('should handle 404 Not Found error', () => {
    const request = new HttpRequest('GET', '/api/data');
    const handler = { handle: () => throwError(() => new HttpErrorResponse({ status: 404 })) } as HttpHandler;

    interceptor.intercept(request, handler).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(snackBar.open).toHaveBeenCalledWith('The requested resource was not found.', 'Close', jasmine.any(Object));
      }
    });
  });

  it('should handle 500 Internal Server Error', () => {
    const request = new HttpRequest('GET', '/api/data');
    const handler = { handle: () => throwError(() => new HttpErrorResponse({ status: 500 })) } as HttpHandler;

    interceptor.intercept(request, handler).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(snackBar.open).toHaveBeenCalledWith('An internal server error occurred. Please try again later.', 'Close', jasmine.any(Object));
      }
    });
  });

  it('should handle client-side errors', () => {
    const request = new HttpRequest('GET', '/api/data');
    const handler = { handle: () => throwError(() => new Error('Network error')) } as HttpHandler;

    interceptor.intercept(request, handler).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(snackBar.open).toHaveBeenCalledWith('An error occurred. Please try again.', 'Close', jasmine.any(Object));
      }
    });
  });

  it('should pass through successful responses', () => {
    const request = new HttpRequest('GET', '/api/data');
    const handler = { handle: () => of({ data: 'test' }) } as HttpHandler;

    interceptor.intercept(request, handler).subscribe(response => {
      expect(response).toEqual({ data: 'test' });
      expect(snackBar.open).not.toHaveBeenCalled();
    });
  });

  it('should handle custom error messages from server', () => {
    const request = new HttpRequest('GET', '/api/data');
    const errorResponse = new HttpErrorResponse({
      status: 400,
      error: { message: 'Custom error message' }
    });
    const handler = { handle: () => throwError(() => errorResponse) } as HttpHandler;

    interceptor.intercept(request, handler).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(snackBar.open).toHaveBeenCalledWith('Custom error message', 'Close', jasmine.any(Object));
      }
    });
  });

  it('should handle multiple errors in sequence', () => {
    const request = new HttpRequest('GET', '/api/data');
    const handler = { handle: () => throwError(() => new HttpErrorResponse({ status: 401 })) } as HttpHandler;

    interceptor.intercept(request, handler).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      }
    });

    // Reset spies
    authService.logout.calls.reset();
    router.navigate.calls.reset();
    snackBar.open.calls.reset();

    // Test another error
    const handler2 = { handle: () => throwError(() => new HttpErrorResponse({ status: 500 })) } as HttpHandler;
    interceptor.intercept(request, handler2).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(snackBar.open).toHaveBeenCalledWith('An internal server error occurred. Please try again later.', 'Close', jasmine.any(Object));
      }
    });
  });
}); 