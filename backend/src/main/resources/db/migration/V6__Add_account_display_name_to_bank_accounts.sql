-- Add account_display_name column to bank_accounts table
ALTER TABLE bank_accounts ADD COLUMN account_display_name VARCHAR(255);

-- Update existing records to use bank_name as account_display_name if null
UPDATE bank_accounts SET account_display_name = bank_name WHERE account_display_name IS NULL;
