import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Chart } from 'chart.js';
import { MarketDataService, MarketSummary, StockQuote, CryptoQuote, HistoricalData, TechnicalIndicators, MarketNews } from '../../services/market-data.service';
import { Observable, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-market-data',
  templateUrl: './market-data.component.html',
  styleUrls: ['./market-data.component.scss']
})
export class MarketDataComponent implements OnInit {
  @ViewChild('priceChart') priceChartRef: any;
  @ViewChild('volumeChart') volumeChartRef: any;
  @ViewChild('indicatorsChart') indicatorsChartRef: any;

  marketSummary: MarketSummary | null = null;
  selectedQuote: StockQuote | CryptoQuote | null = null;
  historicalData: HistoricalData[] = [];
  technicalIndicators: TechnicalIndicators | null = null;
  marketNews: MarketNews[] = [];
  trackedSymbols: string[] = [];
  
  searchForm: FormGroup;
  loading = false;
  priceChart: Chart | null = null;
  volumeChart: Chart | null = null;
  indicatorsChart: Chart | null = null;

  constructor(
    private marketDataService: MarketDataService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.formBuilder.group({
      symbol: ['']
    });
  }

  ngOnInit(): void {
    this.loadMarketData();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchForm.get('symbol')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length >= 2) {
          return this.marketDataService.searchSymbols(query);
        }
        return [];
      })
    ).subscribe({
      next: (results) => {
        // Handle search results
        console.log('Search results:', results);
      },
      error: (error) => {
        this.snackBar.open('Failed to search symbols', 'Close', {
          duration: 5000
        });
      }
    });
  }

  private loadMarketData(): void {
    this.loading = true;
    this.marketDataService.getMarketSummary().subscribe({
      next: (data) => {
        this.marketSummary = data;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load market data', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });

    this.loadTrackedSymbols();
    this.loadMarketNews();
  }

  private loadTrackedSymbols(): void {
    this.marketDataService.getTrackedSymbols().subscribe({
      next: (symbols) => {
        this.trackedSymbols = symbols;
      },
      error: (error) => {
        this.snackBar.open('Failed to load tracked symbols', 'Close', {
          duration: 5000
        });
      }
    });
  }

  private loadMarketNews(symbol?: string): void {
    this.marketDataService.getMarketNews(symbol).subscribe({
      next: (news) => {
        this.marketNews = news;
      },
      error: (error) => {
        this.snackBar.open('Failed to load market news', 'Close', {
          duration: 5000
        });
      }
    });
  }

  onSymbolSelect(symbol: string): void {
    this.loading = true;
    this.marketDataService.getStockQuote(symbol).subscribe({
      next: (quote) => {
        this.selectedQuote = quote;
        this.loadHistoricalData(symbol);
        this.loadTechnicalIndicators(symbol);
        this.loadMarketNews(symbol);
      },
      error: (error) => {
        this.marketDataService.getCryptoQuote(symbol).subscribe({
          next: (quote) => {
            this.selectedQuote = quote;
            this.loadHistoricalData(symbol);
            this.loadTechnicalIndicators(symbol);
            this.loadMarketNews(symbol);
          },
          error: (error) => {
            this.snackBar.open('Failed to load quote data', 'Close', {
              duration: 5000
            });
            this.loading = false;
          }
        });
      }
    });
  }

  private loadHistoricalData(symbol: string): void {
    this.marketDataService.getHistoricalData(symbol).subscribe({
      next: (data) => {
        this.historicalData = data;
        this.initializeCharts();
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load historical data', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  private loadTechnicalIndicators(symbol: string): void {
    this.marketDataService.getTechnicalIndicators(symbol).subscribe({
      next: (indicators) => {
        this.technicalIndicators = indicators;
        this.updateIndicatorsChart();
      },
      error: (error) => {
        this.snackBar.open('Failed to load technical indicators', 'Close', {
          duration: 5000
        });
      }
    });
  }

  private initializeCharts(): void {
    this.initializePriceChart();
    this.initializeVolumeChart();
    this.initializeIndicatorsChart();
  }

  private initializePriceChart(): void {
    const ctx = this.priceChartRef.nativeElement.getContext('2d');
    this.priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.historicalData.map(d => d.date),
        datasets: [{
          label: 'Price',
          data: this.historicalData.map(d => d.close),
          borderColor: '#2196f3',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => '$' + value
            }
          }
        }
      }
    });
  }

  private initializeVolumeChart(): void {
    const ctx = this.volumeChartRef.nativeElement.getContext('2d');
    this.volumeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.historicalData.map(d => d.date),
        datasets: [{
          label: 'Volume',
          data: this.historicalData.map(d => d.volume),
          backgroundColor: '#4caf50'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(1) + 'K';
                }
                return value;
              }
            }
          }
        }
      }
    });
  }

  private initializeIndicatorsChart(): void {
    const ctx = this.indicatorsChartRef.nativeElement.getContext('2d');
    this.indicatorsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.historicalData.map(d => d.date),
        datasets: [
          {
            label: 'Price',
            data: this.historicalData.map(d => d.close),
            borderColor: '#2196f3',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => '$' + value
            }
          }
        }
      }
    });
  }

  private updateIndicatorsChart(): void {
    if (!this.indicatorsChart || !this.technicalIndicators) return;

    const datasets = [
      {
        label: 'Price',
        data: this.historicalData.map(d => d.close),
        borderColor: '#2196f3',
        tension: 0.1
      },
      {
        label: 'SMA (20)',
        data: this.technicalIndicators.sma.find(s => s.period === 20)?.value,
        borderColor: '#ff9800',
        borderDash: [5, 5]
      },
      {
        label: 'EMA (20)',
        data: this.technicalIndicators.ema.find(e => e.period === 20)?.value,
        borderColor: '#9c27b0',
        borderDash: [5, 5]
      },
      {
        label: 'Upper BB',
        data: this.technicalIndicators.bollingerBands.upper,
        borderColor: '#f44336',
        borderDash: [2, 2]
      },
      {
        label: 'Lower BB',
        data: this.technicalIndicators.bollingerBands.lower,
        borderColor: '#f44336',
        borderDash: [2, 2]
      }
    ];

    this.indicatorsChart.data.datasets = datasets;
    this.indicatorsChart.update();
  }

  onTrackSymbol(symbol: string): void {
    this.marketDataService.trackSymbol(symbol).subscribe({
      next: () => {
        this.snackBar.open('Symbol tracked successfully', 'Close', {
          duration: 3000
        });
        this.loadTrackedSymbols();
      },
      error: (error) => {
        this.snackBar.open('Failed to track symbol', 'Close', {
          duration: 5000
        });
      }
    });
  }

  onUntrackSymbol(symbol: string): void {
    this.marketDataService.untrackSymbol(symbol).subscribe({
      next: () => {
        this.snackBar.open('Symbol untracked successfully', 'Close', {
          duration: 3000
        });
        this.loadTrackedSymbols();
      },
      error: (error) => {
        this.snackBar.open('Failed to untrack symbol', 'Close', {
          duration: 5000
        });
      }
    });
  }

  isTracked(symbol: string): boolean {
    return this.trackedSymbols.includes(symbol);
  }

  openNewsUrl(url: string): void {
    window.open(url, '_blank');
  }
} 