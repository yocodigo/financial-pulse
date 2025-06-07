CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    balance NUMERIC(15,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id),
    symbol VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    date TIMESTAMP NOT NULL
);

-- Demo data
INSERT INTO users (username, password, email) VALUES
('demo', 'demo', 'demo@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO accounts (user_id, provider, account_number, balance) VALUES
(1, 'Schwab', 'SCHW123456', 10000.00),
(1, 'Fidelity', 'FID987654', 15000.00)
ON CONFLICT DO NOTHING;

INSERT INTO portfolios (user_id, name) VALUES
(1, 'Retirement'),
(1, 'Trading')
ON CONFLICT DO NOTHING;

INSERT INTO transactions (portfolio_id, symbol, type, amount, date) VALUES
(1, 'AAPL', 'buy', 10, NOW()),
(1, 'GOOGL', 'buy', 5, NOW()),
(2, 'BTC', 'buy', 0.1, NOW())
ON CONFLICT DO NOTHING;
