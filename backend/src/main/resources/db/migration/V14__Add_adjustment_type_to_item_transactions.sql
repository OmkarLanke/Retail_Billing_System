-- Add adjustment_type column to item_transactions table
ALTER TABLE item_transactions ADD COLUMN adjustment_type VARCHAR(10);

-- Add comment to explain the column
COMMENT ON COLUMN item_transactions.adjustment_type IS 'For ADJUSTMENT transactions: ADD or REDUCE';
