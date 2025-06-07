import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { PortfolioService, PortfolioHolding, PortfolioTransaction, PortfolioSummary } from '../../services/portfolio.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  @ViewChild('holdingsTable') holdingsTable!: MatTable<PortfolioHolding>;
  @ViewChild('transactionsTable') transactionsTable!: MatTable<PortfolioTransaction>;

  accountId: number;
  summary: PortfolioSummary | null = null;
  holdingsColumns = ['symbol', 'name', 'quantity', 'avgPrice', 'currentPrice', 'totalValue', 'gainLoss', 'actions'];
  transactionsColumns = ['date', 'symbol', 'type', 'quantity', 'price', 'totalAmount', 'description'];
  
  addHoldingForm: FormGroup;
  addTransactionForm: FormGroup;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private portfolioService: PortfolioService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.accountId = this.route.snapshot.params['accountId'];
    
    this.addHoldingForm = this.formBuilder.group({
      symbol: ['', [Validators.required, Validators.pattern('^[A-Z]{1,5}$')]],
      quantity: ['', [Validators.required, Validators.min(0.0001)]],
      averagePrice: ['', [Validators.required, Validators.min(0.0001)]]
    });

    this.addTransactionForm = this.formBuilder.group({
      symbol: ['', [Validators.required, Validators.pattern('^[A-Z]{1,5}$')]],
      type: ['BUY', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.0001)]],
      price: ['', [Validators.required, Validators.min(0.0001)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadPortfolioData();
  }

  loadPortfolioData(): void {
    this.loading = true;
    this.portfolioService.getPortfolioSummary(this.accountId).subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load portfolio data', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  onAddHolding(): void {
    if (this.addHoldingForm.invalid) {
      return;
    }

    const holding = this.addHoldingForm.value;
    this.portfolioService.addHolding(this.accountId, holding).subscribe({
      next: () => {
        this.snackBar.open('Holding added successfully', 'Close', {
          duration: 3000
        });
        this.addHoldingForm.reset();
        this.loadPortfolioData();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to add holding', 'Close', {
          duration: 5000
        });
      }
    });
  }

  onAddTransaction(): void {
    if (this.addTransactionForm.invalid) {
      return;
    }

    const transaction = this.addTransactionForm.value;
    this.portfolioService.addTransaction(this.accountId, transaction).subscribe({
      next: () => {
        this.snackBar.open('Transaction added successfully', 'Close', {
          duration: 3000
        });
        this.addTransactionForm.reset({ type: 'BUY' });
        this.loadPortfolioData();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to add transaction', 'Close', {
          duration: 5000
        });
      }
    });
  }

  onRemoveHolding(symbol: string): void {
    if (confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) {
      this.portfolioService.removeHolding(this.accountId, symbol).subscribe({
        next: () => {
          this.snackBar.open('Holding removed successfully', 'Close', {
            duration: 3000
          });
          this.loadPortfolioData();
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || 'Failed to remove holding', 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  onRefreshPortfolio(): void {
    this.loading = true;
    this.portfolioService.refreshPortfolio(this.accountId).subscribe({
      next: () => {
        this.snackBar.open('Portfolio refreshed successfully', 'Close', {
          duration: 3000
        });
        this.loadPortfolioData();
      },
      error: (error) => {
        this.snackBar.open(error.error?.message || 'Failed to refresh portfolio', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }
} 