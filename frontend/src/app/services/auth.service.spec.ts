import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  };

  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule
      ],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    const response = { token: mockToken, user: mockUser };

    service.login(credentials).subscribe(result => {
      expect(result).toEqual(mockUser);
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(response);
  });

  it('should handle login error', () => {
    const credentials = { email: 'test@example.com', password: 'wrong' };
    const errorResponse = { message: 'Invalid credentials' };

    service.login(credentials).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(service.isAuthenticated()).toBeFalse();
        expect(service.getCurrentUser()).toBeNull();
      }
    });

    const req = httpMock.expectOne(`${service.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
  });

  it('should register successfully', () => {
    const userData = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password'
    };
    const response = { token: mockToken, user: mockUser };

    service.register(userData).subscribe(result => {
      expect(result).toEqual(mockUser);
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(response);
  });

  it('should handle registration error', () => {
    const userData = {
      name: 'New User',
      email: 'existing@example.com',
      password: 'password'
    };
    const errorResponse = { message: 'Email already exists' };

    service.register(userData).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(service.isAuthenticated()).toBeFalse();
        expect(service.getCurrentUser()).toBeNull();
      }
    });

    const req = httpMock.expectOne(`${service.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
  });

  it('should logout successfully', () => {
    // First login to set the token and user
    localStorage.setItem('token', mockToken);
    service['currentUserSubject'].next(mockUser);

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should check token expiration', () => {
    // Set an expired token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjM5MDIyfQ';
    localStorage.setItem('token', expiredToken);

    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should handle token refresh', () => {
    const newToken = 'new-mock-jwt-token';
    const response = { token: newToken, user: mockUser };

    service.refreshToken().subscribe(result => {
      expect(result).toBeTrue();
      expect(service.isAuthenticated()).toBeTrue();
      expect(localStorage.getItem('token')).toBe(newToken);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    req.flush(response);
  });

  it('should handle token refresh error', () => {
    service.refreshToken().subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(service.isAuthenticated()).toBeFalse();
        expect(localStorage.getItem('token')).toBeNull();
      }
    });

    const req = httpMock.expectOne(`${service.apiUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('should check user role', () => {
    // First login to set the user
    localStorage.setItem('token', mockToken);
    service['currentUserSubject'].next(mockUser);

    expect(service.hasRole('USER')).toBeTrue();
    expect(service.hasRole('ADMIN')).toBeFalse();
  });

  it('should handle network errors', () => {
    const credentials = { email: 'test@example.com', password: 'password' };

    service.login(credentials).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(service.isAuthenticated()).toBeFalse();
      }
    });

    const req = httpMock.expectOne(`${service.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.error(new ErrorEvent('Network error'));
  });
}); 