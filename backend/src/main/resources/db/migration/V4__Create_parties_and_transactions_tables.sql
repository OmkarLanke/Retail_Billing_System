-- Create parties table
CREATE TABLE parties (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(255),
    address TEXT,
    gst_number VARCHAR(15),
    pan_number VARCHAR(10),
    opening_balance DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    party_type VARCHAR(20) NOT NULL CHECK (party_type IN ('CUSTOMER', 'SUPPLIER', 'BOTH')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create party_transactions table
CREATE TABLE party_transactions (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    party_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('SALE', 'PURCHASE', 'PAYMENT_IN', 'PAYMENT_OUT', 'ADJUSTMENT')),
    transaction_number VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    transaction_date TIMESTAMP NOT NULL,
    balance_after DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_parties_merchant_id ON parties(merchant_id);
CREATE INDEX idx_parties_merchant_active ON parties(merchant_id, is_active);
CREATE INDEX idx_parties_name ON parties(name);
CREATE INDEX idx_parties_phone ON parties(phone);
CREATE INDEX idx_parties_email ON parties(email);
CREATE INDEX idx_parties_type ON parties(party_type);

CREATE INDEX idx_party_transactions_merchant_id ON party_transactions(merchant_id);
CREATE INDEX idx_party_transactions_party_id ON party_transactions(party_id);
CREATE INDEX idx_party_transactions_merchant_date ON party_transactions(merchant_id, transaction_date);
CREATE INDEX idx_party_transactions_party_date ON party_transactions(party_id, transaction_date);
CREATE INDEX idx_party_transactions_type ON party_transactions(transaction_type);
CREATE INDEX idx_party_transactions_number ON party_transactions(transaction_number);

-- Add foreign key constraints
ALTER TABLE parties ADD CONSTRAINT fk_parties_merchant FOREIGN KEY (merchant_id) REFERENCES users(id);
ALTER TABLE party_transactions ADD CONSTRAINT fk_party_transactions_merchant FOREIGN KEY (merchant_id) REFERENCES users(id);
ALTER TABLE party_transactions ADD CONSTRAINT fk_party_transactions_party FOREIGN KEY (party_id) REFERENCES parties(id);
