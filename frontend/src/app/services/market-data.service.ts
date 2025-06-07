import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  eps: number;
  dividend: number;
  dividendYield: number;
  high52Week: number;
  low52Week: number;
}

export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  high24h: number;
  low24h: number;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketSummary {
  sp500Value: number;
  sp500Change: number;
  dowJonesValue: number;
  dowJonesChange: number;
  nasdaqValue: number;
  nasdaqChange: number;
  bitcoinValue: number;
  bitcoinChange: number;
}

export interface TechnicalIndicators {
  sma: { period: number; value: number }[];
  ema: { period: number; value: number }[];
  rsi: { period: number; value: number }[];
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  symbol?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStockQuote(symbol: string): Observable<StockQuote> {
    return this.http.get<StockQuote>(`${this.apiUrl}/market/stock/${symbol}`);
  }

  getCryptoQuote(symbol: string): Observable<CryptoQuote> {
    return this.http.get<CryptoQuote>(`${this.apiUrl}/market/crypto/${symbol}`);
  }

  getHistoricalData(symbol: string, period: string = '1m'): Observable<HistoricalData[]> {
    return this.http.get<HistoricalData[]>(`${this.apiUrl}/market/historical/${symbol}`, {
      params: { period }
    });
  }

  getBatchQuotes(symbols: string[]): Observable<(StockQuote | CryptoQuote)[]> {
    return this.http.post<(StockQuote | CryptoQuote)[]>(`${this.apiUrl}/market/batch`, { symbols });
  }

  getMarketSummary(): Observable<MarketSummary> {
    return this.http.get<MarketSummary>(`${this.apiUrl}/market/summary`);
  }

  searchSymbols(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/market/search`, {
      params: { query }
    });
  }

  trackSymbol(symbol: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/market/track`, { symbol });
  }

  untrackSymbol(symbol: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/market/track/${symbol}`);
  }

  getTrackedSymbols(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/market/tracked`);
  }

  getTechnicalIndicators(symbol: string, period: string = '1m'): Observable<TechnicalIndicators> {
    return this.http.get<TechnicalIndicators>(`${this.apiUrl}/market/indicators/${symbol}`, {
      params: { period }
    });
  }

  getMarketNews(symbol?: string): Observable<MarketNews[]> {
    return this.http.get<MarketNews[]>(`${this.apiUrl}/market/news`, {
      params: symbol ? { symbol } : {}
    });
  }
} 