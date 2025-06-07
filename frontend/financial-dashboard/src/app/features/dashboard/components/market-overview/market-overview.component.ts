import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

interface MarketData {
  indices: Array<{
    name: string;
    value: number;
    change: number;
    changePercentage: number;
  }>;
  crypto: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    changePercentage24h: number;
    marketCap: number;
  }>;
}

@Component({
  selector: 'app-market-overview',
  templateUrl: './market-overview.component.html',
  styleUrls: ['./market-overview.component.scss']
})
export class MarketOverviewComponent implements OnInit, OnDestroy {
  marketData: MarketData | null = null;
  loading = false;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadMarketData();
    // Refresh data every minute
    this.subscription.add(
      setInterval(() => this.loadMarketData(), 60 * 1000)
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadMarketData(): void {
    this.loading = true;
    this.error = null;

    this.subscription.add(
      this.apiService.get<MarketData>('/market/overview').subscribe({
        next: (data) => {
          this.marketData = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load market data. Please try again later.';
          this.loading = false;
          console.error('Market data error:', error);
        }
      })
    );
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  }

  formatMarketCap(value: number): string {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return this.formatCurrency(value);
  }
}
