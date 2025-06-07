import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Chart } from 'chart.js';
import { AccountsService, Account, Transaction, AccountSummary } from '../../services/accounts.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  @ViewChild('balanceChart') balanceChartRef: any;

  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  transactions: Transaction[] = [];
  accountSummary: AccountSummary | null = null;
  balanceChart: Chart | null = null;

  accountForm: FormGroup;
  transactionForm: FormGroup;
  transferForm: FormGroup;
  loading = false;

  constructor(
    private accountsService: AccountsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.accountForm = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      currency: ['USD', Validators.required],
      institution: ['', Validators.required],
      accountNumber: ['', Validators.required]
    });

    this.transactionForm = this.formBuilder.group({
      type: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      date: [new Date(), Validators.required]
    });

    this.transferForm = this.formBuilder.group({
      fromAccountId: ['', Validators.required],
      toAccountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadAccountSummary();
  }

  private loadAccounts(): void {
    this.loading = true;
    this.accountsService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load accounts', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  private loadAccountSummary(): void {
    this.accountsService.getAccountSummary().subscribe({
      next: (summary) => {
        this.accountSummary = summary;
        this.initializeBalanceChart();
      },
      error: (error) => {
        this.snackBar.open('Failed to load account summary', 'Close', {
          duration: 5000
        });
      }
    });
  }

  onAccountSelect(account: Account): void {
    this.selectedAccount = account;
    this.loadTransactions(account.id);
    this.loadBalanceHistory(account.id);
  }

  private loadTransactions(accountId: string): void {
    this.loading = true;
    this.accountsService.getTransactions(accountId).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load transactions', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  private loadBalanceHistory(accountId: string): void {
    this.accountsService.getAccountBalanceHistory(accountId).subscribe({
      next: (history) => {
        this.updateBalanceChart(history);
      },
      error: (error) => {
        this.snackBar.open('Failed to load balance history', 'Close', {
          duration: 5000
        });
      }
    });
  }

  private initializeBalanceChart(): void {
    if (!this.accountSummary) return;

    const ctx = this.balanceChartRef.nativeElement.getContext('2d');
    this.balanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.accountSummary.balanceHistory.map(h => h.date),
        datasets: [{
          label: 'Total Balance',
          data: this.accountSummary.balanceHistory.map(h => h.balance),
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

  private updateBalanceChart(history: { date: string; balance: number }[]): void {
    if (!this.balanceChart) return;

    this.balanceChart.data.labels = history.map(h => h.date);
    this.balanceChart.data.datasets[0].data = history.map(h => h.balance);
    this.balanceChart.update();
  }

  onCreateAccount(): void {
    if (this.accountForm.invalid) return;

    this.loading = true;
    this.accountsService.createAccount(this.accountForm.value).subscribe({
      next: (account) => {
        this.accounts.push(account);
        this.accountForm.reset();
        this.snackBar.open('Account created successfully', 'Close', {
          duration: 3000
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to create account', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  onUpdateAccount(account: Account): void {
    this.loading = true;
    this.accountsService.updateAccount(account.id, account).subscribe({
      next: (updatedAccount) => {
        const index = this.accounts.findIndex(a => a.id === account.id);
        if (index !== -1) {
          this.accounts[index] = updatedAccount;
        }
        this.snackBar.open('Account updated successfully', 'Close', {
          duration: 3000
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to update account', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  onDeleteAccount(accountId: string): void {
    if (!confirm('Are you sure you want to delete this account?')) return;

    this.loading = true;
    this.accountsService.deleteAccount(accountId).subscribe({
      next: () => {
        this.accounts = this.accounts.filter(a => a.id !== accountId);
        if (this.selectedAccount?.id === accountId) {
          this.selectedAccount = null;
          this.transactions = [];
        }
        this.snackBar.open('Account deleted successfully', 'Close', {
          duration: 3000
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to delete account', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  onCreateTransaction(): void {
    if (this.transactionForm.invalid || !this.selectedAccount) return;

    this.loading = true;
    this.accountsService.createTransaction(this.selectedAccount.id, this.transactionForm.value).subscribe({
      next: (transaction) => {
        this.transactions.unshift(transaction);
        this.transactionForm.reset();
        this.snackBar.open('Transaction created successfully', 'Close', {
          duration: 3000
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to create transaction', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  onTransferFunds(): void {
    if (this.transferForm.invalid) return;

    this.loading = true;
    const { fromAccountId, toAccountId, amount, description } = this.transferForm.value;
    this.accountsService.transferFunds(fromAccountId, toAccountId, amount, description).subscribe({
      next: ({ fromTransaction, toTransaction }) => {
        if (this.selectedAccount?.id === fromAccountId) {
          this.transactions.unshift(fromTransaction);
        }
        this.transferForm.reset();
        this.snackBar.open('Transfer completed successfully', 'Close', {
          duration: 3000
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to transfer funds', 'Close', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  getAccountTypeIcon(type: string): string {
    switch (type) {
      case 'CHECKING':
        return 'account_balance';
      case 'SAVINGS':
        return 'savings';
      case 'INVESTMENT':
        return 'trending_up';
      case 'CREDIT':
        return 'credit_card';
      default:
        return 'account_balance';
    }
  }

  getTransactionTypeIcon(type: string): string {
    switch (type) {
      case 'DEPOSIT':
        return 'arrow_downward';
      case 'WITHDRAWAL':
        return 'arrow_upward';
      case 'TRANSFER':
        return 'swap_horiz';
      case 'INVESTMENT':
        return 'trending_up';
      case 'DIVIDEND':
        return 'payments';
      case 'INTEREST':
        return 'savings';
      default:
        return 'payment';
    }
  }
} 