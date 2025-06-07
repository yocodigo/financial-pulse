import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AuthState {
  isAuthenticated: boolean;
  provider: 'schwab' | 'fidelity' | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_STATE_KEY = 'auth_state';
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    provider: null,
    token: null
  });

  constructor(private apiService: ApiService) {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    const savedState = localStorage.getItem(this.AUTH_STATE_KEY);
    if (savedState) {
      this.authState.next(JSON.parse(savedState));
    }
  }

  private saveAuthState(state: AuthState): void {
    localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(state));
    this.authState.next(state);
  }

  public getAuthState(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  public async connectToSchwab(credentials: { username: string; password: string }): Promise<void> {
    try {
      const response = await this.apiService.post<{ token: string }>('/auth/schwab', credentials).toPromise();
      this.saveAuthState({
        isAuthenticated: true,
        provider: 'schwab',
        token: response.token
      });
    } catch (error) {
      console.error('Failed to connect to Schwab:', error);
      throw error;
    }
  }

  public async connectToFidelity(credentials: { username: string; password: string }): Promise<void> {
    try {
      const response = await this.apiService.post<{ token: string }>('/auth/fidelity', credentials).toPromise();
      this.saveAuthState({
        isAuthenticated: true,
        provider: 'fidelity',
        token: response.token
      });
    } catch (error) {
      console.error('Failed to connect to Fidelity:', error);
      throw error;
    }
  }

  public disconnect(): void {
    this.saveAuthState({
      isAuthenticated: false,
      provider: null,
      token: null
    });
  }

  public isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  public getCurrentProvider(): 'schwab' | 'fidelity' | null {
    return this.authState.value.provider;
  }

  public getToken(): string | null {
    return this.authState.value.token;
  }
}
