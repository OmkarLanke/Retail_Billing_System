-- Fix sales table structure to match entity
-- Rename sale_date to invoice_date
ALTER TABLE sales RENAME COLUMN sale_date TO invoice_date;

-- Rename paid_amount to received_amount
ALTER TABLE sales RENAME COLUMN paid_amount TO received_amount;

-- Add missing columns
ALTER TABLE sales ADD COLUMN IF NOT EXISTS subtotal DECIMAL(19,2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(19,2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(19,2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS bank_account_id BIGINT;

-- Make subtotal NOT NULL after adding it
ALTER TABLE sales ALTER COLUMN subtotal SET NOT NULL;

-- Add foreign key constraint for bank_account_id
ALTER TABLE sales ADD CONSTRAINT fk_sale_bank_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id);

-- Update precision for existing columns to match entity
ALTER TABLE sales ALTER COLUMN total_amount TYPE DECIMAL(19,2);
ALTER TABLE sales ALTER COLUMN received_amount TYPE DECIMAL(19,2);
ALTER TABLE sales ALTER COLUMN balance_amount TYPE DECIMAL(19,2);
ALTER TABLE sales ALTER COLUMN round_off TYPE DECIMAL(19,2);
