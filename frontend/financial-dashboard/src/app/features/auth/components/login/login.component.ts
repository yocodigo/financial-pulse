import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  selectedProvider: 'schwab' | 'fidelity' = 'schwab';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const credentials = {
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value
    };

    const loginPromise = this.selectedProvider === 'schwab'
      ? this.authService.connectToSchwab(credentials)
      : this.authService.connectToFidelity(credentials);

    loginPromise
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        this.error = 'Authentication failed. Please check your credentials and try again.';
        console.error('Login error:', error);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  switchProvider(provider: 'schwab' | 'fidelity'): void {
    this.selectedProvider = provider;
    this.error = null;
  }
} 