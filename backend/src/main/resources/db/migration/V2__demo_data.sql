-- Insert demo user
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('demo@example.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', 'Demo', 'User');

-- Insert demo financial accounts
INSERT INTO financial_accounts (user_id, account_type, provider, account_number, balance, currency)
VALUES 
    (1, 'BROKERAGE', 'SCHWAB', 'SCHW123456', 50000.00, 'USD'),
    (1, 'BROKERAGE', 'FIDELITY', 'FID789012', 75000.00, 'USD');

-- Insert demo transactions
INSERT INTO transactions (account_id, transaction_type, amount, description, transaction_date)
VALUES 
    (1, 'BUY', 1000.00, 'Bought AAPL shares', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (1, 'SELL', 500.00, 'Sold MSFT shares', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (2, 'BUY', 2000.00, 'Bought GOOGL shares', CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Insert demo portfolio holdings
INSERT INTO portfolio_holdings (account_id, symbol, quantity, average_price, current_price)
VALUES 
    (1, 'AAPL', 10, 150.00, 175.50),
    (1, 'MSFT', 5, 250.00, 275.75),
    (2, 'GOOGL', 2, 2800.00, 2850.25);

-- Insert demo market data
INSERT INTO market_data (symbol, price, volume, timestamp, data_source)
VALUES 
    ('AAPL', 175.50, 1000000, CURRENT_TIMESTAMP, 'YAHOO_FINANCE'),
    ('MSFT', 275.75, 800000, CURRENT_TIMESTAMP, 'YAHOO_FINANCE'),
    ('GOOGL', 2850.25, 500000, CURRENT_TIMESTAMP, 'YAHOO_FINANCE'); 