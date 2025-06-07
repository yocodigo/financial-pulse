import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    this.loggingService.debug('Attempting login', { email });
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap({
          next: (user) => {
            this.loggingService.info('Login successful', { email: user.email });
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          },
          error: (error) => {
            this.loggingService.error('Login failed', { email, error });
            throw error;
          }
        })
      );
  }

  register(user: User): Observable<User> {
    this.loggingService.debug('Attempting registration', { email: user.email });
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, user)
      .pipe(
        tap({
          next: (newUser) => {
            this.loggingService.info('Registration successful', { email: newUser.email });
          },
          error: (error) => {
            this.loggingService.error('Registration failed', { email: user.email, error });
            throw error;
          }
        })
      );
  }

  logout(): void {
    this.loggingService.debug('Logging out user', { email: this.currentUserValue?.email });
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.loggingService.info('User logged out successfully');
  }

  refreshToken(): Observable<User> {
    this.loggingService.debug('Refreshing token');
    return this.http.post<User>(`${environment.apiUrl}/auth/refresh-token`, {})
      .pipe(
        tap({
          next: (user) => {
            this.loggingService.info('Token refreshed successfully');
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          },
          error: (error) => {
            this.loggingService.error('Token refresh failed', { error });
            throw error;
          }
        })
      );
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.currentUserValue;
    this.loggingService.debug('Checking authentication status', { isAuthenticated: isAuth });
    return isAuth;
  }

  private getUserFromStorage(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name
      };
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
} 