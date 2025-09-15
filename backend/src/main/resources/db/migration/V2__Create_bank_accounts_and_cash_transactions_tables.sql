-- Create bank_accounts table
CREATE TABLE bank_accounts (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255),
    account_type VARCHAR(50),
    opening_balance DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cash_transactions table
CREATE TABLE cash_transactions (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    transaction_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_bank_accounts_merchant_id ON bank_accounts(merchant_id);
CREATE INDEX idx_bank_accounts_merchant_active ON bank_accounts(merchant_id, is_active);
CREATE INDEX idx_cash_transactions_merchant_id ON cash_transactions(merchant_id);
CREATE INDEX idx_cash_transactions_merchant_date ON cash_transactions(merchant_id, transaction_date);
CREATE INDEX idx_cash_transactions_type ON cash_transactions(transaction_type);

-- Add foreign key constraints (optional, depending on your requirements)
-- ALTER TABLE bank_accounts ADD CONSTRAINT fk_bank_accounts_merchant FOREIGN KEY (merchant_id) REFERENCES users(id);
-- ALTER TABLE cash_transactions ADD CONSTRAINT fk_cash_transactions_merchant FOREIGN KEY (merchant_id) REFERENCES users(id);
