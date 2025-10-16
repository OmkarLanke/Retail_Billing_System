CREATE TABLE item_transactions (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    invoice_ref VARCHAR(100),
    party_name VARCHAR(255),
    quantity DECIMAL(10,2) NOT NULL,
    price_per_unit DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    status VARCHAR(50),
    transaction_date TIMESTAMP NOT NULL,
    merchant_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (merchant_id) REFERENCES users(id)
);
