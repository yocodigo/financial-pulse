import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  currentProvider: 'schwab' | 'fidelity' | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(state => {
      this.isAuthenticated = state.isAuthenticated;
      this.currentProvider = state.provider;
    });
  }

  logout(): void {
    this.authService.disconnect();
    this.router.navigate(['/auth']);
  }
}
