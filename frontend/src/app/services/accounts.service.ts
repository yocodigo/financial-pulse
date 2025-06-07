import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Account {
  id: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CREDIT';
  balance: number;
  currency: string;
  institution: string;
  accountNumber: string;
  lastUpdated: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'INVESTMENT' | 'DIVIDEND' | 'INTEREST';
  amount: number;
  description: string;
  date: string;
  category: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference?: string;
}

export interface AccountSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  accountCount: number;
  recentTransactions: Transaction[];
  balanceHistory: { date: string; balance: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/accounts`);
  }

  getAccount(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/accounts/${id}`);
  }

  createAccount(account: Omit<Account, 'id' | 'lastUpdated'>): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/accounts`, account);
  }

  updateAccount(id: string, account: Partial<Account>): Observable<Account> {
    return this.http.patch<Account>(`${this.apiUrl}/accounts/${id}`, account);
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/accounts/${id}`);
  }

  getTransactions(accountId: string, params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    category?: string;
  }): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/accounts/${accountId}/transactions`, {
      params: params as any
    });
  }

  createTransaction(accountId: string, transaction: Omit<Transaction, 'id' | 'accountId'>): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/accounts/${accountId}/transactions`, transaction);
  }

  updateTransaction(accountId: string, transactionId: string, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(
      `${this.apiUrl}/accounts/${accountId}/transactions/${transactionId}`,
      transaction
    );
  }

  deleteTransaction(accountId: string, transactionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/accounts/${accountId}/transactions/${transactionId}`);
  }

  getAccountSummary(): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(`${this.apiUrl}/accounts/summary`);
  }

  transferFunds(fromAccountId: string, toAccountId: string, amount: number, description?: string): Observable<{
    fromTransaction: Transaction;
    toTransaction: Transaction;
  }> {
    return this.http.post<{
      fromTransaction: Transaction;
      toTransaction: Transaction;
    }>(`${this.apiUrl}/accounts/transfer`, {
      fromAccountId,
      toAccountId,
      amount,
      description
    });
  }

  getAccountBalanceHistory(accountId: string, period: string = '1m'): Observable<{ date: string; balance: number }[]> {
    return this.http.get<{ date: string; balance: number }[]>(`${this.apiUrl}/accounts/${accountId}/balance-history`, {
      params: { period }
    });
  }
} 