-- Fix party balance signs to ensure all balances are stored as positive values
-- The balance_type field indicates the direction (TO_PAY or TO_RECEIVE)

-- Update all parties with negative current_balance to positive values
UPDATE parties 
SET current_balance = ABS(current_balance)
WHERE current_balance < 0;

-- Add comment to explain the fix
COMMENT ON COLUMN parties.current_balance IS 'Party balance amount (always positive). Use balance_type to determine direction: TO_PAY (we owe them) or TO_RECEIVE (they owe us)';
