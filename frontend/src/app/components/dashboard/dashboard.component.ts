import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { LoggingService } from '../../services/logging.service';
import { HoneycombService } from '../../services/honeycomb.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('portfolioChart') portfolioChartRef: any;
  @ViewChild('allocationChart') allocationChartRef: any;

  summary: any;
  portfolioHistory: any[] = [];
  assetAllocation: any[] = [];
  recentActivity: any[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private portfolioChart: Chart | null = null;
  private allocationChart: Chart | null = null;

  constructor(
    private dashboardService: DashboardService,
    private loggingService: LoggingService,
    private honeycombService: HoneycombService,
    private snackBar: MatSnackBar
  ) {
    this.loggingService.logComponentLifecycle('DashboardComponent', 'constructed');
  }

  ngOnInit(): void {
    this.loggingService.logComponentLifecycle('DashboardComponent', 'initialized');
    this.honeycombService.startSpan('DashboardComponent.ngOnInit');
    this.loadDashboardData();
    this.honeycombService.endSpan('DashboardComponent.ngOnInit');
  }

  loadDashboardData(): void {
    this.loggingService.debug('Loading dashboard data');
    this.honeycombService.startSpan('DashboardComponent.loadDashboardData');
    this.loading = true;
    this.error = null;

    // Load summary
    this.dashboardService.getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.loggingService.debug('Dashboard summary loaded', data);
          this.honeycombService.sendEvent('DashboardSummaryLoaded', { dataSize: JSON.stringify(data).length });
          this.summary = data;
          this.initializeCharts();
        },
        error: (error) => {
          this.loggingService.error('Failed to load dashboard summary', error);
          this.honeycombService.sendError('DashboardSummaryLoadFailed', error);
          this.error = 'Failed to load dashboard summary';
        }
      });

    // Load portfolio history
    this.dashboardService.getPortfolioHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.loggingService.debug('Portfolio history loaded', { dataPoints: data.length });
          this.honeycombService.sendEvent('PortfolioHistoryLoaded', { dataPoints: data.length });
          this.portfolioHistory = data;
        },
        error: (error) => {
          this.loggingService.error('Failed to load portfolio history', error);
          this.honeycombService.sendError('PortfolioHistoryLoadFailed', error);
          this.error = 'Failed to load portfolio history';
        }
      });

    // Load asset allocation
    this.dashboardService.getAssetAllocation()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.loggingService.debug('Asset allocation loaded', { categories: data.length });
          this.honeycombService.sendEvent('AssetAllocationLoaded', { categories: data.length });
          this.assetAllocation = data;
        },
        error: (error) => {
          this.loggingService.error('Failed to load asset allocation', error);
          this.honeycombService.sendError('AssetAllocationLoadFailed', error);
          this.error = 'Failed to load asset allocation';
        }
      });

    // Load recent activity
    this.dashboardService.getRecentActivity()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.loggingService.debug('Recent activity loaded', { activities: data.length });
          this.honeycombService.sendEvent('RecentActivityLoaded', { activities: data.length });
          this.recentActivity = data;
          this.loading = false;
          this.honeycombService.endSpan('DashboardComponent.loadDashboardData');
        },
        error: (error) => {
          this.loggingService.error('Failed to load recent activity', error);
          this.honeycombService.sendError('RecentActivityLoadFailed', error);
          this.error = 'Failed to load recent activity';
          this.loading = false;
          this.honeycombService.endSpan('DashboardComponent.loadDashboardData');
        }
      });
  }

  refreshDashboard(): void {
    this.loggingService.debug('Refreshing dashboard data');
    this.honeycombService.startSpan('DashboardComponent.refreshDashboard');
    this.loadDashboardData();
    this.honeycombService.endSpan('DashboardComponent.refreshDashboard');
  }

  private initializeCharts(): void {
    this.honeycombService.startSpan('DashboardComponent.initializeCharts');
    this.initializePortfolioChart();
    this.initializeAllocationChart();
    this.honeycombService.endSpan('DashboardComponent.initializeCharts');
  }

  private initializePortfolioChart(): void {
    this.honeycombService.startSpan('DashboardComponent.initializePortfolioChart');
    this.dashboardService.getPortfolioValueHistory().subscribe({
      next: (data) => {
        const ctx = this.portfolioChartRef.nativeElement.getContext('2d');
        this.portfolioChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map(d => d.date),
            datasets: [{
              label: 'Portfolio Value',
              data: data.map(d => d.value),
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
        this.honeycombService.sendEvent('PortfolioChartInitialized', { dataPoints: data.length });
        this.honeycombService.endSpan('DashboardComponent.initializePortfolioChart');
      },
      error: (error) => {
        this.loggingService.error('Failed to initialize portfolio chart', error);
        this.honeycombService.sendError('PortfolioChartInitializationFailed', error);
        this.honeycombService.endSpan('DashboardComponent.initializePortfolioChart');
      }
    });
  }

  private initializeAllocationChart(): void {
    this.honeycombService.startSpan('DashboardComponent.initializeAllocationChart');
    this.dashboardService.getAssetAllocation().subscribe({
      next: (data) => {
        const ctx = this.allocationChartRef.nativeElement.getContext('2d');
        this.allocationChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: data.map(d => d.type),
            datasets: [{
              data: data.map(d => d.value),
              backgroundColor: [
                '#2196f3',
                '#4caf50',
                '#ff9800',
                '#f44336',
                '#9c27b0'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right'
              }
            }
          }
        });
        this.honeycombService.sendEvent('AllocationChartInitialized', { categories: data.length });
        this.honeycombService.endSpan('DashboardComponent.initializeAllocationChart');
      },
      error: (error) => {
        this.loggingService.error('Failed to initialize allocation chart', error);
        this.honeycombService.sendError('AllocationChartInitializationFailed', error);
        this.honeycombService.endSpan('DashboardComponent.initializeAllocationChart');
      }
    });
  }

  ngOnDestroy(): void {
    this.loggingService.logComponentLifecycle('DashboardComponent', 'destroyed');
    this.honeycombService.sendEvent('DashboardComponentDestroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
} 