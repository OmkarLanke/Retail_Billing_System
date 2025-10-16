-- Remove the global unique constraint on code
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_code_key;

-- Add a unique constraint that combines merchant_id and code
-- This allows the same code to exist for different merchants
-- but prevents duplicate codes within the same merchant
ALTER TABLE items ADD CONSTRAINT items_merchant_code_unique UNIQUE (merchant_id, code);
