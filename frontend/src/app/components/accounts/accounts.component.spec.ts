import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountsComponent } from './accounts.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccountsService } from '../../services/accounts.service';
import { of } from 'rxjs';
import { Account, AccountType } from '../../models/account.model';
import { Transaction, TransactionType, TransactionStatus } from '../../models/transaction.model';

describe('AccountsComponent', () => {
  let component: AccountsComponent;
  let fixture: ComponentFixture<AccountsComponent>;
  let accountsService: jasmine.SpyObj<AccountsService>;

  const mockAccount: Account = {
    id: 1,
    name: 'Test Account',
    type: AccountType.CHECKING,
    balance: 1000,
    currency: 'USD',
    institution: 'Test Bank',
    accountNumber: '1234567890',
    lastUpdated: new Date()
  };

  const mockTransaction: Transaction = {
    id: 1,
    accountId: 1,
    type: TransactionType.DEPOSIT,
    amount: 100,
    description: 'Test deposit',
    category: 'Test category',
    date: new Date(),
    status: TransactionStatus.COMPLETED
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AccountsService', [
      'getAccounts',
      'getAccount',
      'createAccount',
      'updateAccount',
      'deleteAccount',
      'getAccountTransactions',
      'createTransaction',
      'transferFunds',
      'getAccountSummary'
    ]);

    spy.getAccounts.and.returnValue(of([mockAccount]));
    spy.getAccount.and.returnValue(of(mockAccount));
    spy.getAccountTransactions.and.returnValue(of([mockTransaction]));
    spy.getAccountSummary.and.returnValue(of({
      totalBalance: 1000,
      totalIncome: 500,
      totalExpenses: 300,
      accountCount: 1
    }));

    await TestBed.configureTestingModule({
      declarations: [AccountsComponent],
      imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AccountsService, useValue: spy }
      ]
    }).compileComponents();

    accountsService = TestBed.inject(AccountsService) as jasmine.SpyObj<AccountsService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on init', () => {
    expect(accountsService.getAccounts).toHaveBeenCalled();
    expect(component.accounts).toEqual([mockAccount]);
  });

  it('should load account summary on init', () => {
    expect(accountsService.getAccountSummary).toHaveBeenCalled();
    expect(component.accountSummary).toBeTruthy();
  });

  it('should create account form with required fields', () => {
    expect(component.accountForm.get('name')).toBeTruthy();
    expect(component.accountForm.get('type')).toBeTruthy();
    expect(component.accountForm.get('currency')).toBeTruthy();
    expect(component.accountForm.get('institution')).toBeTruthy();
    expect(component.accountForm.get('accountNumber')).toBeTruthy();
  });

  it('should create transaction form with required fields', () => {
    expect(component.transactionForm.get('type')).toBeTruthy();
    expect(component.transactionForm.get('amount')).toBeTruthy();
    expect(component.transactionForm.get('description')).toBeTruthy();
    expect(component.transactionForm.get('category')).toBeTruthy();
    expect(component.transactionForm.get('date')).toBeTruthy();
  });

  it('should create transfer form with required fields', () => {
    expect(component.transferForm.get('fromAccountId')).toBeTruthy();
    expect(component.transferForm.get('toAccountId')).toBeTruthy();
    expect(component.transferForm.get('amount')).toBeTruthy();
    expect(component.transferForm.get('description')).toBeTruthy();
  });

  it('should call createAccount when form is submitted', () => {
    const newAccount = {
      name: 'New Account',
      type: AccountType.SAVINGS,
      currency: 'USD',
      institution: 'New Bank',
      accountNumber: '9876543210'
    };

    component.accountForm.patchValue(newAccount);
    component.onCreateAccount();

    expect(accountsService.createAccount).toHaveBeenCalledWith(newAccount);
  });

  it('should call createTransaction when form is submitted', () => {
    const newTransaction = {
      type: TransactionType.DEPOSIT,
      amount: 200,
      description: 'New transaction',
      category: 'New category',
      date: new Date()
    };

    component.transactionForm.patchValue(newTransaction);
    component.onCreateTransaction();

    expect(accountsService.createTransaction).toHaveBeenCalledWith(component.selectedAccount.id, newTransaction);
  });

  it('should call transferFunds when form is submitted', () => {
    const transfer = {
      fromAccountId: 1,
      toAccountId: 2,
      amount: 100,
      description: 'Test transfer'
    };

    component.transferForm.patchValue(transfer);
    component.onTransferFunds();

    expect(accountsService.transferFunds).toHaveBeenCalledWith(
      transfer.fromAccountId,
      transfer.toAccountId,
      transfer.amount,
      transfer.description
    );
  });

  it('should load transactions when account is selected', () => {
    component.onAccountSelect(mockAccount);

    expect(accountsService.getAccountTransactions).toHaveBeenCalledWith(mockAccount.id);
    expect(component.transactions).toEqual([mockTransaction]);
  });

  it('should delete account when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.onDeleteAccount(mockAccount.id);

    expect(accountsService.deleteAccount).toHaveBeenCalledWith(mockAccount.id);
  });

  it('should not delete account when not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.onDeleteAccount(mockAccount.id);

    expect(accountsService.deleteAccount).not.toHaveBeenCalled();
  });
}); 