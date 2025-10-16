-- Create companies table
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    gstin VARCHAR(15) UNIQUE,
    email VARCHAR(255),
    business_type VARCHAR(100),
    business_category VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    business_address TEXT,
    logo_path VARCHAR(500),
    signature_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_gstin ON companies(gstin);
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_business_name ON companies(business_name);
