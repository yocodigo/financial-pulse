import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';

interface PortfolioData {
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
  holdings: Array<{
    symbol: string;
    quantity: number;
    currentPrice: number;
    value: number;
    change: number;
    changePercentage: number;
  }>;
}

@Component({
  selector: 'app-portfolio-summary',
  templateUrl: './portfolio-summary.component.html',
  styleUrls: ['./portfolio-summary.component.scss']
})
export class PortfolioSummaryComponent implements OnInit, OnDestroy {
  portfolioData: PortfolioData | null = null;
  loading = false;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPortfolioData();
    // Refresh data every 5 minutes
    this.subscription.add(
      setInterval(() => this.loadPortfolioData(), 5 * 60 * 1000)
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadPortfolioData(): void {
    if (!this.authService.isAuthenticated()) {
      this.error = 'Please connect to your brokerage account first';
      return;
    }

    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.apiService.get<PortfolioData>('/portfolio/summary').subscribe({
        next: (data) => {
          this.portfolioData = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load portfolio data. Please try again later.';
          this.loading = false;
          console.error('Portfolio data error:', error);
        }
      })
    );
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  }
}
