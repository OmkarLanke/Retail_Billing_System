-- Create payment_out table
CREATE TABLE payment_out (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    party_id BIGINT NOT NULL,
    payment_type VARCHAR(50) NOT NULL, -- e.g., CASH, CHEQUE, BANK_ACCOUNT
    bank_account_id BIGINT, -- Nullable if payment_type is CASH or CHEQUE
    amount DECIMAL(15, 2) NOT NULL,
    receipt_number VARCHAR(255),
    payment_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES users(id),
    FOREIGN KEY (party_id) REFERENCES parties(id),
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
);

-- Create indexes for better performance
CREATE INDEX idx_payment_out_merchant_id ON payment_out (merchant_id);
CREATE INDEX idx_payment_out_party_id ON payment_out (party_id);
CREATE INDEX idx_payment_out_bank_account_id ON payment_out (bank_account_id);
CREATE INDEX idx_payment_out_payment_date ON payment_out (payment_date);
