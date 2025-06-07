import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-header (menuClick)="sidenav.toggle()"></app-header>
      
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <app-sidenav></app-sidenav>
        </mat-sidenav>
        
        <mat-sidenav-content class="content">
          <div class="content-container">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .sidenav-container {
      flex: 1;
    }

    .sidenav {
      width: 250px;
      background-color: #fafafa;
    }

    .content {
      padding: 20px;
    }

    .content-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .sidenav {
        width: 200px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated and redirect if necessary
    if (!this.authService.isAuthenticated() && 
        !this.router.url.includes('/login') && 
        !this.router.url.includes('/register')) {
      this.router.navigate(['/login']);
    }
  }
} 