import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardSummary {
  totalPortfolioValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  accountBalances: {
    accountId: number;
    accountName: string;
    balance: number;
    type: string;
  }[];
  topHoldings: {
    symbol: string;
    name: string;
    quantity: number;
    currentPrice: number;
    totalValue: number;
    gainLoss: number;
    gainLossPercentage: number;
  }[];
  recentTransactions: {
    id: number;
    accountId: number;
    accountName: string;
    type: string;
    amount: number;
    date: string;
    description: string;
  }[];
  marketTrends: {
    symbol: string;
    name: string;
    currentPrice: number;
    change: number;
    changePercentage: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${environment.apiUrl}/dashboard/summary`);
  }

  getPortfolioValueHistory(days: number = 30): Observable<{ date: string; value: number }[]> {
    return this.http.get<{ date: string; value: number }[]>(
      `${environment.apiUrl}/dashboard/portfolio/history?days=${days}`
    );
  }

  getAssetAllocation(): Observable<{ type: string; value: number; percentage: number }[]> {
    return this.http.get<{ type: string; value: number; percentage: number }[]>(
      `${environment.apiUrl}/dashboard/portfolio/allocation`
    );
  }

  getRecentActivity(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/dashboard/activity?limit=${limit}`);
  }
} 