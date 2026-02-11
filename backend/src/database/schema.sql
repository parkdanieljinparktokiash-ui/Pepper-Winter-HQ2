-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    username VARCHAR(100) UNIQUE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    location VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (broker accounts)
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    broker VARCHAR(100) NOT NULL,
    api_credentials_encrypted TEXT,
    balance DECIMAL(15, 2) DEFAULT 0,
    profit_calculation_method VARCHAR(50) DEFAULT 'FIFO',
    sync_enabled BOOLEAN DEFAULT false,
    last_sync TIMESTAMP,
    next_update TIMESTAMP,
    account_type VARCHAR(50) DEFAULT 'live',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    entry_date TIMESTAMP NOT NULL,
    exit_date TIMESTAMP,
    entry_price DECIMAL(15, 4) NOT NULL,
    exit_price DECIMAL(15, 4),
    quantity DECIMAL(15, 4) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('long', 'short')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'win', 'loss')),
    net_pnl DECIMAL(15, 2),
    net_roi DECIMAL(10, 4),
    commission DECIMAL(10, 2) DEFAULT 0,
    fees DECIMAL(10, 2) DEFAULT 0,
    tags TEXT[],
    notes TEXT,
    strategy_id INTEGER,
    zella_insights TEXT,
    zella_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    net_pnl DECIMAL(15, 2) DEFAULT 0,
    num_trades INTEGER DEFAULT 0,
    num_wins INTEGER DEFAULT 0,
    num_losses INTEGER DEFAULT 0,
    win_rate DECIMAL(5, 2),
    profit_factor DECIMAL(10, 2),
    avg_win DECIMAL(15, 2),
    avg_loss DECIMAL(15, 2),
    largest_win DECIMAL(15, 2),
    largest_loss DECIMAL(15, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Rules table
CREATE TABLE IF NOT EXISTS rules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    condition_type VARCHAR(100) NOT NULL,
    condition_value JSONB,
    streak_count INTEGER DEFAULT 0,
    follow_rate DECIMAL(5, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rule checks table
CREATE TABLE IF NOT EXISTS rule_checks (
    id SERIAL PRIMARY KEY,
    rule_id INTEGER NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    passed BOOLEAN NOT NULL,
    performance DECIMAL(15, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder VARCHAR(100) DEFAULT 'My notes',
    title VARCHAR(255) NOT NULL,
    content_json JSONB,
    date DATE,
    pnl DECIMAL(15, 2),
    tags TEXT[],
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Strategies table
CREATE TABLE IF NOT EXISTS strategies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rules_json JSONB,
    shared BOOLEAN DEFAULT false,
    shared_with_users INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Import history table
CREATE TABLE IF NOT EXISTS import_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    import_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    records_imported INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    error_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_entry_date ON trades(entry_date);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_date ON notebooks(date);
CREATE INDEX IF NOT EXISTS idx_rule_checks_user_date ON rule_checks(user_id, date);
