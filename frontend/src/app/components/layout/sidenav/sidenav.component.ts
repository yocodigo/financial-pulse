import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  template: `
    <div class="sidenav-container">
      <mat-nav-list>
        <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>
        
        <a mat-list-item routerLink="/portfolio" routerLinkActive="active">
          <mat-icon matListItemIcon>account_balance</mat-icon>
          <span matListItemTitle>Portfolio</span>
        </a>
        
        <a mat-list-item routerLink="/market-data" routerLinkActive="active">
          <mat-icon matListItemIcon>show_chart</mat-icon>
          <span matListItemTitle>Market Data</span>
        </a>
        
        <a mat-list-item routerLink="/accounts" routerLinkActive="active">
          <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
          <span matListItemTitle>Accounts</span>
        </a>
      </mat-nav-list>
    </div>
  `,
  styles: [`
    .sidenav-container {
      padding-top: 64px; /* Height of the header */
      height: 100%;
    }

    mat-nav-list {
      padding-top: 8px;
    }

    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }

    mat-icon {
      margin-right: 8px;
    }

    @media (max-width: 600px) {
      .sidenav-container {
        padding-top: 56px; /* Height of the header on mobile */
      }
    }
  `]
})
export class SidenavComponent {
  constructor(private router: Router) {}
} 