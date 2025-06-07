import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PortfolioHolding {
  id: number;
  accountId: number;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  lastUpdated: string;
}

export interface PortfolioTransaction {
  id: number;
  accountId: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalAmount: number;
  date: string;
  description?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  holdings: PortfolioHolding[];
  transactions: PortfolioTransaction[];
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  constructor(private http: HttpClient) {}

  getPortfolioSummary(accountId: number): Observable<PortfolioSummary> {
    return this.http.get<PortfolioSummary>(`${environment.apiUrl}/portfolio/${accountId}/summary`);
  }

  getHoldings(accountId: number): Observable<PortfolioHolding[]> {
    return this.http.get<PortfolioHolding[]>(`${environment.apiUrl}/portfolio/${accountId}/holdings`);
  }

  getHolding(accountId: number, symbol: string): Observable<PortfolioHolding> {
    return this.http.get<PortfolioHolding>(`${environment.apiUrl}/portfolio/${accountId}/holdings/${symbol}`);
  }

  addHolding(accountId: number, holding: Partial<PortfolioHolding>): Observable<PortfolioHolding> {
    return this.http.post<PortfolioHolding>(`${environment.apiUrl}/portfolio/${accountId}/holdings`, holding);
  }

  updateHolding(accountId: number, symbol: string, holding: Partial<PortfolioHolding>): Observable<PortfolioHolding> {
    return this.http.put<PortfolioHolding>(`${environment.apiUrl}/portfolio/${accountId}/holdings/${symbol}`, holding);
  }

  removeHolding(accountId: number, symbol: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/portfolio/${accountId}/holdings/${symbol}`);
  }

  getTransactions(accountId: number): Observable<PortfolioTransaction[]> {
    return this.http.get<PortfolioTransaction[]>(`${environment.apiUrl}/portfolio/${accountId}/transactions`);
  }

  addTransaction(accountId: number, transaction: Partial<PortfolioTransaction>): Observable<PortfolioTransaction> {
    return this.http.post<PortfolioTransaction>(`${environment.apiUrl}/portfolio/${accountId}/transactions`, transaction);
  }

  refreshPortfolio(accountId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/portfolio/${accountId}/refresh`, {});
  }
} 