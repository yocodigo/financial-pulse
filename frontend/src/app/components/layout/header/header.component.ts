import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar color="primary" class="header">
      <button mat-icon-button (click)="menuClick.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      
      <span class="title">Financial Dashboard</span>
      
      <span class="spacer"></span>
      
      <ng-container *ngIf="authService.currentUserValue">
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        
        <mat-menu #userMenu="matMenu">
          <div class="user-info" mat-menu-item>
            <span>{{ authService.currentUserValue.name }}</span>
            <span class="email">{{ authService.currentUserValue.email }}</span>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="onLogout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </ng-container>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }

    .title {
      margin-left: 8px;
      font-size: 1.2rem;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      padding: 8px 16px;
      cursor: default;
    }

    .email {
      font-size: 0.8rem;
      color: rgba(0, 0, 0, 0.54);
    }
  `]
})
export class HeaderComponent {
  @Output() menuClick = new EventEmitter<void>();

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 