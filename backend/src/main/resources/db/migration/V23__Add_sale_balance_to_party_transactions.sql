-- Add sale_balance column to party_transactions table
ALTER TABLE party_transactions ADD COLUMN sale_balance DECIMAL(15,2);

-- Add comment to explain the column purpose
COMMENT ON COLUMN party_transactions.sale_balance IS 'Remaining balance of the specific sale transaction';
