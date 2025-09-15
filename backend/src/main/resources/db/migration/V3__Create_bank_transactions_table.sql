-- Create bank_transactions table
CREATE TABLE bank_transactions (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    bank_account_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('OPENING_BALANCE', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    transaction_date TIMESTAMP NOT NULL,
    balance_after DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_bank_transactions_merchant_id ON bank_transactions(merchant_id);
CREATE INDEX idx_bank_transactions_bank_account_id ON bank_transactions(bank_account_id);
CREATE INDEX idx_bank_transactions_merchant_date ON bank_transactions(merchant_id, transaction_date);
CREATE INDEX idx_bank_transactions_bank_account_date ON bank_transactions(bank_account_id, transaction_date);
CREATE INDEX idx_bank_transactions_type ON bank_transactions(transaction_type);

-- Add foreign key constraints (optional, depending on your requirements)
-- ALTER TABLE bank_transactions ADD CONSTRAINT fk_bank_transactions_merchant FOREIGN KEY (merchant_id) REFERENCES users(id);
-- ALTER TABLE bank_transactions ADD CONSTRAINT fk_bank_transactions_bank_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id);
