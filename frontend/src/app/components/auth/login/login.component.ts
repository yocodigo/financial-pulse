import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { LoggingService } from '../../../services/logging.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password" required>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>
            
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="loginForm.invalid || loading" class="full-width">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Login</span>
            </button>
          </form>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-button routerLink="/register">Create Account</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }

    .login-card {
      max-width: 400px;
      width: 90%;
      margin: 20px;
    }

    .full-width {
      width: 100%;
    }

    mat-card-header {
      justify-content: center;
      margin-bottom: 20px;
    }

    mat-card-content {
      padding: 20px;
    }

    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: center;
    }

    button[type="submit"] {
      margin-top: 20px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private loggingService: LoggingService
  ) {
    this.loggingService.logComponentLifecycle('LoginComponent', 'constructed');
  }

  ngOnInit(): void {
    this.loggingService.logComponentLifecycle('LoginComponent', 'initialized');
    
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.loggingService.debug('Login component initialized', { returnUrl: this.returnUrl });

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.loggingService.info('User already authenticated, redirecting', { returnUrl: this.returnUrl });
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    this.loggingService.debug('Login form submitted', { email: this.loginForm.get('email')?.value });

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      this.loggingService.warn('Login form validation failed', this.loginForm.errors);
      return;
    }

    this.loading = true;
    this.authService.login(
      this.loginForm.get('email')?.value,
      this.loginForm.get('password')?.value
    ).subscribe({
      next: () => {
        this.loggingService.info('Login successful, redirecting', { returnUrl: this.returnUrl });
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loggingService.error('Login failed', error);
        this.snackBar.open('Login failed: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.loggingService.logComponentLifecycle('LoginComponent', 'destroyed');
  }
} 