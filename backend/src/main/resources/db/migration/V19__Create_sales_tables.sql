-- Create sales table
CREATE TABLE sales (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(255) UNIQUE NOT NULL,
    sale_date DATE NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2),
    balance_amount DECIMAL(15, 2),
    payment_type VARCHAR(50),
    sale_type VARCHAR(50) NOT NULL,
    party_id BIGINT,
    billing_name VARCHAR(255),
    billing_address TEXT,
    phone_number VARCHAR(20),
    round_off DECIMAL(15, 2),
    description TEXT,
    attachment_url VARCHAR(500),
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create sale_items table
CREATE TABLE sale_items (
    id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50),
    price DECIMAL(19, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(19, 2),
    tax_percentage DECIMAL(5, 2),
    tax_amount DECIMAL(19, 2),
    total_amount DECIMAL(19, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);
