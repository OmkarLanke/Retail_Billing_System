-- Add balance_type column to parties table
ALTER TABLE parties ADD COLUMN balance_type VARCHAR(20) DEFAULT 'TO_PAY';

-- Update existing records to have TO_PAY as default
UPDATE parties SET balance_type = 'TO_PAY' WHERE balance_type IS NULL;
