-- Create purchases table
CREATE TABLE purchases (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    bill_number VARCHAR(50),
    bill_date TIMESTAMP NOT NULL,
    state_of_supply VARCHAR(100),
    party_id BIGINT NOT NULL,
    phone_no VARCHAR(20),
    payment_type VARCHAR(50),
    round_off DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(15,2) DEFAULT 0.00,
    total_discount DECIMAL(15,2) DEFAULT 0.00,
    total_tax DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'DRAFT',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for purchases table
CREATE INDEX idx_purchases_merchant_id ON purchases(merchant_id);
CREATE INDEX idx_purchases_party_id ON purchases(party_id);
CREATE INDEX idx_purchases_bill_date ON purchases(bill_date);
CREATE INDEX idx_purchases_status ON purchases(status);

-- Add foreign key constraints for purchases table
ALTER TABLE purchases ADD CONSTRAINT fk_purchases_merchant_id 
    FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE purchases ADD CONSTRAINT fk_purchases_party_id 
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE;

-- Create purchase_items table
CREATE TABLE purchase_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50),
    price_per_unit DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_percent DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    amount DECIMAL(15,2) NOT NULL
);

-- Create indexes for purchase_items table
CREATE INDEX idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_item_id ON purchase_items(item_id);

-- Add foreign key constraints for purchase_items table
ALTER TABLE purchase_items ADD CONSTRAINT fk_purchase_items_purchase_id 
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE;
ALTER TABLE purchase_items ADD CONSTRAINT fk_purchase_items_item_id 
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE;
